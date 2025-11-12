import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfrffizseufnhqusrpdg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcmZmaXpzZXVmbmhxdXNycGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDU1MzgsImV4cCI6MjA3ODUyMTUzOH0.cCPID8j-io11M1hn1_vuUe-O5WQcOza0_kewW_XEpA8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
