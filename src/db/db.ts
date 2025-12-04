// src/db/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import dotenv from 'dotenv';


dotenv.config({ path: '.env.local' });

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  console.log("Database URL:", url);
  
  if (!url) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }
  
  return url;
};


const sql = neon(getDatabaseUrl());


export const db = drizzle(sql, { schema });