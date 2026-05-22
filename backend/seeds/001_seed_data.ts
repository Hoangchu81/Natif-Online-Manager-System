/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(db: Knex): Promise<void> {
  // Programs are already seeded by setup-db.ts
  // Only seed additional test data here if needed

  // Example: seed a test user (uncomment for development)
  // const hash = await bcrypt.hash('testpass123', 12);
  // await db('users').insert({
  //   email: 'test@example.com',
  //   password_hash: hash,
  //   full_name: 'Test User',
  //   role: 'enterprise',
  // }).onConflict('email').ignore();
}
