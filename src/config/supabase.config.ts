import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Use environment variables for the Supabase URL and API key
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL or API key is missing in .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
