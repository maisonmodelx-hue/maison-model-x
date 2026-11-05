"use client";
import { useEffect, useRef } from "react";
import type { Piece } from "../pieces";

type PhotoViewerProps = {
  pieces: Piece[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
};

export default function PhotoViewer({ pieces, index, onChange, onClose }: PhotoViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const piece = pieces[index];
  const go = (direction: number) => onChange((index + direction + pieces.length) % pieces.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    dialog?.showModal();
    dialog?.focus(); // otherwise the browser focuses, and rings, the first arrow
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
      dialog?.close();
    };
  }, []);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  }

  // Clicking the empty space around the photo closes the viewer.
  function onClick(event: React.MouseEvent) {
    if ((event.target as HTMLElement).dataset.dismiss !== undefined) dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className="viewer"
      tabIndex={-1}
      aria-label={piece.title}
      data-dismiss
      data-lenis-prevent
      // React's Strict Mode reopens the dialog in development, so only a dialog that stayed closed counts.
      onClose={() => { if (!dialogRef.current?.open) onClose(); }}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div className="viewer-stage" data-dismiss>
        <div className="viewer-frame" key={piece.id} style={{ "--ratio": piece.ratio } as React.CSSProperties}>
          {piece.renderMedia("(max-width: 900px) 100vw, 72vw", true)}
        </div>
      </div>
      <div className="viewer-info">
        <p className="label viewer-meta"><span>{piece.code}</span><span>{piece.meta}</span></p>
        <h2>{piece.title}</h2>
        <p className="viewer-summary">{piece.summary}</p>
        {piece.credits && <p className="label viewer-credits">{piece.credits}</p>}
        <div className="viewer-nav">
          <span className="label">{String(index + 1).padStart(2, "0")} / {pieces.length}</span>
          <div>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo">←</button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo">→</button>
          </div>
        </div>
      </div>
      <button type="button" className="viewer-close label" onClick={() => dialogRef.current?.close()}>Close ✕</button>
    </dialog>
  );
}
