import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, ClipboardList, ArrowLeft } from 'lucide-react'

export default async function TraineeModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: moduleData } = await supabase.from('modules').select('id, title, review_content').eq('id', moduleId).single()
  const { data: pages } = await supabase.from('pages').select('id, title, order_index').eq('module_id', moduleId).order('order_index', { ascending: true })
  
  const { data: submissions } = await supabase.from('submissions').select('page_id, is_passing').eq('trainee_id', user!.id)
  const passedPageIds = new Set(submissions?.filter(s => s.is_passing).map(s => s.page_id))

  const hasReviewQuiz = moduleData?.review_content && moduleData.review_content.length > 0
  const { data: reviewResult } = await supabase
    .from('module_reviews')
    .select('is_passing, score')
    .eq('trainee_id', user!.id)
    .eq('module_id', moduleId)
    .eq('is_passing', true)
    .limit(1)
  const reviewPassed = reviewResult && reviewResult.length > 0
  const allPagesPassed = pages && pages.length > 0 && pages.every(p => passedPageIds.has(p.id))

  if (!moduleData) return <div className="text-center py-12 text-warm-gray">Module not found</div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-navy transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-navy">{moduleData.title}</h2>
      </div>

      {/* Lessons List */}
      <Card className="bg-ivory border-gold/20 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Lessons & Quizzes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 md:px-6">
          {pages?.map((p, idx) => {
            const isPassed = passedPageIds.has(p.id)
            let isUnlocked = idx === 0 || passedPageIds.has(pages[idx - 1].id)

            return (
              <div key={p.id} className={`flex items-center justify-between p-3 md:p-4 rounded-lg transition-all ${
                isPassed 
                  ? 'bg-forest/5 border border-forest/20' 
                  : isUnlocked 
                    ? 'bg-cream border border-gold/20 hover:border-gold/40' 
                    : 'bg-muted/50 border border-dashed border-warm-gray/20 opacity-60'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  {isPassed 
                    ? <CheckCircle2 className="text-forest h-5 w-5 flex-shrink-0" /> 
                    : <Circle className="text-warm-gray/40 h-5 w-5 flex-shrink-0" />
                  }
                  <span className={`font-medium text-sm md:text-base truncate ${isPassed ? 'text-navy' : 'text-navy/80'}`}>
                    {p.order_index}. {p.title}
                  </span>
                </div>
                {isUnlocked ? (
                  <Link href={`/module/${moduleData.id}/page/${p.id}`}>
                    <Button 
                      variant={isPassed ? "outline" : "default"} 
                      size="sm"
                      className={`flex-shrink-0 text-xs h-9 ${
                        !isPassed ? 'navy-gradient text-ivory hover:opacity-90' : 'border-navy/20 text-navy'
                      }`}
                    >
                      {isPassed ? 'Review' : 'Start'}
                    </Button>
                  </Link>
                ) : (
                  <Button disabled variant="ghost" size="sm" className="text-xs h-9 text-warm-gray">Locked</Button>
                )}
              </div>
            )
          })}
          {pages?.length === 0 && (
            <div className="text-warm-gray text-center py-8 text-sm">No content yet.</div>
          )}
        </CardContent>
      </Card>

      {/* Module Review Quiz */}
      {hasReviewQuiz && (
        <Card className={`shadow-sm ${
          reviewPassed 
            ? 'border-forest/30 bg-forest/5' 
            : allPagesPassed 
              ? 'border-gold/40 bg-gold/5' 
              : 'border-warm-gray/20 bg-muted/30 opacity-60'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className={`h-5 w-5 ${reviewPassed ? 'text-forest' : 'text-gold-dark'}`} />
              <span className="text-navy">Module Review Quiz</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewPassed ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-forest font-medium text-sm">✓ Review quiz passed!</p>
                  <p className="text-xs text-warm-gray mt-0.5">Score: {reviewResult[0].score.toFixed(0)}%</p>
                </div>
                <Link href={`/module/${moduleId}/review`}>
                  <Button variant="outline" size="sm" className="text-xs border-forest/30 text-forest">Review</Button>
                </Link>
              </div>
            ) : allPagesPassed ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm text-gold-dark">All lessons done! Take the review quiz to unlock the next module.</p>
                  <p className="text-xs text-warm-gray mt-0.5">You need 70% or higher to pass.</p>
                </div>
                <Link href={`/module/${moduleId}/review`}>
                  <Button className="gold-gradient text-navy font-semibold hover:opacity-90 shadow-sm text-sm h-10 px-6">
                    Take Quiz
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-warm-gray text-sm">Complete all lessons to unlock the review quiz.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
