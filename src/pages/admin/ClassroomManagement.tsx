import { useState } from 'react'
import { Plus, X, Pencil, Trash2, Users } from 'lucide-react'
import { useClassrooms, useClassroomMembers } from '../../hooks/useData'
import type { Classroom } from '../../types'

const DEFAULT_SPORT_CATEGORIES = [
  'サッカー',
  'バスケットボール',
  'テニス',
  'バレーボール',
  '野球',
  '水泳',
  '体操',
]

export function AdminClassroomManagement() {
  const { classrooms, addClassroom, updateClassroom, deleteClassroom } = useClassrooms()
  const getClassroomMembers = useClassroomMembers()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [removedDefaultCategories, setRemovedDefaultCategories] = useState<string[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Merge default (minus removed) + custom + existing categories from classrooms
  const allCategories = Array.from(new Set([
    ...DEFAULT_SPORT_CATEGORIES.filter((c) => !removedDefaultCategories.includes(c)),
    ...customCategories,
    ...classrooms.map((c) => c.sportCategory),
  ])).filter(Boolean)

  const openAdd = () => {
    setEditingId(null)
    setFormName('')
    setFormCategory('')
    setShowModal(true)
  }

  const openEdit = (c: Classroom) => {
    setEditingId(c.id)
    setFormName(c.name)
    setFormCategory(c.sportCategory)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formName.trim() || !formCategory.trim()) return
    // If a new custom category was typed, persist it
    if (formCategory.trim() && !allCategories.includes(formCategory.trim())) {
      setCustomCategories((prev) => [...prev, formCategory.trim()])
    }
    if (editingId) {
      updateClassroom(editingId, { name: formName.trim(), sportCategory: formCategory })
    } else {
      const newClassroom: Classroom = {
        id: `class-${Date.now()}`,
        name: formName.trim(),
        sportCategory: formCategory,
        createdAt: new Date(),
      }
      addClassroom(newClassroom)
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    deleteClassroom(id)
    setDeleteConfirmId(null)
  }

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (!name) return
    if (allCategories.includes(name)) return
    setCustomCategories((prev) => [...prev, name])
    setNewCategoryName('')
  }

  const handleDeleteCategory = (cat: string) => {
    const isInUse = classrooms.some((c) => c.sportCategory === cat)
    if (isInUse) return
    if (DEFAULT_SPORT_CATEGORIES.includes(cat)) {
      setRemovedDefaultCategories((prev) => [...prev, cat])
    } else {
      setCustomCategories((prev) => prev.filter((c) => c !== cat))
    }
    if (formCategory === cat) setFormCategory('')
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text">教室管理</h1>
            <p className="mt-0.5 text-sm text-text-secondary">
              {classrooms.length}件の教室
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
          >
            <Plus size={16} />
            新規追加
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((c) => {
            const members = getClassroomMembers(c.id)
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-bg-card p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-text">{c.name}</h3>
                    <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {c.sportCategory}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-bg hover:text-text"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(c.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Users size={14} />
                  <span className="text-sm">{members.length}名</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-base font-bold text-text">
                {editingId ? '教室を編集' : '教室を追加'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                  教室名
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例: Fクラス"
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                  種目カテゴリ
                </label>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFormCategory(cat)}
                      className={`rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                        formCategory === cat
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-text-secondary hover:border-primary/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="flex items-center justify-center rounded-full border-2 border-dashed border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {!formCategory && (
                  <p className="mt-1.5 text-xs text-text-secondary">カテゴリを選択してください</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:bg-bg"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={!formName.trim() || !formCategory.trim()}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-30"
              >
                {editingId ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-base font-bold text-text">カテゴリ管理</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory() }}
                  placeholder="新しいカテゴリ名"
                  className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-30"
                >
                  追加
                </button>
              </div>
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {allCategories.map((cat) => {
                  const isInUse = classrooms.some((c) => c.sportCategory === cat)
                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-bg"
                    >
                      <span className="text-sm text-text">{cat}</span>
                      <div className="flex items-center gap-2">
                        {isInUse && (
                          <span className="text-[11px] text-text-secondary">使用中</span>
                        )}
                        {!isInUse && (
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-bg-card p-6 shadow-xl">
            <h3 className="mb-2 text-base font-bold text-text">教室を削除</h3>
            <p className="mb-4 text-sm text-text-secondary">
              この教室を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:bg-bg"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
