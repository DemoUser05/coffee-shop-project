const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase клієнт ініціалізовано в конфігурації');
} else {
  console.warn('⚠️  Supabase не налаштовано в .env файлі');
  supabase = null;
}

module.exports = { supabase };