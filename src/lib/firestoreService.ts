/**
 * Firestore service layer — typed CRUD operations for all collections.
 * When Firebase credentials are configured, these functions interact with Firestore.
 * Otherwise the app runs in demo mode using local state.
 */
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
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

// ---- helpers ----

function isFirebaseConfigured(): boolean {
  try {
    return !!import.meta.env.VITE_FIREBASE_PROJECT_ID
  } catch {
    return false
  }
}

export const firestoreEnabled = isFirebaseConfigured()

// ---- generic helpers ----

function col(name: string) {
  return collection(db, name)
}

// ---- Members ----

export async function fetchMembers(): Promise<User[]> {
  const snap = await getDocs(query(col('users'), where('role', '==', 'member'), orderBy('createdAt')))
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as unknown as User))
}

export function onMembers(cb: (members: User[]) => void): Unsubscribe {
  return onSnapshot(
    query(col('users'), where('role', '==', 'member'), orderBy('createdAt')),
    snap => cb(snap.docs.map(d => ({ uid: d.id, ...d.data() } as unknown as User)))
  )
}

export async function addMember(data: Omit<User, 'uid' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col('users'), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateMember(uid: string, updates: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), updates as DocumentData)
}

export async function deleteMember(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid))
}

// ---- Classrooms ----

export async function fetchClassrooms(): Promise<Classroom[]> {
  const snap = await getDocs(query(col('classrooms'), orderBy('createdAt')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Classroom))
}

export function onClassrooms(cb: (classrooms: Classroom[]) => void): Unsubscribe {
  return onSnapshot(
    query(col('classrooms'), orderBy('createdAt')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Classroom)))
  )
}

export async function addClassroom(data: Omit<Classroom, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col('classrooms'), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateClassroom(id: string, updates: Partial<Classroom>): Promise<void> {
  await updateDoc(doc(db, 'classrooms', id), updates as DocumentData)
}

export async function deleteClassroom(id: string): Promise<void> {
  await deleteDoc(doc(db, 'classrooms', id))
}

// ---- Broadcasts ----

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  const snap = await getDocs(query(col('broadcasts'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Broadcast))
}

export function onBroadcasts(cb: (broadcasts: Broadcast[]) => void): Unsubscribe {
  return onSnapshot(
    query(col('broadcasts'), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Broadcast)))
  )
}

export async function addBroadcast(data: Omit<Broadcast, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col('broadcasts'), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateBroadcast(id: string, updates: Partial<Broadcast>): Promise<void> {
  await updateDoc(doc(db, 'broadcasts', id), updates as DocumentData)
}

// ---- Read Statuses ----

export async function fetchReadStatuses(): Promise<ReadStatus[]> {
  const snap = await getDocs(col('readStatuses'))
  return snap.docs.map(d => d.data() as ReadStatus)
}

export function onReadStatuses(cb: (rs: ReadStatus[]) => void): Unsubscribe {
  return onSnapshot(col('readStatuses'), snap => cb(snap.docs.map(d => d.data() as ReadStatus)))
}

export async function markBroadcastAsRead(broadcastId: string, userId: string, userName: string): Promise<void> {
  const id = `${broadcastId}_${userId}`
  await setDoc(doc(db, 'readStatuses', id), { broadcastId, userId, userName, openedAt: serverTimestamp() })
}

// ---- Messages ----

export function onMessages(cb: (messages: Message[]) => void, ...constraints: QueryConstraint[]): Unsubscribe {
  return onSnapshot(
    query(col('messages'), orderBy('createdAt'), ...constraints),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Message)))
  )
}

export async function addMessageDoc(data: Omit<Message, 'id'>): Promise<string> {
  const ref = await addDoc(col('messages'), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateMessageDoc(id: string, updates: Partial<Message>): Promise<void> {
  await updateDoc(doc(db, 'messages', id), updates as DocumentData)
}

export async function deleteMessageDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, 'messages', id))
}

// ---- Absences ----

export async function fetchAbsences(): Promise<Absence[]> {
  const snap = await getDocs(query(col('absences'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Absence))
}

export function onAbsences(cb: (absences: Absence[]) => void): Unsubscribe {
  return onSnapshot(
    query(col('absences'), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Absence)))
  )
}

export async function addAbsenceDoc(data: Omit<Absence, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col('absences'), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

// ---- Calendar Events ----

export async function fetchEvents(): Promise<CalendarEvent[]> {
  const snap = await getDocs(query(col('events'), orderBy('date')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as CalendarEvent))
}

export function onEvents(cb: (events: CalendarEvent[]) => void): Unsubscribe {
  return onSnapshot(
    query(col('events'), orderBy('date')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as CalendarEvent)))
  )
}

export async function addEventDoc(data: Omit<CalendarEvent, 'id'>): Promise<string> {
  const ref = await addDoc(col('events'), data as DocumentData)
  return ref.id
}

export async function updateEventDoc(id: string, updates: Partial<CalendarEvent>): Promise<void> {
  await updateDoc(doc(db, 'events', id), updates as DocumentData)
}

export async function deleteEventDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id))
}

// ---- Templates ----

export async function fetchTemplates(): Promise<TemplateMessage[]> {
  const snap = await getDocs(query(col('templates'), orderBy('order')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as TemplateMessage))
}

export function onTemplates(cb: (templates: TemplateMessage[]) => void): Unsubscribe {
  return onSnapshot(
    query(col('templates'), orderBy('order')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as TemplateMessage)))
  )
}

export async function addTemplateDoc(data: Omit<TemplateMessage, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(col('templates'), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateTemplateDoc(id: string, updates: Partial<TemplateMessage>): Promise<void> {
  await updateDoc(doc(db, 'templates', id), updates as DocumentData)
}

export async function deleteTemplateDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, 'templates', id))
}
