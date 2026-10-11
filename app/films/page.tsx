import type { Metadata } from "next";
import FilmFilter from "../components/FilmFilter";

export const metadata: Metadata = { title: "Films", description: "Campaign films by Maison Model X." };

export default function FilmsPage() {
  return (
    <main id="main-content" className="page-main ivory">
      <section className="page-hero shell">
        <p className="eyebrow">The films / 2026</p>
        <h1>Motion,<br/>directed with <em>intent.</em></h1>
        <p className="page-lead">Cinematic campaign films, produced with new creative tools.</p>
      </section>
      <section className="work-section shell">
        <FilmFilter />
      </section>
    </main>
  );
}