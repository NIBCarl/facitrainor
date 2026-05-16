'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { FontFamily } from '@tiptap/extension-font-family'
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, 
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Redo, Undo, Highlighter, Type, Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'monospace' },
  { label: 'Playfair', value: 'Playfair Display, serif' },
]

const COLORS = [
  '#1B2A4A', '#C9A84C', '#2D6A4F', '#C0392B', '#2D2D2D', 
  '#6B6458', '#8B6914', '#2A3F6B', '#000000', '#FFFFFF',
]

export function RichTextEditor({ 
  content, 
  onChange 
}: { 
  content: string, 
  onChange: (html: string) => void 
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none bg-ivory rounded-b-lg border-t border-gold/10 text-navy',
      },
    },
  })

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [])

  if (!editor) return <div className="h-[200px] bg-ivory rounded-lg border border-gold/20 animate-pulse" />

  const ToolbarBtn = ({ 
    onClick, 
    active = false, 
    children, 
    title 
  }: { 
    onClick: () => void, 
    active?: boolean, 
    children: React.ReactNode, 
    title: string 
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-gold/10 transition-colors ${
        active ? 'bg-gold/20 text-navy' : 'text-warm-gray'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-gold/20 rounded-lg overflow-hidden shadow-sm bg-cream">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-ivory border-b border-gold/15">
        {/* Undo/Redo */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-gold/20 mx-1" />

        {/* Font Family */}
        <select
          className="h-7 text-xs bg-cream border border-gold/20 rounded px-1 text-navy focus:ring-gold focus:border-gold"
          value={editor.getAttributes('textStyle').fontFamily || ''}
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setFontFamily(e.target.value).run()
            } else {
              editor.chain().focus().unsetFontFamily().run()
            }
          }}
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <div className="w-px h-5 bg-gold/20 mx-1" />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Normal text">
          <Type className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-gold/20 mx-1" />

        {/* Text Formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-gold/20 mx-1" />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-gold/20 mx-1" />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
          <Quote className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-gold/20 mx-1" />

        {/* Text Color */}
        <div className="relative group">
          <ToolbarBtn onClick={() => {}} title="Text Color">
            <Palette className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <div className="absolute top-full left-0 mt-1 p-1.5 bg-ivory border border-gold/20 rounded-lg shadow-lg hidden group-hover:grid grid-cols-5 gap-1 z-10 min-w-[120px]">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                className="w-5 h-5 rounded border border-gold/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => editor.chain().focus().setColor(color).run()}
                title={color}
              />
            ))}
            <button
              type="button"
              className="w-5 h-5 rounded border border-gold/20 text-[8px] hover:bg-cream"
              onClick={() => editor.chain().focus().unsetColor().run()}
              title="Reset"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Highlight */}
        <div className="relative group">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight({ color: '#FEF3C7' }).run()} active={editor.isActive('highlight')} title="Highlight">
            <Highlighter className="h-3.5 w-3.5" />
          </ToolbarBtn>
        </div>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  )
}
