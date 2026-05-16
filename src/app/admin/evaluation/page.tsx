import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'
import { Trophy, Medal, Award } from 'lucide-react'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function EvaluationPage() {
  const supabase = getAdminClient()

  const { data: trainees } = await supabase.from('profiles').select('id, full_name').eq('role', 'trainee').order('full_name')
  const { data: allSubmissions } = await supabase.from('submissions').select('trainee_id, score, is_passing')
  const { data: summativeScores } = await supabase.from('summative_scores').select('trainee_id, score')
  const { data: allPages } = await supabase.from('pages').select('id')

  const totalPages = allPages?.length ?? 1

  const rankings = trainees?.map(trainee => {
    const subs = allSubmissions?.filter(s => s.trainee_id === trainee.id && s.is_passing) ?? []
    const quizAvg = subs.length > 0 
      ? subs.reduce((sum, s) => sum + (s.score ?? 0), 0) / subs.length 
      : 0
    const summative = summativeScores?.find(s => s.trainee_id === trainee.id)
    const summativeScore = summative?.score ?? 0
    const completionRate = (subs.length / totalPages) * 100
    const composite = (quizAvg * 0.4) + (summativeScore * 0.4) + (completionRate * 0.2)

    return {
      id: trainee.id,
      name: trainee.full_name || 'Unnamed',
      quizAvg: Math.round(quizAvg * 10) / 10,
      summativeScore: Math.round(summativeScore * 10) / 10,
      completionRate: Math.round(completionRate),
      composite: Math.round(composite * 10) / 10,
      isEligible: quizAvg >= 70 && summativeScore >= 70 && completionRate === 100,
    }
  })?.sort((a, b) => b.composite - a.composite) ?? []

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-gold" />
    if (index === 1) return <Medal className="h-5 w-5 text-warm-gray" />
    if (index === 2) return <Award className="h-5 w-5 text-gold-dark" />
    return <span className="text-xs font-medium text-warm-gray w-5 text-center">{index + 1}</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-navy">Facilitator Evaluation</h2>
        <p className="text-warm-gray text-sm mt-1">
          Final rankings: Quiz (40%) + Summative (40%) + Completion (20%).
        </p>
      </div>

      <Card className="bg-ivory border-gold/15 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Trainee Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="text-sm text-warm-gray py-8 text-center">No trainees found.</p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-gold/15 text-left">
                    <th className="p-3 font-medium text-warm-gray text-xs w-12">Rank</th>
                    <th className="p-3 font-medium text-warm-gray text-xs">Trainee</th>
                    <th className="p-3 font-medium text-warm-gray text-xs text-center">Quiz Avg</th>
                    <th className="p-3 font-medium text-warm-gray text-xs text-center">Summative</th>
                    <th className="p-3 font-medium text-warm-gray text-xs text-center">Completion</th>
                    <th className="p-3 font-medium text-warm-gray text-xs text-center">Composite</th>
                    <th className="p-3 font-medium text-warm-gray text-xs text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((t, index) => (
                    <tr key={t.id} className={`border-b border-gold/10 transition-colors ${index < 3 ? 'bg-gold/5' : 'hover:bg-gold/5'}`}>
                      <td className="p-3">
                        <div className="flex justify-center">{getRankIcon(index)}</div>
                      </td>
                      <td className="p-3 font-medium text-navy">{t.name}</td>
                      <td className="p-3 text-center">
                        <span className={t.quizAvg >= 70 ? 'text-forest font-semibold' : 'text-warm-gray'}>{t.quizAvg}%</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={t.summativeScore >= 70 ? 'text-forest font-semibold' : 'text-warm-gray'}>
                          {t.summativeScore > 0 ? `${t.summativeScore}%` : '—'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={t.completionRate === 100 ? 'text-forest font-semibold' : 'text-warm-gray'}>{t.completionRate}%</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold font-serif text-navy">{t.composite}%</span>
                      </td>
                      <td className="p-3 text-center">
                        {t.isEligible ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-forest/10 text-forest">✓ Eligible</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cream text-warm-gray">Incomplete</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
