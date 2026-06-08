// Sends a fully-formatted (HTML) email via the Resend API.
// The Resend API key is read from the RESEND_API_KEY env secret if present,
// otherwise from the private app_config table (server-only, RLS-locked).
// Optional overrides (env): RESEND_FROM, REPLY_TO.
// Invoked from the app with: sb.functions.invoke('send-email', { body: { to, subject, html, text } })

const DEFAULT_FROM = "The Masterpieces <info@themasterpieces.org>";
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

function addrOf(s: string) {
  const m = s.match(/<([^>]+)>/);
  return m ? m[1] : s;
}

// Resend key: prefer an env secret, fall back to the app_config table (read with
// the service role, which bypasses RLS).
async function getResendKey(): Promise<string | null> {
  const envKey = Deno.env.get("RESEND_API_KEY");
  if (envKey) return envKey;
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !svc) return null;
    const r = await fetch(`${url}/rest/v1/app_config?key=eq.RESEND_API_KEY&select=value`, {
      headers: { apikey: svc, Authorization: `Bearer ${svc}` },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return rows?.[0]?.value || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { to, subject, html, text, replyTo, ping } = body || {};

  const apiKey = await getResendKey();
  const from = Deno.env.get("RESEND_FROM") || DEFAULT_FROM;
  const replyAddr = replyTo || Deno.env.get("REPLY_TO") || DEFAULT_REPLY_TO;

  // Health check: report whether the API key is configured (no email sent).
  if (ping) return json({ ok: true, configured: !!apiKey, from: addrOf(from) });

  const recipients = Array.isArray(to)
    ? to
    : String(to || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!recipients.length) return json({ error: "No recipients" }, 400);

  if (!apiKey) {
    return json({ error: "Email is not configured yet (no Resend API key)." }, 503);
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
