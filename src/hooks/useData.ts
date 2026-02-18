/**
 * Domain-specific data hooks — thin wrappers around DataContext.
 * Import these instead of using DUMMY_* constants directly.
 */
import { useMemo } from 'react'
import { useData } from '../contexts/DataContext'
import type { Broadcast, User, Classroom } from '../types'

// ---- Re-export base hook ----
export { useData } from '../contexts/DataContext'

// ---- Members ----

export function useMembers() {
  const { members, addMember, updateMember, deleteMember } = useData()
  return { members, addMember, updateMember, deleteMember }
}

// ---- Classrooms ----

export function useClassrooms() {
  const { classrooms, addClassroom, updateClassroom, deleteClassroom } = useData()
  return { classrooms, addClassroom, updateClassroom, deleteClassroom }
}

// ---- Broadcasts ----

export function useBroadcasts() {
  const { broadcasts, addBroadcast, updateBroadcast, readStatuses, markAsRead } = useData()
  return { broadcasts, addBroadcast, updateBroadcast, readStatuses, markAsRead }
}

// ---- Messages ----

export function useMessages() {
  const {
    messages,
    addMessage,
    markMemberMessagesAsRead,
    unsendMessage,
    updateMessage,
    deleteMessage,
    getUnreadCountFromMembers,
  } = useData()
  return {
    messages,
    addMessage,
    markMemberMessagesAsRead,
    unsendMessage,
    updateMessage,
    deleteMessage,
    getUnreadCountFromMembers,
  }
}

// ---- Absences ----

export function useAbsences() {
  const { absences, addAbsence } = useData()
  return { absences, addAbsence }
}

// ---- Calendar Events ----

export function useCalendarEvents() {
  const { events, addEvent, updateEvent, deleteEvent } = useData()
  return { events, addEvent, updateEvent, deleteEvent }
}

// ---- Templates ----

export function useTemplates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, reorderTemplates } = useData()
  return { templates, addTemplate, updateTemplate, deleteTemplate, reorderTemplates }
}

// ---- Helper hooks (replace functions from dummyData.ts) ----

export function useClassLabel() {
  const { classrooms } = useData()
  return (classId: string): string => {
    return classrooms.find(c => c.id === classId)?.name ?? classId
  }
}

export function useClassOptions() {
  const { classrooms } = useData()
  return useMemo(() => classrooms.map(c => ({ value: c.id, label: c.name })), [classrooms])
}

export function useTargetMembers() {
  const { members } = useData()
  return (bc: Broadcast): User[] => {
    if (bc.targetType === 'all') return members.filter(m => m.role === 'member')
    if (bc.targetType === 'class') {
      return members.filter(m => m.role === 'member' && m.classIds.some(id => bc.targetClassIds.includes(id)))
    }
    return members.filter(m => bc.targetUserIds?.includes(m.uid))
  }
}

export function useTargetMemberCount() {
  const { members } = useData()
  return (bc: Broadcast): number => {
    if (bc.targetType === 'all') return members.length
    if (bc.targetType === 'class') {
      return members.filter(m => m.classIds.some(id => bc.targetClassIds.includes(id))).length
    }
    return bc.targetUserIds?.length ?? 0
  }
}

export function useMemberClassrooms() {
  const { members, classrooms } = useData()
  return (userId: string): Classroom[] => {
    const member = members.find(m => m.uid === userId)
    if (!member) return []
    return classrooms.filter(c => member.classIds.includes(c.id))
  }
}

export function useClassroomMembers() {
  const { members } = useData()
  return (classroomId: string): User[] => {
    return members.filter(m => m.classIds.includes(classroomId))
  }
}

export function useSiblings() {
  const { members } = useData()
  return (userId: string): User[] => {
    const member = members.find(m => m.uid === userId)
    if (!member?.parentId) return []
    return members.filter(m => m.parentId === member.parentId && m.uid !== userId)
  }
}

export function useTargetLabel() {
  const { classrooms } = useData()
  const getLabel = (classId: string) => classrooms.find(c => c.id === classId)?.name ?? classId
  return (bc: Broadcast): string => {
    if (bc.targetType === 'all') return '全体'
    if (bc.targetType === 'class') return bc.targetClassIds.map(getLabel).join(', ')
    return '個別指定'
  }
}

export function useTargetLabelForMember() {
  const { classrooms } = useData()
  const getLabel = (classId: string) => classrooms.find(c => c.id === classId)?.name ?? classId
  return (bc: Broadcast, userClassIds: string[]): string[] => {
    if (bc.targetType === 'all') return ['全体']
    if (bc.targetType === 'class') {
      const labels = bc.targetClassIds.map(id => ({ id, label: getLabel(id) }))
      const mine = labels.filter(l => userClassIds.includes(l.id))
      const others = labels.filter(l => !userClassIds.includes(l.id))
      return [...mine.map(l => l.label), ...others.map(l => l.label)]
    }
    return ['個別']
  }
}
