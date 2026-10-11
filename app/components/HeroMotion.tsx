"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const firstLine = ["Where", "elegance"];
const secondLine = ["transcends", "reality."];

export default function HeroMotion() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const revealFrame = requestAnimationFrame(() => setReady(true));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return () => cancelAnimationFrame(revealFrame);

    let ticking = false;
    // Scroll-out transition from the hero into the next section (matches the studio reference):
    // image parallaxes down + scales up, overlay darkens, content slides up and fully fades.
    const update = () => {
      const heroHeight = sectionRef.current?.offsetHeight || window.innerHeight;
      const p = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      if (mediaRef.current) {
        mediaRef.current.style.transform = `translate3d(0, ${p * 22}%, 0) scale(${1 + p * 0.12})`;
      }
      if (shadeRef.current) {
        shadeRef.current.style.opacity = `${0.4 + p * 0.45}`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${p * -30}%, 0)`;
        contentRef.current.style.opacity = `${Math.max(0, 1 - p / 0.85)}`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(revealFrame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onMagnetMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "touch") return;
    const button = ctaRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.28;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.32;
    button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const resetMagnet = () => {
    if (ctaRef.current) ctaRef.current.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <section ref={sectionRef} className={`hero dark-section ${ready ? "hero-motion-ready" : ""}`}>
      <div ref={mediaRef} className="hero-media" aria-hidden="true" />
      <div ref={shadeRef} className="hero-shade" />
      <div ref={contentRef} className="hero-content shell">
        <p className="eyebrow hero-kicker hero-fade">AI FASHION & JEWELLERY CAMPAIGNS</p>
        <h1 aria-label="Where elegance transcends reality.">
          <span className="hero-line" aria-hidden="true">
            {firstLine.map((word, index) => (
              <span className="word-mask" key={word}><span className="word-inner" style={{ transitionDelay: `${140 + index * 85}ms` }}>{word}</span></span>
            ))}
          </span>
          <em className="hero-line hero-line-offset" aria-hidden="true">
            {secondLine.map((word, index) => (
              <span className="word-mask" key={word}><span className="word-inner" style={{ transitionDelay: `${310 + index * 85}ms` }}>{word}</span></span>
            ))}
          </em>
        </h1>
        <p className="hero-intro hero-fade">Fashion and jewellery campaigns, crafted with AI for brands that demand speed, consistency, and editorial quality.</p>
        <div className="hero-actions hero-fade">
          <Link
            ref={ctaRef}
            className="button brass magnetic"
            href="/start"
            onPointerMove={onMagnetMove}
            onPointerLeave={resetMagnet}
            onPointerCancel={resetMagnet}
          >
            <span>Book Now</span><i aria-hidden="true">↗</i>
          </Link>
          <a className="text-link light" href="#selected-work">View selected work <span>↘</span></a>
        </div>
      </div>
      <div className="hero-index label">MMX / 001</div>
      <div className="scroll-cue"><span /></div>
    </section>
  );
}
