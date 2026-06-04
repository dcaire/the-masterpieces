// Email follow-up templates for Beth. Each builder returns { subject, text, html }.
//  - `text` is a clean plain-text version used for mailto: links (opens Beth's mail app).
//  - `html` is a vibrant, email-safe (inline-styled) version for the in-app preview
//    and the "Copy formatted" button (paste into Gmail/Outlook keeps the styling).

const SIGNATURE_NAME = 'Beth';
const SIGNATURE_ROLE = 'Manager, The Masterpieces';
const SIGNATURE_TAG = 'A mixed quartet with piano accompaniment — representing Texas Master Chorale';
const TAX_NOTE = 'Our performance fee is simply a tax-deductible donation to Texas Master Chorale.';

const fmtDate = (d) => {
  if (!d) return 'a date that works for you';
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return d; }
};
const money = (n) => '$' + Number(n || 0).toLocaleString();
const first = (name) => (name || '').trim().split(' ')[0] || 'there';

// ---- Shared vibrant HTML shell -------------------------------------------------
function shell(bodyHtml, accent = ['#7C3AED', '#EC4899']) {
  return `<div style="margin:0;padding:24px;background:#f4f1fb;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(124,58,237,.12)">
    <div style="background:linear-gradient(135deg,${accent[0]},${accent[1]});padding:34px 32px 30px;text-align:center">
      <div style="display:inline-block;width:54px;height:54px;line-height:54px;border-radius:16px;background:rgba(255,255,255,.18);color:#fff;font-size:26px;font-weight:700;font-family:Georgia,serif">M</div>
      <div style="margin-top:14px;color:#fff;font-size:22px;font-weight:700;letter-spacing:.3px;font-family:Georgia,serif">The Masterpieces</div>
      <div style="margin-top:4px;color:rgba(255,255,255,.85);font-size:12px;letter-spacing:1.5px;text-transform:uppercase">Mixed Quartet</div>
    </div>
    <div style="padding:32px">${bodyHtml}</div>
    <div style="padding:22px 32px;background:#faf8ff;border-top:1px solid #eee;text-align:center">
      <div style="font-size:15px;font-weight:700;color:#1f2937">${SIGNATURE_NAME}</div>
      <div style="font-size:12.5px;color:#7C3AED;font-weight:600">${SIGNATURE_ROLE}</div>
      <div style="font-size:11.5px;color:#9ca3af;margin-top:8px;font-style:italic">${SIGNATURE_TAG}</div>
      <div style="font-size:10.5px;color:#b6abd4;margin-top:6px">${TAX_NOTE}</div>
    </div>
  </div>
</div>`;
}

const p = (t) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#374151">${t}</p>`;
const button = (label, accent) => `<div style="text-align:center;margin:26px 0 6px"><span style="display:inline-block;background:linear-gradient(135deg,${accent[0]},${accent[1]});color:#fff;padding:13px 30px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none">${label}</span></div>`;
function detailCard(rows, accent) {
  const items = rows.map(([k, v]) => `<tr><td style="padding:7px 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;font-weight:700;width:38%">${k}</td><td style="padding:7px 0;font-size:14px;color:#1f2937;font-weight:600">${v}</td></tr>`).join('');
  return `<table style="width:100%;border-collapse:collapse;background:#faf8ff;border:1px solid #ede9fe;border-radius:14px;padding:6px 18px;margin:6px 0 20px"><tbody style="display:block;padding:6px 18px">${items}</tbody></table>`;
}

