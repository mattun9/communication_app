import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DataProvider } from './contexts/DataContext'
import { LoginPage } from './pages/LoginPage'

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function LoginRoute() {
  const { isAuthenticated, isAdmin } = useAuth()
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/member/talk'} replace />
  }
  return <LoginPage />
}

function AppRoutes() {
  return (
    <Routes>
      {/* ログイン画面 */}
      <Route path="/login" element={<LoginRoute />} />

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
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
