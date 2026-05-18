import { supabase } from './supabase'
import type {
  User,
  Message,
  Broadcast,
  ReadStatus,
  Absence,
  CalendarEvent,
  Classroom,
  TemplateMessage,
} from '../types'

// ---- 型変換ヘルパー ----

function toMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    text: (row.text as string) ?? '',
    type: (row.type as Message['type']) ?? 'text',
    attachmentUrl: row.attachment_url as string | undefined,
    attachmentType: row.attachment_type as Message['attachmentType'],
    attachmentName: row.attachment_name as string | undefined,
    senderUid: row.sender_id as string,
    senderName: row.sender_name as string,
    senderRole: row.sender_role as Message['senderRole'],
    recipientUid: row.recipient_id as string | undefined,
    isDeleted: (row.is_deleted as boolean) ?? false,
    deletedAt: row.deleted_at ? new Date(row.deleted_at as string) : undefined,
    isReadByRecipient: (row.is_read as boolean) ?? false,
    readAt: row.read_at ? new Date(row.read_at as string) : undefined,
    isScheduled: (row.is_scheduled as boolean) ?? false,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at as string) : undefined,
    absenceDate: row.absence_date as string | undefined,
    absenceReason: row.absence_reason as string | undefined,
    absenceNote: row.absence_note as string | undefined,
    createdAt: new Date(row.created_at as string),
  }
}

function toBroadcast(row: Record<string, unknown>): Broadcast {
  return {
    id: row.id as string,
    title: row.title as string,
    body: row.body as string,
    imageUrl: row.image_url as string | undefined,
    targetType: row.target_type as Broadcast['targetType'],
    targetClassIds: (row.target_class_ids as string[]) ?? [],
    targetUserIds: (row.target_user_ids as string[]) ?? [],
    isImportant: (row.is_important as boolean) ?? false,
    status: row.status as Broadcast['status'],
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at as string) : undefined,
    sentAt: row.sent_at ? new Date(row.sent_at as string) : undefined,
    recalledAt: row.recalled_at ? new Date(row.recalled_at as string) : undefined,
    createdBy: row.created_by as string,
    createdAt: new Date(row.created_at as string),
  }
}

function toReadStatus(row: Record<string, unknown>): ReadStatus {
  return {
    broadcastId: row.broadcast_id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    openedAt: new Date(row.opened_at as string),
  }
}

function toAbsence(row: Record<string, unknown>): Absence {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    classId: row.class_id as string,
    date: new Date(row.date as string),
    reason: row.reason as string,
    note: row.note as string | undefined,
    createdAt: new Date(row.created_at as string),
  }
}

function toEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    date: new Date(row.date as string),
    description: row.description as string | undefined,
    classId: (row.class_id as string) ?? 'all',
    type: row.type as CalendarEvent['type'],
  }
}

function toClassroom(row: Record<string, unknown>): Classroom {
  return {
    id: row.id as string,
    name: row.name as string,
    sportCategory: (row.category as string) ?? '',
    createdAt: row.created_at ? new Date(row.created_at as string) : new Date(),
  }
}

function toMember(row: Record<string, unknown>): User {
  const classes = (row.classes as string[]) ?? []
  return {
    uid: row.id as string,
    name: (row.name as string) ?? '',
    nameKana: (row.name_kana as string) ?? '',
    role: 'member',
    classId: classes[0] ?? '',
    classIds: classes,
    email: (row.email as string) ?? '',
    phone: row.phone as string | undefined,
    memberNumber: row.member_number as string | undefined,
    lineUserId: row.line_user_id as string | undefined,
    createdAt: row.created_at ? new Date(row.created_at as string) : new Date(),
  }
}

// ---- Members（管理システムの既存テーブルを参照） ----

export async function fetchMembers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('members')
    .select('id, name, name_kana, email, phone, member_number, classes, line_user_id, created_at')
    .eq('status', '在籍')
    .order('name')
  if (error) throw error
  return (data ?? []).map(toMember)
}

