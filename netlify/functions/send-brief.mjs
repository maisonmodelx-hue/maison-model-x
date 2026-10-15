import nodemailer from "nodemailer";

const MAX_FILE = 4 * 1024 * 1024; // Netlify Functions accept roughly 6 MB per request
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

function confirmationHtml(name) {
  const first = esc(name.split(" ")[0] || "there");
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

  try {
    const data = await req.formData();
    if (data.get("website")) return Response.json({ ok: true }); // spam trap, silently ignore

    const get = (k) => String(data.get(k) ?? "").trim();
    const name = get("name"), brand = get("brand"), email = get("email");
    const category = get("category"), description = get("description");
    if (!name || !brand || !email || !category || !description || !validEmail(email)) {
      return Response.json({ ok: false, error: "Missing or invalid fields" }, { status: 400 });
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
        text: `Thank you, ${name.split(" ")[0] || "there"}.\n\nWe have received your project brief. Our studio will review it and get back to you with a recommended creative scope within 24 hours.\n\nThere is nothing more you need to do for now.\n\nMaison Model X\nWhere elegance transcends reality.\n\nThis is an automated message. Please do not reply to this email.`,
        html: confirmationHtml(name),
      });
    } catch (err) {
      console.error("Confirmation email failed:", err);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ ok: false, error: "Send failed" }, { status: 500 });
  }
};

export const config = { path: "/api/send-brief" };
