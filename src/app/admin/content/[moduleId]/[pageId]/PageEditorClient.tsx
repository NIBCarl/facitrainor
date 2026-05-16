'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { savePageContent } from '../../actions'
import { Loader2, Plus, Trash2, ImageIcon, VideoIcon, FileText, HelpCircle, GripVertical } from 'lucide-react'
import { RichTextEditor } from '@/components/RichTextEditor'

type ContentBlock = 
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; caption?: string }
  | { type: 'video'; url: string }
  | { type: 'quiz'; question: string; options: string[]; answerIndex: number }

export function PageEditorClient({ pageId, initialContent }: { pageId: string, initialContent: ContentBlock[] }) {
  const [content, setContent] = useState<ContentBlock[]>(initialContent)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    await savePageContent(pageId, content)
    setIsSaving(false)
    alert("Saved successfully!")
  }

  function addText() {
    setContent([...content, { type: 'text', text: '' }])
  }

  function addImage() {
    setContent([...content, { type: 'image', url: '', caption: '' }])
  }

  function addVideo() {
    setContent([...content, { type: 'video', url: '' }])
  }

  function addQuiz() {
    setContent([...content, { type: 'quiz', question: '', options: ['', '', '', ''], answerIndex: 0 }])
  }

  function removeBlock(index: number) {
    setContent(content.filter((_, i) => i !== index))
  }

  function updateBlock(index: number, newBlock: ContentBlock) {
    const newContent = [...content]
    newContent[index] = newBlock
    setContent(newContent)
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    const newContent = [...content]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= newContent.length) return
    ;[newContent[index], newContent[target]] = [newContent[target], newContent[index]]
    setContent(newContent)
  }

  const blockTypeLabels: Record<string, { label: string; color: string }> = {
    text: { label: 'Rich Text', color: 'text-navy bg-navy/5 border-navy/20' },
    image: { label: 'Image', color: 'text-forest bg-forest/5 border-forest/20' },
    video: { label: 'Video', color: 'text-gold-dark bg-gold/5 border-gold/20' },
    quiz: { label: 'Quiz', color: 'text-destructive bg-destructive/5 border-destructive/20' },
  }

  return (
    <div className="space-y-5">
      {/* Add Block Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={addText} variant="outline" size="sm" className="border-navy/20 text-navy hover:bg-navy/5 text-xs h-9">
          <FileText className="mr-1.5 h-3.5 w-3.5" /> Add Text
        </Button>
        <Button onClick={addImage} variant="outline" size="sm" className="border-forest/20 text-forest hover:bg-forest/5 text-xs h-9">
          <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Add Image
        </Button>
        <Button onClick={addVideo} variant="outline" size="sm" className="border-gold-dark/20 text-gold-dark hover:bg-gold/5 text-xs h-9">
          <VideoIcon className="mr-1.5 h-3.5 w-3.5" /> Add Video
        </Button>
        <Button onClick={addQuiz} variant="outline" size="sm" className="border-destructive/20 text-destructive hover:bg-destructive/5 text-xs h-9">
          <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> Add Quiz
        </Button>
      </div>

      {/* Content Blocks */}
      <div className="space-y-4">
        {content.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-gold/20 rounded-xl text-warm-gray bg-ivory">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gold/40" />
            <p className="font-medium">No content yet</p>
            <p className="text-sm mt-1">Click the buttons above to build your page.</p>
          </div>
        )}

        {content.map((block, index) => {
          const { label, color } = blockTypeLabels[block.type] || { label: block.type, color: '' }

          return (
            <Card key={index} className="relative bg-ivory border-gold/15 shadow-sm">
              {/* Block Header */}
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
                    {label}
                  </span>
                  <span className="text-[10px] text-warm-gray">Block {index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-warm-gray hover:text-navy" onClick={() => moveBlock(index, 'up')} disabled={index === 0}>
                    <span className="text-xs">↑</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-warm-gray hover:text-navy" onClick={() => moveBlock(index, 'down')} disabled={index === content.length - 1}>
                    <span className="text-xs">↓</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={() => removeBlock(index)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Rich Text Editor */}
                {block.type === 'text' && (
                  <RichTextEditor
                    content={block.text}
                    onChange={(html) => updateBlock(index, { ...block, text: html })}
                  />
                )}

                {/* Image Block */}
                {block.type === 'image' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-navy font-medium">Image URL (Cloudinary or direct link)</Label>
                      <Input 
                        value={block.url} 
                        onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                        placeholder="e.g., https://res.cloudinary.com/.../image.jpg"
                        className="h-9 bg-cream/50 border-gold/20 focus-visible:ring-gold text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-navy font-medium">Caption (optional)</Label>
                      <Input 
                        value={block.caption || ''} 
                        onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
                        placeholder="e.g., Figure 1: Leadership Framework"
                        className="h-9 bg-cream/50 border-gold/20 focus-visible:ring-gold text-sm"
                      />
                    </div>
                    {block.url && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gold/20 bg-cream">
                        <img src={block.url} alt={block.caption || 'Preview'} className="max-h-48 mx-auto object-contain p-2" />
                      </div>
                    )}
                  </div>
                )}

                {/* Video Block */}
                {block.type === 'video' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-navy font-medium">Video URL / Embed URL</Label>
                    <Input 
                      value={block.url} 
                      onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                      placeholder="e.g., https://res.cloudinary.com/..."
                      className="h-9 bg-cream/50 border-gold/20 focus-visible:ring-gold text-sm"
                    />
                  </div>
                )}

                {/* Quiz Block */}
                {block.type === 'quiz' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-navy font-medium">Question</Label>
                      <Input 
                        value={block.question} 
                        onChange={(e) => updateBlock(index, { ...block, question: e.target.value })}
                        placeholder="What is..."
                        className="h-9 bg-cream/50 border-gold/20 focus-visible:ring-gold text-sm"
                      />
                    </div>
                    <div className="grid gap-2 pl-3 border-l-2 border-gold/30">
                      <Label className="text-[10px] text-warm-gray uppercase tracking-wider">Select the correct option</Label>
                      {block.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`quiz-${index}`} 
                            checked={block.answerIndex === optIndex}
                            onChange={() => updateBlock(index, { ...block, answerIndex: optIndex })}
                            className="text-gold accent-gold"
                          />
                          <Input 
                            value={opt} 
                            onChange={(e) => {
                              const newOpts = [...block.options]
                              newOpts[optIndex] = e.target.value
                              updateBlock(index, { ...block, options: newOpts })
                            }}
                            placeholder={`Option ${optIndex + 1}`}
                            className="h-8 bg-cream/50 border-gold/20 focus-visible:ring-gold text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Save Button */}
      {content.length > 0 && (
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full md:w-auto navy-gradient text-ivory font-semibold hover:opacity-90 shadow-md h-11"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Page Content
        </Button>
      )}
    </div>
  )
}
