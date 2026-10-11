import Link from "next/link";
import Reveal from "./components/Reveal";
import HeroMotion from "./components/HeroMotion";
import { projects, services } from "./data";

export default function Home() {
  return (
    <main id="main-content">
      <HeroMotion />

      <section className="section ivory selected" id="selected-work">
        <div className="shell">
          <Reveal><div className="section-heading"><p className="eyebrow">Selected work</p><p className="section-note">Campaign direction / still / motion</p></div></Reveal>
          <div className="editorial-grid">
            {projects.slice(0, 3).map((project, index) => (
              <Reveal key={project.slug} className={`project-tile tile-${index + 1}`} delay={index * 100}>
                <div className="project-tile-static" aria-label={`${project.name} case study`}>
                  <div className="project-media" data-cursor="View">
                    <div className={`project-image project-image-${project.image}`} />
                  </div>
                  <div className="project-meta">
                    <h2>{project.name}</h2><p className="label">{project.tags.join(" · ")}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="align-right"><Link className="text-link" href="/work">Explore all work <span>→</span></Link></div>
        </div>
      </section>

      <section className="section ink transformation">
        <div className="shell">
          <Reveal><p className="eyebrow muted-light">A complete transformation</p><h2 className="display-large centered">From first idea to<br /><em>final campaign.</em></h2></Reveal>
          <div className="sequence">
            {[
              ["01", "Sketch", "line-art"], ["02", "Garment", "fabric"], ["03", "Model", "campaign"], ["04", "Campaign film", "jewellery"],
            ].map(([n, title, cls], i) => (
              <Reveal className="sequence-step" delay={i * 160} key={title}>
                <div className={`sequence-frame ${cls}`}><span className="sequence-number">{n}</span></div>
                <p className="label">{title}</p>
              </Reveal>
            ))}
          </div>
          <p className="sequence-caption label">Nooré SS26 — sketch to campaign, 41 hours</p>
        </div>
      </section>

      <section className="section paper capabilities">
        <div className="shell">
          <Reveal><div className="split-title"><div><p className="eyebrow">Capabilities</p><h2 className="display-medium">Made for the<br /><em>fashion moment.</em></h2></div><p>Creative direction and AI-powered production for fashion and jewellery brands, from campaign photography to cinematic motion.</p></div></Reveal>
          <div className="service-list">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={index * 70}>
                <Link href="/services" className="service-row">
                  <span className="label">0{index + 1}</span><h3>{service.title}</h3><p>{service.short}</p><span className="row-arrow">↗</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section case-feature dark-section">
        <div className="shell">
          <Reveal><p className="eyebrow muted-light">Featured case study</p></Reveal>
          <div className="feature-layout">
            <Reveal className="feature-copy">
              <p className="label brass-text">Nooré / Spring–Summer 2026</p>
              <h2>Jewellery, captured with the precision it deserves.</h2>
              <p>From four product references, we built an editorial world where every stone, setting and reflection remained true to the original pieces.</p>
              <Link className="text-link light" href="/work/noore-ss26">Read the case study <span>→</span></Link>
            </Reveal>
            <Reveal className="feature-image" delay={120}><div className="feature-crop" /></Reveal>
          </div>
          <div className="stat-line label"><span>Scope 24 images + 2 films</span><span>Turnaround 41 hours</span><span>Usage global commercial</span></div>
        </div>
      </section>

      <section className="section ivory outcomes">
        <div className="shell">
          <Reveal><p className="eyebrow">Why Maison Model X</p><h2 className="display-medium">Built around the way<br />collections <em>actually launch.</em></h2></Reveal>
          <div className="outcomes-grid">
            {[
              ["01", "Launch collections faster", "Campaign assets in 48 hours, not six weeks."],
              ["02", "Reduce production cost", "Up to 90% less than a traditional studio production."],
              ["03", "Maintain one visual language", "The same model and art direction, across every market."],
            ].map(([n, title, copy], i) => <Reveal className="outcome" delay={i * 100} key={title}><p className="label">{n}</p><h3>{title}</h3><p>{copy}</p></Reveal>)}
          </div>
        </div>
      </section>

      <section className="section burgundy process">
        <div className="shell">
          <Reveal><p className="eyebrow muted-light">The process</p><h2 className="display-medium">Simple by design.<br /><em>Rigorous by nature.</em></h2></Reveal>
          <div className="process-grid">
            {[
              ["01", "Brief", "Share products, direction, formats and launch date."],
              ["02", "Create & refine", "Art direction, first pass and two considered revisions."],
              ["03", "Deliver", "Campaign-ready files with full commercial usage rights."],
            ].map(([n, title, copy], i) => <Reveal className="process-step" delay={i * 100} key={title}><p className="label">{n} / 03</p><h3>{title}</h3><p>{copy}</p></Reveal>)}
          </div>
        </div>
      </section>

      <section className="section ink trust">
        <div className="shell">
          <Reveal><p className="eyebrow muted-light">Our standard</p><blockquote>“A production partner for brands that refuse to choose between speed, craft and control.”</blockquote></Reveal>
          <div className="trust-facts label"><span>48-hour standard delivery</span><span>Global commercial licence</span><span>Fashion & jewellery specialisation</span><span>Private, brand-controlled production</span></div>
        </div>
      </section>

      <section className="founder ivory">
        <div className="founder-image" role="img" aria-label="Maison Model X creative direction studio" />
        <div className="founder-copy">
          <Reveal><p className="eyebrow">The studio</p><h2 className="display-medium">Technology is the medium.<br /><em>Taste is the difference.</em></h2><p>Maison Model X was founded to give fashion brands a more agile way to make exceptional visual work. We combine art direction, AI production and exacting post-production under one creative point of view.</p><Link className="text-link" href="/studio">Meet the studio <span>→</span></Link></Reveal>
        </div>
      </section>

      <section className="final-cta dark-section">
        <div className="shell">
          <Reveal><p className="eyebrow muted-light">Begin a collaboration</p><h2>Your next campaign can<br /><em>begin with a sketch.</em></h2><div className="cta-row"><Link className="button brass" href="/start">Start a project</Link><a className="text-link light" href="https://wa.me/917756078868?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20Maison%20Model%20X" target="_blank" rel="noopener">WhatsApp the studio <span>↗</span></a></div></Reveal>
        </div>
      </section>
    </main>
  );
}
