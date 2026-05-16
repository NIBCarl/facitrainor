import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GradingForm } from './GradingForm'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function GradingPage() {
  const supabase = getAdminClient()

  const { data: trainees } = await supabase.from('profiles').select('*').eq('role', 'trainee').order('full_name')
  const { data: scores } = await supabase.from('summative_scores').select('*')
  const { data: modules } = await supabase.from('modules').select('id, title, review_content')
  const { data: pages } = await supabase.from('pages').select('id, module_id')
  const { data: allSubmissions } = await supabase.from('submissions').select('trainee_id, page_id, is_passing')
  const { data: allReviews } = await supabase.from('module_reviews').select('trainee_id, module_id, is_passing')

  const traineesWithScores = trainees?.map(t => {
    const s = scores?.find(score => score.trainee_id === t.id)
    const passedPageIds = new Set(
      allSubmissions?.filter(sub => sub.trainee_id === t.id && sub.is_passing).map(sub => sub.page_id)
    )
    const totalPages = pages?.length || 0
    const passedPages = [...passedPageIds].filter(pid => pages?.some(p => p.id === pid)).length
    const passedReviews = allReviews?.filter(r => r.trainee_id === t.id && r.is_passing).length || 0
    const totalReviewModules = modules?.filter(m => m.review_content && m.review_content.length > 0).length || 0
    const allModulesComplete = passedPages === totalPages && totalPages > 0 &&
      (totalReviewModules === 0 || passedReviews >= totalReviewModules)

    return { 
      ...t, 
      score: s?.score ?? null, 
      isPassed: s?.is_passing ?? false,
      passedPages,
      totalPages,
      allModulesComplete,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-navy">Summative Grading</h2>
        <p className="text-warm-gray text-sm mt-1">Input scores for the physical Saturday meetups.</p>
      </div>

      <Card className="bg-ivory border-gold/15 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Trainee Scores</CardTitle>
          <CardDescription className="text-warm-gray text-xs">A score of 70 or higher is required to pass.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="border-gold/15">
                  <TableHead className="text-warm-gray text-xs">Trainee Name</TableHead>
                  <TableHead className="text-warm-gray text-xs">Online Progress</TableHead>
                  <TableHead className="text-warm-gray text-xs">Summative Score</TableHead>
                  <TableHead className="text-warm-gray text-xs">Status</TableHead>
                  <TableHead className="text-right text-warm-gray text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {traineesWithScores?.map((trainee) => (
                  <TableRow key={trainee.id} className="border-gold/10 hover:bg-gold/5">
                    <TableCell className="font-medium text-navy text-sm">{trainee.full_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-2 bg-cream rounded-full overflow-hidden">
                          <div className="h-full gold-gradient rounded-full" style={{ width: `${trainee.totalPages > 0 ? (trainee.passedPages / trainee.totalPages) * 100 : 0}%` }} />
                        </div>
                        <span className="text-[10px] text-warm-gray">{trainee.passedPages}/{trainee.totalPages}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {trainee.score !== null ? <span className="font-semibold text-navy">{trainee.score}%</span> : <span className="text-warm-gray">—</span>}
                    </TableCell>
                    <TableCell>
                      {trainee.score === null ? (
                        <span className="text-warm-gray text-xs">Pending</span>
                      ) : trainee.isPassed && trainee.allModulesComplete ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-forest/10 text-forest">
                          ✓ Certificate Ready
                        </span>
                      ) : trainee.isPassed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/15 text-gold-dark">
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive">
                          Failed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <GradingForm traineeId={trainee.id} currentScore={trainee.score} />
                    </TableCell>
                  </TableRow>
                ))}
                {!traineesWithScores?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-warm-gray text-sm">No trainees found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
