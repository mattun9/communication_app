import { useState } from 'react'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import type { TemplateMessage } from '../types'

interface TemplateManagerProps {
  templates: TemplateMessage[]
  onUpdate: (templates: TemplateMessage[]) => void
  onClose: () => void
}

export function TemplateManager({ templates, onUpdate, onClose }: TemplateManagerProps) {
  const [localTemplates, setLocalTemplates] = useState<TemplateMessage[]>(
    [...templates].sort((a, b) => a.order - b.order)
  )
  const [newText, setNewText] = useState('')

  const handleDelete = (id: string) => {
    setLocalTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const handleEdit = (id: string, text: string) => {
    setLocalTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)))
  }

  const handleAdd = () => {
    if (!newText.trim()) return
    const newTpl: TemplateMessage = {
      id: `tpl-${Date.now()}`,
      text: newText.trim(),
      order: localTemplates.length + 1,
      createdAt: new Date(),
    }
    setLocalTemplates((prev) => [...prev, newTpl])
    setNewText('')
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const items = [...localTemplates]
    ;[items[index - 1], items[index]] = [items[index], items[index - 1]]
    setLocalTemplates(items.map((t, i) => ({ ...t, order: i + 1 })))
  }

  const handleMoveDown = (index: number) => {
    if (index === localTemplates.length - 1) return
    const items = [...localTemplates]
    ;[items[index], items[index + 1]] = [items[index + 1], items[index]]
    setLocalTemplates(items.map((t, i) => ({ ...t, order: i + 1 })))
  }

  const handleSave = () => {
    onUpdate(localTemplates.map((t, i) => ({ ...t, order: i + 1 })))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold text-text">定型文の管理</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-4">
          <div className="space-y-2">
            {localTemplates.map((tpl, idx) => (
              <div key={tpl.id} className="flex items-center gap-2">
                <div className="flex flex-col">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="text-text-secondary disabled:opacity-20"
                  >
                    <GripVertical size={12} />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === localTemplates.length - 1}
                    className="text-text-secondary disabled:opacity-20"
                  >
                    <GripVertical size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  value={tpl.text}
                  onChange={(e) => handleEdit(tpl.id, e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="新しい定型文を入力..."
              className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!newText.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:opacity-30"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:bg-bg">
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
