import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { ReviewQuizClient } from './ReviewQuizClient'
import { ArrowLeft } from 'lucide-react'

export default async function ReviewQuizPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: moduleData } = await supabase.from('modules').select('id, title, review_content').eq('id', moduleId).single()
  if (!moduleData || !moduleData.review_content || moduleData.review_content.length === 0) {
    return (
      <div className="space-y-4">
        <Link href={`/module/${moduleId}`} className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-navy transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Module
        </Link>
        <div className="text-center py-12 text-warm-gray">No review quiz has been set for this module yet.</div>
      </div>
    )
  }

  const { data: existingReview } = await supabase
    .from('module_reviews')
    .select('score, is_passing')
    .eq('trainee_id', user.id)
    .eq('module_id', moduleId)
    .eq('is_passing', true)
    .limit(1)

  const isAlreadyPassed = existingReview && existingReview.length > 0

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/module/${moduleId}`} className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-navy transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Module
        </Link>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-navy">
          Review: {moduleData.title}
        </h2>
      </div>

      <div className="p-4 bg-gold/10 rounded-lg border border-gold/25">
        <p className="text-sm text-navy">
          <strong>📋 End-of-Module Review</strong> — Score 70% or higher to unlock the next module.
        </p>
      </div>

      <ReviewQuizClient
        moduleId={moduleId}
        questions={moduleData.review_content}
        isAlreadyPassed={isAlreadyPassed || false}
      />
    </div>
  )
}
