import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function getCookie(name: string): Promise<string | undefined> {
  const c = await cookies().then((cookieStore) => cookieStore.get(name))
  return c?.value
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Missing Spotify credentials')

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Refresh failed: ${txt}`)
  }
  return res.json() as Promise<{ access_token: string; expires_in: number }>
}

export async function POST(request: Request) {
  try {
    const { trackId, trackUri, device_id } = (await request.json()) as {
      trackId?: string
      trackUri?: string
      device_id?: string
    }
    if (!trackId && !trackUri) {
      return NextResponse.json({ error: 'trackId or trackUri is required' }, { status: 400 })
    }

    // Read tokens from cookies (set by your auth flow)
    let accessToken = await getCookie('spotify_access_token')
    const refreshToken = await getCookie('spotify_refresh_token')
    const expiresAt = await getCookie('spotify_expires_at')

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated with Spotify' }, { status: 401 })
    }

    // Refresh if needed
    const now = Date.now()
    const exp = expiresAt ? parseInt(expiresAt, 10) : 0
    if (refreshToken && exp && now >= exp - 60_000) {
      try {
        const refreshed = await refreshAccessToken(refreshToken)
        accessToken = refreshed.access_token
        // Update cookies
        const newExpiresAt = String(now + refreshed.expires_in * 1000)
        const cookieStore = await cookies()
        cookieStore.set('spotify_access_token', accessToken, { httpOnly: true, sameSite: 'lax', path: '/' })
        cookieStore.set('spotify_expires_at', newExpiresAt, { httpOnly: true, sameSite: 'lax', path: '/' })
      } catch (err) {
        console.error('Failed to refresh token:', err)
      }
    }

    const uri = trackUri ?? `spotify:track:${trackId}`

    // Make the play call. Requires an active device on the user account.
    const url = new URL('https://api.spotify.com/v1/me/player/play')
    if (device_id) url.searchParams.set('device_id', device_id)

    const playRes = await fetch(url.toString(), {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [uri] }),
    })

    if (!playRes.ok) {
      const txt = await playRes.text()
      return NextResponse.json({ error: 'Spotify play failed', details: txt }, { status: playRes.status })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Player play route error:', err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
