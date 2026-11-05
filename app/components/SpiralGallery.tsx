"use client";
import { useEffect, useRef, useState } from "react";
import { photoSrc } from "../photo";
import { photoPieces as pieces } from "../pieces";
import { createSpiral, type Spiral } from "../spiral";
import PhotoViewer from "./PhotoViewer";

const TIP_WIDTH = 300;
const TIP_HEIGHT = 150;
const TIP_GAP = 20;

export default function SpiralGallery({ onUnsupported }: { onUnsupported: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const spiralRef = useRef<Spiral | null>(null);
  const [tipPhoto, setTipPhoto] = useState(0);
  const [tipVisible, setTipVisible] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Panels are small on screen, so only high-resolution desktop screens need the larger files.
    const textureWidth = window.innerWidth * window.devicePixelRatio >= 2000 ? 1024 : 640;
    const spiral = createSpiral(
      canvas,
      pieces.map((piece) => ({ url: photoSrc(piece.src, textureWidth), ratio: piece.ratio })),
      {
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        onHover(photo, x, y) {
          setTipVisible(photo !== null);
          if (photo === null) return;
          setTipPhoto(photo);
          const bounds = sectionRef.current?.getBoundingClientRect();
          if (!bounds || !tipRef.current) return;
          const left = x + TIP_GAP + TIP_WIDTH > bounds.width ? x - TIP_GAP - TIP_WIDTH : x + TIP_GAP;
          const top = y + TIP_GAP + TIP_HEIGHT > bounds.height ? y - TIP_GAP - TIP_HEIGHT : y + TIP_GAP;
          tipRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        },
        onPick: setViewing,
        onFail: onUnsupported,
      },
    );
    if (!spiral) {
      requestAnimationFrame(onUnsupported);
      return;
    }
    spiralRef.current = spiral;
    return () => {
      spiral.destroy();
      spiralRef.current = null;
    };
  }, [onUnsupported]);

  useEffect(() => {
    spiralRef.current?.setPaused(viewing !== null);
  }, [viewing]);

  const tip = pieces[tipPhoto];

  return (
    <section ref={sectionRef} className="spiral" aria-label="Spiral of campaign photographs">
      <canvas ref={canvasRef} role="img" aria-label={`A slowly turning spiral of ${pieces.length} campaign photographs. They are also listed by name after this image.`} />

      <div className="spiral-head label" aria-hidden="true">
        <span className="spiral-mark-start">Maison Model X ©</span>
        <span className="spiral-mark-end">Archive — Nº {pieces.length}</span>
      </div>
      <div className="spiral-foot label" aria-hidden="true">
        <span className="spiral-mark-start">/{pieces.length} Photos</span>
        <span className="spiral-mark-end">The Work / 2026</span>
      </div>

      <button type="button" className="spiral-arrow spiral-arrow-prev" onClick={() => spiralRef.current?.step(-1)} aria-label="Turn the spiral back">←</button>
      <button type="button" className="spiral-arrow spiral-arrow-next" onClick={() => spiralRef.current?.step(1)} aria-label="Turn the spiral forward">→</button>

      {/* The canvas can't be read or tabbed through, so this is how keyboard and screen reader users reach each photo. */}
      <ul className="spiral-list">
        {pieces.map((piece, i) => (
          <li key={piece.id}><button type="button" onClick={() => setViewing(i)}>View {piece.title}: {piece.summary}</button></li>
        ))}
      </ul>

      <div ref={tipRef} className={`spiral-tip ${tipVisible ? "visible" : ""}`} aria-hidden="true">
        <p className="label spiral-tip-meta"><span>{tip.code}</span><span>{tip.category}</span></p>
        <p className="spiral-tip-title">{tip.title}</p>
        <p className="spiral-tip-summary">{tip.summary}</p>
      </div>

      {viewing !== null && <PhotoViewer pieces={pieces} index={viewing} onChange={setViewing} onClose={() => setViewing(null)} />}
    </section>
  );
}
