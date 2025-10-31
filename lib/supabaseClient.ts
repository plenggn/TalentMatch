// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ตรวจสอบเฉพาะ Key ที่ Client ต้องใช้
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from .env.local")
}

// สร้างและ export เฉพาะ Client สำหรับ Frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey)