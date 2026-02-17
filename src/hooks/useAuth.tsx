import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import { DUMMY_MEMBERS } from '../lib/dummyData'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  switchRole: (role: 'admin' | 'member') => void
  updateUser: (updates: Partial<User>) => void
  switchChild: (uid: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  switchRole: () => {},
  updateUser: () => {},
  switchChild: () => {},
  logout: () => {},
})

const ADMIN_USER: User = {
  uid: 'admin-001',
  name: '田中コーチ',
  nameKana: 'タナカ コーチ',
  role: 'admin',
  classId: 'class-a',
  classIds: ['class-a'],
  email: 'tanaka@example.com',
  createdAt: new Date(),
}

function getDefaultMember(): User {
  const member = DUMMY_MEMBERS.find(m => m.uid === 'member-001')
  if (member) return { ...member }
  return { uid: 'member-001', name: '山田 太郎', nameKana: 'ヤマダ タロウ', role: 'member', classId: 'class-a', classIds: ['class-a'], email: 'yamada@example.com', createdAt: new Date() }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(getDefaultMember)

  const switchRole = useCallback((newRole: 'admin' | 'member') => {
    setUser(newRole === 'admin' ? { ...ADMIN_USER } : getDefaultMember())
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  const switchChild = useCallback((uid: string) => {
    const sibling = DUMMY_MEMBERS.find(m => m.uid === uid)
    if (sibling) setUser({ ...sibling })
  }, [])

  const logout = useCallback(() => {
    setUser(getDefaultMember())
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user.role === 'admin',
        switchRole,
        updateUser,
        switchChild,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
