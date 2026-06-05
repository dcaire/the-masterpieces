// Email follow-up templates for Beth. Each builder returns { subject, text, html }.
//  - `text` is a clean plain-text version used for mailto: links (opens Beth's mail app).
//  - `html` is a vibrant, email-safe (inline-styled) version for the in-app preview
//    and the "Copy formatted" button (paste into Gmail/Outlook keeps the styling).

const SIGNATURE_NAME = 'Beth';
const SIGNATURE_ROLE = 'Manager, The Masterpieces';
const SIGNATURE_TAG = 'A mixed vocal ensemble';
// Brand logomark (hosted PNG — renders in all mail clients; SVG/local files do not).
const LOGO_URL = 'https://the-masterpieces-app.netlify.app/logomark.png';
// Optional: paste a public image URL (e.g. the group photo) to show it atop every email instead of the logo.
const BAND_PHOTO_URL = '';

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// "Additional notes" from the booking, shown (when present) in every template.
const noteBlockHtml = (t) => t && t.trim()
  ? `<div style="margin:6px 0 20px;padding:13px 16px;background:#faf5e9;border-left:3px solid #e8b430;border-radius:8px">
      <div style="font-size:10.5px;letter-spacing:.6px;text-transform:uppercase;color:#9ca3af;font-weight:700;margin-bottom:5px">Notes</div>
      <div style="font-size:13.5px;line-height:1.6;color:#4b5563">${esc(t.trim()).replace(/\n/g, '<br>')}</div></div>`
  : '';
const noteLines = (t) => t && t.trim() ? ['', 'Notes:', t.trim()] : [];

const fmtDate = (d) => {
  if (!d) return 'a date that works for you';
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return d; }
};
const money = (n) => '$' + Number(n || 0).toLocaleString();
const first = (name) => (name || '').trim().split(' ')[0] || 'there';

// ---- Shared vibrant HTML shell -------------------------------------------------
const FIVE_BAR = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr><td width="20%" height="3" style="background:#e8b430"></td><td width="20%" height="3" style="background:#e07830"></td><td width="20%" height="3" style="background:#d03a6a"></td><td width="20%" height="3" style="background:#20a89a"></td><td width="20%" height="3" style="background:#7b52c4"></td></tr></table>`;

function shell(bodyHtml, accent = ['#0d1a30', '#1c3564']) {
  return `<div style="margin:0;padding:24px;background:#fdf8ee;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a2e">
  <div style="max-width:560px;margin:0 auto;background:#fffdf8;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(13,26,48,.16)">
    ${FIVE_BAR}
    <div style="background:#0d1a30;padding:34px 32px 30px;text-align:center">
      ${BAND_PHOTO_URL
        ? `<img src="${BAND_PHOTO_URL}" alt="The Masterpieces" width="120" style="width:120px;height:120px;border-radius:16px;object-fit:cover;border:3px solid rgba(232,180,48,.5)" />`
        : `<img src="${LOGO_URL}" alt="The Masterpieces" width="72" height="72" style="display:inline-block;width:72px;height:72px;border-radius:18px" />`}
      <div style="margin-top:8px;color:#e8b430;font-size:10px;letter-spacing:5px;text-transform:uppercase">The</div>
      <div style="margin-top:2px;color:#fdf8ee;font-size:24px;font-weight:700;letter-spacing:3px;text-transform:uppercase;font-family:Georgia,serif">Masterpieces</div>
      <div style="margin-top:6px;color:rgba(232,180,48,.85);font-size:11px;letter-spacing:2px;text-transform:uppercase">Vocal Ensemble</div>
    </div>
    <div style="padding:32px">${bodyHtml}<!--NOTES--></div>
    <div style="padding:22px 32px;background:#faf5e9;border-top:1px solid #efe6d4;text-align:center">
      <div style="font-size:15px;font-weight:700;color:#1a1a2e;font-family:Georgia,serif">${SIGNATURE_NAME}</div>
      <div style="font-size:12.5px;color:#1c3564;font-weight:600">${SIGNATURE_ROLE}</div>
      <div style="font-size:11.5px;color:#6e6e82;margin-top:8px;font-style:italic">${SIGNATURE_TAG}</div>
    </div>
  </div>
