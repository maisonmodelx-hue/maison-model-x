"use client";
import { useRef, useState } from "react";
import { photoSrc } from "../photo";

type FilmFrameProps = { title: string; video: string; poster: string; isFeature: boolean };

export default function FilmFrame({ title, video, poster, isFeature }: FilmFrameProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function play() {
    setStarted(true);
    ref.current?.play();
  }

  return (
    <>
      <video ref={ref} poster={photoSrc(poster, isFeature ? 1600 : 1024)} controls={started} preload="none" playsInline aria-label={title}>
        <source src={video} type="video/mp4" />
      </video>
      {!started && <button type="button" className="film-play" onClick={play} aria-label={`Play ${title}`}><span>Play</span></button>}
    </>
  );
}
