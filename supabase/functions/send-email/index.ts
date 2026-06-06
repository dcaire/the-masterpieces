// Sends a fully-formatted (HTML) email via the Resend API.
// Only ONE secret is required on the Supabase project:
//   RESEND_API_KEY   (from resend.com — Settings → API Keys)
// Optional overrides:
//   RESEND_FROM      the From header, e.g. "The Masterpieces <info@yourdomain.com>"
//                    (defaults to Resend's shared sender until a domain is verified)
//   REPLY_TO         where replies go (defaults to the group's Gmail)
// Invoked from the app with: sb.functions.invoke('send-email', { body: { to, subject, html, text } })

const DEFAULT_FROM = "The Masterpieces <onboarding@resend.dev>";
const DEFAULT_REPLY_TO = "themasterpiecesinfo@gmail.com";

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

// Pull the bare email address out of a "Name <addr>" string for display.
function addrOf(s: string) {
  const m = s.match(/<([^>]+)>/);
  return m ? m[1] : s;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { to, subject, html, text, replyTo, ping } = body || {};

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM") || DEFAULT_FROM;
  const replyAddr = replyTo || Deno.env.get("REPLY_TO") || DEFAULT_REPLY_TO;

  // Health check: report whether the API key is configured (no email sent).
  if (ping) return json({ ok: true, configured: !!apiKey, from: addrOf(from) });

  const recipients = Array.isArray(to)
    ? to
    : String(to || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!recipients.length) return json({ error: "No recipients" }, 400);

  if (!apiKey) {
    return json({ error: "Email is not configured yet (missing RESEND_API_KEY)." }, 503);
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: replyAddr,
        subject: subject || "(no subject)",
        html: html || undefined,
        text: text || " ",
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: data?.message || `Send failed (${r.status})` }, 502);
    return json({ ok: true, sent: recipients.length, id: data?.id });
  } catch (e) {
    return json({ error: String((e && (e as Error).message) || e) }, 500);
  }
});
