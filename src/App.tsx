import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DataProvider } from './contexts/DataContext'
import { LiffProvider, useLiff } from './contexts/LiffContext'
import { LoginPage } from './pages/LoginPage'
import { LineCallbackPage } from './pages/LineCallbackPage'

// Layouts
import { MemberLayout } from './components/MemberLayout'
import { AdminLayout } from './components/AdminLayout'

// Member pages
import { MemberTalkPage } from './pages/member/TalkPage'
import { MemberNewsPage } from './pages/member/NewsPage'
import { MemberCalendarPage } from './pages/member/CalendarPage'
import { MemberMyPage } from './pages/member/MyPage'

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminInbox } from './pages/admin/Inbox'
import { AdminBroadcastManager } from './pages/admin/BroadcastManager'
import { AdminSchedule } from './pages/admin/Schedule'
import { AdminMemberManagement } from './pages/admin/MemberManagement'
import { AdminClassroomManagement } from './pages/admin/ClassroomManagement'

function LiffLoadingScreen() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-bg">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-text-secondary">読み込み中...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loginWithLiff } = useAuth()
  const { isLiffReady, isInLiff } = useLiff()
  const [liffLoginAttempted, setLiffLoginAttempted] = useState(false)

  useEffect(() => {
    if (isInLiff && isLiffReady && !isAuthenticated && !liffLoginAttempted) {
      setLiffLoginAttempted(true)
      loginWithLiff()
    }
  }, [isInLiff, isLiffReady, isAuthenticated, liffLoginAttempted, loginWithLiff])

  // LIFF initializing
  if (isInLiff && !isLiffReady) return <LiffLoadingScreen />

  // LIFF auto-login in progress
  if (isInLiff && !isAuthenticated && !liffLoginAttempted) return <LiffLoadingScreen />

  // Not authenticated in browser mode
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}

function LoginRoute() {
  const { isAuthenticated, isAdmin } = useAuth()
  const { isInLiff } = useLiff()

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/member/talk'} replace />
  }

  // LIFF users skip login page — ProtectedRoute handles auto-auth
  if (isInLiff) {
    return <Navigate to="/member/talk" replace />
  }

  return <LoginPage />
}

function AppRoutes() {
  return (
    <Routes>
      {/* ログイン画面 */}
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/login/line-callback" element={<LineCallbackPage />} />

      {/* 会員画面（モバイル） */}
      <Route
        path="/member"
        element={
          <ProtectedRoute>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route path="talk" element={<MemberTalkPage />} />
        <Route path="news" element={<MemberNewsPage />} />
        <Route path="calendar" element={<MemberCalendarPage />} />
        <Route path="mypage" element={<MemberMyPage />} />
        <Route index element={<Navigate to="talk" replace />} />
      </Route>

      {/* 管理者画面（PC） */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="inbox" element={<AdminInbox />} />
        <Route path="broadcasts" element={<AdminBroadcastManager />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="members" element={<AdminMemberManagement />} />
        <Route path="classrooms" element={<AdminClassroomManagement />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* デフォルト: ログイン画面 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <LiffProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </LiffProvider>
  )
}
