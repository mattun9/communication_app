import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import type { ReactNode } from 'react'
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
import {
  onMembers,
  fetchClassrooms,
  onMessages,
  insertMessage,
  updateMessage as updateMessageDb,
  deleteMessage as deleteMessageDb,
  onBroadcasts,
  insertBroadcast,
  updateBroadcast as updateBroadcastDb,
  fetchReadStatuses,
  markBroadcastAsRead,
  onAbsences,
  insertAbsence,
  onEvents,
  insertEvent,
  updateEvent as updateEventDb,
  deleteEvent as deleteEventDb,
  fetchTemplates,
  insertTemplate,
  updateTemplate as updateTemplateDb,
  deleteTemplate as deleteTemplateDb,
  reorderTemplates as reorderTemplatesDb,
} from '../lib/supabaseService'

export interface DataContextValue {
  members: User[]
  addMember: (member: User) => void
  updateMember: (uid: string, updates: Partial<User>) => void
  deleteMember: (uid: string) => void

  classrooms: Classroom[]
  addClassroom: (classroom: Classroom) => void
  updateClassroom: (id: string, updates: Partial<Classroom>) => void
  deleteClassroom: (id: string) => void

  broadcasts: Broadcast[]
  addBroadcast: (bc: Broadcast) => void
  updateBroadcast: (id: string, updates: Partial<Broadcast>) => void

  readStatuses: ReadStatus[]
  markAsRead: (broadcastId: string, userId: string, userName: string) => void

  messages: Message[]
  addMessage: (msg: Message) => void
  markMemberMessagesAsRead: (memberUid: string) => void
  unsendMessage: (msgId: string) => void
  updateMessage: (msgId: string, updates: Partial<Message>) => void
  deleteMessage: (msgId: string) => void
  getUnreadCountFromMembers: () => number

  absences: Absence[]
  addAbsence: (absence: Absence) => void

