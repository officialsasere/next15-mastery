// Update your imports:
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http'; // Change from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Initialize the Neon driver function
const sql = neon(process.env.DATABASE_URL); 

// Pass the driver to Drizzle
export const db = drizzle(sql, {schema});

