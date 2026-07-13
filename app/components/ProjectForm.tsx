"use client";
import { FormEvent, useState } from "react";
export default function ProjectForm() { const [sent, setSent] = useState(false); function submit(e: FormEvent) { e.preventDefault(); setSent(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
  if (sent) return <div className="form-success"><p className="eyebrow">Brief received</p><h2>Thank you.<br/><em>We’ll be in touch.</em></h2><p>Your brief has been received. Our studio will review it and respond with the recommended creative scope within 24 hours.</p><button className="text-link" onClick={() => setSent(false)}>Send another brief →</button></div>;
  return <form className="project-form" onSubmit={submit}>
    <div className="field"><label htmlFor="name">Name *</label><input id="name" name="name" required placeholder="Your full name" /></div>
    <div className="field"><label htmlFor="brand">Brand *</label><input id="brand" name="brand" required placeholder="Brand or company" /></div>
    <div className="field"><label htmlFor="email">Email *</label><input id="email" type="email" required placeholder="you@brand.com" /></div>
    <div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" type="tel" placeholder="+91" /></div>
    <div className="field full"><label htmlFor="category">Project category *</label><select id="category" required defaultValue=""><option value="" disabled>Select a category</option><option>Fashion</option><option>Jewellery</option><option>Beauty</option><option>Campaign film</option><option>E-commerce</option></select></div>
    <div className="field"><label htmlFor="products">Products or designs *</label><input id="products" type="number" min="1" required placeholder="e.g. 12" /></div>
    <div className="field"><label htmlFor="launch">Launch date *</label><input id="launch" type="date" required /></div>
    <fieldset className="field full checks"><legend>Deliverables needed *</legend>{["Stills", "Film", "Reels", "Sketch-to-model", "Swatch-to-model"].map(x => <label key={x}><input type="checkbox" name="deliverables" value={x}/><span>{x}</span></label>)}</fieldset>
    <div className="field full"><label htmlFor="budget">Approximate budget</label><select id="budget" defaultValue=""><option value="" disabled>Select an indication</option><option>Starter collection</option><option>Campaign production</option><option>Seasonal partnership</option><option>Not decided</option></select></div>
    <div className="field full"><label htmlFor="description">Project description *</label><textarea id="description" required rows={6} placeholder="Tell us about the collection, creative direction, formats and ambition." /></div>
    <div className="field full"><label htmlFor="reference">Reference upload</label><input className="file" id="reference" type="file" accept="image/*,.pdf" /></div>
    <button className="button brass submit" type="submit">Send project brief <span>↗</span></button>
  </form>;
}
