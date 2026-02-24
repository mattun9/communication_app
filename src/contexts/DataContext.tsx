/**
 * DataContext — central data store for the entire app.
 *
 * In demo mode (no Firebase credentials): uses in-memory state from dummyData.
 * In Firestore mode: subscribes to real-time Firestore listeners.
 *
 * All pages should read data via the useData() hooks instead of
 * importing DUMMY_* constants directly.
 */
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
  DUMMY_MEMBERS,
  DUMMY_CLASSROOMS,
  DUMMY_BROADCASTS,
  DUMMY_READ_STATUSES,
  DUMMY_MESSAGES,
  DUMMY_ABSENCES,
  DUMMY_EVENTS,
  DEFAULT_TEMPLATES,
} from '../lib/dummyData'
import {
  firestoreEnabled,
  onMembers,
  addMember as fsAddMember,
  updateMember as fsUpdateMember,
  deleteMember as fsDeleteMember,
  onClassrooms,
  addClassroom as fsAddClassroom,
  updateClassroom as fsUpdateClassroom,
  deleteClassroom as fsDeleteClassroom,
  onBroadcasts,
  addBroadcast as fsAddBroadcast,
  updateBroadcast as fsUpdateBroadcast,
  onReadStatuses,
  markBroadcastAsRead,
  onMessages,
  addMessageDoc,
  updateMessageDoc,
  deleteMessageDoc,
  onAbsences,
  addAbsenceDoc,
  onEvents,
  addEventDoc,
  updateEventDoc,
  deleteEventDoc,
  onTemplates,
  addTemplateDoc,
  updateTemplateDoc,
  deleteTemplateDoc,
} from '../lib/firestoreService'

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
  // --- State (empty arrays in Firestore mode, dummy data in demo mode) ---
  const [members, setMembers] = useState<User[]>(firestoreEnabled ? [] : DUMMY_MEMBERS)
  const [classrooms, setClassrooms] = useState<Classroom[]>(firestoreEnabled ? [] : DUMMY_CLASSROOMS)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(firestoreEnabled ? [] : DUMMY_BROADCASTS)
  const [readStatuses, setReadStatuses] = useState<ReadStatus[]>(firestoreEnabled ? [] : DUMMY_READ_STATUSES)
  const [messages, setMessages] = useState<Message[]>(firestoreEnabled ? [] : DUMMY_MESSAGES)
  const [absences, setAbsences] = useState<Absence[]>(firestoreEnabled ? [] : DUMMY_ABSENCES)
  const [events, setEvents] = useState<CalendarEvent[]>(firestoreEnabled ? [] : DUMMY_EVENTS)
  const [templates, setTemplates] = useState<TemplateMessage[]>(firestoreEnabled ? [] : DEFAULT_TEMPLATES)

  // --- Firestore real-time listeners ---
  useEffect(() => {
    if (!firestoreEnabled) return
    const unsubs = [
      onMembers(setMembers),
      onClassrooms(setClassrooms),
      onBroadcasts(setBroadcasts),
      onReadStatuses(setReadStatuses),
      onMessages(setMessages),
      onAbsences(setAbsences),
      onEvents(setEvents),
      onTemplates(setTemplates),
    ]
    return () => unsubs.forEach(u => u())
  }, [])

  // --- Members ---
  const addMember = useCallback((member: User) => {
    if (firestoreEnabled) {
      const { uid: _uid, createdAt: _ts, ...data } = member
      fsAddMember(data)
      return
    }
    setMembers(prev => [...prev, member])
  }, [])
  const updateMemberFn = useCallback((uid: string, updates: Partial<User>) => {
    if (firestoreEnabled) {
      fsUpdateMember(uid, updates)
      return
    }
    setMembers(prev => prev.map(m => m.uid === uid ? { ...m, ...updates } : m))
  }, [])
  const deleteMemberCb = useCallback((uid: string) => {
    if (firestoreEnabled) {
      fsDeleteMember(uid)
      return
    }
    setMembers(prev => prev.filter(m => m.uid !== uid))
  }, [])

  // --- Classrooms ---
  const addClassroom = useCallback((classroom: Classroom) => {
    if (firestoreEnabled) {
      const { id: _id, createdAt: _ts, ...data } = classroom
      fsAddClassroom(data)
      return
    }
    setClassrooms(prev => [...prev, classroom])
  }, [])
  const updateClassroomFn = useCallback((id: string, updates: Partial<Classroom>) => {
    if (firestoreEnabled) {
      fsUpdateClassroom(id, updates)
      return
    }
    setClassrooms(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])
  const deleteClassroomCb = useCallback((id: string) => {
    if (firestoreEnabled) {
      fsDeleteClassroom(id)
      return
    }
    setClassrooms(prev => prev.filter(c => c.id !== id))
  }, [])

  // --- Broadcasts ---
  const addBroadcast = useCallback((bc: Broadcast) => {
    if (firestoreEnabled) {
      const { id: _id, createdAt: _ts, ...data } = bc
      fsAddBroadcast(data)
      return
    }
    setBroadcasts(prev => [bc, ...prev])
  }, [])
  const updateBroadcastFn = useCallback((id: string, updates: Partial<Broadcast>) => {
    if (firestoreEnabled) {
      fsUpdateBroadcast(id, updates)
      return
    }
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  // --- Read statuses ---
  const markAsRead = useCallback((broadcastId: string, userId: string, userName: string) => {
    if (firestoreEnabled) {
      markBroadcastAsRead(broadcastId, userId, userName)
      return
    }
    setReadStatuses(prev => {
      if (prev.some(r => r.broadcastId === broadcastId && r.userId === userId)) return prev
      return [...prev, { broadcastId, userId, userName, openedAt: new Date() }]
    })
  }, [])

  // --- Messages ---
  const addMessage = useCallback((msg: Message) => {
    if (firestoreEnabled) {
      const { id: _id, ...data } = msg
      addMessageDoc(data)
      return
    }
    setMessages(prev => [...prev, msg])
  }, [])
  const markMemberMessagesAsRead = useCallback((memberUid: string) => {
    if (firestoreEnabled) {
      // Update each unread message from this member in Firestore
      const unread = messages.filter(
        m => m.senderUid === memberUid && m.senderRole === 'member' && !m.isReadByRecipient
      )
      unread.forEach(m => updateMessageDoc(m.id, { isReadByRecipient: true, readAt: new Date() }))
      return
    }
    setMessages(prev =>
      prev.map(m =>
        m.senderUid === memberUid && m.senderRole === 'member' && !m.isReadByRecipient
          ? { ...m, isReadByRecipient: true, readAt: new Date() }
          : m
      )
    )
  }, [messages])
  const unsendMessage = useCallback((msgId: string) => {
    if (firestoreEnabled) {
      updateMessageDoc(msgId, { isDeleted: true, deletedAt: new Date() })
      return
    }
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, isDeleted: true, deletedAt: new Date() } : m)
    )
  }, [])
  const updateMessageFn = useCallback((msgId: string, updates: Partial<Message>) => {
    if (firestoreEnabled) {
      updateMessageDoc(msgId, updates)
      return
    }
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, ...updates } : m))
  }, [])
  const deleteMessageCb = useCallback((msgId: string) => {
    if (firestoreEnabled) {
      deleteMessageDoc(msgId)
      return
    }
    setMessages(prev => prev.filter(m => m.id !== msgId))
  }, [])
  const getUnreadCountFromMembers = useCallback(() => {
    return messages.filter(m => m.senderRole === 'member' && !m.isReadByRecipient && !m.isDeleted).length
  }, [messages])

  // --- Absences ---
  const addAbsence = useCallback((absence: Absence) => {
    if (firestoreEnabled) {
      const { id: _id, createdAt: _ts, ...data } = absence
      addAbsenceDoc(data)
      return
    }
    setAbsences(prev => [absence, ...prev])
  }, [])

  // --- Calendar Events ---
  const addEvent = useCallback((event: CalendarEvent) => {
    if (firestoreEnabled) {
      const { id: _id, ...data } = event
      addEventDoc(data)
      return
    }
    setEvents(prev => [...prev, event])
  }, [])
  const updateEventFn = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    if (firestoreEnabled) {
      updateEventDoc(id, updates)
      return
    }
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }, [])
  const deleteEventCb = useCallback((id: string) => {
    if (firestoreEnabled) {
      deleteEventDoc(id)
      return
    }
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  // --- Templates ---
  const addTemplate = useCallback((tpl: TemplateMessage) => {
    if (firestoreEnabled) {
      const { id: _id, createdAt: _ts, ...data } = tpl
      addTemplateDoc(data)
      return
    }
    setTemplates(prev => [...prev, tpl])
  }, [])
  const updateTemplateFn = useCallback((id: string, updates: Partial<TemplateMessage>) => {
    if (firestoreEnabled) {
      updateTemplateDoc(id, updates)
      return
    }
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])
  const deleteTemplateCb = useCallback((id: string) => {
    if (firestoreEnabled) {
      deleteTemplateDoc(id)
      return
    }
    setTemplates(prev => prev.filter(t => t.id !== id))
  }, [])
  const reorderTemplates = useCallback((reordered: TemplateMessage[]) => {
    if (firestoreEnabled) {
      // Update order field for each template in Firestore
      reordered.forEach((tpl, idx) => {
        if (tpl.order !== idx) {
          updateTemplateDoc(tpl.id, { order: idx })
        }
      })
      return
    }
    setTemplates(reordered)
  }, [])

  const value = useMemo<DataContextValue>(() => ({
    members,
    addMember,
    updateMember: updateMemberFn,
    deleteMember: deleteMemberCb,
    classrooms,
    addClassroom,
    updateClassroom: updateClassroomFn,
    deleteClassroom: deleteClassroomCb,
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
    deleteMessage: deleteMessageCb,
    getUnreadCountFromMembers,
    absences,
    addAbsence,
    events,
    addEvent,
    updateEvent: updateEventFn,
    deleteEvent: deleteEventCb,
    templates,
    addTemplate,
    updateTemplate: updateTemplateFn,
    deleteTemplate: deleteTemplateCb,
    reorderTemplates,
  }), [
    members, addMember, updateMemberFn, deleteMemberCb,
    classrooms, addClassroom, updateClassroomFn, deleteClassroomCb,
    broadcasts, addBroadcast, updateBroadcastFn,
    readStatuses, markAsRead,
    messages, addMessage, markMemberMessagesAsRead, unsendMessage, updateMessageFn, deleteMessageCb, getUnreadCountFromMembers,
    absences, addAbsence,
    events, addEvent, updateEventFn, deleteEventCb,
    templates, addTemplate, updateTemplateFn, deleteTemplateCb, reorderTemplates,
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
