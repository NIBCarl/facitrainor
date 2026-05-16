'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteModule } from './actions'
import { useRouter } from 'next/navigation'

export function DeleteModuleButton({ moduleId, moduleName }: { moduleId: string, moduleName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    const confirmed = window.confirm(
      `⚠️ Delete module "${moduleName}"?\n\nThis will permanently delete:\n• All pages in this module\n• All trainee submissions for those pages\n• All review quiz results\n\nThis cannot be undone.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    const result = await deleteModule(moduleId)
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
      title="Delete module"
    >
      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  )
}
