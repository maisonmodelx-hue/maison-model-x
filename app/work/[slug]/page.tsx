import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "../../components/Reveal";
import { getProject, projects } from "../../data";
export function generateStaticParams() { return projects.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const p = getProject(slug); return p ? { title: p.name, description: p.summary } : {}; }
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const p = getProject(slug); if (!p) notFound(); const next = projects[(projects.findIndex(x => x.slug === slug) + 1) % projects.length];
  return <main id="main-content" className="case-page">
    <section className={`case-hero project-image-${p.image}`}><div className="case-overlay"/><div className="shell case-hero-content"><p className="eyebrow">{p.category} / {p.year}</p><h1>{p.name}</h1><p>{p.summary}</p></div></section>
    <section className="section ivory case-intro"><div className="shell case-intro-grid"><Reveal><p className="eyebrow">The brief</p><h2 className="display-medium">Make the product feel<br/><em>impossible to forget.</em></h2></Reveal><Reveal delay={100}><p>The collection arrived as product references and a short creative note: sculptural, intimate, future-facing. We developed the visual world, cast an original virtual identity and directed every frame around the product’s defining details.</p><div className="case-details label"><span>Client <b>{p.name}</b></span><span>Services <b>{p.tags.join(", ")}</b></span><span>Turnaround <b>41 hours</b></span><span>Usage <b>Global commercial</b></span></div></Reveal></div></section>
    <section className="case-gallery ink"><div className="case-shot case-shot-wide project-image-hero"/><div className="case-shot project-image-jewellery"/><div className="case-shot project-image-campaign"/></section>
    <section className="section paper case-result"><div className="shell"><Reveal><p className="eyebrow">The result</p><h2 className="display-large">One collection.<br/><em>One visual world.</em></h2></Reveal><div className="result-grid"><Reveal><p>Twenty-four final campaign images, two short films and a full suite of social crops—all created with a coherent cast, light language and finish.</p></Reveal><Reveal delay={120}><div className="big-stat">41<span>hours</span></div><p className="label">Brief to final delivery</p></Reveal></div></div></section>
    <section className="next-project dark-section"><div className="shell"><p className="eyebrow muted-light">Next project</p><Link href={`/work/${next.slug}`}><h2>{next.name}</h2><span className="circle-arrow">→</span></Link></div></section>
  </main>;
}
