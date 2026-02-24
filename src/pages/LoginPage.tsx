import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Logo } from '../components/Logo'
import { firestoreEnabled } from '../lib/firestoreService'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    setLoading(true)
    const result = await login(email.trim(), password)
    if (!result.success) {
      setError(result.error ?? 'ログインに失敗しました')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <Logo size={200} className="drop-shadow-lg" />
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="example@email.com"
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">
              パスワード
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="パスワードを入力"
                autoComplete="current-password"
                className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 pr-12 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-md transition-all disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn size={18} />
                ログイン
              </>
            )}
          </button>
        </form>

        {/* Demo accounts hint — デモモード時のみ表示 */}
        {!firestoreEnabled && (
          <div className="mt-6 rounded-xl border border-border bg-bg-card p-4">
            <p className="mb-2 text-xs font-bold text-text-secondary">デモアカウント</p>
            <div className="space-y-1.5 text-[11px] text-text-secondary">
              <div className="flex items-center justify-between">
                <span>管理者</span>
                <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-text">tanaka@example.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span>保護者（父）</span>
                <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-text">yamada.ichiro@example.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span>保護者（母）</span>
                <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-text">yamada.mika@example.com</code>
              </div>
              <p className="mt-1.5 text-[10px] text-text-secondary/70">パスワード: なんでもOK</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
