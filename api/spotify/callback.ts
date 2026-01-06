

function parseCookies(cookieHeader: string | undefined) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rest] = part.trim().split('=');
    if (!rawName) continue;
    cookies[rawName] = decodeURIComponent(rest.join('=') ?? '');
  }
  return cookies;
}

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

function html(res: any, status: number, body: string) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

function base64BasicAuth(id: string, secret: string) {
  return Buffer.from(`${id}:${secret}`).toString('base64');
}

async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64BasicAuth(params.clientId, params.clientSecret)}`,
    },
    body,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    throw new Error(`Token exchange failed (${res.status}): ${JSON.stringify(json)}`);
  }

  return json as { refresh_token?: string };
}

export default async function handler(req: any, res: any) {
  if (req.method && req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end('Method not allowed');
    return;
  }

  const clientId = (process.env.SPOTIFY_CLIENT_ID ?? '').trim();
  const clientSecret = (process.env.SPOTIFY_CLIENT_SECRET ?? '').trim();

  if (!clientId || !clientSecret) {
    return html(
      res,
      500,
      '<h2>Missing server env vars</h2><p>Set <code>SPOTIFY_CLIENT_ID</code> and <code>SPOTIFY_CLIENT_SECRET</code> in Vercel.</p>'
    );
  }

  const baseUrl = buildBaseUrl(req);
  const redirectUri = (process.env.SPOTIFY_REDIRECT_URI ?? `${baseUrl}/api/spotify/callback`).trim();

  const cookies = parseCookies(req.headers?.cookie as string | undefined);
  const expectedState = cookies.spotify_oauth_state;

  const error = req.query?.error ?? null;
  const code = req.query?.code ?? null;
  const state = req.query?.state ?? null;


  setCookie(res, 'spotify_oauth_state', '', { maxAgeSeconds: 0 });

  if (error) {
    return html(res, 400, `<h2>Spotify auth error</h2><p>${String(error)}</p>`);
  }

  if (!code || typeof code !== 'string') {
    return html(res, 400, '<h2>Missing code</h2><p>No <code>?code=</code> provided by Spotify.</p>');
  }

  if (!state || typeof state !== 'string' || !expectedState || state !== expectedState) {
    return html(
      res,
      400,
      '<h2>Invalid state</h2><p>Start again from <code>/api/spotify/authorize</code>.</p>'
    );
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      redirectUri,
      clientId,
      clientSecret,
    });

    if (!tokens.refresh_token) {
      return html(
        res,
        200,
        '<h2>No refresh token returned</h2><p>Remove the app from your Spotify Account → Apps, then try again.</p>'
      );
    }

    return html(
      res,
      200,
      `
<h2>Spotify refresh token</h2>
<p>Copy this value into Vercel env var <code>SPOTIFY_REFRESH_TOKEN</code> (do not commit it):</p>
<pre style="white-space: pre-wrap; word-break: break-all; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">${tokens.refresh_token}</pre>
<p>Then redeploy your site.</p>
`
    );
  } catch (e: any) {
    return html(res, 500, '<h2>Token exchange failed</h2><p>Check your Spotify app settings and env vars.</p>');
  }
}
