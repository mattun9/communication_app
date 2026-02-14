import { FileText } from 'lucide-react'

interface AttachmentPreviewProps {
  url: string
  type: 'image' | 'pdf'
  fileName?: string
  onImageClick?: () => void
  variant?: 'light' | 'dark'
}

export function AttachmentPreview({ url, type, fileName, onImageClick, variant = 'light' }: AttachmentPreviewProps) {
  if (type === 'image') {
    return (
      <button onClick={onImageClick} className="mt-1.5 block overflow-hidden rounded-lg">
        <img
          src={url}
          alt="添付画像"
          className="max-h-48 max-w-full rounded-lg object-cover"
        />
      </button>
    )
  }

  return (
    <div className={`mt-1.5 flex items-center gap-2 rounded-lg p-2 ${
      variant === 'dark' ? 'bg-white/10' : 'bg-bg'
    }`}>
      <FileText size={20} className={variant === 'dark' ? 'text-white/70' : 'text-primary'} />
      <span className={`truncate text-xs ${variant === 'dark' ? 'text-white/80' : 'text-text'}`}>
        {fileName || '添付ファイル.pdf'}
      </span>
    </div>
  )
}
