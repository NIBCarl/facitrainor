'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

// We use the service role key to bypass RLS and create users via the admin API
// without logging the current admin out.
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createTrainee(formData: FormData) {
  const supabase = await createClient() // Verify caller is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authorized' }
  
  // Use service role client to check admin status (bypasses RLS)
  const adminClient = getAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const adminAuthClient = getAdminClient()

  // Use the admin API to create the user directly
  const { data, error } = await adminAuthClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'trainee'
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
