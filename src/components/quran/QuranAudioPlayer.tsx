import { useEffect, useRef, useState } from "react";

const repeatOptions = [1, 3, 5, 10] as const;

type QuranAudioPlayerProps = {
  source: string;
  startMs: number;
  endMs: number;
};

export function QuranAudioPlayer({ source, startMs, endMs }: QuranAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const completedPasses = useRef(0);
  const repeatCountRef = useRef(1);
  const isCrossingBoundary = useRef(false);
  const [repeatCount, setRepeatCount] = useState<(typeof repeatOptions)[number]>(1);
  const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const startSeconds = startMs / 1_000;
  const endSeconds = endMs / 1_000;
  const verseKey = `${source}:${startMs}:${endMs}`;
  const isPlaying = playingVerseKey === verseKey;

  const pauseAudio = () => {
    audioRef.current?.pause();
    setPlayingVerseKey(null);
    setIsLoading(false);
  };

  useEffect(() => {
    // A verse change never leaks a prior verse's repeat counter or playback.
    const audio = audioRef.current;
    audio?.pause();
    if (audio) audio.currentTime = startSeconds;
    completedPasses.current = 0;
    isCrossingBoundary.current = false;
    return () => audio?.pause();
    // The bounds identify a verse even if two verses reuse one surah asset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, startMs, endMs]);

  const startPass = async (fromStart: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;

    document.querySelectorAll<HTMLAudioElement>("audio[data-quran-audio]").forEach((element) => {
      if (element !== audio) element.pause();
    });
    if (fromStart || audio.currentTime < startSeconds || audio.currentTime >= endSeconds) {
      audio.currentTime = startSeconds;
    }
    setHasError(false);
    setIsLoading(true);
    try {
      await audio.play();
      setPlayingVerseKey(verseKey);
    } catch {
      setHasError(true);
      setPlayingVerseKey(null);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (completedPasses.current >= repeatCountRef.current || audio.currentTime >= endSeconds) {
      completedPasses.current = 0;
      await startPass(true);
      return;
    }
    await startPass(audio.currentTime < startSeconds);
  };

  const handleSegmentBoundary = async () => {
    const audio = audioRef.current;
    if (!audio || isCrossingBoundary.current) return;
    isCrossingBoundary.current = true;
    audio.pause();
    audio.currentTime = endSeconds;
    completedPasses.current += 1;

    if (completedPasses.current < repeatCountRef.current) {
      isCrossingBoundary.current = false;
      await startPass(true);
      return;
    }
    setPlayingVerseKey(null);
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime >= endSeconds) void handleSegmentBoundary();
  };

  const selectRepeatCount = (count: (typeof repeatOptions)[number]) => {
    repeatCountRef.current = count;
    setRepeatCount(count);
  };

  return (
    <section className="audio-player" aria-label="Audio ayat">
      <audio
        ref={audioRef}
        data-quran-audio
        data-testid="quran-audio"
        src={source}
        preload="metadata"
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio && !isPlaying) audio.currentTime = startSeconds;
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => void handleSegmentBoundary()}
        onPause={() => { if (!isCrossingBoundary.current) setPlayingVerseKey(null); }}
        onError={() => { setHasError(true); setPlayingVerseKey(null); setIsLoading(false); }}
      />
      <div className="audio-actions">
        <div className="audio-listen-control">
          <span className="audio-control-label">Dengar ayat</span>
          <button type="button" className="button-primary audio-play-button" aria-label={isLoading ? "Memuat audio" : isPlaying ? "Jeda audio" : "Putar audio"} disabled={isLoading} onClick={isPlaying ? pauseAudio : () => void playAudio()}>
            <span className="audio-button-icon" aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
            <span>{isLoading ? "Memuat" : isPlaying ? "Jeda" : "Dengar"}</span>
          </button>
        </div>
        <div className="repeat-group">
          <span className="audio-control-label">Ulangi</span>
          <div className="repeat-controls" aria-label="Jumlah pengulangan">
            {repeatOptions.map((count) => (
              <button key={count} type="button" aria-label={`Ulangi ${count} kali`} aria-pressed={repeatCount === count} onClick={() => selectRepeatCount(count)}>
                <span aria-hidden="true">↻</span>
                <span>{count}×</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="audio-status" aria-live="polite">
        {hasError ? "Audio belum dapat dimuat. Ketuk Dengar untuk mencoba lagi." : `Ayat akan diputar ${repeatCount} kali. Dengarkan, lalu ikuti perlahan.`}
      </p>
    </section>
  );
}