// ---- Templates -----------------------------------------------------------------
export const TEMPLATES = {
  outreach: { label: 'Initial Outreach', accent: ['#7C3AED', '#EC4899'], hint: 'Warm first reply to a new inquiry' },
  followup: { label: 'Gentle Follow-up', accent: ['#06B6D4', '#3B82F6'], hint: 'Friendly nudge if you haven’t heard back' },
  confirmation: { label: 'Booking Confirmation', accent: ['#10B981', '#06B6D4'], hint: 'Lock in the details once confirmed' },
  thanks: { label: 'Thank You', accent: ['#F59E0B', '#FB7185'], hint: 'A note of thanks after the performance' },
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
      ...(donation ? [`  Donation: ${donation} (tax-deductible to Texas Master Chorale)`] : []),
      ``,
      `Please let me know if anything looks off, or if there are particular pieces you'd love us to include — jazz, swing, pop, or something seasonal. We'll arrive early to set up the piano and warm up.`,
      `We can't wait to sing for you.`,
    ];
    const rows = [['Event', evType], ['Date', when]];
    if (donation) rows.push(['Donation', `${donation} (tax-deductible)`]);
    if (lead.phone) rows.push(['Contact', lead.phone]);
    html = shell(p(`Hi ${first(name)},`) + p(`Wonderful news — we're all set! <strong>The Masterpieces</strong> are confirmed to perform for <strong>${org}</strong>. Here's what we have on file:`) + detailCard(rows, accent) + p(`Please let me know if there are particular pieces you'd love us to include — jazz, swing, pop, or something seasonal. We'll arrive early to set up the piano and warm up.`) + p(`As a reminder, ${TAX_NOTE.charAt(0).toLowerCase() + TAX_NOTE.slice(1)}`) + p(`We can't wait to sing for you. 🎵`), accent);
  } else if (type === 'thanks') {
    subject = `Thank you from The Masterpieces`;
    lines = [
      `Hi ${first(name)},`,
      `On behalf of the whole quartet — thank you for having The Masterpieces at ${org}. It was a joy to share music with you and your guests.`,
      `If photos or recordings are floating around, we'd love to see them. And if you ever need us again, we're only a note away.`,
      `With gratitude and song,`,
    ];
    html = shell(p(`Hi ${first(name)},`) + p(`On behalf of the whole quartet — <strong>thank you</strong> for having The Masterpieces at <strong>${org}</strong>. It was a joy to share music with you and your guests.`) + p(`If photos or recordings are floating around, we'd love to see them. And if you ever need us again, we're only a note away.`) + p(`With gratitude and song. 🎼`), accent);
  } else { // outreach
    subject = `The Masterpieces — thank you for reaching out!`;
    lines = [
      `Hi ${first(name)},`,
      `Thank you so much for thinking of The Masterpieces for ${evType === 'your event' ? 'your event' : evType} at ${org}! We're a mixed quartet with piano accompaniment, representing Texas Master Chorale for events where a full chorus isn't feasible.`,
      `We sing jazz, swing, and pop from the 1930s right up to today, plus seasonal Christmas and patriotic favorites — and we'll happily tailor the program to your event.`,
      ...(lead.event_date ? [`I see you're looking at ${when} — I'd be glad to check our calendar and put together a few thoughts on a program.`] : [`Whenever you have a date in mind, I'd be glad to check our calendar and sketch out a program.`]),
      `Could you share a little about the occasion and how long you'd like us to sing? ${TAX_NOTE}`,
      `Looking forward to it!`,
    ];
    html = shell(p(`Hi ${first(name)},`) + p(`Thank you so much for thinking of <strong>The Masterpieces</strong> for <strong>${evType}</strong> at <strong>${org}</strong>! We're a mixed quartet with piano accompaniment, representing <strong>Texas Master Chorale</strong> for events where a full chorus isn't feasible.`) + p(`We sing jazz, swing, and pop from the 1930s right up to today, plus seasonal Christmas and patriotic favorites — and we'll happily tailor the program to your event.`) + p(lead.event_date ? `I see you're looking at <strong>${when}</strong> — I'd be glad to check our calendar and put together a few thoughts on a program.` : `Whenever you have a date in mind, I'd be glad to check our calendar and sketch out a program.`) + p(`Could you share a little about the occasion and how long you'd like us to sing? ${TAX_NOTE}`) + button('Let’s find a date', accent), accent);
  }

  const text = `${lines.join('\n')}\n\n${SIGNATURE_NAME}\n${SIGNATURE_ROLE}\n${SIGNATURE_TAG}`;
  return { subject, text, html };
}

// Availability request sent to the quartet's singers for a specific event.
export function buildAvailabilityEmail(ev) {
  const accent = ['#F59E0B', '#FB7185'];
  const when = fmtDate(ev.event_date);
  const subject = `Are you in? — ${ev.title}`;
  const text = `Hi everyone,\n\nWe have a possible booking and I need to know who's available:\n\n  ${ev.title}\n  ${when}${ev.event_time ? ' at ' + ev.event_time : ''}\n  ${ev.venue || ''}\n\nPlease reply YES, NO, or MAYBE as soon as you can so I can confirm with the client.\n\nThank you!\n\n${SIGNATURE_NAME}\n${SIGNATURE_ROLE}`;
  const rows = [['Event', ev.title], ['Date', when], ...(ev.event_time ? [['Time', ev.event_time]] : []), ...(ev.venue ? [['Venue', ev.venue]] : [])];
  const html = shell(p(`Hi everyone,`) + p(`We have a possible booking and I need to know who's available:`) + detailCard(rows, accent) + p(`Please reply <strong>YES</strong>, <strong>NO</strong>, or <strong>MAYBE</strong> as soon as you can so I can confirm with the client.`) + p(`Thank you! 🎶`), accent);
  return { subject, text, html };
}

export function mailto(to, subject, body) {
  return `mailto:${to || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
