import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { PageRendererClient } from './PageRendererClient'
import { ArrowLeft } from 'lucide-react'

export default async function TraineePageViewer({ params }: { params: Promise<{ moduleId: string, pageId: string }> }) {
  const { moduleId, pageId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: pageData } = await supabase.from('pages').select('*').eq('id', pageId).single()
  if (!pageData) return <div className="text-center py-12 text-warm-gray">Page not found</div>

  const { data: submissions } = await supabase.from('submissions').select('*').eq('page_id', pageId).eq('trainee_id', user!.id).eq('is_passing', true)
  const isAlreadyPassed = (submissions && submissions.length > 0)

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/module/${moduleId}`} className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-navy transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Lessons
        </Link>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-navy">{pageData.title}</h2>
      </div>

      <PageRendererClient 
        pageId={pageData.id} 
        moduleId={moduleId}
        content={pageData.content || []} 
        isAlreadyPassed={isAlreadyPassed} 
      />
    </div>
  )
}
