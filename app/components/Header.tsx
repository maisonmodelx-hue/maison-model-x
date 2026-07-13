"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 80); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  const darkHero = pathname === "/" || pathname?.startsWith("/work/");
  return <header className={`site-header ${scrolled ? "scrolled" : ""} ${darkHero ? "over-dark" : "light-page"}`}>
    <Link className="wordmark" href="/" aria-label="Maison Model X home"><img className="wordmark-logo" src="/images/logo.png" alt="" aria-hidden="true" /><span className="wordmark-text"><span>MAISON</span><b>MODEL X</b></span></Link>
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu"><span/><span/></button>
    <nav className={open ? "open" : ""} aria-label="Primary navigation">
      <Link onClick={() => setOpen(false)} className={pathname === "/work" ? "active" : ""} href="/work">Work</Link>
      <Link onClick={() => setOpen(false)} className={pathname === "/services" ? "active" : ""} href="/services">Services</Link>
      <Link onClick={() => setOpen(false)} className={pathname === "/studio" ? "active" : ""} href="/studio">Studio</Link>
      <Link onClick={() => setOpen(false)} className="nav-cta" href="/start">Start a project <span>↗</span></Link>
    </nav>
  </header>;
}