</div>`;
}

const p = (t) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#374151">${t}</p>`;
const button = (label, accent) => `<div style="text-align:center;margin:26px 0 6px"><span style="display:inline-block;background:linear-gradient(135deg,${accent[0]},${accent[1]});color:#fff;padding:13px 30px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none">${label}</span></div>`;
function detailCard(rows, accent) {
  const items = rows.map(([k, v]) => `<tr><td style="padding:7px 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;font-weight:700;width:38%">${k}</td><td style="padding:7px 0;font-size:14px;color:#1a1a2e;font-weight:600">${v}</td></tr>`).join('');
  return `<table style="width:100%;border-collapse:collapse;background:#faf5e9;border:1px solid #efe6d4;border-radius:14px;padding:6px 18px;margin:6px 0 20px"><tbody style="display:block;padding:6px 18px">${items}</tbody></table>`;
}

// ---- Templates -----------------------------------------------------------------
export const TEMPLATES = {
  intro: { label: 'Cold Intro', accent: ['#0d1a30', '#1c3564'], hint: 'Introduce the ensemble to a new prospect' },
  outreach: { label: 'Initial Outreach', accent: ['#0d1a30', '#1c3564'], hint: 'Warm first reply to a new inquiry' },
  followup: { label: 'Gentle Follow-up', accent: ['#20a89a', '#3898d4'], hint: 'Friendly nudge if you haven’t heard back' },
  confirmation: { label: 'Booking Confirmation', accent: ['#20a89a', '#1c8f82'], hint: 'Lock in the details once confirmed' },
  thanks: { label: 'Thank You', accent: ['#e8b430', '#e07830'], hint: 'A note of thanks after the performance' },
};

