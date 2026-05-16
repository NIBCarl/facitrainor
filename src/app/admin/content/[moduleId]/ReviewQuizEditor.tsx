'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveReviewQuiz } from '../actions'
import { Loader2, Plus, Trash2 } from 'lucide-react'

type ReviewQuestion = {
  question: string
  options: string[]
  answerIndex: number
}

export function ReviewQuizEditor({ moduleId, initialQuestions }: { moduleId: string, initialQuestions: ReviewQuestion[] }) {
  const [questions, setQuestions] = useState<ReviewQuestion[]>(initialQuestions)
  const [isSaving, setIsSaving] = useState(false)

  function addQuestion() {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], answerIndex: 0 }])
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, updated: ReviewQuestion) {
    const newQuestions = [...questions]
    newQuestions[index] = updated
    setQuestions(newQuestions)
  }

  async function handleSave() {
    setIsSaving(true)
    await saveReviewQuiz(moduleId, questions)
    setIsSaving(false)
    alert('Review quiz saved!')
  }

  return (
    <Card className="border-orange-300/50">
      <CardHeader>
        <CardTitle className="text-orange-600">📝 Module Review Quiz</CardTitle>
        <p className="text-sm text-muted-foreground">
          This quiz must be passed (≥70%) before the next module unlocks. Add at least one question.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
            No review questions yet. Trainees won&apos;t need to take a review quiz to proceed.
          </div>
        )}

        {questions.map((q, qIdx) => (
          <div key={qIdx} className="relative p-4 border rounded-lg bg-muted/30 space-y-3">
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={() => removeQuestion(qIdx)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-orange-600">Question {qIdx + 1}</Label>
              <Input
                value={q.question}
                onChange={(e) => updateQuestion(qIdx, { ...q, question: e.target.value })}
                placeholder="Enter the review question..."
              />
            </div>
            <div className="grid gap-2 pl-3 border-l-2 border-orange-300/50">
              <Label className="text-xs text-muted-foreground">Select the correct answer</Label>
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`review-q-${qIdx}`}
                    checked={q.answerIndex === optIdx}
                    onChange={() => updateQuestion(qIdx, { ...q, answerIndex: optIdx })}
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...q.options]
                      newOpts[optIdx] = e.target.value
                      updateQuestion(qIdx, { ...q, options: newOpts })
                    }}
                    placeholder={`Option ${optIdx + 1}`}
                    className="h-8"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <Button onClick={addQuestion} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
            <Plus className="mr-2 h-4 w-4" /> Add Review Question
          </Button>
          {questions.length > 0 && (
            <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Review Quiz
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
