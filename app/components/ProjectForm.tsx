"use client";
import { FormEvent, useEffect, useRef, useState } from "react";

const categories = ["Fashion", "Jewellery", "Fashion & Jewellery", "Campaign Film", "Full Campaign"];

export default function ProjectForm() {
  const [sent, setSent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  }

  function removeFile() {
    if (fileRef.current) fileRef.current.value = "";
    setFile(null);
    setOpen(false);
  }

  // Create / clean up the preview URL whenever the file changes
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Close the pop-up with Esc and lock page scroll while it's open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  if (sent) return <div className="form-success"><p className="eyebrow">Brief received</p><h2>Thank you.<br/><em>We’ll be in touch.</em></h2><p>Your brief has been received. Our studio will review it and respond with the recommended creative scope within 24 hours.</p><button className="text-link" onClick={() => { setSent(false); setFile(null); }}>Send another brief →</button></div>;

  const isImage = file?.type.startsWith("image/");
  const isPdf = file?.type === "application/pdf";

  return <>
    <form className="project-form" onSubmit={submit}>
      <div className="field"><label htmlFor="name">Name *</label><input id="name" name="name" required placeholder="Your full name" /></div>
      <div className="field"><label htmlFor="brand">Brand *</label><input id="brand" name="brand" required placeholder="Brand or company" /></div>
      <div className="field"><label htmlFor="email">Email *</label><input id="email" type="email" required placeholder="you@brand.com" /></div>
      <div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" type="tel" placeholder="+91" /></div>
      <div className="field full"><label htmlFor="category">Project category *</label><select id="category" required defaultValue=""><option value="" disabled>Select a category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="products">Products or designs *</label><input id="products" type="number" min="1" required placeholder="e.g. 12" /></div>
      <div className="field"><label htmlFor="launch">Launch date *</label><input id="launch" type="date" required /></div>
      <fieldset className="field full checks"><legend>Deliverables needed *</legend>{["Campaign Photography", "Campaign Film", "Social Content", "Full Campaign"].map(x => <label key={x}><input type="checkbox" name="deliverables" value={x}/><span>{x}</span></label>)}</fieldset>
      <div className="field full"><label htmlFor="budget">Approximate budget</label><input id="budget" name="budget" type="text" inputMode="text" autoComplete="off" placeholder="e.g. $2,000 – $5,000" /></div>
      <div className="field full"><label htmlFor="description">Project description *</label><textarea id="description" required rows={6} placeholder="Tell us about the collection, creative direction, formats and ambition." /></div>
      <div className="field full">
        <label htmlFor="reference">Reference upload</label>
        <input ref={fileRef} className="file" id="reference" type="file" accept="image/*,.pdf" onChange={onFileChange} />
        {file && <div className="file-actions">
          <button type="button" className="text-link" onClick={() => setOpen(true)}>Preview upload <span>↗</span></button>
          <button type="button" className="text-link" onClick={removeFile}>Remove</button>
        </div>}
      </div>
      <button className="button brass submit" type="submit">Send project brief <span>↗</span></button>
    </form>

    {open && file && previewUrl && <div className="preview-backdrop" role="dialog" aria-modal="true" aria-label="Reference preview" onClick={() => setOpen(false)}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <div className="preview-head">
          <span className="label">{file.name}</span>
          <button type="button" className="preview-close" onClick={() => setOpen(false)} aria-label="Close preview">Close ✕</button>
        </div>
        <div className="preview-body">
          {isImage && <img src={previewUrl} alt={file.name} />}
          {isPdf && <iframe src={previewUrl} title={file.name} />}
          {!isImage && !isPdf && <p>No preview available for this file type.</p>}
        </div>
      </div>
    </div>}
  </>;
}