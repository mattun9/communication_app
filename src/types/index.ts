export interface User {
  uid: string
  name: string
  role: 'admin' | 'member'
  classId: string
  parentId?: string
  email: string
  avatarUrl?: string
  createdAt: Date
}

// 個別チャットメッセージ
export interface Message {
  id: string
  text: string
  type: 'text' | 'system'
  attachmentUrl?: string
  attachmentType?: 'image' | 'pdf'
  senderUid: string
  senderName: string
  senderRole: 'admin' | 'member'
  // 個別チャットの相手 (1対1)
  recipientUid?: string
  createdAt: Date
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
  status: 'draft' | 'scheduled' | 'sent'
  scheduledAt?: Date
  sentAt?: Date
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
