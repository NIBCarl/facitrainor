import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createModule } from './actions'
import { DeleteModuleButton } from './DeleteModuleButton'
import { EditModuleButton } from './EditModuleButton'
import { BookOpen, Plus } from 'lucide-react'

export default async function ContentPage() {
  const supabase = await createClient()
  const { data: modules } = await supabase.from('modules').select('*').order('order_index', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-navy">Content Management</h2>
        <p className="text-warm-gray text-sm mt-1">Manage your training modules and pages.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-ivory border-gold/15 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy">Create New Module</CardTitle>
            <CardDescription className="text-warm-gray text-xs">A module is a high-level group of pages (e.g., "Day 1").</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createModule} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs text-navy font-medium">Module Title</Label>
                <Input id="title" name="title" placeholder="e.g., Day 1: Leadership" required className="h-9 bg-cream/50 border-gold/20 focus-visible:ring-gold text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order_index" className="text-xs text-navy font-medium">Order Number</Label>
                <Input id="order_index" name="order_index" type="number" defaultValue="1" required className="h-9 bg-cream/50 border-gold/20 focus-visible:ring-gold text-sm" />
              </div>
              <Button type="submit" className="navy-gradient text-ivory font-semibold hover:opacity-90 h-9 text-sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Module
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-ivory border-gold/15 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy">Existing Modules</CardTitle>
          </CardHeader>
          <CardContent>
            {modules?.length === 0 ? (
              <div className="text-center py-8 text-warm-gray">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-gold/40" />
                <p className="text-sm">No modules created yet.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {modules?.map(m => (
                  <li key={m.id} className="flex items-center justify-between p-3 border border-gold/15 rounded-lg bg-cream/50 hover:bg-gold/5 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full flex-shrink-0">{m.order_index}</span>
                      <span className="font-medium text-navy text-sm truncate">{m.title}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <EditModuleButton moduleId={m.id} currentTitle={m.title} currentOrder={m.order_index} />
                      <Link href={`/admin/content/${m.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8 border-navy/20 text-navy">Manage</Button>
                      </Link>
                      <DeleteModuleButton moduleId={m.id} moduleName={m.title} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
