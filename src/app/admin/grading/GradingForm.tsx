'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveScore } from './actions'

export function GradingForm({ traineeId, currentScore }: { traineeId: string, currentScore: number | null }) {
  const [score, setScore] = useState(currentScore ?? '')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    await saveScore(traineeId, Number(score))
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-end gap-2">
      <Input 
        type="number" 
        min="0" 
        max="100" 
        className="w-20 h-8" 
        placeholder="Score"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        required
      />
      <Button type="submit" size="sm" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
