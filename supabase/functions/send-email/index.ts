// Sends a fully-formatted (HTML) email from The Masterpieces' Gmail account
// via SMTP. Requires two secrets to be set on the Supabase project:
//   GMAIL_USER          e.g. themasterpieces@gmail.com
//   GMAIL_APP_PASSWORD  a Google "App Password" (Account → Security → App passwords)
// Invoked from the app with: sb.functions.invoke('send-email', { body: { to, subject, html, text } })
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { to, subject, html, text, replyTo, ping } = body || {};

  const user = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");

  // Health check: report whether credentials are configured (no email sent).
  if (ping) return json({ ok: true, configured: !!(user && pass), from: user || null });

  const recipients = Array.isArray(to)
    ? to
    : String(to || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!recipients.length) return json({ error: "No recipients" }, 400);

  if (!user || !pass) {
    return json({ error: "Email is not configured yet (missing GMAIL_USER / GMAIL_APP_PASSWORD)." }, 503);
  }

  try {
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: { username: user, password: pass },
      },
    });
    await client.send({
      from: `The Masterpieces <${user}>`,
      to: recipients,
      replyTo: replyTo || user,
      subject: subject || "(no subject)",
      content: text || " ",
      html: html || undefined,
    });
    await client.close();
    return json({ ok: true, sent: recipients.length });
  } catch (e) {
    return json({ error: String((e && (e as Error).message) || e) }, 500);
  }
});
