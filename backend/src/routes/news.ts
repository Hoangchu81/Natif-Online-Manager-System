import type { Request, Response } from 'express';
import pool from '../config/database.js';

// ─── Auth Request ─────────────────────────────────────────────────────────────

interface AuthRequest extends Request {
  userId?: string;
}

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
  const { category, tag, search, limit = 9, page = 1 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  let query = 'SELECT * FROM news WHERE status = $1';
  const params: (string | number)[] = ['published'];
  let idx = 2;

  if (category) {
    query += ` AND category = $${idx++}`;
    params.push(category as string);
  }
  if (search) {
    query += ` AND (title ILIKE $${idx} OR excerpt ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }

  const limitParam = idx++;
  const offsetParam = idx;
  query += ` ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $${limitParam} OFFSET $${offsetParam}`;
  params.push(Number(limit), offset);

  // Build count query with same conditions
  const countParams: (string | number)[] = ['published'];
  let countIdx = 2;
  let countQuery = 'SELECT COUNT(*) FROM news WHERE status = $1';
  if (category) {
    countQuery += ` AND category = $${countIdx++}`;
    countParams.push(category as string);
  }
  if (search) {
    countQuery += ` AND (title ILIKE $${countIdx} OR excerpt ILIKE $${countIdx})`;
    countParams.push(`%${search}%`);
  }

  const [result, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, countParams),
  ]);

  res.setHeader('Cache-Control', 'public, max-age=300');
  const total = parseInt(countResult.rows[0].count);
  res.json({
    data: result.rows,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
}

export async function getNews(req: Request, res: Response) {
  const { slug } = req.params;
  const result = await pool.query('SELECT * FROM news WHERE slug = $1 AND status = $2', [slug, 'published']);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

  await pool.query('UPDATE news SET view_count = view_count + 1 WHERE slug = $1', [slug]);
  res.json(result.rows[0]);
}

export async function getNewsByIdPublic(req: Request, res: Response) {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json(result.rows[0]);
}

export async function listFeatured(req: Request, res: Response) {
  const result = await pool.query(
    `SELECT * FROM news WHERE is_featured = true AND status = 'published'
     ORDER BY published_at DESC NULLS LAST LIMIT 3`
  );
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json({ data: result.rows });
}

export async function listAnnouncements(req: Request, res: Response) {
  const { limit = 10 } = req.query;
  const result = await pool.query(
    `SELECT * FROM news WHERE category = 'thong-bao' AND status = 'published'
     ORDER BY published_at DESC NULLS LAST LIMIT $1`,
    [Number(limit)]
  );
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json({ data: result.rows });
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(req: Request, res: Response) {
  const result = await pool.query(
    `SELECT c.*,
      (SELECT COUNT(*) FROM news WHERE category = c.slug AND status = 'published') as article_count
     FROM news_categories c
     WHERE c.is_active = true
     ORDER BY c.sort_order`
  );
  res.json({ data: result.rows });
}

export async function createCategory(req: AuthRequest, res: Response) {
  const { name, description, sort_order, is_active = true } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Tên danh mục không được trống' });

  const slug = slugify(name);
  const existing = await pool.query('SELECT id FROM news_categories WHERE slug = $1', [slug]);
  if (existing.rows.length) return res.status(409).json({ error: 'Slug đã tồn tại, vui lòng chọn tên khác' });

  const result = await pool.query(
    `INSERT INTO news_categories (name, slug, description, sort_order, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name.trim(), slug, description || null, sort_order ?? 0, is_active]
  );
  res.status(201).json(result.rows[0]);
}

export async function updateCategory(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, description, sort_order, is_active } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Tên danh mục không được trống' });

  const result = await pool.query(
    `UPDATE news_categories
     SET name = $1, description = $2, sort_order = $3, is_active = $4, updated_at = NOW()
     WHERE id = $5 RETURNING *`,
    [name.trim(), description || null, sort_order ?? 0, is_active ?? true, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Danh mục không tồn tại' });
  res.json(result.rows[0]);
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const cat = await pool.query('SELECT slug FROM news_categories WHERE id = $1', [id]);
  if (!cat.rows.length) return res.status(404).json({ error: 'Danh mục không tồn tại' });

  const articleCount = await pool.query(
    'SELECT COUNT(*) FROM news WHERE category = $1 AND status = $2',
    [cat.rows[0].slug, 'published']
  );
  if (parseInt(articleCount.rows[0].count) > 0) {
    return res.status(409).json({
      error: `Danh mục đang có ${articleCount.rows[0].count} bài viết, không thể xóa. Hãy chuyển bài viết sang danh mục khác trước.`
    });
  }

  await pool.query('DELETE FROM news_categories WHERE id = $1', [id]);
  res.json({ success: true });
}

// ─── News Admin CRUD ─────────────────────────────────────────────────────────

export async function listNewsAdmin(req: AuthRequest, res: Response) {
  const { status, category, search, limit = 20, page = 1, featured } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  let query = `
    SELECT n.*, u.full_name as author_name
    FROM news n
    LEFT JOIN users u ON n.updated_by = u.id
    WHERE 1=1
  `;
  let countQuery = `SELECT COUNT(*) FROM news n WHERE 1=1`;
  const params: (string | number | boolean)[] = [];
  const countParams: (string | number | boolean)[] = [];
  let idx = 1;

  if (status && status !== 'all') {
    query += ` AND n.status = $${idx}`;
    countQuery += ` AND n.status = $${idx}`;
    params.push(status as string);
    countParams.push(status as string);
    idx++;
  }
  if (category && category !== 'all') {
    query += ` AND n.category = $${idx}`;
    countQuery += ` AND n.category = $${idx}`;
    params.push(category as string);
    countParams.push(category as string);
    idx++;
  }
  if (search) {
    query += ` AND (n.title ILIKE $${idx} OR n.excerpt ILIKE $${idx})`;
    countQuery += ` AND (n.title ILIKE $${idx} OR n.excerpt ILIKE $${idx})`;
    params.push(`%${search}%`);
    countParams.push(`%${search}%`);
    idx++;
  }
  if (featured === 'true') {
    query += ` AND n.is_featured = true`;
    countQuery += ` AND n.is_featured = true`;
  }

  query += ` ORDER BY n.updated_at DESC LIMIT $${idx++} OFFSET $${idx}`;
  params.push(Number(limit), offset);

  const [result, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, countParams),
  ]);

  res.json({
    data: result.rows,
    meta: {
      total: parseInt(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
    },
  });
}

