import { useRef } from 'react'
import { Paperclip } from 'lucide-react'

interface FileAttachmentButtonProps {
  onFileSelect: (file: File, previewUrl: string, fileType: 'image' | 'pdf') => void
}

export function FileAttachmentButton({ onFileSelect }: FileAttachmentButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileType: 'image' | 'pdf' = file.type.startsWith('image/') ? 'image' : 'pdf'
    const previewUrl = URL.createObjectURL(file)
    onFileSelect(file, previewUrl, fileType)

    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg text-text-secondary transition-colors hover:bg-border"
      >
        <Paperclip size={18} />
      </button>
    </>
  )
}
