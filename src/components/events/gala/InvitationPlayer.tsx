"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { HolidaySprig } from "./HolidaySprig";

export function InvitationPlayer({ src, poster }: { src: string; poster?: string }) {
  const t = useTranslations("christmasGala.hero");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);

  async function play() {
    setError(false);
    try {
      await videoRef.current?.play();
    } catch {
      setError(true);
    }
  }

  return (
    <div className="gala-video-player">
      <video
        ref={videoRef}
        src={poster ? src : `${src}#t=0.001`}
        poster={poster}
        aria-label={t("screenLabel")}
        controls={started}
        playsInline
        preload={poster ? "none" : "metadata"}
        controlsList="nodownload"
        onPlay={() => { setStarted(true); setError(false); }}
        onEnded={() => setStarted(false)}
      />
      {!started && (
        <button type="button" className="gala-holiday-play" onClick={play} aria-label={t("play")}>
          <span className="gala-play-wreath" aria-hidden="true">
            <HolidaySprig className="gala-play-sprig gala-play-sprig-left" />
            <HolidaySprig className="gala-play-sprig gala-play-sprig-right" />
            <Play size={30} fill="currentColor" strokeWidth={1} />
          </span>
          <span className="gala-play-label">{t("play")}</span>
        </button>
      )}
      {error && <p role="alert" className="gala-video-error">{t("playError")}</p>}
    </div>
  );
}
