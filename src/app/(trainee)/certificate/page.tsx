import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, CheckCircle2, XCircle } from 'lucide-react'
import { PrintButton } from './PrintButton'
import Image from 'next/image'

export default async function CertificatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  const { data: summative } = await supabase.from('summative_scores').select('is_passing, score').eq('trainee_id', user.id).limit(1)
  const summativeRecord = summative?.[0]
  const hasPassedSummative = summativeRecord?.is_passing === true

  const { data: pages } = await supabase.from('pages').select('id')
  const { data: submissions } = await supabase.from('submissions').select('page_id').eq('trainee_id', user.id).eq('is_passing', true)
  const totalPages = pages?.length || 0
  const passedPages = new Set(submissions?.map(s => s.page_id)).size
  const hasPassedAllPages = totalPages > 0 && passedPages === totalPages

  const { data: modules } = await supabase.from('modules').select('id, review_content')
  const modulesWithReview = modules?.filter(m => m.review_content && m.review_content.length > 0) || []
  const { data: reviewResults } = await supabase.from('module_reviews').select('module_id').eq('trainee_id', user.id).eq('is_passing', true)
  const passedReviewModuleIds = new Set(reviewResults?.map(r => r.module_id))
  const hasPassedAllReviews = modulesWithReview.every(m => passedReviewModuleIds.has(m.id))

  const isEligible = hasPassedAllPages && hasPassedAllReviews && hasPassedSummative

  if (!isEligible) {
    return (
      <div className="space-y-6 max-w-md mx-auto mt-6">
        <Card className="bg-ivory border-gold/20 shadow-sm text-center py-8">
          <CardHeader>
            <div className="mx-auto bg-navy/5 p-4 rounded-full w-fit mb-3">
              <Award className="h-10 w-10 text-gold" />
            </div>
            <CardTitle className="text-xl text-navy">Certificate Locked</CardTitle>
            <CardDescription className="text-warm-gray text-sm mt-1">
              Complete all requirements below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-5">
            {[
              { label: 'All Lessons', done: hasPassedAllPages, detail: hasPassedAllPages ? 'Done' : `${passedPages}/${totalPages}` },
              { label: 'Module Reviews', done: modulesWithReview.length === 0 || hasPassedAllReviews, detail: modulesWithReview.length === 0 ? 'N/A' : hasPassedAllReviews ? 'All Passed' : `${passedReviewModuleIds.size}/${modulesWithReview.length}` },
              { label: 'Physical Assessment', done: hasPassedSummative, detail: hasPassedSummative ? `Passed (${summativeRecord?.score}%)` : summativeRecord ? `Failed (${summativeRecord.score}%)` : 'Not Graded' },
            ].map((req, i) => (
              <div key={i} className="flex justify-between items-center p-3 border border-gold/15 rounded-lg bg-cream/50">
                <span className="font-medium text-sm text-navy">{req.label}</span>
                <div className="flex items-center gap-1.5">
                  {req.done 
                    ? <CheckCircle2 className="h-4 w-4 text-forest" /> 
                    : <XCircle className="h-4 w-4 text-destructive" />
                  }
                  <span className={`text-xs font-semibold ${req.done ? 'text-forest' : 'text-destructive'}`}>{req.detail}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-4 max-w-4xl mx-auto mt-4">
      <div className="flex justify-end print:hidden">
        <PrintButton />
      </div>

      {/* Certificate */}
      <div className="relative bg-ivory rounded-lg shadow-xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Ornate gold/navy border */}
        <div className="absolute inset-0 border-[12px] md:border-[20px] rounded-lg" style={{
          borderImage: 'linear-gradient(135deg, #C9A84C 0%, #1B2A4A 30%, #C9A84C 50%, #1B2A4A 70%, #C9A84C 100%) 1',
        }} />
        {/* Inner border */}
        <div className="absolute inset-[16px] md:inset-[28px] border-2 border-gold/40 rounded" />

        <div className="relative p-8 md:p-16 text-center">
          {/* Logo */}
          <div className="mb-4">
            <Image 
              src="/logo.png" 
              alt="KONEK Logo" 
              width={120} 
              height={120} 
              className="mx-auto drop-shadow-lg"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-navy mb-2 tracking-tight">
            Certificate of Completion
          </h1>
          <div className="w-24 h-0.5 gold-gradient mx-auto mb-6" />

          <p className="text-base md:text-lg text-warm-gray mb-8">This is to certify that</p>
          
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-navy border-b-2 border-gold pb-3 mb-8 inline-block px-6 md:px-12">
            {profile?.full_name}
          </h2>
          
          <p className="text-sm md:text-base text-warm-gray max-w-xl mx-auto mb-12 leading-relaxed">
            has successfully completed the <strong className="text-navy">KONEK Training Program</strong> — 
            Keeping Outreach Near Every Community for the Kingdom — 
            encompassing all online academic modules, review assessments, and physical meetup evaluations.
          </p>

          <p className="text-xs md:text-sm text-gold-dark font-semibold tracking-widest uppercase mb-12">
            SWPUC F-Camp 2026
          </p>

          <div className="flex flex-col sm:flex-row justify-between items-end mt-12 sm:mt-20 px-4 md:px-12 gap-8 sm:gap-0">
            <div className="text-center w-full sm:w-56 border-t-2 border-navy/30 pt-3">
              <p className="font-serif font-bold text-navy text-sm">F-Camp Administrator</p>
              <p className="text-xs text-warm-gray">Authorized Signature</p>
            </div>
            <div className="text-center w-full sm:w-56 border-t-2 border-navy/30 pt-3">
              <p className="font-serif font-bold text-navy text-sm">{dateStr}</p>
              <p className="text-xs text-warm-gray">Date of Completion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
