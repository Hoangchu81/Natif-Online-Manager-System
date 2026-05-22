import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { afterAll, beforeAll } from 'vitest';
import pg from 'pg';
const { Pool } = pg;

const testPool = new Pool({
  host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT || '5432'),
  database: process.env.TEST_DB_NAME || 'natif_oms_test',
  user: process.env.TEST_DB_USER || process.env.DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
});

beforeAll(async () => {
  // Verify test DB connection
  try {
    await testPool.query('SELECT 1');
  } catch {
    console.warn('[TEST] Test database not available — integration tests may be skipped');
  }
});

afterAll(async () => {
  await testPool.end();
});

export { testPool };
