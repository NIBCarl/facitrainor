'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deletePage } from '../actions'
import { useRouter } from 'next/navigation'

export function DeletePageButton({ pageId, moduleId, pageName }: { pageId: string, moduleId: string, pageName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    const confirmed = window.confirm(
      `⚠️ Delete page "${pageName}"?\n\nThis will permanently delete:\n• All content in this page\n• All trainee submissions for this page\n\nThis cannot be undone.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    const result = await deletePage(pageId, moduleId)
    if (result.error) {
      alert(`Error: ${result.error}`)
      setIsDeleting(false)
    } else {
      router.refresh()
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete page"
    >
      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  )
}
