import { useState, useRef } from 'react'
import { X, Upload, AlertCircle } from 'lucide-react'
import { parseCSVToMembers } from '../lib/csvUtils'
import type { User } from '../types'

interface CSVImportModalProps {
  onImport: (members: Partial<User>[]) => void
  onClose: () => void
}

export function CSVImportModal({ onImport, onClose }: CSVImportModalProps) {
  const [parsed, setParsed] = useState<Partial<User>[]>([])
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const members = parseCSVToMembers(text)
        if (members.length === 0) {
          setError('CSVにデータ行がありません。')
          return
        }
        setParsed(members)
      } catch {
        setError('CSVの解析に失敗しました。')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-2xl rounded-2xl bg-bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold text-text">CSVインポート</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bg">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {!parsed.length ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border px-12 py-8 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Upload size={32} className="text-text-secondary" />
                <span className="text-sm font-medium text-text">CSVファイルを選択</span>
                <span className="text-xs text-text-secondary">UTF-8 CSV形式</span>
              </button>
              {fileName && <span className="text-sm text-text-secondary">{fileName}</span>}
              {error && (
                <div className="flex items-center gap-2 text-sm text-danger">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-3 text-sm text-text-secondary">
                {parsed.length}件のデータを読み込みました
              </div>
              <div className="max-h-64 overflow-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-bg text-left">
                      <th className="px-3 py-2 font-medium text-text-secondary">会員番号</th>
                      <th className="px-3 py-2 font-medium text-text-secondary">氏名</th>
                      <th className="px-3 py-2 font-medium text-text-secondary">フリガナ</th>
                      <th className="px-3 py-2 font-medium text-text-secondary">メール</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 20).map((m, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-3 py-2 text-text">{m.memberNumber ?? '-'}</td>
                        <td className="px-3 py-2 text-text">{m.name}</td>
                        <td className="px-3 py-2 text-text">{m.nameKana}</td>
                        <td className="px-3 py-2 text-text">{m.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.length > 20 && (
                  <div className="bg-bg px-3 py-2 text-xs text-text-secondary">
                    ...他 {parsed.length - 20}件
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:bg-bg">
            キャンセル
          </button>
          <button
            onClick={() => {
              onImport(parsed)
              onClose()
            }}
            disabled={!parsed.length}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-30"
          >
            インポート
          </button>
        </div>
      </div>
    </div>
  )
}