export async function getNewsById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json(result.rows[0]);
}

export async function createNews(req: AuthRequest, res: Response) {
  const { title, content, excerpt, category, author, thumbnail, tags, status = 'draft', is_featured, published_at } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: 'Tiêu đề không được trống' });
  if (!category) return res.status(400).json({ error: 'Danh mục không được trống' });

  const slug = await uniqueSlug(title);
  const userId = (req as AuthRequest).userId;

  // Set published_at if status is published
  const effectiveStatus = status === 'published' ? 'published' : 'draft';
  const effectivePublishedAt = effectiveStatus === 'published'
    ? (published_at || new Date().toISOString())
    : null;

  const result = await pool.query(
    `INSERT INTO news (slug, title, content, excerpt, category, author, thumbnail, tags, status, is_featured, published_at, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
     RETURNING *`,
    [
      slug,
      title.trim(),
      content || '',
      excerpt || '',
      category,
      author || '',
      thumbnail || null,
      tags || null,
      effectiveStatus,
      is_featured ?? false,
      effectivePublishedAt,
      userId || null,
    ]
  );
  res.status(201).json(result.rows[0]);
}

export async function updateNews(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { title, content, excerpt, category, author, thumbnail, tags, status, is_featured, published_at } = req.body;

  const existing = await pool.query('SELECT id, status, published_at FROM news WHERE id = $1', [id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

  const updates: string[] = [];
  const params: (string | number | boolean | null)[] = [];
  let idx = 1;

  if (title !== undefined) { updates.push(`title = $${idx++}`); params.push(title.trim()); }
  if (content !== undefined) { updates.push(`content = $${idx++}`); params.push(content); }
  if (excerpt !== undefined) { updates.push(`excerpt = $${idx++}`); params.push(excerpt || ''); }
  if (category !== undefined) { updates.push(`category = $${idx++}`); params.push(category); }
  if (author !== undefined) { updates.push(`author = $${idx++}`); params.push(author); }
  if (thumbnail !== undefined) { updates.push(`thumbnail = $${idx++}`); params.push(thumbnail || null); }
  if (tags !== undefined) { updates.push(`tags = $${idx++}`); params.push(tags || null); }
  if (is_featured !== undefined) { updates.push(`is_featured = $${idx++}`); params.push(is_featured); }

  // Handle status change and published_at
  if (status !== undefined) {
    updates.push(`status = $${idx++}`);
    params.push(status);
    if (status === 'published') {
      // If publishing, set published_at if not already set
      const currentPublishedAt = existing.rows[0].published_at;
      if (!currentPublishedAt) {
        updates.push(`published_at = $${idx++}`);
        params.push(published_at || new Date().toISOString());
      }
    }
  }

  if (published_at !== undefined && published_at) {
    updates.push(`published_at = $${idx++}`);
    params.push(published_at);
  }

  updates.push(`updated_at = NOW()`);
  updates.push(`updated_by = $${idx++}`);
  params.push((req as AuthRequest).userId || null);
  params.push(id);

  const result = await pool.query(
    `UPDATE news SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  res.json(result.rows[0]);
}

export async function deleteNews(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json({ success: true });
}

// ─── Publish/Unpublish ───────────────────────────────────────────────────────

export async function publishNews(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await pool.query('SELECT status FROM news WHERE id = $1', [id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

  const result = await pool.query(
    `UPDATE news SET status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW(), updated_by = $1
     WHERE id = $2 RETURNING *`,
    [(req as AuthRequest).userId, id]
  );
  res.json(result.rows[0]);
}

export async function unpublishNews(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = await pool.query(
    `UPDATE news SET status = 'draft', updated_at = NOW(), updated_by = $1 WHERE id = $2 RETURNING *`,
    [(req as AuthRequest).userId, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json(result.rows[0]);
}

export async function toggleFeatured(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await pool.query('SELECT is_featured FROM news WHERE id = $1', [id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

  const result = await pool.query(
    `UPDATE news SET is_featured = NOT is_featured, updated_at = NOW(), updated_by = $1 WHERE id = $2 RETURNING *`,
    [(req as AuthRequest).userId, id]
  );
  res.json(result.rows[0]);
}

export async function duplicateNews(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const existing = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
  if (!existing.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

  const orig = existing.rows[0];
  const newSlug = await uniqueSlug(`${orig.title}-copy`);
  const userId = (req as AuthRequest).userId;

  const result = await pool.query(
    `INSERT INTO news (slug, title, content, excerpt, category, author, thumbnail, tags, status, is_featured, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', false, $9, $9)
     RETURNING *`,
    [
      newSlug,
      `[Bản sao] ${orig.title}`,
      orig.content,
      orig.excerpt,
      orig.category,
      orig.author,
      orig.thumbnail,
      orig.tags,
      userId || null,
    ]
  );
  res.status(201).json(result.rows[0]);
}

// ─── Bulk Actions ─────────────────────────────────────────────────────────────

export async function bulkAction(req: AuthRequest, res: Response) {
  const { ids, action } = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
  if (!['publish', 'unpublish', 'delete'].includes(action)) {
    return res.status(400).json({ error: 'Action không hợp lệ' });
  }

  const userId = (req as AuthRequest).userId;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (action === 'delete') {
      await client.query(`DELETE FROM news WHERE id = ANY($1)`, [ids]);
    } else if (action === 'publish') {
      await client.query(
        `UPDATE news SET status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW(), updated_by = $1 WHERE id = ANY($2)`,
        [userId, ids]
      );
    } else if (action === 'unpublish') {
      await client.query(
        `UPDATE news SET status = 'draft', updated_at = NOW(), updated_by = $1 WHERE id = ANY($2)`,
        [userId, ids]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, count: ids.length });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Lỗi khi thực hiện bulk action' });
  } finally {
    client.release();
  }
}

// ─── Related Articles ─────────────────────────────────────────────────────────

export async function getRelatedNews(req: Request, res: Response) {
  const { id } = req.params;
  const { category, limit = 3 } = req.query;

  const article = await pool.query('SELECT category FROM news WHERE id = $1', [id]);
  if (!article.rows.length) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

  const result = await pool.query(
    `SELECT id, slug, title, excerpt, thumbnail, category, author, published_at
     FROM news
     WHERE category = $1 AND id != $2 AND status = 'published'
     ORDER BY published_at DESC NULLS LAST
     LIMIT $3`,
    [article.rows[0].category, id, Number(limit)]
  );
  res.json({ data: result.rows });
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

export async function createMenuItem(req: AuthRequest, res: Response) {
  const { label, url, icon, parent_id, position = 'header', sort_order, is_active = true } = req.body;
  if (!label?.trim() || !url?.trim()) {
    return res.status(400).json({ error: 'Nhãn và URL không được trống' });
  }
  if (!url.match(/^(\/|https?:\/\/)/)) {
    return res.status(400).json({ error: 'URL phải bắt đầu bằng / hoặc http(s)://' });
  }
  const existing = await pool.query(
    'SELECT id FROM site_menus WHERE label = $1 AND position = $2',
    [label.trim(), position]
  );
  if (existing.rows.length) {
    return res.status(409).json({ error: 'Nhãn menu đã tồn tại ở vị trí này' });
  }

  const result = await pool.query(
    `INSERT INTO site_menus (label, url, icon, parent_id, position, sort_order, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [label.trim(), url.trim(), icon || null, parent_id || null, position, sort_order ?? 0, is_active]
  );
  res.status(201).json(result.rows[0]);
}

export async function updateMenuItem(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { label, url, icon, parent_id, position, sort_order, is_active } = req.body;
  if (!label?.trim() || !url?.trim()) {
    return res.status(400).json({ error: 'Nhãn và URL không được trống' });
  }
  if (!url.match(/^(\/|https?:\/\/)/)) {
    return res.status(400).json({ error: 'URL phải bắt đầu bằng / hoặc http(s)://' });
  }
  const result = await pool.query(
    `UPDATE site_menus
     SET label = $1, url = $2, icon = $3, parent_id = $4, position = $5, sort_order = $6, is_active = $7, updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [label.trim(), url.trim(), icon || null, parent_id || null, position ?? 'header', sort_order ?? 0, is_active ?? true, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Menu item không tồn tại' });
  res.json(result.rows[0]);
}

export async function deleteMenuItem(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await pool.query('DELETE FROM site_menus WHERE parent_id = $1', [id]);
  const result = await pool.query('DELETE FROM site_menus WHERE id = $1 RETURNING id', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Menu item không tồn tại' });
  res.json({ success: true });
}

export async function reorderMenu(req: AuthRequest, res: Response) {
  const { items } = req.body;
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