export function buildEmail(type, lead) {
  const name = lead.contact_name || '';
  const org = lead.organization || 'your organization';
  const when = fmtDate(lead.event_date);
  const evType = lead.event_type || 'your event';
  const donation = lead.expected_donation ? money(lead.expected_donation) : null;
  const accent = (TEMPLATES[type] || TEMPLATES.outreach).accent;

  let subject, lines, html;

  if (type === 'followup') {
    subject = `Following up — The Masterpieces for ${org}`;
    lines = [
      `Hi ${first(name)},`,
      `I wanted to gently follow up on my earlier note about having The Masterpieces perform for ${evType === 'your event' ? 'your upcoming event' : evType} at ${org}.`,
      `We'd be honored to be part of it, and I'd love to answer any questions about our repertoire, scheduling, or what a typical program looks like.`,
      `Is there a good time this week for a quick call? Just reply and let me know.`,
    ];
    html = shell(p(`Hi ${first(name)},`) + p(`I wanted to gently follow up on my earlier note about having <strong>The Masterpieces</strong> perform for <strong>${evType}</strong> at <strong>${org}</strong>.`) + p(`We'd be honored to be part of it, and I'd love to answer any questions about our repertoire, scheduling, or what a typical program looks like.`) + p(`Is there a good time this week for a quick call?`) + button('Reply to schedule a call', accent), accent);
  } else if (type === 'confirmation') {
    subject = `Confirmed — The Masterpieces at ${org}`;
    lines = [
      `Hi ${first(name)},`,
      `Wonderful news — we're all set! The Masterpieces are confirmed to perform for ${org}. Here are the details we have on file:`,
      ``,
      `  Event:    ${evType}`,
      `  Date:     ${when}`,
      ...(donation ? [`  Fee:      ${donation}`] : []),
      ``,
      `Please let me know if anything looks off, or if there are particular pieces you'd love us to include — jazz, swing, pop, or something seasonal. We'll arrive early to warm up.`,
      `We can't wait to sing for you.`,
    ];
    const rows = [['Event', evType], ['Date', when]];
    if (donation) rows.push(['Fee', donation]);
    if (lead.phone) rows.push(['Contact', lead.phone]);
    html = shell(p(`Hi ${first(name)},`) + p(`Wonderful news — we're all set! <strong>The Masterpieces</strong> are confirmed to perform for <strong>${org}</strong>. Here's what we have on file:`) + detailCard(rows, accent) + p(`Please let me know if there are particular pieces you'd love us to include — jazz, swing, pop, or something seasonal. We'll arrive early to warm up.`) + p(`We can't wait to sing for you. 🎵`), accent);
  } else if (type === 'thanks') {
    subject = `Thank you from The Masterpieces`;
    lines = [
      `Hi ${first(name)},`,
      `On behalf of the whole ensemble — thank you for having The Masterpieces at ${org}. It was a joy to share music with you and your guests.`,
      `If photos or recordings are floating around, we'd love to see them. And if you ever need us again, we're only a note away.`,
      `With gratitude and song,`,
    ];
    html = shell(p(`Hi ${first(name)},`) + p(`On behalf of the whole ensemble — <strong>thank you</strong> for having The Masterpieces at <strong>${org}</strong>. It was a joy to share music with you and your guests.`) + p(`If photos or recordings are floating around, we'd love to see them. And if you ever need us again, we're only a note away.`) + p(`With gratitude and song. 🎼`), accent);
  } else if (type === 'intro') {
    subject = `Live music for ${org} — The Masterpieces`;
    lines = [
      `Hi ${first(name)},`,
      `I'm Beth with The Masterpieces, a mixed vocal ensemble here in the Houston area. We bring the energy of a jazz club and the polish of a concert hall to luncheons, club meetings, services, galas, and celebrations.`,
      `We sing jazz, swing, and pop standards from the 1930s to today, plus Christmas and patriotic favorites — and we tailor every program to the occasion.`,
      `I'd love to share how we could create a memorable afternoon for ${org}. Could I send over a short sample set list, or find a few minutes to chat?`,
      `Warmly,`,
    ];
    html = shell(p(`Hi ${first(name)},`) + p(`I'm Beth with <strong>The Masterpieces</strong>, a mixed vocal ensemble here in the Houston area. We bring the energy of a jazz club and the polish of a concert hall to luncheons, club meetings, services, galas, and celebrations.`) + p(`We sing jazz, swing, and pop standards from the 1930s to today, plus Christmas and patriotic favorites — and we tailor every program to the occasion.`) + p(`I'd love to share how we could create a memorable afternoon for <strong>${org}</strong>. Could I send over a short sample set list, or find a few minutes to chat?`) + button('Hear what we do', accent), accent);
  } else { // outreach
    subject = `The Masterpieces — thank you for reaching out!`;
    lines = [
      `Hi ${first(name)},`,
      `Thank you so much for thinking of The Masterpieces for ${evType === 'your event' ? 'your event' : evType} at ${org}! We're a mixed vocal ensemble that brings the energy of a jazz club and the polish of a concert hall to events of every size.`,
      `We sing jazz, swing, and pop from the 1930s right up to today, plus seasonal Christmas and patriotic favorites — and we'll happily tailor the program to your event.`,
      ...(lead.event_date ? [`I see you're looking at ${when} — I'd be glad to check our calendar and put together a few thoughts on a program.`] : [`Whenever you have a date in mind, I'd be glad to check our calendar and sketch out a program.`]),
      `Could you share a little about the occasion and how long you'd like us to sing?`,
      `Looking forward to it!`,
    ];
    html = shell(p(`Hi ${first(name)},`) + p(`Thank you so much for thinking of <strong>The Masterpieces</strong> for <strong>${evType}</strong> at <strong>${org}</strong>! We're a mixed vocal ensemble that brings the energy of a jazz club and the polish of a concert hall to events of every size.`) + p(`We sing jazz, swing, and pop from the 1930s right up to today, plus seasonal Christmas and patriotic favorites — and we'll happily tailor the program to your event.`) + p(lead.event_date ? `I see you're looking at <strong>${when}</strong> — I'd be glad to check our calendar and put together a few thoughts on a program.` : `Whenever you have a date in mind, I'd be glad to check our calendar and sketch out a program.`) + p(`Could you share a little about the occasion and how long you'd like us to sing?`) + button('Let’s find a date', accent), accent);
  }

  const notes = (lead.notes || '').trim();
  html = html.replace('<!--NOTES-->', noteBlockHtml(notes));
  const text = `${[...lines, ...noteLines(notes)].join('\n')}\n\n${SIGNATURE_NAME}\n${SIGNATURE_ROLE}\n${SIGNATURE_TAG}`;
  return { subject, text, html };
}

