import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Message } from '../types'
import { DUMMY_MESSAGES } from '../lib/dummyData'

interface MessageContextValue {
  messages: Message[]
  markMemberMessagesAsRead: (memberUid: string) => void
  addMessage: (msg: Message) => void
  unsendMessage: (msgId: string) => void
  updateMessage: (msgId: string, updates: Partial<Message>) => void
  deleteMessage: (msgId: string) => void
  getUnreadCountFromMembers: () => number
}

const MessageContext = createContext<MessageContextValue | null>(null)

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES)

  const markMemberMessagesAsRead = useCallback((memberUid: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.senderUid === memberUid && m.senderRole === 'member' && !m.isReadByRecipient
          ? { ...m, isReadByRecipient: true, readAt: new Date() }
          : m
      )
    )
  }, [])

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const unsendMessage = useCallback((msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, isDeleted: true, deletedAt: new Date() } : m
      )
    )
  }, [])

  const updateMessage = useCallback((msgId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, ...updates } : m))
    )
  }, [])

  const deleteMessage = useCallback((msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId))
  }, [])

  const getUnreadCountFromMembers = useCallback(() => {
    return messages.filter(
      (m) => m.senderRole === 'member' && !m.isReadByRecipient && !m.isDeleted
    ).length
  }, [messages])

  const value = useMemo<MessageContextValue>(
    () => ({
      messages,
      markMemberMessagesAsRead,
      addMessage,
      unsendMessage,
      updateMessage,
      deleteMessage,
      getUnreadCountFromMembers,
    }),
    [messages, markMemberMessagesAsRead, addMessage, unsendMessage, updateMessage, deleteMessage, getUnreadCountFromMembers]
  )

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessages(): MessageContextValue {
  const ctx = useContext(MessageContext)
  if (!ctx) throw new Error('useMessages must be used within MessageProvider')
  return ctx
}
