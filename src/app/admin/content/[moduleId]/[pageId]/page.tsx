import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { PageEditorClient } from './PageEditorClient'

export default async function PageEditor({ params }: { params: Promise<{ moduleId: string, pageId: string }> }) {
  const { moduleId, pageId } = await params
  const supabase = await createClient()
  const { data: pageData } = await supabase.from('pages').select('*').eq('id', pageId).single()

  if (!pageData) return <div>Page not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/content/${moduleId}`}>
          <Button variant="outline" size="sm">← Back to Module</Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Editing: {pageData.title}</h2>
      </div>
      
      <PageEditorClient pageId={pageData.id} initialContent={pageData.content || []} />
    </div>
  )
}
