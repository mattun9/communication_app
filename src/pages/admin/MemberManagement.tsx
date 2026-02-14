import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronUp, ChevronDown, Download, Upload, FileDown, X, Plus, Pencil, MessageCircle } from 'lucide-react'
import { DUMMY_MEMBERS, DUMMY_CLASSROOMS, getClassLabel, CLASS_OPTIONS } from '../../lib/dummyData'
import { exportMembersToCSV, generateCSVTemplate, downloadCSV } from '../../lib/csvUtils'
import { CSVImportModal } from '../../components/CSVImportModal'
import type { User } from '../../types'

type SortField = 'memberNumber' | 'name' | 'nameKana' | 'phone' | 'email' | 'classIds' | 'createdAt'

const COLUMNS: { key: SortField; label: string }[] = [
  { key: 'memberNumber', label: '会員番号' },
  { key: 'name', label: '氏名' },
  { key: 'nameKana', label: 'フリガナ' },
  { key: 'phone', label: '電話番号' },
  { key: 'email', label: 'メールアドレス' },
  { key: 'classIds', label: '教室' },
  { key: 'createdAt', label: '登録日' },
]

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

function getSortValue(member: User, field: SortField): string | number {
  switch (field) {
    case 'memberNumber':
      return member.memberNumber ?? ''
    case 'name':
      return member.name
    case 'nameKana':
      return member.nameKana
    case 'phone':
      return member.phone ?? ''
    case 'email':
      return member.email
    case 'classIds':
      return member.classIds.map(getClassLabel).join(', ')
    case 'createdAt':
      return member.createdAt.getTime()
    default:
      return ''
  }
}

