import nodemailer from "nodemailer";

const MAX_FILE = 4 * 1024 * 1024; // Netlify Functions accept roughly 6 MB per request
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const data = await req.formData();
    if (data.get("website")) return Response.json({ ok: true }); // spam trap, silently ignore

    const get = (k) => String(data.get(k) ?? "").trim();
    const name = get("name"), brand = get("brand"), email = get("email");
    const category = get("category"), description = get("description");
    if (!name || !brand || !email || !category || !description) {
      return Response.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const attachments = [];
    const file = data.get("reference");
    if (file && typeof file === "object" && file.size > 0) {
      if (file.size > MAX_FILE) return Response.json({ ok: false, error: "File too large" }, { status: 413 });
      attachments.push({ filename: file.name, content: Buffer.from(await file.arrayBuffer()) });
    }

    const rows = [
      ["Name", name], ["Brand", brand], ["Email", email], ["WhatsApp", get("whatsapp")],
      ["Category", category], ["Products / designs", get("products")], ["Launch date", get("launch")],
      ["Deliverables", data.getAll("deliverables").join(", ")], ["Budget", get("budget")],
      ["Description", get("description")],
    ];

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });

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

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ ok: false, error: "Send failed" }, { status: 500 });
  }
};

export const config = { path: "/api/send-brief" };