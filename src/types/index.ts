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

export interface Message {
  id: string
  text: string
  attachmentUrl?: string
  attachmentType?: 'image' | 'pdf'
  targetClassId: string | 'all'
  isImportant: boolean
  senderName: string
  senderRole: 'admin' | 'member'
  createdAt: Date
}

export interface ReadReceipt {
  messageId: string
  userId: string
  readAt: Date
}

export interface Attendance {
  id: string
  userId: string
  date: Date
  reason: string
  status: 'pending' | 'approved' | 'rejected'
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
