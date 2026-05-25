import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

// ─── Config for sub-resource tables ──────────────────────────────────────────

const DETAIL_TABLES: Record<string, { table: string; order: string; columns: string[]; required: string[] }> = {
  noi_dung: {
    table: 'application_noi_dung',
    order: 'noi_dung_so ASC',
    columns: ['noi_dung_so', 'ten', 'mo_ta_chi_tiet', 'phuong_phap', 'san_pham_du_kien', 'nguoi_thuc_hien', 'thoi_gian_tu', 'thoi_gian_den'],
    required: ['noi_dung_so', 'ten'],
  },
  san_pham: {
    table: 'application_san_pham',
    order: 'created_at ASC',
    columns: ['loai', 'ten', 'chi_tieu_chat_luong', 'yeu_cau_ky_thuat', 'so_luong', 'don_vi', 'quy_mo', 'dia_chi_ung_dung'],
    required: ['loai', 'ten'],
  },
  du_toan: {
    table: 'application_du_toan',
    order: 'created_at ASC',
    columns: ['hang_muc', 'noi_dung', 'don_vi', 'so_luong', 'don_gia', 'thanh_tien', 'nguon_nsnn', 'nguon_khac', 'ghi_chu'],
    required: ['hang_muc', 'noi_dung', 'thanh_tien'],
  },
  nhom_nghien_cuu: {
    table: 'application_nhom_nghien_cuu',
    order: 'created_at ASC',
    columns: ['ho_ten', 'hoc_vi', 'chuc_danh', 'don_vi_cong_tac', 'vai_tro', 'thoi_gian_tham_gia_thang', 'so_gio_quy_doi'],
    required: ['ho_ten', 'vai_tro'],
  },
  tien_do: {
    table: 'application_tien_do',
    order: 'giai_doan ASC',
    columns: ['giai_doan', 'noi_dung', 'san_pham', 'thoi_gian_tu', 'thoi_gian_den', 'kinh_phi'],
    required: ['giai_doan', 'noi_dung'],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function assertApplicationAccess(req: AuthRequest, applicationId: string) {
  const result = await pool.query(
    'SELECT id, user_id, status FROM applications WHERE id = $1',
    [applicationId]
  );
  if (!result.rows.length) return { ok: false as const, status: 404, error: 'Không tìm thấy hồ sơ' };
  const app = result.rows[0];
  if (req.userRole !== 'admin' && app.user_id !== req.userId) {
    return { ok: false as const, status: 403, error: 'Không có quyền truy cập' };
  }
  return { ok: true as const, app };
}

function getTableConfig(kind: string) {
  return DETAIL_TABLES[kind] || null;
}

// ─── Thuyết minh (1:1 with application) ─────────────────────────────────────

export async function getThuyetMinh(req: AuthRequest, res: Response) {
  const access = await assertApplicationAccess(req, req.params.id);
  if (!access.ok) return res.status(access.status!).json({ error: access.error });

  const result = await pool.query(
    'SELECT * FROM application_thuyet_minh WHERE application_id = $1',
    [req.params.id]
  );
  res.json(result.rows[0] || null);
}

export async function upsertThuyetMinh(req: AuthRequest, res: Response) {
  const access = await assertApplicationAccess(req, req.params.id);
  if (!access.ok) return res.status(access.status!).json({ error: access.error });

  const required = ['tinh_cap_thiet', 'tinh_moi_sang_tao', 'muc_tieu_tong_quat'];
  for (const field of required) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `Thiếu trường bắt buộc: ${field}` });
    }
  }

  const result = await pool.query(
    `INSERT INTO application_thuyet_minh (
      application_id, tinh_cap_thiet, tong_quan_trong_nuoc, tong_quan_quoc_te,
      tinh_moi_sang_tao, muc_tieu_tong_quat, muc_tieu_cu_the,
      hieu_qua_kinh_te, hieu_qua_xa_hoi, hieu_qua_moi_truong, kha_nang_ung_dung,
      co_so_vat_chat, hop_tac_quoc_te
    ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (application_id) DO UPDATE SET
      tinh_cap_thiet = EXCLUDED.tinh_cap_thiet,
      tong_quan_trong_nuoc = EXCLUDED.tong_quan_trong_nuoc,
      tong_quan_quoc_te = EXCLUDED.tong_quan_quoc_te,
      tinh_moi_sang_tao = EXCLUDED.tinh_moi_sang_tao,
      muc_tieu_tong_quat = EXCLUDED.muc_tieu_tong_quat,
      muc_tieu_cu_the = EXCLUDED.muc_tieu_cu_the,
      hieu_qua_kinh_te = EXCLUDED.hieu_qua_kinh_te,
      hieu_qua_xa_hoi = EXCLUDED.hieu_qua_xa_hoi,
      hieu_qua_moi_truong = EXCLUDED.hieu_qua_moi_truong,
      kha_nang_ung_dung = EXCLUDED.kha_nang_ung_dung,
      co_so_vat_chat = EXCLUDED.co_so_vat_chat,
      hop_tac_quoc_te = EXCLUDED.hop_tac_quoc_te,
      updated_at = NOW()
    RETURNING *`,
    [
      req.params.id,
      req.body.tinh_cap_thiet,
      req.body.tong_quan_trong_nuoc || null,
      req.body.tong_quan_quoc_te || null,
      req.body.tinh_moi_sang_tao,
      req.body.muc_tieu_tong_quat,
      JSON.stringify(req.body.muc_tieu_cu_the || []),
      req.body.hieu_qua_kinh_te || null,
      req.body.hieu_qua_xa_hoi || null,
      req.body.hieu_qua_moi_truong || null,
      req.body.kha_nang_ung_dung || null,
      req.body.co_so_vat_chat || null,
      req.body.hop_tac_quoc_te || null,
    ]
  );

  res.json(result.rows[0]);
}

