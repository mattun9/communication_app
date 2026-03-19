import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { isLiffEnabled, initLiff, isInLiffClient, isLiffLoggedIn } from '../lib/liff'

interface LiffContextType {
  /** Whether LIFF initialization has completed (or was skipped) */
  isLiffReady: boolean
  /** Whether the app is running inside the LINE app */
  isInLiff: boolean
  /** Whether the LIFF user is authenticated */
  isLiffLoggedIn: boolean
  /** Initialization error, if any */
  liffError: string | null
}

const LiffContext = createContext<LiffContextType>({
  isLiffReady: false,
  isInLiff: false,
  isLiffLoggedIn: false,
  liffError: null,
})

export function LiffProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(!isLiffEnabled)
  const [isInLiffState, setIsInLiffState] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [liffError, setLiffError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLiffEnabled) return

    initLiff()
      .then(() => {
        setIsInLiffState(isInLiffClient())
        setIsLoggedIn(isLiffLoggedIn())
        setIsReady(true)
      })
      .catch((err) => {
        console.error('LIFF init failed:', err)
        setLiffError(err instanceof Error ? err.message : 'LIFF初期化に失敗しました')
        // Fall back to browser mode
        setIsInLiffState(false)
        setIsLoggedIn(false)
        setIsReady(true)
      })
  }, [])

  return (
    <LiffContext.Provider
      value={{
        isLiffReady: isReady,
        isInLiff: isInLiffState,
        isLiffLoggedIn: isLoggedIn,
        liffError,
      }}
    >
      {children}
    </LiffContext.Provider>
  )
}

export function useLiff() {
  return useContext(LiffContext)
}
