

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  res.end(JSON.stringify(body));
}

function requiredEnv(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

function base64BasicAuth(id: string, secret: string) {
  return Buffer.from(`${id}:${secret}`).toString('base64');
}

async function getAccessToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: params.refreshToken,
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
  if (!res.ok || !json?.access_token) {
    throw new Error(`Spotify token refresh failed (${res.status}): ${JSON.stringify(json)}`);
  }

  return json.access_token as string;
}

export default async function handler(req: any, res: any) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed' });
  }

  const clientId = requiredEnv('SPOTIFY_CLIENT_ID');
  const clientSecret = requiredEnv('SPOTIFY_CLIENT_SECRET');
  const refreshToken = requiredEnv('SPOTIFY_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    return json(res, 500, {
      error: 'Missing Spotify env vars',
      missing: {
        SPOTIFY_CLIENT_ID: !clientId,
        SPOTIFY_CLIENT_SECRET: !clientSecret,
        SPOTIFY_REFRESH_TOKEN: !refreshToken,
      },
    });
  }

  try {
    const accessToken = await getAccessToken({ clientId, clientSecret, refreshToken });

    const nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (nowRes.status === 204 || nowRes.status === 202) {
      return json(res, 200, { isPlaying: false });
    }

    const nowJson = await nowRes.json().catch(() => null);
    if (!nowRes.ok || !nowJson) {
      return json(res, 200, { isPlaying: false });
    }

    const item = nowJson.item;
    const isPlaying = Boolean(nowJson.is_playing && item);

    if (!isPlaying) {
      return json(res, 200, { isPlaying: false });
    }

    const title = item?.name ?? '';
    const artist = Array.isArray(item?.artists)
      ? item.artists.map((a: any) => a?.name).filter(Boolean).join(', ')
      : '';

    const songUrl = item?.external_urls?.spotify ?? '';

    const images = item?.album?.images;
    const albumImageUrl = Array.isArray(images) && images.length
      ? images[0]?.url ?? ''
      : '';

    return json(res, 200, {
      isPlaying: true,
      title,
      artist,
      songUrl,
      albumImageUrl,
    });
  } catch (e: any) {
    return json(res, 200, { isPlaying: false });
  }
}
