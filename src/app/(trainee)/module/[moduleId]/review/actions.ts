'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReviewQuiz(moduleId: string, submittedAnswers: { index: number, selectedOption: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized' }

  // Fetch module review content to verify answers on the server
  const { data: moduleData } = await supabase.from('modules').select('review_content').eq('id', moduleId).single()
  if (!moduleData || !moduleData.review_content) return { error: 'No review quiz found' }

  const questions = moduleData.review_content as { question: string; options: string[]; answerIndex: number }[]

  let correctCount = 0
  questions.forEach((q, idx) => {
    const submitted = submittedAnswers.find(sa => sa.index === idx)
    if (submitted && submitted.selectedOption === q.answerIndex) {
      correctCount++
    }
  })

  const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 100
  const isPassing = score >= 70

  // Record the review submission
  await supabase.from('module_reviews').insert({
    trainee_id: user.id,
    module_id: moduleId,
    score,
    is_passing: isPassing,
  })

  // Revalidate
  revalidatePath('/dashboard')
  revalidatePath(`/module/${moduleId}`)

  return { success: true, score, isPassing }
}
