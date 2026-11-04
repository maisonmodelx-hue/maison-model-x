import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import nodemailer from "nodemailer";
import handler, { config } from "../netlify/functions/send-brief.mjs";

process.env.GMAIL_USER = "studio@example.com";
process.env.GMAIL_PASS = "not-a-real-password";

const PNG = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
const PDF = Buffer.from("%PDF-1.7\n");

let sent;
beforeEach(() => {
  sent = [];
  nodemailer.createTransport = () => ({ sendMail: async (mail) => { sent.push(mail); } });
});

function form(overrides = {}, files = []) {
  const fields = {
    name: "Asha Rao", brand: "Nooré", email: "asha@example.com", category: "Jewellery",
    products: "12", launch: "2027-01-15", description: "A new collection.", ...overrides,
  };
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) if (value !== null) body.append(key, value);
  for (const [bytes, name, type] of files) body.append("reference", new File([bytes], name, { type }));
  return body;
}

const post = (body, origin = "https://maisonmodelx.com") =>
  handler(new Request("https://maisonmodelx.com/api/send-brief", {
    method: "POST", body, headers: origin ? { origin } : {},
  }));

test("a valid brief emails the studio and confirms to the visitor", async () => {
  const res = await post(form());
  assert.equal(res.status, 200);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].to, "studio@example.com");
  assert.equal(sent[0].replyTo, "asha@example.com");
  assert.equal(sent[1].to, "asha@example.com");
  assert.match(sent[1].text, /^Thank you, Asha\./);
});

test("only POST is accepted", async () => {
  const res = await handler(new Request("https://maisonmodelx.com/api/send-brief"));
  assert.equal(res.status, 405);
});

test("submissions from other websites or with no origin are rejected", async () => {
  assert.equal((await post(form(), "https://evil.example")).status, 403);
  assert.equal((await post(form(), "https://maisonmodelx.com.evil.example")).status, 403);
  assert.equal((await post(form(), null)).status, 403);
  assert.equal(sent.length, 0);
});

test("the spam trap accepts silently and sends nothing", async () => {
  const res = await post(form({ website: "http://spam.example" }));
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test("addresses that could reach extra recipients are rejected", async () => {
  for (const email of ["a@b.com,c@d.com", "a@b.com;c@d.com", "x<a@b.com>", '"a"@b.com', "a@b.com\nbcc:c@d.com", "not-an-email"]) {
    assert.equal((await post(form({ email }))).status, 400, email);
  }
  assert.equal(sent.length, 0);
});

test("missing fields and values outside the form's options are rejected", async () => {
  for (const bad of [{ name: null }, { brand: "" }, { category: "Anything" }, { products: "lots" }, { launch: "soon" }, { description: "  " }]) {
    assert.equal((await post(form(bad))).status, 400, JSON.stringify(bad));
  }
  assert.equal(sent.length, 0);
});

test("line breaks can't inject email headers through the subject", async () => {
  await post(form({ brand: "Nooré\r\nBcc: victim@example.com" }));
  assert.doesNotMatch(sent[0].subject, /[\r\n]/);
});

test("HTML in a brief is escaped in the studio's email", async () => {
  await post(form({ description: '<img src=x onerror="steal()">' }));
  assert.doesNotMatch(sent[0].html, /<img/);
  assert.match(sent[0].html, /&lt;img/);
});

test("a link in the name never reaches the confirmation email", async () => {
  for (const name of ["https://evil.example/login", "<b>Win</b>", "visit.evil.example now"]) {
    sent = [];
    await post(form({ name }));
    assert.match(sent[1].text, /^Thank you, there\./, name);
    assert.doesNotMatch(sent[1].html, /evil|<b>Win/, name);
  }
});

test("very long values are cut down", async () => {
  await post(form({ brand: "x".repeat(10000) }));
  assert.ok(sent[0].subject.length < 200);
});

test("unknown deliverables are dropped", async () => {
  const body = form();
  body.append("deliverables", "Campaign Film");
  body.append("deliverables", "<script>");
  await post(body);
  assert.match(sent[0].html, /Campaign Film/);
  assert.doesNotMatch(sent[0].html, /<script|&lt;script/);
});

test("attachments are typed from their real bytes and get safe names", async () => {
  const res = await post(form({}, [[PNG, "../../..\\photo (final).png", "image/png"], [PDF, "brief.pdf", "application/pdf"]]));
  assert.equal(res.status, 200);
  assert.deepEqual(
    sent[0].attachments.map((a) => [a.filename, a.contentType]),
    [["photo final.png", "image/png"], ["brief.pdf", "application/pdf"]],
  );
});

test("disguised and scriptable files are rejected", async () => {
  const cases = [
    [Buffer.from("MZ executable"), "photo.png", "image/png"],
    [Buffer.from("<svg onload=alert(1)>"), "logo.svg", "image/svg+xml"],
    [Buffer.from("<html><script>"), "brief.pdf", "application/pdf"],
  ];
  for (const file of cases) assert.equal((await post(form({}, [file]))).status, 415, file[1]);
  assert.equal(sent.length, 0);
});

test("uploads over the total size limit are rejected", async () => {
  const large = Buffer.concat([PNG, Buffer.alloc(2.5 * 1024 * 1024)]);
  const res = await post(form({}, [[large, "a.png", "image/png"], [large, "b.png", "image/png"]]));
  assert.equal(res.status, 413);
  assert.equal(sent.length, 0);
});

test("only the first six files are kept", async () => {
  const files = Array.from({ length: 8 }, (_, i) => [PNG, `${i}.png`, "image/png"]);
  await post(form({}, files));
  assert.equal(sent[0].attachments.length, 6);
});

test("the endpoint declares a rate limit", () => {
  assert.equal(config.path, "/api/send-brief");
  assert.deepEqual(config.rateLimit.aggregateBy, ["ip", "domain"]);
  assert.ok(config.rateLimit.windowLimit <= 10);
});
