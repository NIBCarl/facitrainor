'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitQuiz(pageId: string, submittedAnswers: { index: number, selectedOption: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized' }

  // Fetch page content to verify answers securely on the server
  const { data: page } = await supabase.from('pages').select('content').eq('id', pageId).single()
  if (!page) return { error: 'Page not found' }

  const content = page.content || []
  let correctCount = 0
  let totalQuizzes = 0

  // Grade
  content.forEach((block: any, idx: number) => {
    if (block.type === 'quiz') {
      totalQuizzes++
      const submitted = submittedAnswers.find(sa => sa.index === idx)
      if (submitted && submitted.selectedOption === block.answerIndex) {
        correctCount++
      }
    }
  })

  // Determine pass/fail
  let score = 100
  let isPassing = true

  if (totalQuizzes > 0) {
    score = (correctCount / totalQuizzes) * 100
    isPassing = score >= 70
  }

  // Record submission
  await supabase.from('submissions').insert({
    trainee_id: user.id,
    page_id: pageId,
    score: score,
    is_passing: isPassing
  })

  // Revalidate UI
  revalidatePath('/dashboard')
  revalidatePath(`/module`)

  return { success: true, score, isPassing }
}
