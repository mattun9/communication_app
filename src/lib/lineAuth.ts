/**
 * LINE Login utilities for the frontend.
 * Only active when VITE_LINE_LOGIN_CHANNEL_ID is configured.
 */

const LINE_LOGIN_CHANNEL_ID = import.meta.env.VITE_LINE_LOGIN_CHANNEL_ID as string | undefined

export const isLineLoginEnabled = !!LINE_LOGIN_CHANNEL_ID

/** Generate a random state token for CSRF protection */
function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

/** Get the LINE OAuth callback URL */
function getCallbackUrl(): string {
  return `${window.location.origin}/login/line-callback`
}

/**
 * Redirect the user to LINE Login authorization page.
 * @param mode 'login' for login flow, 'link' for account linking flow
 */
export function redirectToLineLogin(mode: 'login' | 'link' = 'login'): void {
  if (!LINE_LOGIN_CHANNEL_ID) return

  const state = generateState()
  sessionStorage.setItem('line_oauth_state', state)
  sessionStorage.setItem('line_oauth_mode', mode)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINE_LOGIN_CHANNEL_ID,
    redirect_uri: getCallbackUrl(),
    state,
    scope: 'profile openid',
  })

  window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`
}

/**
 * Validate the OAuth callback state parameter.
 */
export function validateOAuthState(state: string): boolean {
  const stored = sessionStorage.getItem('line_oauth_state')
  sessionStorage.removeItem('line_oauth_state')
  return !!stored && stored === state
}

/**
 * Get the stored OAuth mode (login or link).
 */
export function getOAuthMode(): 'login' | 'link' {
  const mode = sessionStorage.getItem('line_oauth_mode') || 'login'
  sessionStorage.removeItem('line_oauth_mode')
  return mode as 'login' | 'link'
}

/**
 * Exchange the authorization code for LINE user info via Cloud Function.
 */
export async function exchangeLineCode(
  code: string,
  functionsBaseUrl: string
): Promise<{
  status: 'linked' | 'not_linked'
  customToken?: string
  lineUserId: string
  lineDisplayName: string
}> {
  const res = await fetch(`${functionsBaseUrl}/lineLoginCallback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      redirectUri: getCallbackUrl(),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'LINE認証に失敗しました')
  }

  return res.json()
}