export function onMembers(cb: (members: User[]) => void): () => void {
  fetchMembers().then(cb).catch(console.error)
  const channel = supabase
    .channel('members-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
      fetchMembers().then(cb).catch(console.error)
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

// ---- Classrooms（管理システムの既存テーブルを参照） ----

export async function fetchClassrooms(): Promise<Classroom[]> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('id, name, category, created_at')
    .eq('status', 'active')
    .order('display_order')
  if (error) throw error
  return (data ?? []).map(toClassroom)
}

// ---- Messages ----

export async function fetchMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from('comm_messages')
    .select('*')
    .order('created_at')
  if (error) throw error
  return (data ?? []).map(row => toMessage(row as Record<string, unknown>))
}

export function onMessages(cb: (messages: Message[]) => void): () => void {
  fetchMessages().then(cb).catch(console.error)
  const channel = supabase
    .channel('comm-messages')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comm_messages' }, () => {
      fetchMessages().then(cb).catch(console.error)
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export async function insertMessage(msg: Omit<Message, 'id'>): Promise<string> {
  const { data, error } = await supabase.from('comm_messages').insert({
    text: msg.text,
    type: msg.type,
    attachment_url: msg.attachmentUrl ?? null,
    attachment_type: msg.attachmentType ?? null,
    attachment_name: msg.attachmentName ?? null,
    sender_id: msg.senderUid,
    sender_name: msg.senderName,
    sender_role: msg.senderRole,
    recipient_id: msg.recipientUid ?? null,
    is_scheduled: msg.isScheduled ?? false,
    scheduled_at: msg.scheduledAt?.toISOString() ?? null,
    absence_date: msg.absenceDate ?? null,
    absence_reason: msg.absenceReason ?? null,
    absence_note: msg.absenceNote ?? null,
  }).select('id').single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updateMessage(id: string, updates: Partial<Message>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (updates.text !== undefined) patch.text = updates.text
  if (updates.isDeleted !== undefined) patch.is_deleted = updates.isDeleted
  if (updates.deletedAt !== undefined) patch.deleted_at = updates.deletedAt?.toISOString() ?? null
  if (updates.isReadByRecipient !== undefined) patch.is_read = updates.isReadByRecipient
  if (updates.readAt !== undefined) patch.read_at = updates.readAt?.toISOString() ?? null
  if (updates.scheduledAt !== undefined) patch.scheduled_at = updates.scheduledAt?.toISOString() ?? null
  const { error } = await supabase.from('comm_messages').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase.from('comm_messages').delete().eq('id', id)
  if (error) throw error
}

// ---- Broadcasts ----

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  const { data, error } = await supabase
    .from('comm_broadcasts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => toBroadcast(row as Record<string, unknown>))
}

export function onBroadcasts(cb: (broadcasts: Broadcast[]) => void): () => void {
  fetchBroadcasts().then(cb).catch(console.error)
  const channel = supabase
    .channel('comm-broadcasts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comm_broadcasts' }, () => {
      fetchBroadcasts().then(cb).catch(console.error)
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export async function insertBroadcast(bc: Omit<Broadcast, 'id' | 'createdAt'>): Promise<string> {
  const { data, error } = await supabase.from('comm_broadcasts').insert({
    title: bc.title,
    body: bc.body,
    image_url: bc.imageUrl ?? null,
    target_type: bc.targetType,
    target_class_ids: bc.targetClassIds,
    target_user_ids: bc.targetUserIds ?? [],
    is_important: bc.isImportant,
    status: bc.status,
    scheduled_at: bc.scheduledAt?.toISOString() ?? null,
    sent_at: bc.sentAt?.toISOString() ?? null,
    created_by: bc.createdBy,
  }).select('id').single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updateBroadcast(id: string, updates: Partial<Broadcast>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (updates.title !== undefined) patch.title = updates.title
  if (updates.body !== undefined) patch.body = updates.body
  if (updates.status !== undefined) patch.status = updates.status
  if (updates.sentAt !== undefined) patch.sent_at = updates.sentAt?.toISOString() ?? null
  if (updates.recalledAt !== undefined) patch.recalled_at = updates.recalledAt?.toISOString() ?? null
  const { error } = await supabase.from('comm_broadcasts').update(patch).eq('id', id)
  if (error) throw error
}

// ---- Broadcast Reads ----

export async function fetchReadStatuses(): Promise<ReadStatus[]> {
  const { data, error } = await supabase.from('comm_broadcast_reads').select('*')
  if (error) throw error
  return (data ?? []).map(row => toReadStatus(row as Record<string, unknown>))
}

export async function markBroadcastAsRead(broadcastId: string, userId: string, userName: string): Promise<void> {
  const { error } = await supabase.from('comm_broadcast_reads').upsert(
    { broadcast_id: broadcastId, user_id: userId, user_name: userName },
    { onConflict: 'broadcast_id,user_id' }
  )
  if (error) throw error
}

// ---- Absences ----

export async function fetchAbsences(): Promise<Absence[]> {
  const { data, error } = await supabase
    .from('comm_absences')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => toAbsence(row as Record<string, unknown>))
}

export function onAbsences(cb: (absences: Absence[]) => void): () => void {
  fetchAbsences().then(cb).catch(console.error)
  const channel = supabase
    .channel('comm-absences')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comm_absences' }, () => {
      fetchAbsences().then(cb).catch(console.error)
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export async function insertAbsence(ab: Omit<Absence, 'id' | 'createdAt'>): Promise<string> {
  const { data, error } = await supabase.from('comm_absences').insert({
    user_id: ab.userId,
    user_name: ab.userName,
    class_id: ab.classId,
    date: ab.date.toISOString().split('T')[0],
    reason: ab.reason,
    note: ab.note ?? null,
  }).select('id').single()
  if (error) throw error
  return (data as { id: string }).id
}

// ---- Calendar Events ----

export async function fetchEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('comm_events')
    .select('*')
    .order('date')
  if (error) throw error
  return (data ?? []).map(row => toEvent(row as Record<string, unknown>))
}

export function onEvents(cb: (events: CalendarEvent[]) => void): () => void {
  fetchEvents().then(cb).catch(console.error)
  const channel = supabase
    .channel('comm-events')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comm_events' }, () => {
      fetchEvents().then(cb).catch(console.error)
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export async function insertEvent(ev: Omit<CalendarEvent, 'id'>): Promise<string> {
  const { data, error } = await supabase.from('comm_events').insert({
    title: ev.title,
    date: ev.date.toISOString().split('T')[0],
    description: ev.description ?? null,
    class_id: ev.classId,
    type: ev.type,
  }).select('id').single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (updates.title !== undefined) patch.title = updates.title
  if (updates.date !== undefined) patch.date = updates.date.toISOString().split('T')[0]
  if (updates.description !== undefined) patch.description = updates.description ?? null
  if (updates.classId !== undefined) patch.class_id = updates.classId
  if (updates.type !== undefined) patch.type = updates.type
  const { error } = await supabase.from('comm_events').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('comm_events').delete().eq('id', id)
  if (error) throw error
}

// ---- Templates ----

export async function fetchTemplates(): Promise<TemplateMessage[]> {
  const { data, error } = await supabase
    .from('comm_templates')
    .select('*')
    .order('order')
  if (error) throw error
  return (data ?? []).map(row => ({
    id: row.id as string,
    text: row.text as string,
    order: row.order as number,
    createdAt: new Date(row.created_at as string),
  }))
}

export async function insertTemplate(tpl: Omit<TemplateMessage, 'id' | 'createdAt'>): Promise<string> {
  const { data, error } = await supabase.from('comm_templates').insert({
    text: tpl.text,
    order: tpl.order,
  }).select('id').single()
  if (error) throw error
  return (data as { id: string }).id
}

export async function updateTemplate(id: string, updates: Partial<TemplateMessage>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (updates.text !== undefined) patch.text = updates.text
  if (updates.order !== undefined) patch.order = updates.order
  const { error } = await supabase.from('comm_templates').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('comm_templates').delete().eq('id', id)
  if (error) throw error
}

export async function reorderTemplates(templates: TemplateMessage[]): Promise<void> {
  const updates = templates.map((t, i) =>
    supabase.from('comm_templates').update({ order: i }).eq('id', t.id)
  )
  await Promise.all(updates)
}
