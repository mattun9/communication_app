import { Settings, X } from 'lucide-react'
import type { TemplateMessage } from '../types'

interface TemplateMessagePanelProps {
  templates: TemplateMessage[]
  onSelect: (text: string) => void
  onClose: () => void
  onManage: () => void
}

export function TemplateMessagePanel({ templates, onSelect, onClose, onManage }: TemplateMessagePanelProps) {
  return (
    <div className="border-t border-border bg-bg-card">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-bold text-text-secondary">定型文</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onManage}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-bg hover:text-text"
          >
            <Settings size={12} />
            管理
          </button>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-bg"
          >
            <X size={14} className="text-text-secondary" />
          </button>
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto px-3 pb-3">
        <div className="flex flex-col gap-1.5">
          {templates
            .sort((a, b) => a.order - b.order)
            .map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => onSelect(tpl.text)}
                className="rounded-lg border border-border bg-bg px-3 py-2 text-left text-sm text-text transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                {tpl.text}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
