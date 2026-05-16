'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { submitReviewQuiz } from './actions'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

type ReviewQuestion = {
  question: string
  options: string[]
  answerIndex: number
}

export function ReviewQuizClient({
  moduleId,
  questions,
  isAlreadyPassed
}: {
  moduleId: string,
  questions: ReviewQuestion[],
  isAlreadyPassed: boolean
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number, passed: boolean } | null>(null)

  async function handleSubmit() {
    setIsSubmitting(true)
    const submittedAnswers = questions.map((_, i) => ({
      index: i,
      selectedOption: answers[i] ?? -1
    }))

    const res = await submitReviewQuiz(moduleId, submittedAnswers)
    setIsSubmitting(false)
    if (res.error) {
      alert(res.error)
    } else {
      setResult({ score: res.score!, passed: res.isPassing! })
    }
  }

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {questions.map((q, index) => (
        <Card key={index} className="bg-ivory border-gold/20 shadow-sm">
          <CardContent className="pt-5 px-4 md:px-6">
            <h3 className="text-base font-semibold mb-4 text-navy">
              {index + 1}. {q.question}
            </h3>
            <RadioGroup
              value={answers[index]?.toString()}
              onValueChange={(val) => setAnswers({ ...answers, [index]: parseInt(val) })}
            >
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center space-x-3 p-3 rounded-lg border border-transparent hover:bg-gold/5 transition-colors">
                    <RadioGroupItem
                      value={optIdx.toString()}
                      id={`review-q-${index}-opt-${optIdx}`}
                      disabled={isAlreadyPassed || result?.passed}
                      className="border-gold/40 text-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                    />
                    <Label htmlFor={`review-q-${index}-opt-${optIdx}`} className="cursor-pointer flex-1 font-normal text-sm text-navy/80">
                      {opt}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      {(!isAlreadyPassed && !result?.passed) && (
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length < questions.length}
            className="w-full h-12 text-base font-semibold navy-gradient text-ivory hover:opacity-90 shadow-md"
          >
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit Review Quiz
          </Button>
          {Object.keys(answers).length < questions.length && (
            <p className="text-xs text-warm-gray mt-2 text-center">Answer all {questions.length} questions to submit.</p>
          )}
        </div>
      )}

      {(isAlreadyPassed || result?.passed) && (
        <div className="p-5 bg-forest/5 text-forest rounded-xl border border-forest/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">🎉 Review Quiz Passed!</h3>
            {result && <p className="text-sm">You scored {result.score.toFixed(0)}%. The next module is now unlocked!</p>}
            {isAlreadyPassed && !result && <p className="text-sm">You have already passed this review quiz.</p>}
          </div>
          <Link href="/dashboard">
            <Button className="navy-gradient text-ivory hover:opacity-90 font-semibold">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      )}

      {result && !result.passed && (
        <div className="p-5 bg-destructive/5 text-destructive rounded-xl border border-destructive/20 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Needs Improvement</h3>
          <p className="text-sm mb-4">You scored {result.score.toFixed(0)}%. You need 70% or higher.</p>
          <Button variant="destructive" onClick={() => setResult(null)}>Try Again</Button>
        </div>
      )}
    </div>
  )
}
