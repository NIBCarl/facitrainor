import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPage } from '../actions'
import { ReviewQuizEditor } from './ReviewQuizEditor'
import { DeletePageButton } from './DeletePageButton'
import { EditPageButton } from './EditPageButton'
import { ArrowLeft, FileText, Plus } from 'lucide-react'

export default async function ModuleDetailsPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  const supabase = await createClient()
  const { data: moduleData } = await supabase.from('modules').select('*').eq('id', moduleId).single()
  const { data: pages } = await supabase.from('pages').select('*').eq('module_id', moduleId).order('order_index', { ascending: true })

  if (!moduleData) return <div className="text-center py-12 text-warm-gray">Module not found</div>

  const addPageWithModule = createPage.bind(null, moduleData.id)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-navy transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Modules
        </Link>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-navy">{moduleData.title}</h2>
        <p className="text-warm-gray text-sm mt-1">Manage the pages (lessons) and review quiz for this module.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-ivory border-gold/15 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy">Add New Page</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addPageWithModule} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs text-navy font-medium">Page Title</Label>
                <Input id="title" name="title" placeholder="e.g., Introduction Video" required className="h-9 bg-cream/50 border-gold/20 focus-visible:ring-gold text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order_index" className="text-xs text-navy font-medium">Order Number</Label>
                <Input id="order_index" name="order_index" type="number" defaultValue="1" required className="h-9 bg-cream/50 border-gold/20 focus-visible:ring-gold text-sm" />
              </div>
              <Button type="submit" className="navy-gradient text-ivory font-semibold hover:opacity-90 h-9 text-sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Page
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-ivory border-gold/15 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy">Pages in this Module</CardTitle>
          </CardHeader>
          <CardContent>
            {pages?.length === 0 ? (
              <div className="text-center py-8 text-warm-gray">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gold/40" />
                <p className="text-sm">No pages yet. Add one to get started.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {pages?.map(p => (
                  <li key={p.id} className="flex items-center justify-between p-3 border border-gold/15 rounded-lg bg-cream/50 hover:bg-gold/5 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full flex-shrink-0">{p.order_index}</span>
                      <span className="font-medium text-navy text-sm truncate">{p.title}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <EditPageButton pageId={p.id} moduleId={moduleData.id} currentTitle={p.title} currentOrder={p.order_index} />
                      <Link href={`/admin/content/${moduleData.id}/${p.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8 border-navy/20 text-navy">Edit</Button>
                      </Link>
                      <DeletePageButton pageId={p.id} moduleId={moduleData.id} pageName={p.title} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Review Quiz Editor */}
      <ReviewQuizEditor 
        moduleId={moduleData.id} 
        initialQuestions={moduleData.review_content || []} 
      />
    </div>
  )
}
