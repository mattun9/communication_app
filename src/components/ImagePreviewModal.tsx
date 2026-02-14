import { X } from 'lucide-react'

interface ImagePreviewModalProps {
  url: string
  onClose: () => void
}

export function ImagePreviewModal({ url, onClose }: ImagePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
      >
        <X size={24} />
      </button>
      <img
        src={url}
        alt="プレビュー"
        className="max-h-[85dvh] max-w-[90vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
