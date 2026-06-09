// Member portal data service. A singer opens the app with ?member=<portal_token>;
// the portal calls this function with that token. Using the service role, it
// returns ONLY that singer's events + program (with download links) + the rest
// of the lineup + the director's contact, and lets them RSVP — without exposing
// any of the manager's data.

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
const jget = async (path: string) => { const r = await rest(path); return r.ok ? await r.json() : []; };
const sanitizeToken = (t: string) => /^[0-9a-fA-F-]{10,40}$/.test(t) ? t : "";
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!URL || !SVC) return json({ error: "Server not configured" }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const token = sanitizeToken(String(body?.token || ""));
  if (!token) return json({ error: "This link isn’t valid." }, 400);

  const members = await jget(`roster?portal_token=eq.${token}&select=id,name,voice_part,singer_type,active&limit=1`);
  const member = Array.isArray(members) ? members[0] : null;
  if (!member) return json({ error: "This link isn’t valid." }, 404);

  // RSVP to an event
  if (body?.action === "rsvp") {
    const eventId = Number(body?.eventId);
    const response = String(body?.response || "");
    if (!eventId || !["yes", "no", "pending"].includes(response)) return json({ error: "Bad request" }, 400);
    const ex = await jget(`member_availability?roster_id=eq.${member.id}&event_id=eq.${eventId}&select=id`);
    if (Array.isArray(ex) && ex[0]) {
      await rest(`member_availability?id=eq.${ex[0].id}`, { method: "PATCH", body: JSON.stringify({ response, responded_at: new Date().toISOString() }) });
    } else {
      await rest(`member_availability`, { method: "POST", body: JSON.stringify({ event_id: eventId, roster_id: member.id, response, responded_at: new Date().toISOString() }) });
    }
    return json({ ok: true });
  }

  // Toggle a blackout date (singer marks/unmarks themselves unavailable)
  if (body?.action === "toggleBlock") {
    const date = String(body?.date || "");
    if (!isDate(date)) return json({ error: "Bad date" }, 400);
    const ex = await jget(`unavailability?roster_id=eq.${member.id}&date=eq.${date}&select=id`);
    if (Array.isArray(ex) && ex[0]) {
      await rest(`unavailability?id=eq.${ex[0].id}`, { method: "DELETE" });
      return json({ ok: true, blocked: false });
    }
    await rest(`unavailability`, { method: "POST", body: JSON.stringify({ roster_id: member.id, date }) });
    return json({ ok: true, blocked: true });
  }

  // The singer's events
  const avail = await jget(`member_availability?roster_id=eq.${member.id}&event_id=not.is.null&select=event_id,response`);
  const respByEv: Record<string, string> = {};
  for (const a of avail) respByEv[a.event_id] = a.response;
  const evIds = avail.map((a: any) => a.event_id);

  let events: any[] = [];
  let lineupRows: any[] = [];
  if (evIds.length) {
    events = await jget(`events?id=in.(${evIds.join(",")})&status=neq.lost&select=id,title,event_date,event_time,venue,status,songs_planned&order=event_date.asc`);
    lineupRows = await jget(`member_availability?event_id=in.(${evIds.join(",")})&response=in.(yes,pending)&select=event_id,roster_id,response`);
  }

  // people in those lineups
  const rosterIds = [...new Set(lineupRows.map((r) => r.roster_id))];
  let people: any[] = [];
  if (rosterIds.length) people = await jget(`roster?id=in.(${rosterIds.join(",")})&select=id,name,voice_part,singer_type`);
  const personById: Record<string, any> = {};
  for (const p of people) personById[p.id] = p;
  const lineupByEv: Record<string, any[]> = {};
  for (const r of lineupRows) {
    const p = personById[r.roster_id];
    if (!p || p.singer_type === "director") continue;
    (lineupByEv[r.event_id] ||= []).push({ name: p.name, voice_part: p.voice_part, response: r.response, me: r.roster_id === member.id });
  }

  // program songs
  const songIds = [...new Set(events.flatMap((e) => e.songs_planned || []))];
  let songs: any[] = [];
  if (songIds.length) songs = await jget(`music_library?id=in.(${songIds.join(",")})&select=id,title,arranger,voice_parts,pages,file_url`);
  const songById: Record<string, any> = {};
  for (const s of songs) songById[s.id] = s;

  const out = events.map((e) => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date,
    event_time: e.event_time,
    venue: e.venue,
    status: e.status,
    myResponse: respByEv[e.id] || "pending",
    lineup: (lineupByEv[e.id] || []).sort((a, b) => (b.me ? 1 : 0) - (a.me ? 1 : 0)),
    songs: (e.songs_planned || []).map((id: any) => songById[id]).filter(Boolean),
  }));

  // director / manager contact
  const dirs = await jget(`roster?singer_type=eq.director&select=name,email,phone&limit=1`);
  const director = Array.isArray(dirs) ? dirs[0] || null : null;

  // the singer's own blackout dates
  const blk = await jget(`unavailability?roster_id=eq.${member.id}&select=date&order=date.asc`);
  const blackouts = (blk || []).map((b: any) => b.date);

  return json({ member: { name: member.name, voice_part: member.voice_part, singer_type: member.singer_type }, director, events: out, blackouts });
});
