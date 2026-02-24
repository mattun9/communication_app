import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Logo } from '../components/Logo'

export function RegisterPage() {
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [nameKana, setNameKana] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !nameKana.trim() || !email.trim() || !password.trim()) {
      setError('すべての項目を入力してください')
      return
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    setLoading(true)
    const result = await signup(email.trim(), password, name.trim(), nameKana.trim())
    if (!result.success) {
      setError(result.error ?? '登録に失敗しました')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size={160} className="drop-shadow-lg" />
        </div>

        <h1 className="mb-6 text-center text-lg font-bold text-text">新規登録</h1>

        {/* Register form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">
              お名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="山田 太郎"
              autoComplete="name"
              className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">
              お名前（カナ）
            </label>
            <input
              type="text"
              value={nameKana}
              onChange={(e) => { setNameKana(e.target.value); setError('') }}
              placeholder="ヤマダ タロウ"
              className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
            />
          </div>

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
                placeholder="6文字以上"
                autoComplete="new-password"
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

          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-secondary">
              パスワード（確認）
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
              placeholder="もう一度入力"
              autoComplete="new-password"
              className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
            />
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
                <UserPlus size={18} />
                登録する
              </>
            )}
          </button>
        </form>

        {/* Link to login */}
        <p className="mt-6 text-center text-xs text-text-secondary">
          既にアカウントをお持ちの方は{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
