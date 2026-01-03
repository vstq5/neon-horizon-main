import { useEffect, useMemo, useState } from 'react';
import { siSpotify } from 'simple-icons';

type NowPlayingResponse =
  | {
      isPlaying: true;
      title: string;
      artist: string;
      songUrl: string;
      albumImageUrl: string;
    }
  | {
      isPlaying: false;
    };

function SpotifyMark() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="h-4 w-4"
    >
      <path d={siSpotify.path} fill={`#${siSpotify.hex}`} />
    </svg>
  );
}

export default function SpotifyNowPlaying() {
  const [data, setData] = useState<NowPlayingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshMs = 25_000;

  const subtitle = useMemo(() => {
    if (!data) return 'Checking Spotify…';
    if (!data.isPlaying) return 'Not listening right now';
    return `${data.artist}`;
  }, [data]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
      try {
        setError(null);
        const res = await fetch('/api/spotify/now-playing', {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        const json = (await res.json().catch(() => null)) as NowPlayingResponse | null;
        if (!mounted) return;

        if (!json) {
          setData({ isPlaying: false });
          return;
        }

        setData(json);
      } catch (e: any) {
        if (!mounted) return;
        if (e?.name === 'AbortError') return;
        setError('Unable to load Spotify status');
        setData({ isPlaying: false });
      }
    }

    void load();
    const interval = window.setInterval(load, refreshMs);

    return () => {
      mounted = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  const isPlaying = Boolean(data && 'isPlaying' in data && data.isPlaying);

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-foreground/10 bg-background/40 px-4 py-2 backdrop-blur">
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <SpotifyMark />
        Listening
      </span>

      <div className="h-4 w-px bg-foreground/10" />

      <div className="min-w-0">
        {isPlaying ? (
          <a
            href={(data as Extract<NowPlayingResponse, { isPlaying: true }>).songUrl}
            target="_blank"
            rel="noreferrer"
            className="group block min-w-0"
            title="Open in Spotify"
          >
            <div className="flex items-center gap-2 min-w-0">
              {(data as Extract<NowPlayingResponse, { isPlaying: true }>).albumImageUrl ? (
                <img
                  src={(data as Extract<NowPlayingResponse, { isPlaying: true }>).albumImageUrl}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-full border border-foreground/10"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <span className="truncate text-sm text-foreground/90 group-hover:text-primary transition-colors">
                {(data as Extract<NowPlayingResponse, { isPlaying: true }>).title}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">•</span>
              <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </a>
        ) : (
          <div className="text-xs text-muted-foreground">
            {error ? error : subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