// Availability request sent to the ensemble's singers for a specific event.
export function buildAvailabilityEmail(ev) {
  const accent = ['#e8b430', '#e07830'];
  const when = fmtDate(ev.event_date);
  const notes = (ev.notes || '').trim();
  const subject = `Are you in? — ${ev.title}`;
  const text = `Hi everyone,\n\nWe have a possible booking and I need to know who's available:\n\n  ${ev.title}\n  ${when}${ev.event_time ? ' at ' + ev.event_time : ''}\n  ${ev.venue || ''}\n${noteLines(notes).join('\n')}\nPlease reply YES, NO, or MAYBE as soon as you can so I can confirm with the client.\n\nThank you!\n\n${SIGNATURE_NAME}\n${SIGNATURE_ROLE}`;
  const rows = [['Event', ev.title], ['Date', when], ...(ev.event_time ? [['Time', ev.event_time]] : []), ...(ev.venue ? [['Venue', ev.venue]] : [])];
  const html = shell(p(`Hi everyone,`) + p(`We have a possible booking and I need to know who's available:`) + detailCard(rows, accent) + noteBlockHtml(notes) + p(`Please reply <strong>YES</strong>, <strong>NO</strong>, or <strong>MAYBE</strong> as soon as you can so I can confirm with the client.`) + p(`Thank you! 🎶`), accent);
  return { subject, text, html };
}

// Program proposal sent to the client for a confirmed/upcoming event.
// `songTitles` is an array of the planned pieces for the event.
export function buildProposalEmail(ev, songTitles = [], clientName = '') {
  const accent = ['#0d1a30', '#1c3564'];
  const when = fmtDate(ev.event_date);
  const subject = `Your program — The Masterpieces at ${ev.title}`;
  const list = songTitles.length ? songTitles : ['(program to be finalized)'];
  const textList = list.map((t, i) => `  ${i + 1}. ${t}`).join('\n');
  const text = [
    `Hi ${clientName ? first(clientName) : 'there'},`,
    `Thank you again for having The Masterpieces! Here's the program we've put together for ${ev.title}${ev.event_date ? ` on ${when}` : ''}:`,
    ``,
    textList,
    ``,
    `We're happy to add, swap, or re-order anything — just let us know if there's a favorite you'd love to hear. Our set blends jazz, swing, and pop with seasonal pieces as the occasion calls for it.`,
    `Looking forward to singing for you!`,
    ...noteLines((ev.notes || '').trim()),
  ].join('\n');
  const htmlList = `<ol style="margin:0 0 18px;padding-left:22px">${list.map(t => `<li style="font-size:14px;line-height:1.8;color:#1a1a2e;font-weight:600">${t}</li>`).join('')}</ol>`;
  const html = shell(
    p(`Hi ${clientName ? first(clientName) : 'there'},`) +
    p(`Thank you again for having <strong>The Masterpieces</strong>! Here's the program we've put together for <strong>${ev.title}</strong>${ev.event_date ? ` on <strong>${when}</strong>` : ''}:`) +
    htmlList +
    p(`We're happy to add, swap, or re-order anything — just let us know if there's a favorite you'd love to hear. Our set blends jazz, swing, and pop with seasonal pieces as the occasion calls for it.`) +
    noteBlockHtml((ev.notes || '').trim()),
    accent);
  return { subject, text, html };
}

export function mailto(to, subject, body) {
  return `mailto:${to || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
