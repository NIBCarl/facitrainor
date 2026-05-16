import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'
import { Users, BookOpen, ClipboardCheck, Award } from 'lucide-react'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AdminDashboardPage() {
  const supabase = getAdminClient()

  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'trainee')
  const { count: modulesCount } = await supabase.from('modules').select('*', { count: 'exact', head: true })
  const { count: submissionsCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true })
  const { count: certifiedCount } = await supabase.from('summative_scores').select('*', { count: 'exact', head: true }).gte('score', 70)

  const { data: trainees } = await supabase.from('profiles').select('id, full_name').eq('role', 'trainee').order('full_name')
  const { data: allSubmissions } = await supabase.from('submissions').select('trainee_id, page_id, is_passing, submitted_at')
  const { data: allPages } = await supabase.from('pages').select('id, module_id')

  const totalPages = allPages?.length ?? 0
  const traineeProgress = trainees?.map(trainee => {
    const subs = allSubmissions?.filter(s => s.trainee_id === trainee.id) ?? []
    const passedPages = subs.filter(s => s.is_passing).length
    const latestSub = subs.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0]
    const today = new Date().toISOString().slice(0, 10)
    const hasCheckedInToday = subs.some(s => s.submitted_at?.startsWith(today))

    return {
      id: trainee.id,
      name: trainee.full_name || 'Unnamed',
      passedPages,
      totalPages,
      percentage: totalPages > 0 ? Math.round((passedPages / totalPages) * 100) : 0,
      lastActive: latestSub ? new Date(latestSub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never',
      checkedInToday: hasCheckedInToday,
    }
  }) ?? []

  const todayCheckIns = traineeProgress.filter(t => t.checkedInToday).length

  const stats = [
    { label: 'Total Trainees', value: usersCount ?? 0, icon: Users, color: 'text-navy' },
    { label: 'Active Modules', value: modulesCount ?? 0, icon: BookOpen, color: 'text-gold-dark' },
    { label: "Today's Check-ins", value: todayCheckIns, sub: `of ${usersCount ?? 0} trainees`, icon: ClipboardCheck, color: 'text-forest' },
    { label: 'Certified', value: certifiedCount ?? 0, icon: Award, color: 'text-gold' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-navy">Dashboard</h2>
        <p className="text-warm-gray text-sm mt-1">Overview of the KONEK Training platform.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-ivory border-gold/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-warm-gray">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className={`text-2xl font-bold font-serif ${stat.color}`}>{stat.value}</div>
              {stat.sub && <p className="text-[10px] text-warm-gray mt-0.5">{stat.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Table */}
      <Card className="bg-ivory border-gold/15 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-navy">Trainee Progress & Daily Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {traineeProgress.length === 0 ? (
            <p className="text-sm text-warm-gray py-8 text-center">No trainees registered yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-gold/15 text-left">
                    <th className="p-3 font-medium text-warm-gray text-xs">Trainee</th>
                    <th className="p-3 font-medium text-warm-gray text-xs">Today</th>
                    <th className="p-3 font-medium text-warm-gray text-xs">Progress</th>
                    <th className="p-3 font-medium text-warm-gray text-xs">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {traineeProgress.map(t => (
                    <tr key={t.id} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                      <td className="p-3 font-medium text-navy text-sm">{t.name}</td>
                      <td className="p-3">
                        {t.checkedInToday ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-forest/10 text-forest">
                            ✓ Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive">
                            ✗ Absent
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-cream rounded-full overflow-hidden max-w-[100px]">
                            <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${t.percentage}%` }} />
                          </div>
                          <span className="text-[10px] text-warm-gray whitespace-nowrap">{t.passedPages}/{t.totalPages}</span>
                        </div>
                      </td>
                      <td className="p-3 text-warm-gray text-xs">{t.lastActive}</td>
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
