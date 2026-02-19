/**
 * DataContext — central data store for the entire app.
 *
 * In demo mode (no Firebase credentials): uses in-memory state from dummyData.
 * In Firestore mode: subscribes to real-time Firestore listeners.
 *
 * All pages should read data via the useData() hooks instead of
 * importing DUMMY_* constants directly.
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react'
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
  DUMMY_MEMBERS,
  DUMMY_CLASSROOMS,
  DUMMY_BROADCASTS,
  DUMMY_READ_STATUSES,
  DUMMY_MESSAGES,
  DUMMY_ABSENCES,
  DUMMY_EVENTS,
  DEFAULT_TEMPLATES,
} from '../lib/dummyData'

// ---- Context shape ----

export interface DataContextValue {
  // Members
  members: User[]
  addMember: (member: User) => void
  updateMember: (uid: string, updates: Partial<User>) => void
  deleteMember: (uid: string) => void

  // Classrooms
  classrooms: Classroom[]
  addClassroom: (classroom: Classroom) => void
  updateClassroom: (id: string, updates: Partial<Classroom>) => void
  deleteClassroom: (id: string) => void

  // Broadcasts
  broadcasts: Broadcast[]
  addBroadcast: (bc: Broadcast) => void
  updateBroadcast: (id: string, updates: Partial<Broadcast>) => void

  // Read statuses
  readStatuses: ReadStatus[]
  markAsRead: (broadcastId: string, userId: string, userName: string) => void

  // Messages
  messages: Message[]
  addMessage: (msg: Message) => void
  markMemberMessagesAsRead: (memberUid: string) => void
  unsendMessage: (msgId: string) => void
  updateMessage: (msgId: string, updates: Partial<Message>) => void
  deleteMessage: (msgId: string) => void
  getUnreadCountFromMembers: () => number

  // Absences
  absences: Absence[]
  addAbsence: (absence: Absence) => void

  // Calendar events
  events: CalendarEvent[]
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  // Templates
  templates: TemplateMessage[]
  addTemplate: (tpl: TemplateMessage) => void
  updateTemplate: (id: string, updates: Partial<TemplateMessage>) => void
  deleteTemplate: (id: string) => void
  reorderTemplates: (templates: TemplateMessage[]) => void
}

const DataContext = createContext<DataContextValue | null>(null)

// ---- Provider ----

export function DataProvider({ children }: { children: ReactNode }) {
  // --- State ---
  const [members, setMembers] = useState<User[]>(DUMMY_MEMBERS)
  const [classrooms, setClassrooms] = useState<Classroom[]>(DUMMY_CLASSROOMS)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(DUMMY_BROADCASTS)
  const [readStatuses, setReadStatuses] = useState<ReadStatus[]>(DUMMY_READ_STATUSES)
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES)
  const [absences, setAbsences] = useState<Absence[]>(DUMMY_ABSENCES)
  const [events, setEvents] = useState<CalendarEvent[]>(DUMMY_EVENTS)
  const [templates, setTemplates] = useState<TemplateMessage[]>(DEFAULT_TEMPLATES)

  // --- Members ---
  const addMember = useCallback((member: User) => {
    setMembers(prev => [...prev, member])
  }, [])
  const updateMemberFn = useCallback((uid: string, updates: Partial<User>) => {
    setMembers(prev => prev.map(m => m.uid === uid ? { ...m, ...updates } : m))
  }, [])
  const deleteMember = useCallback((uid: string) => {
    setMembers(prev => prev.filter(m => m.uid !== uid))
  }, [])

  // --- Classrooms ---
  const addClassroom = useCallback((classroom: Classroom) => {
    setClassrooms(prev => [...prev, classroom])
  }, [])
  const updateClassroomFn = useCallback((id: string, updates: Partial<Classroom>) => {
    setClassrooms(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])
  const deleteClassroom = useCallback((id: string) => {
    setClassrooms(prev => prev.filter(c => c.id !== id))
  }, [])

  // --- Broadcasts ---
  const addBroadcast = useCallback((bc: Broadcast) => {
    setBroadcasts(prev => [bc, ...prev])
  }, [])
  const updateBroadcastFn = useCallback((id: string, updates: Partial<Broadcast>) => {
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  // --- Read statuses ---
  const markAsRead = useCallback((broadcastId: string, userId: string, userName: string) => {
    setReadStatuses(prev => {
      if (prev.some(r => r.broadcastId === broadcastId && r.userId === userId)) return prev
      return [...prev, { broadcastId, userId, userName, openedAt: new Date() }]
    })
  }, [])

  // --- Messages ---
  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg])
  }, [])
  const markMemberMessagesAsRead = useCallback((memberUid: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.senderUid === memberUid && m.senderRole === 'member' && !m.isReadByRecipient
          ? { ...m, isReadByRecipient: true, readAt: new Date() }
          : m
      )
    )
  }, [])
  const unsendMessage = useCallback((msgId: string) => {
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, isDeleted: true, deletedAt: new Date() } : m)
    )
  }, [])
  const updateMessageFn = useCallback((msgId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, ...updates } : m))
  }, [])
  const deleteMessage = useCallback((msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId))
  }, [])
  const getUnreadCountFromMembers = useCallback(() => {
    return messages.filter(m => m.senderRole === 'member' && !m.isReadByRecipient && !m.isDeleted).length
  }, [messages])

  // --- Absences ---
  const addAbsence = useCallback((absence: Absence) => {
    setAbsences(prev => [absence, ...prev])
  }, [])

  // --- Calendar Events ---
  const addEvent = useCallback((event: CalendarEvent) => {
    setEvents(prev => [...prev, event])
  }, [])
  const updateEventFn = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }, [])
  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  // --- Templates ---
  const addTemplate = useCallback((tpl: TemplateMessage) => {
    setTemplates(prev => [...prev, tpl])
  }, [])
  const updateTemplateFn = useCallback((id: string, updates: Partial<TemplateMessage>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])
  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }, [])
  const reorderTemplates = useCallback((reordered: TemplateMessage[]) => {
    setTemplates(reordered)
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
    deleteMessage,
    getUnreadCountFromMembers,
    absences,
    addAbsence,
    events,
    addEvent,
    updateEvent: updateEventFn,
    deleteEvent,
    templates,
    addTemplate,
    updateTemplate: updateTemplateFn,
    deleteTemplate,
    reorderTemplates,
  }), [
    members, addMember, updateMemberFn, deleteMember,
    classrooms, addClassroom, updateClassroomFn, deleteClassroom,
    broadcasts, addBroadcast, updateBroadcastFn,
    readStatuses, markAsRead,
    messages, addMessage, markMemberMessagesAsRead, unsendMessage, updateMessageFn, deleteMessage, getUnreadCountFromMembers,
    absences, addAbsence,
    events, addEvent, updateEventFn, deleteEvent,
    templates, addTemplate, updateTemplateFn, deleteTemplate, reorderTemplates,
  ])

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

// ---- Base hook ----

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
