import pg from 'pg';
const { Pool } = pg;
import { config } from 'dotenv';

config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;