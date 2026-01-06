

import crypto from 'node:crypto';

function buildBaseUrl(req: any) {
  const forwardedProto = (req.headers?.['x-forwarded-proto'] as string | undefined) ?? 'https';
  const host = (req.headers?.['x-forwarded-host'] as string | undefined) ?? req.headers?.host;
  return `${forwardedProto}://${host}`;
}

function setCookie(res: any, name: string, value: string, options: {
  maxAgeSeconds?: number;
  httpOnly?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
  path?: string;
} = {}) {
  const parts: string[] = [];
  parts.push(`${name}=${encodeURIComponent(value)}`);
  parts.push(`Path=${options.path ?? '/'}`);
  if (options.maxAgeSeconds != null) parts.push(`Max-Age=${options.maxAgeSeconds}`);
  if (options.httpOnly !== false) parts.push('HttpOnly');
  parts.push(`SameSite=${options.sameSite ?? 'Lax'}`);
  if (options.secure !== false) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export default async function handler(req: any, res: any) {
  if (req.method && req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end('Method not allowed');
    return;
  }

  const clientId = (process.env.SPOTIFY_CLIENT_ID ?? '').trim();
  if (!clientId) {
    res.statusCode = 500;
    res.end('Missing SPOTIFY_CLIENT_ID');
    return;
  }

  const baseUrl = buildBaseUrl(req);
  const redirectUri = (process.env.SPOTIFY_REDIRECT_URI ?? `${baseUrl}/api/spotify/callback`).trim();

  const scopes = ['user-read-currently-playing', 'user-read-playback-state'].join(' ');
  const state = crypto.randomBytes(16).toString('hex');

  setCookie(res, 'spotify_oauth_state', state, { maxAgeSeconds: 10 * 60 });

  const authorizeUrl = new URL('https://accounts.spotify.com/authorize');
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('scope', scopes);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('show_dialog', 'true');

  res.statusCode = 302;
  res.setHeader('Location', authorizeUrl.toString());
  res.end();
}
