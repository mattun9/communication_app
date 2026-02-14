import { Undo2, Copy, Ban } from 'lucide-react'
import type { Message } from '../types'

interface MessageContextMenuProps {
  message: Message
  position: { x: number; y: number }
  currentUserUid: string
  onUnsend: (messageId: string) => void
  onCopy: (text: string) => void
  onClose: () => void
}

const UNSEND_LIMIT_MS = 24 * 60 * 60 * 1000

export function MessageContextMenu({
  message,
  position,
  currentUserUid,
  onUnsend,
  onCopy,
  onClose,
}: MessageContextMenuProps) {
  const canUnsend =
    message.senderUid === currentUserUid &&
    !message.isDeleted &&
    message.type === 'text' &&
    new Date().getTime() - message.createdAt.getTime() < UNSEND_LIMIT_MS

  return (
    <div className="fixed inset-0 z-[55]" onClick={onClose}>
      <div
        className="absolute min-w-[160px] overflow-hidden rounded-xl border border-border bg-bg-card shadow-xl"
        style={{
          left: Math.min(position.x, window.innerWidth - 180),
          top: Math.min(position.y, window.innerHeight - 120),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {canUnsend && (
          <button
            onClick={() => {
              onUnsend(message.id)
              onClose()
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-danger transition-colors hover:bg-danger/5"
          >
            <Undo2 size={16} />
            送信取り消し
          </button>
        )}
        {!message.isDeleted && (
          <button
            onClick={() => {
              onCopy(message.text)
              onClose()
            }}
            className="flex w-full items-center gap-3 border-t border-border/50 px-4 py-3 text-sm text-text transition-colors hover:bg-bg"
          >
            <Copy size={16} />
            コピー
          </button>
        )}
        {message.isDeleted && (
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary">
            <Ban size={16} />
            取り消し済み
          </div>
        )}
      </div>
    </div>
  )
}
