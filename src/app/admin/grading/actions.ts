'use server'

import { createClient as createAuthClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function saveScore(traineeId: string, score: number) {
  // Verify caller is admin
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Not authorized' }

  const adminClient = getAdminClient()
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  const isPassing = score >= 70

  // Use upsert — requires unique constraint on trainee_id
  const { error } = await adminClient.from('summative_scores').upsert({
    trainee_id: traineeId,
    score: score,
    is_passing: isPassing,
    updated_at: new Date().toISOString()
  }, { onConflict: 'trainee_id' })

  if (error) {
    console.error('Save score error:', error.message)
    return { error: error.message }
  }
  
  revalidatePath('/admin/grading')
  return { success: true }
}