// ─── Generic detail CRUD (1:N with application) ─────────────────────────────

export async function listDetail(req: AuthRequest, res: Response) {
  const cfg = getTableConfig(req.params.kind);
  if (!cfg) return res.status(400).json({ error: 'Loại dữ liệu không hợp lệ' });

  const access = await assertApplicationAccess(req, req.params.id);
  if (!access.ok) return res.status(access.status!).json({ error: access.error });

  const result = await pool.query(
    `SELECT * FROM ${cfg.table} WHERE application_id = $1 ORDER BY ${cfg.order}`,
    [req.params.id]
  );
  res.json(result.rows);
}

export async function createDetail(req: AuthRequest, res: Response) {
  const cfg = getTableConfig(req.params.kind);
  if (!cfg) return res.status(400).json({ error: 'Loại dữ liệu không hợp lệ' });

  const access = await assertApplicationAccess(req, req.params.id);
  if (!access.ok) return res.status(access.status!).json({ error: access.error });

  // Validate required fields
  for (const field of cfg.required) {
    if (req.body[field] === undefined || req.body[field] === '') {
      return res.status(400).json({ error: `Thiếu trường bắt buộc: ${field}` });
    }
  }

  const cols = ['application_id', ...cfg.columns];
  const vals = [req.params.id, ...cfg.columns.map(c => req.body[c] ?? null)];
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(',');

  const result = await pool.query(
    `INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${placeholders}) RETURNING *`,
    vals
  );
  res.status(201).json(result.rows[0]);
}

export async function updateDetail(req: AuthRequest, res: Response) {
  const cfg = getTableConfig(req.params.kind);
  if (!cfg) return res.status(400).json({ error: 'Loại dữ liệu không hợp lệ' });

  const access = await assertApplicationAccess(req, req.params.id);
  if (!access.ok) return res.status(access.status!).json({ error: access.error });

  // Build SET clause from provided fields
  const setClauses: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  for (const col of cfg.columns) {
    if (req.body[col] !== undefined) {
      setClauses.push(`${col} = $${idx++}`);
      vals.push(req.body[col]);
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'Không có dữ liệu cập nhật' });
  }

  vals.push(req.params.detailId);
  vals.push(req.params.id);

  const result = await pool.query(
    `UPDATE ${cfg.table} SET ${setClauses.join(', ')} WHERE id = $${idx++} AND application_id = $${idx} RETURNING *`,
    vals
  );

  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
  res.json(result.rows[0]);
}

export async function deleteDetail(req: AuthRequest, res: Response) {
  const cfg = getTableConfig(req.params.kind);
  if (!cfg) return res.status(400).json({ error: 'Loại dữ liệu không hợp lệ' });

  const access = await assertApplicationAccess(req, req.params.id);
  if (!access.ok) return res.status(access.status!).json({ error: access.error });

  const result = await pool.query(
    `DELETE FROM ${cfg.table} WHERE id = $1 AND application_id = $2 RETURNING id`,
    [req.params.detailId, req.params.id]
  );

  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
  res.json({ message: 'Đã xóa' });
}

// ─── Bulk save (replace all items for a kind) ───────────────────────────────

export async function bulkSaveDetail(req: AuthRequest, res: Response) {
  const cfg = getTableConfig(req.params.kind);
  if (!cfg) return res.status(400).json({ error: 'Loại dữ liệu không hợp lệ' });

  const access = await assertApplicationAccess(req, req.params.id);
  if (!access.ok) return res.status(access.status!).json({ error: access.error });

  const items = req.body.items;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Body phải chứa mảng items' });
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    for (const field of cfg.required) {
      if (items[i][field] === undefined || items[i][field] === '') {
        return res.status(400).json({ error: `Mục ${i + 1}: thiếu trường ${field}` });
      }
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete existing
    await client.query(`DELETE FROM ${cfg.table} WHERE application_id = $1`, [req.params.id]);

    // Insert all
    const results = [];
    for (const item of items) {
      const cols = ['application_id', ...cfg.columns];
      const vals = [req.params.id, ...cfg.columns.map(c => item[c] ?? null)];
      const placeholders = vals.map((_, i) => `$${i + 1}`).join(',');
      const r = await client.query(
        `INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${placeholders}) RETURNING *`,
        vals
      );
      results.push(r.rows[0]);
    }

    await client.query('COMMIT');
    res.json(results);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Get full application with all details ──────────────────────────────────

export async function getApplicationFull(req: AuthRequest, res: Response) {
  const access = await assertApplicationAccess(req, req.params.id);
  if (!access.ok) return res.status(access.status!).json({ error: access.error });

  const [app, tm, nd, sp, dt, nnc, td] = await Promise.all([
    pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id]),
    pool.query('SELECT * FROM application_thuyet_minh WHERE application_id = $1', [req.params.id]),
    pool.query('SELECT * FROM application_noi_dung WHERE application_id = $1 ORDER BY noi_dung_so ASC', [req.params.id]),
    pool.query('SELECT * FROM application_san_pham WHERE application_id = $1 ORDER BY created_at ASC', [req.params.id]),
    pool.query('SELECT * FROM application_du_toan WHERE application_id = $1 ORDER BY created_at ASC', [req.params.id]),
    pool.query('SELECT * FROM application_nhom_nghien_cuu WHERE application_id = $1 ORDER BY created_at ASC', [req.params.id]),
    pool.query('SELECT * FROM application_tien_do WHERE application_id = $1 ORDER BY giai_doan ASC', [req.params.id]),
  ]);

  res.json({
    ...app.rows[0],
    thuyet_minh: tm.rows[0] || null,
    noi_dung: nd.rows,
    san_pham: sp.rows,
    du_toan: dt.rows,
    nhom_nghien_cuu: nnc.rows,
    tien_do: td.rows,
  });
}
