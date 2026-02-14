import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  switchRole: (role: 'admin' | 'member') => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  switchRole: () => {},
})

// MVP: ダミーユーザーでロール切り替え可能（Firebase接続後に置き換え）
const createDummyUser = (role: 'admin' | 'member'): User => ({
  uid: role === 'admin' ? 'admin-001' : 'member-001',
  name: role === 'admin' ? '田中コーチ' : '山田 太郎',
  nameKana: role === 'admin' ? 'タナカ コーチ' : 'ヤマダ タロウ',
  role,
  classId: 'class-a',
  classIds: ['class-a'],
  email: role === 'admin' ? 'tanaka@example.com' : 'yamada@example.com',
  createdAt: new Date(),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const user = createDummyUser(role)

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: role === 'admin',
        switchRole: setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
