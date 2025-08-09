import { NextResponse } from 'next/server';

// Simple in-memory token cache to avoid frequent token exchanges
let cachedToken: { access_token: string; expires_at: number } | null = null;

export async function GET() {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing Spotify credentials. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local' },
        { status: 500 }
      );
    }

    const now = Date.now();
    if (cachedToken && now < cachedToken.expires_at - 60_000) {
      return NextResponse.json({ access_token: cachedToken.access_token, cached: true });
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: 'Spotify token fetch failed', details: text },
        { status: res.status }
      );
    }

    const data = (await res.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
      scope?: string;
    };

    cachedToken = {
      access_token: data.access_token,
      expires_at: now + data.expires_in * 1000,
    };

    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Unexpected server error', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
