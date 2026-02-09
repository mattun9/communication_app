import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TalkPage } from './pages/TalkPage'
import { CalendarPage } from './pages/CalendarPage'
import { RequestPage } from './pages/RequestPage'
import { MyPage } from './pages/MyPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/talk" element={<TalkPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<Navigate to="/talk" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