export function AdminMemberManagement() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<User[]>(DUMMY_MEMBERS.filter(m => m.role === 'member'))
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('memberNumber')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterClassId, setFilterClassId] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<User | null>(null)
  const [showCSVImport, setShowCSVImport] = useState(false)

  // Modal editing state
  const [editingPhone, setEditingPhone] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [showClassDropdown, setShowClassDropdown] = useState(false)

  const filteredMembers = useMemo(() => {
    let result = members

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.nameKana.toLowerCase().includes(q) ||
          (m.memberNumber ?? '').toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      )
    }

    // Class filter
    if (filterClassId !== 'all') {
      result = result.filter((m) => m.classIds.includes(filterClassId))
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aVal = getSortValue(a, sortField)
      const bVal = getSortValue(b, sortField)
      let cmp = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'ja')
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return result
  }, [members, searchQuery, filterClassId, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleExport = () => {
    const csv = exportMembersToCSV(filteredMembers, DUMMY_CLASSROOMS)
    downloadCSV(csv, `会員一覧_${formatDate(new Date()).replace(/\//g, '')}.csv`)
  }

  const handleTemplate = () => {
    const csv = generateCSVTemplate()
    downloadCSV(csv, '会員インポートテンプレート.csv')
  }

  const handleImport = (imported: Partial<User>[]) => {
    const newMembers: User[] = imported.map((m, i) => ({
      uid: `imported-${Date.now()}-${i}`,
      name: m.name ?? '',
      nameKana: m.nameKana ?? '',
      role: 'member' as const,
      classId: '',
      classIds: [],
      phone: m.phone,
      memberNumber: m.memberNumber,
      email: m.email ?? '',
      createdAt: new Date(),
    }))
    setMembers((prev) => [...prev, ...newMembers])
  }

  const openMemberDetail = (member: User) => {
    setSelectedMember(member)
    setEditPhone(member.phone ?? '')
    setEditEmail(member.email)
    setEditingPhone(false)
    setEditingEmail(false)
    setShowClassDropdown(false)
  }

  const updateSelectedMember = (updated: User) => {
    setSelectedMember(updated)
    setMembers((prev) => prev.map((m) => (m.uid === updated.uid ? updated : m)))
  }

  const handleRemoveClass = (classId: string) => {
    if (!selectedMember) return
    const updated: User = {
      ...selectedMember,
      classIds: selectedMember.classIds.filter((id) => id !== classId),
    }
    updateSelectedMember(updated)
  }

  const handleAddClass = (classId: string) => {
    if (!selectedMember) return
    if (selectedMember.classIds.includes(classId)) return
    const updated: User = {
      ...selectedMember,
      classIds: [...selectedMember.classIds, classId],
    }
    updateSelectedMember(updated)
    setShowClassDropdown(false)
  }

  const handleSavePhone = () => {
    if (!selectedMember) return
    const updated: User = { ...selectedMember, phone: editPhone }
    updateSelectedMember(updated)
    setEditingPhone(false)
  }

  const handleSaveEmail = () => {
    if (!selectedMember) return
    const updated: User = { ...selectedMember, email: editEmail }
    updateSelectedMember(updated)
    setEditingEmail(false)
  }

  const availableClassrooms = selectedMember
    ? DUMMY_CLASSROOMS.filter((c) => !selectedMember.classIds.includes(c.id))
    : []

  return (
    <div className="flex h-full flex-col bg-bg">
      {/* Header */}
      <div className="bg-bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="mb-4 flex items-center gap-3">
            <h1 className="text-xl font-bold text-text">会員管理</h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {filteredMembers.length}名
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="会員を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 pl-9 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Class filter */}
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">すべての教室</option>
              {CLASS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* CSV buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg hover:text-text"
              >
                <Download size={14} />
                エクスポート
              </button>
              <button
                onClick={() => setShowCSVImport(true)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg hover:text-text"
              >
                <Upload size={14} />
                インポート
              </button>
              <button
                onClick={handleTemplate}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg hover:text-text"
              >
                <FileDown size={14} />
                テンプレート
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="cursor-pointer select-none whitespace-nowrap px-4 py-3 font-medium text-text-secondary transition-colors hover:text-text"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortField === col.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : (
                        <span className="w-3.5" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.uid}
                  onClick={() => openMemberDetail(member)}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-bg"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-text">
                    {member.memberNumber ?? '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-text">
                    {member.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {member.nameKana}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-text">
                    {member.phone ?? '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-text">
                    {member.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {member.classIds.map((classId) => (
                        <span
                          key={classId}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {getClassLabel(classId)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {formatDate(member.createdAt)}
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-text-secondary">
                    該当する会員が見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="mx-4 w-full max-w-lg rounded-2xl bg-bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-text">{selectedMember.name}</h2>
                <p className="text-xs text-text-secondary">{selectedMember.nameKana}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg hover:text-text"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="space-y-4 px-5 py-4">
              {/* Member number */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">会員番号</label>
                <p className="font-mono text-sm text-text">{selectedMember.memberNumber ?? '-'}</p>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">電話番号</label>
                {editingPhone ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={handleSavePhone}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingPhone(false)
                        setEditPhone(selectedMember.phone ?? '')
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs text-text-secondary hover:bg-bg"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text">{selectedMember.phone ?? '-'}</p>
                    <button
                      onClick={() => setEditingPhone(true)}
                      className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors hover:bg-bg hover:text-text"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">メールアドレス</label>
                {editingEmail ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingEmail(false)
                        setEditEmail(selectedMember.email)
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs text-text-secondary hover:bg-bg"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text">{selectedMember.email}</p>
                    <button
                      onClick={() => setEditingEmail(true)}
                      className="flex h-6 w-6 items-center justify-center rounded text-text-secondary transition-colors hover:bg-bg hover:text-text"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Classrooms */}
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">所属教室</label>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedMember.classIds.map((classId) => (
                    <span
                      key={classId}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {getClassLabel(classId)}
                      <button
                        onClick={() => handleRemoveClass(classId)}
                        className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-primary/20"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {selectedMember.classIds.length === 0 && (
                    <span className="text-xs text-text-secondary">所属教室なし</span>
                  )}
                </div>

                {/* Add classroom */}
                <div className="relative mt-2">
                  <button
                    onClick={() => setShowClassDropdown((v) => !v)}
                    disabled={availableClassrooms.length === 0}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 disabled:text-text-secondary disabled:opacity-50"
                  >
                    <Plus size={12} />
                    教室を追加
                  </button>
                  {showClassDropdown && availableClassrooms.length > 0 && (
                    <div className="absolute left-0 top-full z-10 mt-1 min-w-[160px] rounded-lg border border-border bg-bg-card py-1 shadow-lg">
                      {availableClassrooms.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleAddClass(c.id)}
                          className="block w-full px-3 py-2 text-left text-xs text-text transition-colors hover:bg-bg"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Registration date */}
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">登録日</label>
                <p className="text-sm text-text">{formatDate(selectedMember.createdAt)}</p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-between border-t border-border px-5 py-3">
              <button
                onClick={() => {
                  navigate(`/admin/inbox?member=${selectedMember.uid}`)
                }}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <MessageCircle size={14} />
                トークを開く
              </button>
              <button
                onClick={() => setSelectedMember(null)}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCSVImport && (
        <CSVImportModal
          onImport={handleImport}
          onClose={() => setShowCSVImport(false)}
        />
      )}
    </div>
  )
}
