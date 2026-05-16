'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <Button onClick={() => window.print()} variant="outline" className="border-primary/20 hover:bg-primary/5">
      <Printer className="mr-2 h-4 w-4" /> Print Certificate
    </Button>
  )
}
