'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { submitQuiz } from './actions'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

type ContentBlock = 
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; caption?: string }
  | { type: 'video'; url: string }
  | { type: 'quiz'; question: string; options: string[]; answerIndex: number }

export function PageRendererClient({ 
  pageId, 
  content, 
  moduleId, 
  isAlreadyPassed 
}: { 
  pageId: string, 
  content: ContentBlock[], 
  moduleId: string,
  isAlreadyPassed: boolean
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number, passed: boolean } | null>(null)

  const quizBlocks = content.map((b, i) => ({ ...b, index: i })).filter(b => b.type === 'quiz') as (ContentBlock & { index: number })[]
  
  async function handleSubmit() {
    setIsSubmitting(true)
    const submittedAnswers = quizBlocks.map(qb => ({
      index: qb.index,
      selectedOption: answers[qb.index] ?? -1
    }))

    const res = await submitQuiz(pageId, submittedAnswers)
    setIsSubmitting(false)
    if (res.error) {
      alert(res.error)
    } else {
      setResult({ score: res.score!, passed: res.isPassing! })
    }
  }

  // Check if text contains HTML tags (rich text) or is plain text
  function isHtmlContent(text: string): boolean {
    return /<[^>]+>/.test(text)
  }

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {content.map((block, index) => {
        if (block.type === 'text') {
          return (
            <div key={index} className="p-5 md:p-6 bg-ivory rounded-xl border border-gold/15 shadow-sm">
              {isHtmlContent(block.text) ? (
                <div 
                  className="prose prose-sm md:prose-base max-w-none prose-headings:text-navy prose-headings:font-serif prose-p:text-navy/80 prose-strong:text-navy prose-blockquote:border-gold prose-blockquote:text-warm-gray prose-li:text-navy/80"
                  dangerouslySetInnerHTML={{ __html: block.text }}
                />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed text-navy/80">{block.text}</p>
              )}
            </div>
          )
        }

        if (block.type === 'image') {
          return (
            <figure key={index} className="rounded-xl overflow-hidden shadow-sm border border-gold/15">
              <img 
                src={block.url} 
                alt={block.caption || 'Module image'} 
                className="w-full max-h-[500px] object-contain bg-cream"
              />
              {block.caption && (
                <figcaption className="text-center text-sm text-warm-gray py-3 px-4 bg-ivory border-t border-gold/10">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          )
        }
        
        if (block.type === 'video') {
          const isMp4 = block.url.endsWith('.mp4') || block.url.includes('cloudinary')
          return (
            <div key={index} className="rounded-xl overflow-hidden shadow-md aspect-video bg-black flex items-center justify-center border-2 border-navy/20">
              {isMp4 ? (
                <video src={block.url} controls className="w-full h-full object-contain" />
              ) : (
                <iframe src={block.url} className="w-full h-full" allowFullScreen />
              )}
            </div>
          )
        }

        if (block.type === 'quiz') {
          return (
            <Card key={index} className="border-gold/20 shadow-sm bg-ivory">
              <CardContent className="pt-5 px-4 md:px-6">
                <h3 className="text-base md:text-lg font-semibold mb-4 text-navy">{block.question}</h3>
                <RadioGroup 
                  value={answers[index]?.toString()} 
                  onValueChange={(val) => setAnswers({ ...answers, [index]: parseInt(val) })}
                >
                  <div className="space-y-2">
                    {block.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg border border-transparent hover:bg-gold/5 transition-colors">
                        <RadioGroupItem 
                          value={optIndex.toString()} 
                          id={`q-${index}-opt-${optIndex}`} 
                          disabled={isAlreadyPassed || result?.passed}
                          className="border-gold/40 text-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                        <Label htmlFor={`q-${index}-opt-${optIndex}`} className="cursor-pointer flex-1 font-normal text-sm text-navy/80">{opt}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )
        }
      })}

      {(!isAlreadyPassed && !result?.passed) && (
        <div className="pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || Object.keys(answers).length < quizBlocks.length} 
            className="w-full h-12 text-base font-semibold navy-gradient text-ivory hover:opacity-90 shadow-md"
          >
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {quizBlocks.length > 0 ? 'Submit Quiz Answers' : 'Mark as Complete'}
          </Button>
          {Object.keys(answers).length < quizBlocks.length && (
            <p className="text-xs text-warm-gray mt-2 text-center">Please answer all questions to proceed.</p>
          )}
        </div>
      )}

      {(isAlreadyPassed || result?.passed) && (
        <div className="p-5 bg-forest/5 text-forest rounded-xl border border-forest/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">🎉 Section Passed!</h3>
            {result && <p className="text-sm">You scored {result.score.toFixed(0)}%. Excellent work.</p>}
          </div>
          <Link href={`/module/${moduleId}`}>
            <Button className="navy-gradient text-ivory hover:opacity-90 font-semibold">Return to Module</Button>
          </Link>
        </div>
      )}

      {result && !result.passed && (
        <div className="p-5 bg-destructive/5 text-destructive rounded-xl border border-destructive/20 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Needs Improvement</h3>
          <p className="text-sm mb-4">You scored {result.score.toFixed(0)}%. A score of 70% or higher is required.</p>
          <Button variant="destructive" onClick={() => setResult(null)}>Try Again</Button>
        </div>
      )}
    </div>
  )
}
