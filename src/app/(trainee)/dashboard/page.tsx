import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Lock, Unlock, CheckCircle2, BookOpen } from 'lucide-react'

export default async function TraineeDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  // Fetch modules, pages, submissions, and review results
  const { data: modules } = await supabase.from('modules').select('*, review_content').order('order_index', { ascending: true }) || { data: [] }
  const { data: pages } = await supabase.from('pages').select('id, module_id') || { data: [] }
  const { data: submissions } = await supabase.from('submissions').select('page_id, is_passing').eq('trainee_id', user.id) || { data: [] }
  const { data: moduleReviews } = await supabase.from('module_reviews').select('module_id, is_passing').eq('trainee_id', user.id).eq('is_passing', true) || { data: [] }

  const passedPageIds = new Set(submissions?.filter(s => s.is_passing).map(s => s.page_id))
  const passedReviewModuleIds = new Set(moduleReviews?.map(r => r.module_id))

  let completedModulesCount = 0
  
  const moduleStatusList = modules?.map((mod, index) => {
    const modulePages = pages?.filter(p => p.module_id === mod.id) || []
    const hasReviewQuiz = mod.review_content && mod.review_content.length > 0
    const allPagesPassed = modulePages.length > 0 && modulePages.every(p => passedPageIds.has(p.id))
    const reviewPassed = passedReviewModuleIds.has(mod.id)
    const isCompleted = allPagesPassed && (hasReviewQuiz ? reviewPassed : true)
    if (isCompleted) completedModulesCount++

    let isUnlocked = false
    if (index === 0) {
      isUnlocked = true
    } else {
      const prevModule = modules[index - 1]
      const prevModulePages = pages?.filter(p => p.module_id === prevModule.id) || []
      const prevAllPagesPassed = prevModulePages.length > 0 && prevModulePages.every(p => passedPageIds.has(p.id))
      const prevHasReview = prevModule.review_content && prevModule.review_content.length > 0
      const prevReviewPassed = passedReviewModuleIds.has(prevModule.id)
      isUnlocked = prevAllPagesPassed && (prevHasReview ? prevReviewPassed : true)
    }

    return { ...mod, isCompleted, isUnlocked, pageCount: modulePages.length, hasReviewQuiz, reviewPassed, allPagesPassed }
  }) || []

  const progressPercentage = modules?.length ? (completedModulesCount / modules.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-navy">
          Welcome, {profile?.full_name?.split(' ')[0] || 'Trainee'}!
        </h2>
        <p className="text-warm-gray mt-1 text-sm">Resume your training journey below.</p>
      </div>

      {/* Progress Card */}
      <Card className="bg-ivory border-gold/20 shadow-sm gold-border-left">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Overall Progress</CardTitle>
          <CardDescription className="text-warm-gray">{completedModulesCount} of {modules?.length || 0} modules completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-3 bg-cream [&>div]:gold-gradient" />
            <p className="text-xs text-warm-gray text-right font-medium">{Math.round(progressPercentage)}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="space-y-4">
        {moduleStatusList.map((mod) => (
          <Card key={mod.id} className={`transition-all duration-200 ${
            !mod.isUnlocked 
              ? 'opacity-60 bg-cream border-dashed border-warm-gray/20' 
              : mod.isCompleted
                ? 'bg-ivory border-forest/30 shadow-sm'
                : 'bg-ivory border-gold/30 shadow-sm hover:shadow-md hover:border-gold/50'
          }`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${
                  mod.isCompleted ? 'bg-forest/10' : mod.isUnlocked ? 'bg-gold/10' : 'bg-muted'
                }`}>
                  <BookOpen className={`h-4 w-4 ${
                    mod.isCompleted ? 'text-forest' : mod.isUnlocked ? 'text-gold' : 'text-warm-gray'
                  }`} />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-lg text-navy leading-snug">
                    Module {mod.order_index}: {mod.title}
                  </CardTitle>
                  <p className="text-xs text-warm-gray mt-1">
                    {mod.pageCount} lessons
                    {mod.hasReviewQuiz && (
                      <span className={`ml-2 font-medium ${
                        mod.reviewPassed ? 'text-forest' : mod.allPagesPassed ? 'text-gold-dark' : ''
                      }`}>
                        {mod.reviewPassed ? '• Review ✓' : mod.allPagesPassed ? '• Review Required' : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {mod.isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-forest flex-shrink-0" />
              ) : mod.isUnlocked ? (
                <Unlock className="h-4 w-4 text-gold flex-shrink-0" />
              ) : (
                <Lock className="h-4 w-4 text-warm-gray flex-shrink-0" />
              )}
            </CardHeader>
            <CardFooter className="pt-2">
              {mod.isUnlocked ? (
                <Link href={`/module/${mod.id}`} className="w-full">
                  <Button 
                    className={`w-full h-11 text-sm font-semibold ${
                      mod.isCompleted 
                        ? 'bg-cream text-navy border border-navy/20 hover:bg-navy/5' 
                        : 'navy-gradient text-ivory hover:opacity-90 shadow-sm'
                    }`}
                    variant={mod.isCompleted ? "outline" : "default"}
                  >
                    {mod.isCompleted ? 'Review Material' : 'Continue'}
                  </Button>
                </Link>
              ) : (
                <Button disabled className="w-full h-11 text-sm" variant="outline">
                  <Lock className="mr-2 h-3.5 w-3.5" /> Locked
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
        {moduleStatusList.length === 0 && (
          <div className="text-center py-16 text-warm-gray border-2 border-dashed border-gold/20 rounded-xl bg-ivory">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-gold/50" />
            <p className="font-medium">No modules published yet</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
