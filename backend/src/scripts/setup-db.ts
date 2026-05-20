import pg from 'pg';
const { Pool } = pg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const adminPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const dbName = process.env.DB_NAME || 'natif_oms';

async function setup() {
  console.log('Setting up NATIF OMS database...');

  // Create database if not exists
  try {
    const dbCheck = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (!dbCheck.rows.length) {
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created`);
    } else {
      console.log(`Database '${dbName}' already exists`);
    }
  } catch (e: any) {
    if (e.code !== '42P04') console.log('DB may already exist:', e.message);
  }

  await adminPool.end();

  // Connect to the new database
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: dbName,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  // Create extensions
  await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin','user')),
      phone VARCHAR(50),
      company VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: users');

  // Create applications table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      program_type VARCHAR(50) NOT NULL CHECK (program_type IN ('interest_subsidy','sponsorship','voucher','ecosystem')),
      company_name VARCHAR(255) NOT NULL,
      tax_code VARCHAR(50) NOT NULL,
      contact_name VARCHAR(255) NOT NULL,
      contact_email VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(50),
      title VARCHAR(500) NOT NULL,
      description TEXT,
      budget_requested DECIMAL(15,2) NOT NULL,
      status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft','submitted','reviewing','approved','rejected')),
      submitted_at TIMESTAMP,
      reviewed_at TIMESTAMP,
      reviewer_notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: applications');

  // Create programs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS programs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      requirements TEXT[],
      max_budget DECIMAL(15,2),
      min_budget DECIMAL(15,2),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: programs');

  // Create news table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS news (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(500) NOT NULL,
      content TEXT,
      excerpt TEXT,
      category VARCHAR(30) CHECK (category IN ('activity','tech','announcement')),
      author VARCHAR(255),
      published_at TIMESTAMP DEFAULT NOW(),
      is_featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: news');

  // Seed programs
  const programsExist = await pool.query('SELECT COUNT(*) FROM programs');
  if (parseInt(programsExist.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO programs (slug, name, description, requirements, max_budget, min_budget, is_active) VALUES
      ('interest_subsidy', 'Hỗ trợ lãi suất vay',
       'Quỹ Đổi mới công nghệ quốc gia hỗ trợ lãi suất vay cho doanh nghiệp thực hiện dự án đổi mới công nghệ, chuyển giao công nghệ.',
       ARRAY['Doanh nghiệp thành lập theo pháp luật Việt Nam','Có dự án đổi mới công nghệ được phê duyệt','Khoản vay tại ngân hàng thương mại được phép'],
       5000000000, 100000000, true),
      ('sponsorship', 'Tài trợ, đặt hàng',
       'Tài trợ một phần hoặc toàn bộ kinh phí không hoàn lại cho doanh nghiệp và tổ chức thực hiện các nhiệm vụ khoa học, công nghệ và đổi mới sáng tạo.',
       ARRAY['Nhiệm vụ phù hợp với định hướng phát triển KH&CN quốc gia','Đội ngũ kỹ thuật đủ năng lực','Cam kết kết quả và tiến độ rõ ràng'],
       2000000000, 200000000, true),
      ('voucher', 'Hỗ trợ voucher',
       'Hỗ trợ voucher cho doanh nghiệp tiếp cận dịch vụ công nghệ, đào tạo, tư vấn chuyên gia trong lĩnh vực đổi mới sáng tạo.',
       ARRAY['Doanh nghiệp SME theo quy định pháp luật','Chưa từng được hỗ trợ voucher trong năm','Cam kết sử dụng voucher đúng mục đích'],
       100000000, 10000000, true),
      ('ecosystem', 'Thúc đẩy hệ sinh thái khởi nghiệp sáng tạo',
       'Hỗ trợ hoạt động phát triển hệ thống đổi mới sáng tạo, hệ sinh thái khởi nghiệp sáng tạo, thúc đẩy văn hóa đổi mới sáng tạo và khởi nghiệp sáng tạo.',
       ARRAY['Tổ chức, cá nhân hoạt động trong hệ sinh thái đổi mới sáng tạo','Có kế hoạch hoạt động cụ thể','Tác động xã hội rõ ràng'],
       3000000000, 50000000, true)
    `);
    console.log('Seeded: 4 programs');
  }

  // Seed news
  const newsExist = await pool.query('SELECT COUNT(*) FROM news');
  if (parseInt(newsExist.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO news (slug, title, content, excerpt, category, author, published_at, is_featured) VALUES
      ('thu-tuong-khoa-hoc-cong-nghe-la-yeu-to-so-cuong',
       'Thủ tướng Chính phủ Lê Minh Hưng: Khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số là yếu tố sống còn để hiện thực hóa khát vọng Việt Nam 2045',
       'Nhấn mạnh tầm quan trọng của khoa học, công nghệ và đổi mới sáng tạo trong phát triển kinh tế - xã hội, Thủ tướng Chính phủ Lê Minh Hưng khẳng định đây là yếu tố then chốt để hiện thực hóa khát vọng đưa Việt Nam trở thành nước phát triển có thu nhập cao vào năm 2045.',
       'Thủ tướng khẳng định khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số là yếu tố sống còn để hiện thực hóa khát vọng Việt Nam 2045.',
       'activity', 'Le Tuyet', '2026-05-19', true),
      ('natif-khao-sat-nhu-cau-ho-tro-2026',
       'Quỹ Đổi mới công nghệ quốc gia khảo sát nhu cầu tài trợ, hỗ trợ lãi suất vay và hỗ trợ voucher năm 2026',
       'Quỹ Đổi mới công nghệ quốc gia (NATIF) thông báo tiến hành khảo sát nhu cầu tài trợ, hỗ trợ lãi suất vay và hỗ trợ voucher của các doanh nghiệp trong năm 2026 nhằm xây dựng kế hoạch hỗ trợ phù hợp.',
       'NATIF khảo sát nhu cầu tài trợ, hỗ trợ lãi suất vay và voucher năm 2026 để xây dựng kế hoạch hỗ trợ phù hợp cho doanh nghiệp.',
       'announcement', 'Le Tuyet', '2026-04-10', true),
      ('bo-truong-vu-hai-quan-uy-vien-ban-chi-dao',
       'Bộ trưởng Vũ Hải Quân là Ủy viên Ban Chỉ đạo TW về phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số',
       'Bộ trưởng Bộ Khoa học và Công nghệ Vũ Hải Quân được bổ nhiệm làm Ủy viên Ban Chỉ đạo Trung ương về phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số.',
       'Bộ trưởng Vũ Hải Quân được bổ nhiệm làm Ủy viên Ban Chỉ đạo Trung ương về phát triển KH&CN, ĐMST và chuyển đổi số.',
       'activity', 'Le Tuyet', '2026-05-15', false),
      ('quy-dau-tu-mao-hiem-cong-nghe-noi-that-nghien-cuu',
       'Quỹ đầu tư mạo hiểm công nghệ được kỳ vọng gắn kết giữa nghiên cứu khoa học với dòng vốn tài chính',
       'Việc thành lập các quỹ đầu tư mạo hiểm công nghệ được kỳ vọng sẽ tạo cầu nối hiệu quả giữa nghiên cứu khoa học và dòng vốn tài chính, thúc đẩy thương mại hóa kết quả nghiên cứu.',
       'Quỹ đầu tư mạo hiểm công nghệ được kỳ vọng gắn kết nghiên cứu khoa học với dòng vốn tài chính.',
       'activity', 'Le Tuyet', '2026-05-15', false),
      ('viet-nam-an-do-hop-tac-cong-nghe-lon',
       'Việt Nam – Ấn Độ hợp tác phát triển hệ sinh thái khởi nghiệp công nghệ lõi',
       'Hai nước Việt Nam và Ấn Độ đã ký Biên bản ghi nhớ hợp tác trong lĩnh vực khởi nghiệp công nghệ lõi, tập trung vào AI, semiconductor và công nghệ sạch.',
       'Việt Nam – Ấn Độ hợp tác phát triển hệ sinh thái khởi nghiệp công nghệ lõi, tập trung vào AI, semiconductor và công nghệ sạch.',
       'tech', 'Le Tuyet', '2026-05-06', false),
      ('5-du-an-hop-tac-vien-semiconductor',
       'Bộ KH&CN công bố 5 dự án hợp tác nghiên cứu chip bán dẫn Việt Nam – Nhật Bản',
       'Bộ Khoa học và Công nghệ công bố 5 dự án hợp tác nghiên cứu chip bán dẫn giữa Việt Nam và Nhật Bản, đánh dấu bước tiến quan trọng trong chiến lược phát triển ngành công nghiệp bán dẫn quốc gia.',
       'Bộ KH&CN công bố 5 dự án hợp tác nghiên cứu chip bán dẫn Việt Nam – Nhật Bản.',
       'tech', 'Le Tuyet', '2026-05-04', false),
      ('cong-khai-ngan-sach-2026',
       'Công khai ngân sách Quý I năm 2026',
       'Quỹ Đổi mới công nghệ quốc gia công bố báo cáo tài chính Quý I năm 2026, bao gồm chi tiết thu chi và kết quả giải ngân các chương trình hỗ trợ.',
       'NATIF công bố báo cáo tài chính Quý I năm 2026 với chi tiết thu chi và kết quả giải ngân.',
       'announcement', 'Le Tuyet', '2026-04-10', false),
      ('natif-xay-dung-nghi-dinh-rieng',
       'NATIF triển khai xây dựng Nghị định riêng về tổ chức và hoạt động của Quỹ',
       'Theo Khoản 2, Điều 64 Luật Khoa học công nghệ và đổi mới sáng tạo năm 2025, NATIF đang triển khai xây dựng Nghị định riêng về tổ chức và hoạt động nhằm nâng cao hiệu quả hoạt động của Quỹ.',
       'NATIF triển khai xây dựng Nghị định riêng về tổ chức và hoạt động theo Luật KHCN và ĐMST 2025.',
       'announcement', 'Phung Nguyen', '2026-01-12', false)
    `);
    console.log('Seeded: 8 news articles');
  }

  // Create admin user if not exists
  const adminExists = await pool.query("SELECT id FROM users WHERE email = 'admin@natif.gov.vn'");
  if (!adminExists.rows.length) {
    const hash = await bcrypt.hash('admin123', 12);
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, phone, company) VALUES ($1,$2,$3,$4,$5,$6)`,
      ['admin@natif.gov.vn', hash, 'Quản trị viên', 'admin', '0913060581', 'Quỹ Đổi mới công nghệ quốc gia']
    );
    console.log('Admin user created: admin@natif.gov.vn / admin123');
  }

  // Create indexes
  await pool.query('CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(program_type)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC)');

  console.log('Indexes created');
  console.log('Database setup complete!');
  await pool.end();
}

setup().catch(console.error);
