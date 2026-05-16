'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createModule(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const order_index = parseInt(formData.get('order_index') as string, 10) || 0

  const { error } = await supabase.from('modules').insert([{ title, order_index }])
  if (error) {
    console.error('Create module error:', error.message)
  }
  revalidatePath('/admin/content')
  redirect('/admin/content')
}

export async function createPage(moduleId: string, formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const order_index = parseInt(formData.get('order_index') as string, 10) || 0

  const { error } = await supabase.from('pages').insert([{ module_id: moduleId, title, order_index, content: [] }])
  if (error) {
    console.error('Create page error:', error.message)
  }
  revalidatePath(`/admin/content/${moduleId}`)
  redirect(`/admin/content/${moduleId}`)
}

export async function savePageContent(pageId: string, content: any[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('pages').update({ content }).eq('id', pageId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/content`)
  return { success: true }
}

export async function saveReviewQuiz(moduleId: string, reviewContent: any[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('modules').update({ review_content: reviewContent }).eq('id', moduleId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/content/${moduleId}`)
  return { success: true }
}

export async function deleteModule(moduleId: string) {
  // Use service role to bypass RLS for cascading deletes
  const supabase = getAdminClient()
  
  // Verify caller is admin
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  // Get all pages for this module (to clean up submissions)
  const { data: pages } = await supabase.from('pages').select('id').eq('module_id', moduleId)
  const pageIds = pages?.map(p => p.id) || []

  // Delete related data in correct order
  if (pageIds.length > 0) {
    await supabase.from('submissions').delete().in('page_id', pageIds)
    await supabase.from('pages').delete().eq('module_id', moduleId)
  }
  await supabase.from('module_reviews').delete().eq('module_id', moduleId)
  
  // Delete the module itself
  const { error } = await supabase.from('modules').delete().eq('id', moduleId)
  if (error) return { error: error.message }

  revalidatePath('/admin/content')
  return { success: true }
}

export async function deletePage(pageId: string, moduleId: string) {
  const supabase = getAdminClient()
  
  // Verify caller is admin
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  // Delete related submissions first
  await supabase.from('submissions').delete().eq('page_id', pageId)
  
  // Delete the page
  const { error } = await supabase.from('pages').delete().eq('id', pageId)
  if (error) return { error: error.message }

  revalidatePath(`/admin/content/${moduleId}`)
  return { success: true }
}

export async function renameModule(moduleId: string, newTitle: string, newOrder?: number) {
  const supabase = await createClient()

  const updates: Record<string, any> = { title: newTitle.trim() }
  if (newOrder !== undefined) updates.order_index = newOrder

  const { error } = await supabase.from('modules').update(updates).eq('id', moduleId)
  if (error) return { error: error.message }

  revalidatePath('/admin/content')
  return { success: true }
}

export async function renamePage(pageId: string, moduleId: string, newTitle: string, newOrder?: number) {
  const supabase = await createClient()

  const updates: Record<string, any> = { title: newTitle.trim() }
  if (newOrder !== undefined) updates.order_index = newOrder

  const { error } = await supabase.from('pages').update(updates).eq('id', pageId)
  if (error) return { error: error.message }

  revalidatePath(`/admin/content/${moduleId}`)
  return { success: true }
}
