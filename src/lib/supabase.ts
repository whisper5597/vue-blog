import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const user = ref<any>(null)

supabase.auth.getUser().then(({ data }) => {
  user.value = data.user
})

supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null
})