/**
 * LIFF (LINE Front-end Framework) SDK wrapper.
 * Only active when VITE_LIFF_ID is configured.
 */
import liff from '@line/liff'

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string | undefined

export const isLiffEnabled = !!LIFF_ID

export async function initLiff(): Promise<void> {
  if (!LIFF_ID) return
  await liff.init({ liffId: LIFF_ID })
}

/** Returns true when running inside the LINE app (not external browser) */
export function isInLiffClient(): boolean {
  if (!isLiffEnabled) return false
  return liff.isInClient()
}

/** Returns true when the LIFF user is logged in */
export function isLiffLoggedIn(): boolean {
  if (!isLiffEnabled) return false
  return liff.isLoggedIn()
}

/** Get the LIFF access token for server-side verification */
export function getLiffAccessToken(): string | null {
  if (!isLiffEnabled) return null
  return liff.getAccessToken()
}

/** Get the LINE user profile via LIFF */
export async function getLiffProfile(): Promise<{
  userId: string
  displayName: string
  pictureUrl?: string
}> {
  const profile = await liff.getProfile()
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl,
  }
}
