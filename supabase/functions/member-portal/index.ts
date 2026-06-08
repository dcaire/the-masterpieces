// Member portal data service. A singer opens the app with ?member=<portal_token>;
// the portal calls this function with that token. Using the service role, it
// returns ONLY that singer's events + program (with download links), and lets
// them RSVP — without exposing any of the manager's data.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

const URL = Deno.env.get("SUPABASE_URL");
const SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

async function rest(path: string, opts: RequestInit = {}) {
  const r = await fetch(`${URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: SVC!, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  return r;
}
const sanitizeToken = (t: string) => /^[0-9a-fA-F-]{10,40}$/.test(t) ? t : "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!URL || !SVC) return json({ error: "Server not configured" }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const token = sanitizeToken(String(body?.token || ""));
  if (!token) return json({ error: "This link isn’t valid." }, 400);

  const members = await (await rest(`roster?portal_token=eq.${token}&select=id,name,voice_part,singer_type,active&limit=1`)).json();
  const member = Array.isArray(members) ? members[0] : null;
  if (!member) return json({ error: "This link isn’t valid." }, 404);

  // RSVP to an event
  if (body?.action === "rsvp") {
    const eventId = Number(body?.eventId);
    const response = String(body?.response || "");
    if (!eventId || !["yes", "no", "pending"].includes(response)) return json({ error: "Bad request" }, 400);
    const ex = await (await rest(`member_availability?roster_id=eq.${member.id}&event_id=eq.${eventId}&select=id`)).json();
    if (Array.isArray(ex) && ex[0]) {
      await rest(`member_availability?id=eq.${ex[0].id}`, { method: "PATCH", body: JSON.stringify({ response, responded_at: new Date().toISOString() }) });
    } else {
      await rest(`member_availability`, { method: "POST", body: JSON.stringify({ event_id: eventId, roster_id: member.id, response, responded_at: new Date().toISOString() }) });
    }
    return json({ ok: true });
  }

  // Load the singer's events + programs
  const avail = await (await rest(`member_availability?roster_id=eq.${member.id}&event_id=not.is.null&select=event_id,response`)).json();
  const respByEv: Record<string, string> = {};
  for (const a of (avail || [])) respByEv[a.event_id] = a.response;
  const evIds = (avail || []).map((a: any) => a.event_id);

  let events: any[] = [];
  if (evIds.length) {
    events = await (await rest(`events?id=in.(${evIds.join(",")})&status=neq.lost&select=id,title,event_date,event_time,venue,status,songs_planned&order=event_date.asc`)).json();
  }
  const songIds = [...new Set(events.flatMap((e) => e.songs_planned || []))];
  let songs: any[] = [];
  if (songIds.length) {
    songs = await (await rest(`music_library?id=in.(${songIds.join(",")})&select=id,title,arranger,voice_parts,pages,file_url`)).json();
  }
  const songById: Record<string, any> = {};
  for (const s of (songs || [])) songById[s.id] = s;

  const out = (events || []).map((e) => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date,
    event_time: e.event_time,
    venue: e.venue,
    status: e.status,
    myResponse: respByEv[e.id] || "pending",
    songs: (e.songs_planned || []).map((id: any) => songById[id]).filter(Boolean),
  }));

  return json({ member: { name: member.name, voice_part: member.voice_part, singer_type: member.singer_type }, events: out });
});
