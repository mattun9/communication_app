import { useState, useRef } from 'react'
import { X, Send, ImagePlus, AlertTriangle } from 'lucide-react'

const CLASS_OPTIONS = [
  { value: 'all', label: '全体' },
  { value: 'class-a', label: 'Aクラス' },
  { value: 'class-b', label: 'Bクラス' },
  { value: 'class-c', label: 'Cクラス' },
] as const

interface ComposeModalProps {
  onClose: () => void
  onSend: (data: {
    text: string
    targetClassId: string
    isImportant: boolean
    image: File | null
  }) => void
}

export function ComposeModal({ onClose, onSend }: ComposeModalProps) {
  const [text, setText] = useState('')
  const [targetClassId, setTargetClassId] = useState('all')
  const [isImportant, setIsImportant] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = () => {
    if (!text.trim() && !image) return
    onSend({ text: text.trim(), targetClassId, isImportant, image })
  }

  const canSend = text.trim().length > 0 || image !== null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="flex w-full max-w-lg animate-slide-up flex-col rounded-t-3xl bg-bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg"
          >
            <X size={20} />
          </button>
          <h2 className="text-base font-bold">メッセージ作成</h2>
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className="flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-sm font-bold text-white transition-opacity disabled:opacity-40"
          >
            <Send size={14} />
            送信
          </button>
        </div>

        {/* Target class selector */}
        <div className="border-b border-border px-4 py-3">
          <label className="mb-2 block text-xs font-bold text-text-secondary">
            配信対象
          </label>
          <div className="flex flex-wrap gap-2">
            {CLASS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTargetClassId(opt.value)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                  targetClassId === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-text-secondary hover:border-primary/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Important toggle */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-accent" />
            <span className="text-sm font-medium text-text">重要マーク</span>
          </div>
          <button
            onClick={() => setIsImportant(!isImportant)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              isImportant ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                isImportant ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Text input */}
        <div className="px-4 pt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="メッセージを入力..."
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-bg p-3 text-sm leading-relaxed text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mx-4 mt-2">
            <img
              src={imagePreview}
              alt="プレビュー"
              className="h-32 w-auto rounded-xl object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white shadow"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 pb-8 pt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-bg"
          >
            <ImagePlus size={20} className="text-text-secondary" />
          </button>
          <span className="text-xs text-text-secondary">
            画像を添付できます
          </span>
        </div>
      </div>
    </div>
  )
}