  events: CalendarEvent[]
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  templates: TemplateMessage[]
  addTemplate: (tpl: TemplateMessage) => void
  updateTemplate: (id: string, updates: Partial<TemplateMessage>) => void
  deleteTemplate: (id: string) => void
  reorderTemplates: (templates: TemplateMessage[]) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<User[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [readStatuses, setReadStatuses] = useState<ReadStatus[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [templates, setTemplates] = useState<TemplateMessage[]>([])

  // Supabase Realtime購読
  useEffect(() => {
    const unsubMembers = onMembers(setMembers)
    const unsubMessages = onMessages(setMessages)
    const unsubBroadcasts = onBroadcasts(setBroadcasts)
    const unsubAbsences = onAbsences(setAbsences)
    const unsubEvents = onEvents(setEvents)

    fetchClassrooms().then(setClassrooms).catch(console.error)
    fetchReadStatuses().then(setReadStatuses).catch(console.error)
    fetchTemplates().then(setTemplates).catch(console.error)

    return () => {
      unsubMembers()
      unsubMessages()
      unsubBroadcasts()
      unsubAbsences()
      unsubEvents()
    }
  }, [])

  // --- Members（管理システムDB参照のため追加・更新・削除は管理システム側で行う） ---
  const addMember = useCallback((_member: User) => {}, [])
  const updateMemberFn = useCallback((_uid: string, _updates: Partial<User>) => {}, [])
  const deleteMember = useCallback((_uid: string) => {}, [])

  // --- Classrooms ---
  const addClassroom = useCallback((_classroom: Classroom) => {}, [])
  const updateClassroomFn = useCallback((_id: string, _updates: Partial<Classroom>) => {}, [])
  const deleteClassroom = useCallback((_id: string) => {}, [])

  // --- Broadcasts ---
  const addBroadcast = useCallback(async (bc: Broadcast) => {
    try {
      await insertBroadcast(bc)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const updateBroadcastFn = useCallback(async (id: string, updates: Partial<Broadcast>) => {
    try {
      await updateBroadcastDb(id, updates)
    } catch (e) {
      console.error(e)
    }
  }, [])

  // --- Read statuses ---
  const markAsRead = useCallback(async (broadcastId: string, userId: string, userName: string) => {
    try {
      await markBroadcastAsRead(broadcastId, userId, userName)
      setReadStatuses(prev => {
        if (prev.some(r => r.broadcastId === broadcastId && r.userId === userId)) return prev
        return [...prev, { broadcastId, userId, userName, openedAt: new Date() }]
      })
    } catch (e) {
      console.error(e)
    }
  }, [])

  // --- Messages ---
  const addMessage = useCallback(async (msg: Message) => {
    try {
      // 楽観的更新（UIを即時反映）
      setMessages(prev => [...prev, msg])
      await insertMessage(msg)
    } catch (e) {
      console.error(e)
      // 失敗時はリアルタイムで巻き戻る
    }
  }, [])

  const markMemberMessagesAsRead = useCallback(async (memberUid: string) => {
    const unread = messages.filter(
      m => m.senderUid === memberUid && m.senderRole === 'member' && !m.isReadByRecipient
    )
    setMessages(prev =>
      prev.map(m =>
        m.senderUid === memberUid && m.senderRole === 'member' && !m.isReadByRecipient
          ? { ...m, isReadByRecipient: true, readAt: new Date() }
          : m
      )
    )
    await Promise.all(
      unread.map(m => updateMessageDb(m.id, { isReadByRecipient: true, readAt: new Date() }))
    ).catch(console.error)
  }, [messages])

  const unsendMessage = useCallback(async (msgId: string) => {
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, isDeleted: true, deletedAt: new Date() } : m)
    )
    await updateMessageDb(msgId, { isDeleted: true, deletedAt: new Date() }).catch(console.error)
  }, [])

  const updateMessageFn = useCallback(async (msgId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, ...updates } : m))
    await updateMessageDb(msgId, updates).catch(console.error)
  }, [])

  const deleteMessageFn = useCallback(async (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId))
    await deleteMessageDb(msgId).catch(console.error)
  }, [])

  const getUnreadCountFromMembers = useCallback(() => {
    return messages.filter(
      m => m.senderRole === 'member' && !m.isReadByRecipient && !m.isDeleted
    ).length
  }, [messages])

  // --- Absences ---
  const addAbsence = useCallback(async (absence: Absence) => {
    try {
      setAbsences(prev => [absence, ...prev])
      await insertAbsence(absence)
    } catch (e) {
      console.error(e)
    }
  }, [])

  // --- Calendar Events ---
  const addEvent = useCallback(async (event: CalendarEvent) => {
    try {
      setEvents(prev => [...prev, event])
      await insertEvent(event)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const updateEventFn = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    await updateEventDb(id, updates).catch(console.error)
  }, [])

  const deleteEventFn = useCallback(async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    await deleteEventDb(id).catch(console.error)
  }, [])

  // --- Templates ---
  const addTemplate = useCallback(async (tpl: TemplateMessage) => {
    try {
      setTemplates(prev => [...prev, tpl])
      await insertTemplate(tpl)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const updateTemplateFn = useCallback(async (id: string, updates: Partial<TemplateMessage>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    await updateTemplateDb(id, updates).catch(console.error)
  }, [])

  const deleteTemplateFn = useCallback(async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
    await deleteTemplateDb(id).catch(console.error)
  }, [])

  const reorderTemplatesFn = useCallback(async (reordered: TemplateMessage[]) => {
    setTemplates(reordered)
    await reorderTemplatesDb(reordered).catch(console.error)
  }, [])

  const value = useMemo<DataContextValue>(() => ({
    members,
    addMember,
    updateMember: updateMemberFn,
    deleteMember,
    classrooms,
    addClassroom,
    updateClassroom: updateClassroomFn,
    deleteClassroom,
    broadcasts,
    addBroadcast,
    updateBroadcast: updateBroadcastFn,
    readStatuses,
    markAsRead,
    messages,
    addMessage,
    markMemberMessagesAsRead,
    unsendMessage,
    updateMessage: updateMessageFn,
    deleteMessage: deleteMessageFn,
    getUnreadCountFromMembers,
    absences,
    addAbsence,
    events,
    addEvent,
    updateEvent: updateEventFn,
    deleteEvent: deleteEventFn,
    templates,
    addTemplate,
    updateTemplate: updateTemplateFn,
    deleteTemplate: deleteTemplateFn,
    reorderTemplates: reorderTemplatesFn,
  }), [
    members, addMember, updateMemberFn, deleteMember,
    classrooms, addClassroom, updateClassroomFn, deleteClassroom,
    broadcasts, addBroadcast, updateBroadcastFn,
    readStatuses, markAsRead,
    messages, addMessage, markMemberMessagesAsRead, unsendMessage, updateMessageFn, deleteMessageFn, getUnreadCountFromMembers,
    absences, addAbsence,
    events, addEvent, updateEventFn, deleteEventFn,
    templates, addTemplate, updateTemplateFn, deleteTemplateFn, reorderTemplatesFn,
  ])

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
