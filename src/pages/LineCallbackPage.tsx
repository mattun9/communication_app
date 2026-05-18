import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { validateOAuthState, getOAuthMode, exchangeLineCode } from '../lib/lineAuth'
import { LineIcon } from '../components/LineIcon'
import { AlertCircle } from 'lucide-react'

export function LineCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithLiff, updateUser } = useAuth()
  const [status, setStatus] = useState<'processing' | 'error' | 'not_linked'>('processing')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setErrorMessage('LINEログインがキャンセルされました')
      return
    }

    if (!code || !state) {
      setStatus('error')
      setErrorMessage('不正なリクエストです')
      return
    }

    if (!validateOAuthState(state)) {
      setStatus('error')
      setErrorMessage('セッションが無効です。もう一度お試しください')
      return
    }

    const mode = getOAuthMode()
    handleCallback(code, mode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCallback(code: string, mode: 'login' | 'link') {
    try {
      const functionsBaseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string
      if (!functionsBaseUrl) {
        setStatus('error')
        setErrorMessage('サーバー設定が不足しています')
        return
      }

      const result = await exchangeLineCode(code, functionsBaseUrl)

      if (mode === 'link') {
        updateUser({
          lineUserId: result.lineUserId,
          lineDisplayName: result.lineDisplayName,
          lineNotificationEnabled: true,
          lineLinkedAt: new Date(),
        })
        navigate('/member/mypage', { replace: true })
        return
      }

      // Login mode: LIFFトークンを使ってSupabaseセッションを取得
      const loginResult = await loginWithLiff()
      if (loginResult.success) {
        navigate('/member/talk', { replace: true })
      } else if (loginResult.status === 'not_linked') {
        setStatus('not_linked')
      } else {
        setStatus('error')
        setErrorMessage('ログインに失敗しました')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        {status === 'processing' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#06C755]/10">
              <LineIcon size={40} className="text-[#06C755]" />
            </div>
            <p className="text-base font-bold text-text">LINE認証中...</p>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
              <AlertCircle size={40} className="text-danger" />
            </div>
            <p className="text-base font-bold text-text">認証エラー</p>
            <p className="text-center text-sm text-text-secondary">{errorMessage}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-base font-bold text-white"
            >
              ログイン画面に戻る
            </button>
          </div>
        )}

        {status === 'not_linked' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#06C755]/10">
              <LineIcon size={40} className="text-[#06C755]" />
            </div>
            <p className="text-base font-bold text-text">LINE連携が必要です</p>
            <p className="text-center text-sm leading-relaxed text-text-secondary">
              このLINEアカウントはまだ連携されていません。<br />
              メールアドレスでログインした後、<br />
              マイページからLINE連携を行ってください。
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-base font-bold text-white"
            >
              ログイン画面に戻る
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
