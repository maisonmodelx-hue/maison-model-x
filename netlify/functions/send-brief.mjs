import nodemailer from "nodemailer";

const MAX_FILES = 6;
// Netlify caps requests at 6 MB and base64-encodes uploads, leaving about 4.5 MB for files.
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const MAX_REQUEST_BYTES = 6 * 1024 * 1024;

// Listed explicitly so the origin check can't lock out visitors if Netlify reports an internal host.
const PRODUCTION_HOST = "maisonmodelx.com";

// Keep in sync with ProjectForm.tsx.
const CATEGORIES = ["Fashion", "Jewellery", "Fashion & Jewellery", "Campaign Film", "Full Campaign"];
const DELIVERABLES = ["Campaign Photography", "Campaign Film", "Social Content", "Full Campaign"];

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const oneLine = (value, max) => String(value ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);
const multiLine = (value, max) =>
  String(value ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, " ").trim().slice(0, max);
const validEmail = (e) => e.length <= 254 && /^[^\s@<>()[\],;:"\\]+@[^\s@<>()[\],;:"\\]+\.[^\s@<>()[\],;:"\\.]{2,}$/.test(e);
const fail = (status, error) => Response.json({ ok: false, error }, { status });

// Blocks other websites from submitting this form through their visitors' browsers.
function isSameSite(req) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const { host } = new URL(origin);
    return host === PRODUCTION_HOST || host === new URL(req.url).host || host === req.headers.get("host");
  } catch {
    return false;
  }
}

// Trusts the file's actual bytes, never the name or type the browser reports.
function detectFileType(buf) {
  const ascii = (start, end) => buf.toString("latin1", start, end);
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (ascii(0, 8) === "\x89PNG\r\n\x1a\n") return { ext: "png", type: "image/png" };
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return { ext: "gif", type: "image/gif" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  if (ascii(0, 5) === "%PDF-") return { ext: "pdf", type: "application/pdf" };
  if (ascii(4, 8) === "ftyp" && /^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)$/.test(ascii(8, 12))) return { ext: "heic", type: "image/heic" };
  return null;
}

function safeFilename(name, ext) {
  const base = String(name).split(/[\\/]/).pop().replace(/\.[^.]*$/, "");
  const clean = base.replace(/[^\p{L}\p{N} ._-]+/gu, "").replace(/^\.+/, "").trim().slice(0, 80);
  return `${clean || "reference"}.${ext}`;
}

// The confirmation goes to an unverified address, so visitor text that could carry a link stays out of it.
function firstName(name) {
  const first = name.split(/\s+/)[0];
  return /^[\p{L}\p{M}'’-]{1,40}$/u.test(first) ? first : "there";
}

function confirmationHtml(name) {
  const first = esc(firstName(name));
  return `
  <div style="background:#f2eee7;padding:40px 16px;font-family:Georgia,'Times New Roman',serif;color:#0b0b0a">
    <div style="max-width:560px;margin:0 auto;background:#faf9f6;padding:48px 40px">
      <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#ae8b4a">Maison Model X</p>
      <h1 style="margin:0 0 24px;font-size:30px;font-weight:400;line-height:1.2">Thank you, ${first}.</h1>
      <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#3d3a35">
        We have received your project brief. Our studio will review it and get back to you with a recommended creative scope <b>within 24 hours</b>.
      </p>
      <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#3d3a35">
        There is nothing more you need to do for now.
      </p>
      <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:16px;color:#77746e">Where elegance transcends reality.</p>
      <hr style="border:0;border-top:1px solid #e3ded4;margin:36px 0 20px">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#77746e">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>`;
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!isSameSite(req)) return fail(403, "Forbidden");
  if (Number(req.headers.get("content-length")) > MAX_REQUEST_BYTES) return fail(413, "Your upload is too large.");

  try {
    const data = await req.formData().catch(() => null);
    if (!data) return fail(400, "Missing or invalid fields");
    if (data.get("website")) return Response.json({ ok: true }); // spam trap, silently ignore

    const name = oneLine(data.get("name"), 120), brand = oneLine(data.get("brand"), 160);
    const email = oneLine(data.get("email"), 255), whatsapp = oneLine(data.get("whatsapp"), 30);
    const category = oneLine(data.get("category"), 40), products = oneLine(data.get("products"), 6);
    const launch = oneLine(data.get("launch"), 10), budget = oneLine(data.get("budget"), 80);
    const description = multiLine(data.get("description"), 5000);
    const deliverables = data.getAll("deliverables").filter((d) => DELIVERABLES.includes(d));

    const fieldsValid =
      name && brand && description && validEmail(email) && CATEGORIES.includes(category) &&
      /^[1-9]\d*$/.test(products) && /^\d{4}-\d{2}-\d{2}$/.test(launch);
    if (!fieldsValid) return fail(400, "Missing or invalid fields");

    const incoming = data.getAll("reference").filter((f) => typeof f === "object" && f.size > 0).slice(0, MAX_FILES);
    if (incoming.reduce((total, f) => total + f.size, 0) > MAX_TOTAL_BYTES) {
      return fail(413, "Your files add up to more than 4 MB. Please remove or compress some, or email them to us.");
    }
    const attachments = [];
    for (const file of incoming) {
      const content = Buffer.from(await file.arrayBuffer());
      const kind = detectFileType(content);
      if (!kind) return fail(415, "Only JPG, PNG, WebP, GIF, HEIC and PDF files can be attached.");
      attachments.push({ filename: safeFilename(file.name, kind.ext), content, contentType: kind.type });
    }

    const rows = [
      ["Name", name], ["Brand", brand], ["Email", email], ["WhatsApp", whatsapp],
      ["Category", category], ["Products / designs", products], ["Launch date", launch],
      ["Deliverables", deliverables.join(", ")], ["Budget", budget],
      ["Description", description],
    ];

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });

    // 1. Enquiry to the studio (if this fails, the whole request fails)
    await transporter.sendMail({
      from: `"Maison Model X website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // change this if enquiries should go to a different inbox
      replyTo: email,
      subject: `New project brief: ${brand} (${category})`,
      html: `<table cellpadding="8" style="border-collapse:collapse;font-family:Arial,sans-serif">${rows
        .map(([k, v]) => `<tr><td style="border-bottom:1px solid #ddd"><b>${esc(k)}</b></td><td style="border-bottom:1px solid #ddd">${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
        .join("")}</table>`,
      attachments,
    });

    // 2. Automatic confirmation to the visitor (failure here is logged but does not break the form)
    try {
      await transporter.sendMail({
        from: `"Maison Model X" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "We have received your brief — Maison Model X",
        text: `Thank you, ${firstName(name)}.\n\nWe have received your project brief. Our studio will review it and get back to you with a recommended creative scope within 24 hours.\n\nThere is nothing more you need to do for now.\n\nMaison Model X\nWhere elegance transcends reality.\n\nThis is an automated message. Please do not reply to this email.`,
        html: confirmationHtml(name),
      });
    } catch (err) {
      console.error("Confirmation email failed:", err);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return fail(500, "Send failed");
  }
};

export const config = {
  path: "/api/send-brief",
  rateLimit: { windowLimit: 5, windowSize: 180, aggregateBy: ["ip", "domain"] },
};
