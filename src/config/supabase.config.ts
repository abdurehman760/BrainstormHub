import { createClient } from '@supabase/supabase-js';

// Your Supabase URL and API key from the Supabase dashboard
const SUPABASE_URL = 'https://szpkfzdxilhdzkszzscj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cGtmemR4aWxoZHprc3p6c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwMzE5MzEsImV4cCI6MjA0ODYwNzkzMX0.LZrS5j-jxZWjvLqJ5dXVNviXEE0tKDlnwUpi3m1lGMs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
