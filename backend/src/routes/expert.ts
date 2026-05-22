import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

async function getOrCreateProfile(userId: string) {
  const result = await pool.query(
    `INSERT INTO expert_profiles (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING *`,
    [userId]
  );
  return result.rows[0];
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const profile = await getOrCreateProfile(req.userId!);
    const user = await pool.query('SELECT full_name, email, phone, company FROM users WHERE id = $1', [req.userId]);
    res.json({ ...profile, ...user.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const profile = await getOrCreateProfile(req.userId!);
    const {
      full_name, phone, company,
      date_of_birth, birth_place, gender, id_number, id_issued_date, id_issued_place,
      hometown, nationality, address, province,
      bank_account, bank_account_name, bank_name, bank_branch,
      academic_degree, degree_year, academic_title, title_year, expertise_fields
    } = req.body;

    await pool.query(
      `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone),
       company = COALESCE($3, company), updated_at = NOW() WHERE id = $4`,
      [full_name, phone, company, req.userId]
    );

    await pool.query(
      `UPDATE expert_profiles SET
        date_of_birth = $1, birth_place = $2, gender = $3, id_number = $4,
        id_issued_date = $5, id_issued_place = $6, hometown = $7, nationality = $8,
        address = $9, province = $10, bank_account = $11, bank_account_name = $12,
        bank_name = $13, bank_branch = $14, academic_degree = $15, degree_year = $16,
        academic_title = $17, title_year = $18, expertise_fields = $19, updated_at = NOW()
      WHERE id = $20`,
      [
        date_of_birth || null, birth_place, gender, id_number,
        id_issued_date || null, id_issued_place, hometown, nationality,
        address, province, bank_account, bank_account_name,
        bank_name, bank_branch, academic_degree, degree_year || null,
        academic_title, title_year || null, expertise_fields || null, profile.id
      ]
    );

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
}

export async function completeProfile(req: AuthRequest, res: Response) {
  try {
    const profile = await getOrCreateProfile(req.userId!);
    await pool.query(
      'UPDATE expert_profiles SET profile_completed = true, updated_at = NOW() WHERE id = $1',
      [profile.id]
    );
    res.json({ message: 'Hồ sơ đã được đánh dấu hoàn thành' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
}

// Generic CRUD factory for expert sub-tables
function createCrudHandlers(tableName: string, columns: string[]) {
  return {
    async list(req: AuthRequest, res: Response) {
      try {
        const profile = await getOrCreateProfile(req.userId!);
        const result = await pool.query(
          `SELECT * FROM ${tableName} WHERE expert_profile_id = $1 ORDER BY sort_order ASC, created_at ASC`,
          [profile.id]
        );
        res.json({ data: result.rows });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
      }
    },

    async create(req: AuthRequest, res: Response) {
      try {
        const profile = await getOrCreateProfile(req.userId!);
        const values = columns.map(col => req.body[col] ?? null);
        const placeholders = columns.map((_, i) => `$${i + 2}`).join(', ');
        const result = await pool.query(
          `INSERT INTO ${tableName} (expert_profile_id, ${columns.join(', ')}) VALUES ($1, ${placeholders}) RETURNING *`,
          [profile.id, ...values]
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
      }
    },

    async update(req: AuthRequest, res: Response) {
      try {
        const profile = await getOrCreateProfile(req.userId!);
        const { id } = req.params;
        const setClauses = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
        const values = columns.map(col => req.body[col] ?? null);
        const result = await pool.query(
          `UPDATE ${tableName} SET ${setClauses} WHERE id = $${columns.length + 1} AND expert_profile_id = $${columns.length + 2} RETURNING *`,
          [...values, id, profile.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy' });
        res.json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
      }
    },

    async remove(req: AuthRequest, res: Response) {
      try {
        const profile = await getOrCreateProfile(req.userId!);
        const { id } = req.params;
        const result = await pool.query(
          `DELETE FROM ${tableName} WHERE id = $1 AND expert_profile_id = $2 RETURNING id`,
          [id, profile.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy' });
        res.json({ message: 'Đã xóa' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
      }
    },
  };
}

export const education = createCrudHandlers('expert_education', [
  'period', 'education_system', 'institution', 'country', 'major', 'degree', 'sort_order'
]);

export const workHistory = createCrudHandlers('expert_work_history', [
  'period_start', 'period_end', 'organization', 'address_phone', 'position', 'sort_order'
]);

export const research = createCrudHandlers('expert_research_projects', [
  'title', 'start_year', 'end_year', 'funding_agency', 'role', 'status', 'sort_order'
]);

export const publications = createCrudHandlers('expert_publications', [
  'title', 'authors', 'publisher', 'year', 'publication_type', 'doi', 'issn',
  'author_role', 'journal_rank', 'impact_factor', 'citations', 'notes', 'source_url', 'sort_order'
]);

export const patents = createCrudHandlers('expert_patents', [
  'citation', 'author_role', 'protection_type', 'country', 'status', 'reference_link', 'sort_order'
]);

export const awards = createCrudHandlers('expert_awards', [
  'title', 'author_role', 'awarding_body', 'year', 'notes', 'reference_link', 'sort_order'
]);

export const books = createCrudHandlers('expert_books', [
  'title', 'link', 'authors', 'publisher', 'isbn', 'notes', 'sort_order'
]);
