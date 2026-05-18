import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { getLiffAccessToken } from '../lib/liff'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithLiff: () => Promise<{ success: boolean; status?: 'linked' | 'not_linked'; lineUserId?: string; lineDisplayName?: string }>
  switchRole: (role: 'admin' | 'member') => void
  updateUser: (updates: Partial<User>) => void
  switchChild: (uid: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  login: async () => false,
  loginWithLiff: async () => ({ success: false }),
  switchRole: () => {},
  updateUser: () => {},
  switchChild: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) return false

      // スタッフか会員かを判定
      const { data: staffRow } = await supabase
        .from('staff')
        .select('id, name, name_kana')
        .eq('email', email)
        .maybeSingle()

      if (staffRow) {
        setUser({
          uid: data.user.id,
          name: staffRow.name ?? email,
          nameKana: staffRow.name_kana ?? '',
          role: 'admin',
          classId: '',
          classIds: [],
          email,
          createdAt: new Date(),
        })
        return true
      }

      const { data: memberRow } = await supabase
        .from('members')
        .select('id, name, name_kana, classes, phone, member_number, line_user_id, created_at')
        .eq('email', email)
        .eq('status', '在籍')
        .maybeSingle()

      if (memberRow) {
        const classes = (memberRow.classes as string[]) ?? []
        setUser({
          uid: memberRow.id as string,
          name: (memberRow.name as string) ?? '',
          nameKana: (memberRow.name_kana as string) ?? '',
          role: 'member',
          classId: classes[0] ?? '',
          classIds: classes,
          email,
          phone: memberRow.phone as string | undefined,
          memberNumber: memberRow.member_number as string | undefined,
          lineUserId: memberRow.line_user_id as string | undefined,
          createdAt: memberRow.created_at ? new Date(memberRow.created_at as string) : new Date(),
        })
        return true
      }

      return false
    } catch {
      return false
    }
  }, [])

  const loginWithLiff = useCallback(async (): Promise<{ success: boolean; status?: 'linked' | 'not_linked'; lineUserId?: string; lineDisplayName?: string }> => {
    const accessToken = getLiffAccessToken()
    if (!accessToken) return { success: false }

    const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined
    if (!functionsUrl) return { success: false }

    try {
      const res = await fetch(`${functionsUrl}/liff-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liffAccessToken: accessToken }),
      })
      if (!res.ok) return { success: false }

      const data = await res.json() as { status: string; accessToken?: string; lineUserId?: string; lineDisplayName?: string; memberData?: Record<string, unknown> }

      if (data.status === 'linked' && data.accessToken) {
        const { error } = await supabase.auth.setSession({ access_token: data.accessToken, refresh_token: '' })
        if (error) return { success: false }

        if (data.memberData) {
          const md = data.memberData
          const classes = (md.classes as string[]) ?? []
          setUser({
            uid: md.id as string,
            name: (md.name as string) ?? '',
            nameKana: (md.name_kana as string) ?? '',
            role: 'member',
            classId: classes[0] ?? '',
            classIds: classes,
            email: (md.email as string) ?? '',
            lineUserId: data.lineUserId,
            lineDisplayName: data.lineDisplayName,
            createdAt: new Date(),
          })
        }
        return { success: true, status: 'linked', lineUserId: data.lineUserId, lineDisplayName: data.lineDisplayName }
      }

      return { success: false, status: 'not_linked', lineUserId: data.lineUserId, lineDisplayName: data.lineDisplayName }
    } catch {
      return { success: false }
    }
  }, [])

  const switchRole = useCallback((newRole: 'admin' | 'member') => {
    if (!user) return
    setUser(prev => prev ? { ...prev, role: newRole } : prev)
  }, [user])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev)
  }, [])

  const switchChild = useCallback((_uid: string) => {}, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin: user?.role === 'admin',
      isAuthenticated: user !== null,
      login,
      loginWithLiff,
      switchRole,
      updateUser,
      switchChild,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
