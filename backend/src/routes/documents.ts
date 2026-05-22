import type { AuthRequest } from '../middleware/auth.js';
import type { Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import pool from '../config/database.js';
import { DOCUMENT_CHECKLISTS } from './enterprise.js';

// Configure multer storage
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP'));
    }
  },
});

export const uploadMiddleware = upload.single('file');

// Get document checklist for an application
export async function getChecklist(req: AuthRequest, res: Response) {
  const { applicationId } = req.params;

  const app = await pool.query('SELECT program_type, id FROM applications WHERE id = $1', [applicationId]);
  if (!app.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  // Access check: enterprise can only see their own
  if (req.userRole === 'enterprise' && app.rows[0].user_id !== req.userId) {
    return res.status(403).json({ error: 'Không có quyền truy cập' });
  }

  const checklist = DOCUMENT_CHECKLISTS[app.rows[0].program_type] || DOCUMENT_CHECKLISTS['sponsorship'];

  // Get existing documents
  const docs = await pool.query(
    `SELECT * FROM application_documents WHERE application_id = $1 ORDER BY uploaded_at`,
    [applicationId]
  );

  // Merge checklist with uploaded status
  const merged = checklist.map(item => {
    const uploaded = docs.rows.filter(d => d.document_type === item.type);
    return {
      ...item,
      files: uploaded,
      is_uploaded: uploaded.length > 0,
      is_complete: uploaded.length > 0 && uploaded.every(f => f.status !== 'rejected'),
    };
  });

  res.json({
    checklist: merged,
    program_type: app.rows[0].program_type,
  });
}

// Upload a document
export async function uploadDocument(req: AuthRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file được tải lên' });
  }

  const { applicationId } = req.params;
  const { document_type } = req.body;

  if (!document_type) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Thiếu document_type' });
  }

  const app = await pool.query('SELECT user_id, program_type FROM applications WHERE id = $1', [applicationId]);
  if (!app.rows.length) {
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  // Access: enterprise owns the app, or staff/admin
  if (req.userRole === 'enterprise' && app.rows[0].user_id !== req.userId) {
    fs.unlinkSync(req.file.path);
    return res.status(403).json({ error: 'Không có quyền tải file cho hồ sơ này' });
  }

  // Validate document type matches checklist
  const checklist = DOCUMENT_CHECKLISTS[app.rows[0].program_type] || [];
  const validTypes = checklist.map(c => c.type);
  if (!validTypes.includes(document_type)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Loại tài liệu không hợp lệ cho chương trình này' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const result = await pool.query(
    `INSERT INTO application_documents
     (application_id, document_type, file_name, file_url, file_size, mime_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [applicationId, document_type, req.file.originalname, fileUrl, req.file.size, req.file.mimetype]
  );

  res.status(201).json(result.rows[0]);
}

// List documents for an application
export async function listDocuments(req: AuthRequest, res: Response) {
  const { applicationId } = req.params;

  const app = await pool.query('SELECT user_id FROM applications WHERE id = $1', [applicationId]);
  if (!app.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  if (req.userRole === 'enterprise' && app.rows[0].user_id !== req.userId) {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  const result = await pool.query(
    `SELECT ad.*, u.full_name as reviewed_by_name
     FROM application_documents ad
     LEFT JOIN users u ON ad.reviewed_by = u.id
     WHERE ad.application_id = $1
     ORDER BY ad.uploaded_at`,
    [applicationId]
  );

  res.json({ data: result.rows });
}

// Delete a document
export async function deleteDocument(req: AuthRequest, res: Response) {
  const { documentId } = req.params;

  const doc = await pool.query(
    `SELECT ad.*, a.user_id FROM application_documents ad
     JOIN applications a ON ad.application_id = a.id
     WHERE ad.id = $1`,
    [documentId]
  );

  if (!doc.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấu tài liệu' });
  }

  // Only enterprise owner or admin can delete
  if (req.userRole === 'enterprise' && doc.rows[0].user_id !== req.userId) {
    return res.status(403).json({ error: 'Không có quyền xóa' });
  }

  // Only allow delete if not yet reviewed/verified
  if (doc.rows[0].status === 'verified') {
    return res.status(400).json({ error: 'Tài liệu đã được xác nhận, không thể xóa' });
  }

  // Delete file from disk
  if (doc.rows[0].file_url) {
    const filePath = path.join(process.cwd(), doc.rows[0].file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await pool.query('DELETE FROM application_documents WHERE id = $1', [documentId]);
  res.json({ message: 'Đã xóa tài liệu' });
}

// Review a document (admin/clerk/dept_head/director)
export async function reviewDocument(req: AuthRequest, res: Response) {
  const { documentId } = req.params;
  const { status, notes } = req.body; // status: 'verified' | 'rejected'

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status phải là "verified" hoặc "rejected"' });
  }

  const result = await pool.query(
    `UPDATE application_documents
     SET status = $1, reviewer_notes = $2, reviewed_by = $3, reviewed_at = NOW()
     WHERE id = $4 RETURNING *`,
    [status, notes || null, req.userId, documentId]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: 'Không tìm thấu tài liệu' });
  }

  res.json(result.rows[0]);
}
