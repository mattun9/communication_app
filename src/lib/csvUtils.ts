import type { User, Classroom } from '../types'

const BOM = '\uFEFF'
const CSV_HEADERS = ['会員番号', '氏名', 'フリガナ', '電話番号', 'メールアドレス', '教室', '登録日']

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportMembersToCSV(members: User[], classrooms: Classroom[]): string {
  const getClassNames = (classIds: string[]) =>
    classIds
      .map((id) => classrooms.find((c) => c.id === id)?.name ?? id)
      .join(';')

  const rows = members.map((m) => [
    m.memberNumber ?? '',
    m.name,
    m.nameKana,
    m.phone ?? '',
    m.email,
    getClassNames(m.classIds),
    m.createdAt.toISOString().split('T')[0],
  ])

  const lines = [CSV_HEADERS, ...rows].map((row) => row.map(escapeCSV).join(','))
  return BOM + lines.join('\n')
}

export function generateCSVTemplate(): string {
  const sampleRow = ['M001', '山田 太郎', 'ヤマダ タロウ', '090-1234-5678', 'yamada@example.com', 'Aクラス', '2025-04-01']
  const lines = [CSV_HEADERS, sampleRow].map((row) => row.map(escapeCSV).join(','))
  return BOM + lines.join('\n')
}

export function parseCSVToMembers(csvText: string): Partial<User>[] {
  const text = csvText.replace(/^\uFEFF/, '')
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const rows = lines.slice(1)
  return rows.map((row) => {
    const cols = parseCSVLine(row)
    return {
      memberNumber: cols[0]?.trim() || undefined,
      name: cols[1]?.trim() || '',
      nameKana: cols[2]?.trim() || '',
      phone: cols[3]?.trim() || undefined,
      email: cols[4]?.trim() || '',
    }
  })
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current)
  return result
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
