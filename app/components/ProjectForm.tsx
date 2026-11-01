"use client";
import { FormEvent, useEffect, useRef, useState } from "react";

const categories = ["Fashion", "Jewellery", "Fashion & Jewellery", "Campaign Film", "Full Campaign"];
const MAX_FILE = 4 * 1024 * 1024; // 4 MB per file
const MAX_FILES = 6;

export default function ProjectForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError("");
    const oversized = files.find(f => f.size > MAX_FILE);
    if (oversized) {
      setError(`"${oversized.name}" is over 4 MB. Please choose a smaller file, or email it to us.`);
      return;
    }
    setSending(true);
    try {
      const formData = new FormData(form);
      formData.delete("reference");
      files.forEach(f => formData.append("reference", f));
      const res = await fetch("/api/send-brief", { method: "POST", body: formData });
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
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    const combined = [...files, ...picked].slice(0, MAX_FILES);
    if (files.length + picked.length > MAX_FILES) {
      setError(`You can attach up to ${MAX_FILES} files. The first ${MAX_FILES} were kept.`);
    }
    setFiles(combined);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setOpenIndex(null);
  }

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [files]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenIndex(null); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [openIndex]);

  if (sent) return <div className="form-success"><p className="eyebrow">Brief received</p><h2>Thank you.<br/><em>We’ll be in touch.</em></h2><p>Your brief has been received. Our studio will review it and respond with the recommended creative scope within 24 hours.</p><button className="text-link" onClick={() => { setSent(false); setFiles([]); }}>Send another brief →</button></div>;

  const openFile = openIndex !== null ? files[openIndex] : null;
  const openUrl = openIndex !== null ? previewUrls[openIndex] : null;
  const isImage = openFile?.type.startsWith("image/");
  const isPdf = openFile?.type === "application/pdf";

  return <>
    <form className="project-form" onSubmit={submit}>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <div className="field"><label htmlFor="name">Name *</label><input id="name" name="name" required placeholder="Your full name" /></div>
      <div className="field"><label htmlFor="brand">Brand *</label><input id="brand" name="brand" required placeholder="Brand or company" /></div>
      <div className="field"><label htmlFor="email">Email *</label><input id="email" name="email" type="email" required placeholder="you@brand.com" /></div>
      <div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" type="tel" placeholder="+91" /></div>
      <div className="field full"><label htmlFor="category">Project category *</label><select id="category" name="category" required defaultValue=""><option value="" disabled>Select a category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="products">Products or designs *</label><input id="products" name="products" type="number" min="1" required placeholder="e.g. 12" /></div>
      <div className="field"><label htmlFor="launch">Launch date *</label><input id="launch" name="launch" type="date" required min={today} /></div>
      <fieldset className="field full checks"><legend>Deliverables needed *</legend>{["Campaign Photography", "Campaign Film", "Social Content", "Full Campaign"].map(x => <label key={x}><input type="checkbox" name="deliverables" value={x}/><span>{x}</span></label>)}</fieldset>
      <div className="field full"><label htmlFor="budget">Approximate budget</label><input id="budget" name="budget" type="text" autoComplete="off" placeholder="e.g. $2,000 – $5,000" /></div>
      <div className="field full"><label htmlFor="description">Project description *</label><textarea id="description" name="description" required rows={6} placeholder="Tell us about the collection, creative direction, formats and ambition." /></div>
      <div className="field full">
        <label htmlFor="reference">Reference upload — up to {MAX_FILES} files, max 4 MB each</label>
        <input ref={fileRef} className="file" id="reference" type="file" accept="image/*,.pdf" multiple onChange={onFileChange} disabled={files.length >= MAX_FILES} />
        {files.length > 0 && <ul className="file-list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="file-row">
              <button type="button" className="file-row-name" onClick={() => setOpenIndex(i)} title={f.name}>
                <span className="file-row-icon" aria-hidden="true">📎</span>
                <span className="file-row-text">{f.name}</span>
              </button>
              <button type="button" className="file-row-remove" onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>✕</button>
            </li>
          ))}
        </ul>}
        {files.length >= MAX_FILES && <p className="file-limit-note">Maximum of {MAX_FILES} files reached.</p>}
      </div>
      {error && <p role="alert" style={{ gridColumn: "1 / -1", color: "#8a2a2a", fontSize: 14, margin: 0 }}>{error}</p>}
      <button className="button brass submit" type="submit" disabled={sending}>{sending ? "Sending…" : <>Send project brief <span>↗</span></>}</button>
    </form>

    {openFile && openUrl && <div className="preview-backdrop" role="dialog" aria-modal="true" aria-label="Reference preview" onClick={() => setOpenIndex(null)}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <div className="preview-head">
          <span className="label">{openFile.name}</span>
          <button type="button" className="preview-close" onClick={() => setOpenIndex(null)} aria-label="Close preview">Close ✕</button>
        </div>
        <div className="preview-body">
          {isImage && <img src={openUrl} alt={openFile.name} />}
          {isPdf && <iframe src={openUrl} title={openFile.name} />}
          {!isImage && !isPdf && <p>No preview available for this file type.</p>}
        </div>
      </div>
    </div>}
  </>;
}