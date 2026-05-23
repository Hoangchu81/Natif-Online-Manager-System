import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'news');
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ file ảnh: JPG, PNG, WebP, GIF'));
    }
  },
});

export function uploadRoutes(app: any) {
  app.post(
    '/api/admin/upload/news',
    authenticate,
    upload.single('file'),
    (req: Request, res: Response) => {
      const file = (req as any).file;
      if (!file) return res.status(400).json({ error: 'Không có file nào được upload' });
      res.json({ url: `/uploads/news/${file.filename}`, filename: file.filename, size: file.size });
    }
  );

  app.delete(
    '/api/admin/upload/news',
    authenticate,
    (req: Request, res: Response) => {
      const { filename } = req.body;
      if (!filename) return res.status(400).json({ error: 'Thiếu filename' });
      const safeName = path.basename(filename);
      const filepath = path.join(UPLOAD_DIR, safeName);
      if (!filepath.startsWith(UPLOAD_DIR)) return res.status(400).json({ error: 'Tên file không hợp lệ' });
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return res.json({ success: true });
      }
      res.status(404).json({ error: 'File không tồn tại' });
    }
  );
}
