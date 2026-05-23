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

const dbName = process.env.DB_NAME || 'natif_online_manager';

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
      role VARCHAR(20) DEFAULT 'enterprise' CHECK (role IN ('admin','moderator','enterprise','expert','officer','dept_head','director','clerk')),
      phone VARCHAR(50),
      company VARCHAR(255),
      is_verified BOOLEAN DEFAULT false,
      verified_at TIMESTAMP,
      verified_by UUID REFERENCES users(id),
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

  // Create enterprise_profiles table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enterprise_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      company_name VARCHAR(255) NOT NULL,
      tax_code VARCHAR(50) NOT NULL,
      company_address TEXT,
      district VARCHAR(100),
      city VARCHAR(100),
      phone VARCHAR(50),
      email VARCHAR(255),
      website VARCHAR(255),
      company_type VARCHAR(100),
      founding_date DATE,
      business_lines TEXT,
      employee_count INTEGER,
      charter_capital DECIMAL(15,2),
      total_assets DECIMAL(15,2),
      rep_name VARCHAR(255),
      rep_position VARCHAR(255),
      rep_id_no VARCHAR(50),
      rep_id_issued_date DATE,
      rep_id_issued_place VARCHAR(255),
      rep_phone VARCHAR(50),
      rep_email VARCHAR(255),
      bank_name VARCHAR(255),
      bank_branch VARCHAR(255),
      bank_account_no VARCHAR(50),
      bank_account_name VARCHAR(255),
      doc_dkkd_url TEXT,
      verification_status VARCHAR(20) DEFAULT 'submitted' CHECK (verification_status IN ('draft','submitted','verified','rejected')),
      verification_notes TEXT,
      verified_at TIMESTAMP,
      verified_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: enterprise_profiles');

  // Create application_documents table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS application_documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      document_type VARCHAR(50) NOT NULL,
      file_url TEXT NOT NULL,
      file_name VARCHAR(255),
      file_size INTEGER,
      mime_type VARCHAR(100),
      uploaded_at TIMESTAMP DEFAULT NOW(),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
      reviewer_notes TEXT,
      reviewed_by UUID REFERENCES users(id),
      reviewed_at TIMESTAMP
    )
  `);
  console.log('Table: application_documents');

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

  // Expert profile tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      date_of_birth DATE,
      birth_place VARCHAR(255),
      gender VARCHAR(10),
      id_number VARCHAR(50),
      id_issued_date DATE,
      id_issued_place VARCHAR(255),
      hometown VARCHAR(255),
      nationality VARCHAR(100) DEFAULT 'Việt Nam',
      address TEXT,
      province VARCHAR(100),
      bank_account VARCHAR(50),
      bank_account_name VARCHAR(255),
      bank_name VARCHAR(255),
      bank_branch VARCHAR(255),
      academic_degree VARCHAR(20),
      degree_year INTEGER,
      academic_title VARCHAR(20),
      title_year INTEGER,
      expertise_fields TEXT[],
      avatar_url TEXT,
      profile_completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_profiles');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_education (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      expert_profile_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
      period VARCHAR(50),
      education_system VARCHAR(100),
      institution VARCHAR(500),
      country VARCHAR(100),
      major VARCHAR(255),
      degree VARCHAR(100),
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_education');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_work_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      expert_profile_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
      period_start VARCHAR(20),
      period_end VARCHAR(20),
      organization VARCHAR(500),
      address_phone VARCHAR(500),
      position VARCHAR(255),
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_work_history');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_research_projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      expert_profile_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      start_year VARCHAR(20),
      end_year VARCHAR(20),
      funding_agency VARCHAR(255),
      role VARCHAR(100),
      status VARCHAR(50),
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_research_projects');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_publications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      expert_profile_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      authors TEXT,
      publisher VARCHAR(500),
      year INTEGER,
      publication_type VARCHAR(50),
      doi VARCHAR(255),
      issn VARCHAR(50),
      author_role VARCHAR(100),
      journal_rank VARCHAR(50),
      impact_factor DECIMAL(5,3),
      citations INTEGER DEFAULT 0,
      notes TEXT,
      source_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_publications');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_patents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      expert_profile_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
      citation TEXT NOT NULL,
      author_role VARCHAR(100),
      protection_type VARCHAR(100),
      country VARCHAR(100),
      status VARCHAR(50),
      reference_link TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_patents');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_awards (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      expert_profile_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      author_role VARCHAR(100),
      awarding_body VARCHAR(255),
      year INTEGER,
      notes TEXT,
      reference_link TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_awards');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_books (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      expert_profile_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      link TEXT,
      authors TEXT,
      publisher VARCHAR(255),
      isbn VARCHAR(50),
      notes TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_books');

  // Assignment & Review tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_assignments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
      expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
      assigned_by UUID REFERENCES users(id),
      assigned_at TIMESTAMP DEFAULT NOW(),
      deadline DATE,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','completed','declined')),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_assignments');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expert_reviews (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assignment_id UUID REFERENCES expert_assignments(id) ON DELETE CASCADE,
      expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
      application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
      score_innovation INTEGER CHECK (score_innovation BETWEEN 1 AND 10),
      score_feasibility INTEGER CHECK (score_feasibility BETWEEN 1 AND 10),
      score_impact INTEGER CHECK (score_impact BETWEEN 1 AND 10),
      score_budget INTEGER CHECK (score_budget BETWEEN 1 AND 10),
      score_team INTEGER CHECK (score_team BETWEEN 1 AND 10),
      overall_score DECIMAL(3,1),
      recommendation VARCHAR(20) CHECK (recommendation IN ('approve','reject','revise')),
      strengths TEXT,
      weaknesses TEXT,
      comments TEXT,
      submitted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: expert_reviews');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS application_workflow (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
      from_status VARCHAR(30),
      to_status VARCHAR(30) NOT NULL,
      action_by UUID REFERENCES users(id),
      action_role VARCHAR(20),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table: application_workflow');

  // Create indexes
  await pool.query('CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(program_type)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_profiles_user ON expert_profiles(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_education_profile ON expert_education(expert_profile_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_work_profile ON expert_work_history(expert_profile_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_research_profile ON expert_research_projects(expert_profile_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_publications_profile ON expert_publications(expert_profile_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_patents_profile ON expert_patents(expert_profile_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_awards_profile ON expert_awards(expert_profile_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_books_profile ON expert_books(expert_profile_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_assignments_app ON expert_assignments(application_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_assignments_expert ON expert_assignments(expert_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_reviews_app ON expert_reviews(application_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_expert_reviews_expert ON expert_reviews(expert_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_workflow_app ON application_workflow(application_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_enterprise_profiles_user ON enterprise_profiles(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_enterprise_profiles_tax ON enterprise_profiles(tax_code)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_application_documents_app ON application_documents(application_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_application_documents_user ON application_documents(user_id)');

  console.log('Indexes created');

  // Create expert user if not exists
  const expertExists = await pool.query("SELECT id FROM users WHERE email = 'expert@natif.gov.vn'");
  if (!expertExists.rows.length) {
    const hash = await bcrypt.hash('Expert@Natif2026', 12);
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, phone, company) VALUES ($1,$2,$3,$4,$5,$6)`,
      ['expert@natif.gov.vn', hash, 'Chuyên gia mẫu', 'expert', '0912345678', 'Trường Đại học Bách khoa Hà Nội']
    );
    console.log('Expert user created: expert@natif.gov.vn');
  }

  // Create role-based seed accounts
  const seedAccounts = [
    { email: 'officer@natif.gov.vn', name: 'Chuyên viên Quỹ', role: 'officer' },
    { email: 'clerk@natif.gov.vn', name: 'Văn thư Quỹ', role: 'clerk' },
    { email: 'depthead@natif.gov.vn', name: 'Trưởng phòng', role: 'dept_head' },
    { email: 'director@natif.gov.vn', name: 'Giám đốc Quỹ', role: 'director' },
    { email: 'moderator@natif.gov.vn', name: 'Moderator', role: 'moderator' },
  ];
  for (const acc of seedAccounts) {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [acc.email]);
    if (!exists.rows.length) {
      const hash = await bcrypt.hash('Natif@2026', 12);
      await pool.query(
        `INSERT INTO users (email, password_hash, full_name, role, company) VALUES ($1,$2,$3,$4,$5)`,
        [acc.email, hash, acc.name, acc.role, 'Quỹ Đổi mới công nghệ quốc gia']
      );
      console.log(`Created: ${acc.email} (${acc.role})`);
    }
  }

  console.log('Database setup complete!');
  await pool.end();
}

setup().catch(console.error);
