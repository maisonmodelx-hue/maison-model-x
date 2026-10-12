"use client";
import { FormEvent, useEffect, useRef, useState } from "react";

const categories = ["Fashion", "Jewellery", "Fashion & Jewellery", "Campaign Film", "Full Campaign"];
const MAX_FILE = 4 * 1024 * 1024;

export default function ProjectForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError("");
    if (file && file.size > MAX_FILE) {
      setError("The reference file is over 4 MB. Please choose a smaller file, or email it to us.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/send-brief", { method: "POST", body: new FormData(form) });
      if (!res.ok) throw new Error("failed");
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong sending your brief. Please try again, or email maisonmodelx@gmail.com.");
    } finally {
      setSending(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  function removeFile() {
    if (fileRef.current) fileRef.current.value = "";
    setFile(null);
    setOpen(false);
  }

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <div className="field"><label htmlFor="name">Name *</label><input id="name" name="name" required placeholder="Your full name" /></div>
      <div className="field"><label htmlFor="brand">Brand *</label><input id="brand" name="brand" required placeholder="Brand or company" /></div>
      <div className="field"><label htmlFor="email">Email *</label><input id="email" name="email" type="email" required placeholder="you@brand.com" /></div>
      <div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" type="tel" placeholder="+91" /></div>
      <div className="field full"><label htmlFor="category">Project category *</label><select id="category" name="category" required defaultValue=""><option value="" disabled>Select a category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="products">Products or designs *</label><input id="products" name="products" type="number" min="1" required placeholder="e.g. 12" /></div>
      <div className="field"><label htmlFor="launch">Launch date *</label><input id="launch" name="launch" type="date" required /></div>
      <fieldset className="field full checks"><legend>Deliverables needed *</legend>{["Campaign Photography", "Campaign Film", "Social Content", "Full Campaign"].map(x => <label key={x}><input type="checkbox" name="deliverables" value={x}/><span>{x}</span></label>)}</fieldset>
      <div className="field full"><label htmlFor="budget">Approximate budget</label><input id="budget" name="budget" type="text" autoComplete="off" placeholder="e.g. $2,000 – $5,000" /></div>
      <div className="field full"><label htmlFor="description">Project description *</label><textarea id="description" name="description" required rows={6} placeholder="Tell us about the collection, creative direction, formats and ambition." /></div>
      <div className="field full">
        <label htmlFor="reference">Reference upload (max 4 MB)</label>
        <input ref={fileRef} className="file" id="reference" name="reference" type="file" accept="image/*,.pdf" onChange={onFileChange} />
        {file && <div className="file-actions">
          <button type="button" className="text-link" onClick={() => setOpen(true)}>Preview upload <span>↗</span></button>
          <button type="button" className="text-link" onClick={removeFile}>Remove</button>
        </div>}
      </div>
      {error && <p role="alert" style={{ gridColumn: "1 / -1", color: "#8a2a2a", fontSize: 14, margin: 0 }}>{error}</p>}
      <button className="button brass submit" type="submit" disabled={sending}>{sending ? "Sending…" : <>Send project brief <span>↗</span></>}</button>
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