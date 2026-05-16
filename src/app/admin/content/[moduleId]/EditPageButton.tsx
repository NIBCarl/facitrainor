'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import { renamePage } from '../actions'
import { useRouter } from 'next/navigation'

export function EditPageButton({ pageId, moduleId, currentTitle, currentOrder }: { 
  pageId: string, 
  moduleId: string, 
  currentTitle: string, 
  currentOrder: number 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(currentTitle)
  const [order, setOrder] = useState(currentOrder)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  async function handleSave() {
    if (!title.trim()) return
    setIsSaving(true)
    const result = await renamePage(pageId, moduleId, title, order)
    setIsSaving(false)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      setIsEditing(false)
      router.refresh()
    }
  }

  function handleCancel() {
    setTitle(currentTitle)
    setOrder(currentOrder)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Input
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
          className="w-14 h-8 text-xs bg-cream/50 border-gold/20 text-center"
          type="number"
        />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 text-sm bg-cream/50 border-gold/20 flex-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
        />
        <Button variant="ghost" size="icon" className="h-7 w-7 text-forest hover:bg-forest/10" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-warm-gray hover:bg-destructive/10 hover:text-destructive" onClick={handleCancel}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-warm-gray/50 hover:text-navy hover:bg-gold/10"
      onClick={() => setIsEditing(true)}
      title="Edit page"
    >
      <Pencil className="h-3.5 w-3.5" />
    </Button>
  )
}
