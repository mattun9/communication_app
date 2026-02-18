// 保護者
export interface Guardian {
  id: string
  name: string
  email: string
  relation: string
}

export interface User {
  uid: string
  name: string
  nameKana: string
  role: 'admin' | 'member'
  classId: string
  classIds: string[]
  parentId?: string
  phone?: string
  memberNumber?: string
  email: string
  avatarUrl?: string
  guardians?: Guardian[]
  createdAt: Date
}

// 個別チャットメッセージ
export interface Message {
  id: string
  text: string
  type: 'text' | 'system' | 'absence'
  attachmentUrl?: string
  attachmentType?: 'image' | 'pdf'
  attachmentName?: string
  senderUid: string
  senderName: string
  senderRole: 'admin' | 'member'
  recipientUid?: string
  createdAt: Date
  // 送信取り消し
  isDeleted?: boolean
  deletedAt?: Date
  // 既読
  isReadByRecipient?: boolean
  readAt?: Date
  // 日時指定配信
  isScheduled?: boolean
  scheduledAt?: Date
  // お休み連絡 (type === 'absence')
  absenceDate?: string
  absenceReason?: string
  absenceNote?: string
}

// セグメント配信（一斉連絡）
export interface Broadcast {
  id: string
  title: string
  body: string
  imageUrl?: string
  targetType: 'all' | 'class' | 'individual'
  targetClassIds: string[]
  targetUserIds?: string[]
  isImportant: boolean
  status: 'draft' | 'scheduled' | 'sent' | 'recalled'
  scheduledAt?: Date
  sentAt?: Date
  recalledAt?: Date
  createdBy: string
  createdAt: Date
}

// 配信の開封状況
export interface ReadStatus {
  broadcastId: string
  userId: string
  userName: string
  openedAt: Date
}

// お休み連絡
export interface Absence {
  id: string
  userId: string
  userName: string
  classId: string
  date: Date
  reason: string
  note?: string
  createdAt: Date
}

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  description?: string
  classId: string | 'all'
  type: 'practice' | 'game' | 'event' | 'holiday'
}

// 教室マスタ
export interface Classroom {
  id: string
  name: string
  sportCategory: string
  createdAt: Date
}

// 会員-教室紐づけ
export interface UserClassroom {
  userId: string
  classroomId: string
}

// 定型文
export interface TemplateMessage {
  id: string
  text: string
  order: number
  createdAt: Date
}
