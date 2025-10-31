// lib/supabaseAdminClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ตรวจสอบ Key ที่ Server ต้องใช้
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Key is missing from .env.local (for Admin Client)")
}

// สร้างและ export เฉพาะ Admin Client
export const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey)