import type { Request, Response } from 'express';
import pool from '../config/database.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let counter = 0;
  while (true) {
    const check = counter === 0 ? slug : `${slug}-${counter}`;
    const result = await pool.query('SELECT id FROM news WHERE slug = $1', [check]);
    if (!result.rows.length) return check;
    counter++;
  }
}

// ─── Public ─────────────────────────────────────────────────────────────────

export async function listNews(req: Request, res: Response) {
  const { category, tag, limit = 20, page = 1 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  let query = 'SELECT * FROM news WHERE status = $1';
  const params: (string | number)[] = ['published'];
  let idx = 2;

  if (category) {
    query += ` AND category = $${idx++}`;
    params.push(category as string);
  }

  query += ` ORDER BY published_at DESC LIMIT $${idx++} OFFSET $${idx}`;
  params.push(Number(limit), offset);

  const result = await pool.query(query, params);
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM news WHERE status = $1' + (category ? ' AND category = $2' : ''),
    category ? ['published', category] : ['published']
  );
  const total = parseInt(countResult.rows[0].count);

  res.json({
    data: result.rows,
    meta: { total, page: Number(page), limit: Number(limit) },
  });
}

export async function getNews(req: Request, res: Response) {
  const { slug } = req.params;
  const result = await pool.query('SELECT * FROM news WHERE slug = $1', [slug]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

  // Increment view count
  await pool.query('UPDATE news SET view_count = view_count + 1 WHERE slug = $1', [slug]);

  res.json(result.rows[0]);
}

export async function listAnnouncements(req: Request, res: Response) {
  const result = await pool.query(
    "SELECT * FROM news WHERE category = 'thong-bao' AND status = 'published' ORDER BY published_at DESC LIMIT 10"
  );
  res.json({ data: result.rows });
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(req: Request, res: Response) {
  const result = await pool.query(
    'SELECT c.*, (SELECT COUNT(*) FROM news WHERE category = c.slug AND status = $1) as article_count FROM news_categories c ORDER BY sort_order',
    ['published']
  );
  res.json({ data: result.rows });
}

export async function createCategory(req: Request, res: Response) {
  const { name, description, parent_id, sort_order } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Tên danh mục không được trống' });

  const slug = slugify(name);
  const result = await pool.query(
    `INSERT INTO news_categories (name, slug, description, parent_id, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name.trim(), slug, description || null, parent_id || null, sort_order ?? 0]
  );
  res.status(201).json(result.rows[0]);
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { name, description, parent_id, sort_order, is_active } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Tên danh mục không được trống' });

  const result = await pool.query(
    `UPDATE news_categories SET name = $1, description = $2, parent_id = $3, sort_order = $4, updated_at = NOW()
     WHERE id = $5 RETURNING *`,
    [name.trim(), description || null, parent_id || null, sort_order ?? 0, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Danh mục không tồn tại' });
  res.json(result.rows[0]);
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  // Check if category has articles
  const cat = await pool.query('SELECT slug FROM news_categories WHERE id = $1', [id]);
  if (!cat.rows.length) return res.status(404).json({ error: 'Danh mục không tồn tại' });

  const articleCount = await pool.query(
    'SELECT COUNT(*) FROM news WHERE category = $1 AND status = $2',
    [cat.rows[0].slug, 'published']
  );
  if (parseInt(articleCount.rows[0].count) > 0) {
    return res.status(409).json({ error: 'Danh mục đang có bài viết, không thể xóa' });
  }

  await pool.query('DELETE FROM news_categories WHERE id = $1', [id]);
  res.json({ success: true });
}

// ─── News Admin CRUD ─────────────────────────────────────────────────────────

export async function listNewsAdmin(req: Request, res: Response) {
  const { status, category, search, limit = 50, page = 1 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  let query = `
    SELECT n.*, u.full_name as author_name
    FROM news n
    LEFT JOIN users u ON n.updated_by = u.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  let idx = 1;

  if (status) {
    query += ` AND n.status = $${idx++}`;
    params.push(status as string);
  }
  if (category) {
    query += ` AND n.category = $${idx++}`;
    params.push(category as string);
  }
  if (search) {
    query += ` AND (n.title ILIKE $${idx} OR n.excerpt ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM news n WHERE 1=1` +
    (status ? ` AND n.status = $1` : '') +
    (category ? ` AND n.category = '${category}'` : '') +
    (search ? ` AND (n.title ILIKE '%${search}%' OR n.excerpt ILIKE '%${search}%')` : ''),
    status ? [status] : []
  );

  query += ` ORDER BY n.updated_at DESC LIMIT $${idx++} OFFSET $${idx}`;
  params.push(Number(limit), offset);

  const result = await pool.query(query, params);
  res.json({
    data: result.rows,
    meta: { total: parseInt(countResult.rows[0].count), page: Number(page), limit: Number(limit) },
  });
}

export async function getNewsById(req: Request, res: Response) {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json(result.rows[0]);
}

export async function createNews(req: Request, res: Response) {
  const authReq = req as any;
  const { title, content, excerpt, category, author, thumbnail, tags, status = 'draft', is_featured } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: 'Tiêu đề không được trống' });
  if (!category) return res.status(400).json({ error: 'Danh mục không được trống' });

  const slug = await uniqueSlug(title);
  const userId = authReq.userId;

  const result = await pool.query(
    `INSERT INTO news (slug, title, content, excerpt, category, author, thumbnail, tags, status, is_featured, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [slug, title.trim(), content || '', excerpt || '', category, author || '', thumbnail || null, tags || null, status, is_featured ?? false, userId]
  );
  res.status(201).json(result.rows[0]);
}

export async function updateNews(req: Request, res: Response) {
  const authReq = req as any;
  const { id } = req.params;
  const { title, content, excerpt, category, author, thumbnail, tags, status, is_featured } = req.body;

  const existing = await pool.query('SELECT id FROM news WHERE id = $1', [id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

  const updates: string[] = [];
  const params: (string | number | boolean)[] = [];
  let idx = 1;

  if (title !== undefined) { updates.push(`title = $${idx++}`); params.push(title.trim()); }
  if (content !== undefined) { updates.push(`content = $${idx++}`); params.push(content); }
  if (excerpt !== undefined) { updates.push(`excerpt = $${idx++}`); params.push(excerpt); }
  if (category !== undefined) { updates.push(`category = $${idx++}`); params.push(category); }
  if (author !== undefined) { updates.push(`author = $${idx++}`); params.push(author); }
  if (thumbnail !== undefined) { updates.push(`thumbnail = $${idx++}`); params.push(thumbnail); }
  if (tags !== undefined) { updates.push(`tags = $${idx++}`); params.push(tags); }
  if (status !== undefined) { updates.push(`status = $${idx++}`); params.push(status); }
  if (is_featured !== undefined) { updates.push(`is_featured = $${idx++}`); params.push(is_featured); }

  updates.push(`updated_at = NOW()`);
  updates.push(`updated_by = $${idx++}`);
  params.push(authReq.userId);
  params.push(id);

  const result = await pool.query(
    `UPDATE news SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  res.json(result.rows[0]);
}

export async function deleteNews(req: Request, res: Response) {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json({ success: true });
}

// ─── Menu Management ────────────────────────────────────────────────────────

export async function listMenus(req: Request, res: Response) {
  const { position } = req.query;
  let query = 'SELECT * FROM site_menus';
  const params: string[] = [];
  if (position) {
    query += ' WHERE position = $1';
    params.push(position as string);
  }
  query += ' ORDER BY position, sort_order';
  const result = await pool.query(query, params);
  res.json({ data: result.rows });
}

export async function createMenuItem(req: Request, res: Response) {
  const { label, url, icon, parent_id, position = 'header', sort_order } = req.body;
  if (!label?.trim() || !url?.trim()) {
    return res.status(400).json({ error: 'Nhãn và URL không được trống' });
  }
  const result = await pool.query(
    `INSERT INTO site_menus (label, url, icon, parent_id, position, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [label.trim(), url.trim(), icon || null, parent_id || null, position, sort_order ?? 0]
  );
  res.status(201).json(result.rows[0]);
}

export async function updateMenuItem(req: Request, res: Response) {
  const { id } = req.params;
  const { label, url, icon, parent_id, position, sort_order, is_active } = req.body;
  if (!label?.trim() || !url?.trim()) {
    return res.status(400).json({ error: 'Nhãn và URL không được trống' });
  }
  const result = await pool.query(
    `UPDATE site_menus SET label = $1, url = $2, icon = $3, parent_id = $4, position = $5, sort_order = $6, is_active = $7, updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [label.trim(), url.trim(), icon || null, parent_id || null, position ?? 'header', sort_order ?? 0, is_active ?? true, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Menu item không tồn tại' });
  res.json(result.rows[0]);
}

export async function deleteMenuItem(req: Request, res: Response) {
  const { id } = req.params;
  // Also delete children
  await pool.query('DELETE FROM site_menus WHERE parent_id = $1', [id]);
  const result = await pool.query('DELETE FROM site_menus WHERE id = $1 RETURNING id', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Menu item không tồn tại' });
  res.json({ success: true });
}

export async function reorderMenu(req: Request, res: Response) {
  const { items } = req.body; // [{id, sort_order, parent_id}]
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(
        'UPDATE site_menus SET sort_order = $1, parent_id = $2, updated_at = NOW() WHERE id = $3',
        [item.sort_order ?? 0, item.parent_id || null, item.id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Lỗi khi cập nhật thứ tự menu' });
  } finally {
    client.release();
  }
}
