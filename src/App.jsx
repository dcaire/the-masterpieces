import { useState, useEffect, useMemo } from 'react'
import { sb } from './sb'
import { buildEmail, buildAvailabilityEmail, buildProposalEmail, mailto, TEMPLATES } from './email'
import { Defs, Logo, Note, Mail, Cloud, Tablet, Calendar, Users, Sparkle, Phone, Check, Clock, Plus, Trash, Copy, Send, Bell, MapPin, Arrow, Search, Dollar, Pencil, Target, Globe } from './icons'

/* ---------- helpers ---------- */
const fmt = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d || '' } }
const fmtLong = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }) } catch { return d || '' } }
const dU = d => Math.ceil((new Date(d + 'T12:00:00') - new Date()) / 86400000)
const $ = n => '$' + Number(n || 0).toLocaleString()
const ini = n => (n || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
const byEvDate = (a, b) => new Date(a.event_date || '2999-12-31') - new Date(b.event_date || '2999-12-31')

/* ---------- design tokens ---------- */
const G = {
  purple: 'linear-gradient(135deg,#0d1a30,#1c3564)',   // primary (navy)
  teal: 'linear-gradient(135deg,#20a89a,#3898d4)',
  amber: 'linear-gradient(135deg,#e8b430,#e07830)',     // gold → copper
  green: 'linear-gradient(135deg,#20a89a,#1c8f82)',
}
const VP = {
  Soprano: { bg: '#fbe4ec', fg: '#d03a6a', bd: '#f0a8c0', grad: 'linear-gradient(135deg,#e0688f,#d03a6a)' },
  Alto: { bg: '#fbe7d6', fg: '#c0641f', bd: '#f3bd8e', grad: 'linear-gradient(135deg,#e8924a,#e07830)' },
  Tenor: { bg: '#d6f3ef', fg: '#178577', bd: '#8fd8cf', grad: 'linear-gradient(135deg,#3cc0b2,#20a89a)' },
  Bass: { bg: '#eae6fa', fg: '#6a40b0', bd: '#c3acec', grad: 'linear-gradient(135deg,#9670d6,#7b52c4)' },
}
const SB = {
  new: { bg: '#DBEAFE', fg: '#1D4ED8' }, contacted: { bg: '#FEF3C7', fg: '#B45309' },
  confirmed: { bg: '#D1FAE5', fg: '#047857' }, lost: { bg: '#FEE2E2', fg: '#B91C1C' }, pending: { bg: '#FEF3C7', fg: '#B45309' },
}
const RESP = { yes: { bg: '#D1FAE5', fg: '#047857', bd: '#6EE7B7' }, no: { bg: '#FEE2E2', fg: '#B91C1C', bd: '#FCA5A5' }, pending: { bg: '#FEF3C7', fg: '#B45309', bd: '#FCD34D' } }
// prospect pipeline statuses + target-market types
const PS = {
  prospect: { bg: '#EDE9FE', fg: '#1c3564', l: 'Prospect' }, contacted: { bg: '#FEF3C7', fg: '#B45309', l: 'Contacted' },
  interested: { bg: '#DBEAFE', fg: '#1D4ED8', l: 'Interested' }, booked: { bg: '#D1FAE5', fg: '#047857', l: 'Booked' }, passed: { bg: '#F3F4F6', fg: '#6B7280', l: 'Passed' },
}
const PTYPES = ['Service & Social Club', 'Church / Faith', 'Senior Living', 'Club / Venue', 'Other']
const PTC = { 'Service & Social Club': G.purple, 'Church / Faith': G.teal, 'Senior Living': G.green, 'Club / Venue': G.amber, Other: G.purple }
const PFIELDS = (pr = {}) => [
  { k: 'org', l: 'Organization', rq: 1, df: pr.organization || '' },
  { k: 'type', l: 'Type', ty: 'sel', opts: PTYPES, df: pr.org_type || 'Service & Social Club' },
  { k: 'city', l: 'City', df: pr.city || '' },
  { k: 'organizer', l: 'Organizer / contact name', df: pr.organizer_name || '' },
  { k: 'role', l: 'Their role', df: pr.organizer_role || '' },
  { k: 'email', l: 'Organization email', df: pr.email || '' },
  { k: 'phone', l: 'Phone', df: pr.phone || '' },
  { k: 'website', l: 'Website', df: pr.website || '' },
  { k: 'fit', l: 'Fit (1–5)', ty: 'num', df: pr.fit_score || 3 },
  { k: 'notes', l: 'Notes', ty: 'area', df: pr.notes || '' },
]
const EVFIELDS = (ev = {}) => [
  { k: 'title', l: 'Event title', rq: 1, df: ev.title || '' },
  { k: 'date', l: 'Date', ty: 'date', df: ev.event_date || '' },
  { k: 'time', l: 'Time (e.g. 2:00 PM)', df: ev.event_time || '' },
  { k: 'venue', l: 'Venue', df: ev.venue || '' },
  { k: 'fee', l: 'Fee ($)', ty: 'num', df: ev.donation || 0 },
  { k: 'status', l: 'Status', ty: 'sel', opts: ['confirmed', 'pending', 'upcoming', 'lost'], df: ev.status || 'confirmed' },
]
// performance formats → how many singers each needs
const FORMATS = ['Quartet', 'Trio', 'Duo', 'Soloist', 'Quintet', 'Sextet', 'DJ']
const NEED = { Quartet: 4, Trio: 3, Duo: 2, Soloist: 1, Quintet: 5, Sextet: 6, DJ: 0 }
const NEED_LABEL = { 0: 'DJ', 1: 'Soloist', 2: 'Duo', 3: 'Trio', 4: 'Quartet', 5: 'Quintet', 6: 'Sextet' }
const fmtNeed = f => NEED[f] ?? 4

const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'EB Garamond',Georgia,serif;background:#fdf8ee;color:#1a1a2e;min-height:100vh}
.mesh{position:fixed;inset:0;z-index:0;pointer-events:none;background:
  radial-gradient(60vw 50vh at 8% -5%,rgba(232,180,48,.10),transparent 60%),
  radial-gradient(55vw 45vh at 100% 0%,rgba(28,53,100,.08),transparent 55%),
  radial-gradient(50vw 50vh at 50% 110%,rgba(32,168,154,.07),transparent 60%)}
button{cursor:pointer;font-family:inherit;border:none;background:none;color:inherit}
input,textarea,select{font-family:'Outfit',system-ui,sans-serif;outline:none}
::-webkit-scrollbar{width:7px;height:7px}::-webkit-scrollbar-thumb{background:#cbb89a;border-radius:4px}
.serif{font-family:'Cormorant Garamond',Georgia,serif}
.ui{font-family:'Outfit',system-ui,sans-serif}
.card{position:relative;background:#fffdf8;border-radius:16px;border:1px solid #efe6d4;box-shadow:0 4px 18px rgba(13,26,48,.06);overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;z-index:3;background:linear-gradient(90deg,#e8b430 0 20%,#e07830 20% 40%,#d03a6a 40% 60%,#20a89a 60% 80%,#7b52c4 80% 100%)}
.lift{transition:transform .18s ease,box-shadow .18s ease}
.lift:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(13,26,48,.13)}
.gtext{background:linear-gradient(135deg,#0d1a30,#1c3564);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
@keyframes fadeUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes slideIn{from{transform:translateY(-16px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pop{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
.fade{animation:fadeUp .45s cubic-bezier(.2,.7,.3,1)}
`

/* ---------- atoms ---------- */
const Avatar = ({ name, part, type, size = 44 }) => {
  const pc = VP[part] || VP.Soprano
  return <div style={{ width: size, height: size, borderRadius: '50%', background: pc.grad, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32, fontWeight: 800, flexShrink: 0, boxShadow: `0 4px 12px ${pc.fg}40`, border: type === 'guest' ? '2.5px dashed #fff' : 'none', outline: type === 'guest' ? `2px solid ${pc.bd}` : 'none' }}>{ini(name)}</div>
}
const Badge = ({ s }) => { const c = SB[s] || SB.new; return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: c.bg, color: c.fg, textTransform: 'capitalize', letterSpacing: '.02em' }}>{s}</span> }
const Pill = ({ children, bg, fg }) => <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: bg, color: fg }}>{children}</span>
const IconChip = ({ grad, children, size = 42 }) => <div style={{ width: size, height: size, borderRadius: 13, background: grad, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(13,26,48,.18)', flexShrink: 0 }}>{children}</div>
const SectionTitle = ({ children }) => <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.09em', color: '#6e6e82', marginBottom: 13 }}>{children}</div>

/* ---------- app ---------- */
export default function App() {
  const [tab, sTab] = useState('dashboard')
  const [R, sR] = useState([]); const [M, sM] = useState([]); const [I, sI] = useState([]); const [E, sE] = useState([]); const [A, sA] = useState([]); const [U, sU] = useState([])
  const [ld, sLd] = useState(true); const [err, sErr] = useState(null); const [toast, sTst] = useState(null)
  const [sInq, sSInq] = useState(null); const [sEv, sSEv] = useState(null); const [sSng, sSSng] = useState(null)
  const [rf, sRf] = useState('all'); const [lf, sLf] = useState('all'); const [mf, sMf] = useState('all'); const [q, sQ] = useState('')
  const [shS, sShS] = useState(false); const [shI, sShI] = useState(false); const [shM, sShM] = useState(false); const [shG, sShG] = useState(false)
  const [eSng, sESng] = useState(null) // roster id being edited
  const [eMus, sEMus] = useState(null) // music_library id being edited
  const [eInq, sEInq] = useState(null) // inquiry id being edited
  const [email, sEmail] = useState(null) // {lead} or {availability:ev}
  const [P, sP] = useState([]) // prospects (CRM)
  const [emailCfg, setEmailCfg] = useState('checking'); const [emailFrom, setEmailFrom] = useState('') // Gmail sending status
  const [pf, sPf] = useState('all'); const [ptf, sPtf] = useState('all'); const [pq, sPq] = useState('')
  const [shP, sShP] = useState(false); const [eP, sEP] = useState(null); const [sPro, sSPro] = useState(null)
  const [shEv, sShEv] = useState(false); const [eEv, sEEv] = useState(null); const [shProg, sShProg] = useState(null)

  const noti = m => { sTst(m); setTimeout(() => sTst(null), 3000) }
  const nav = t => { sTab(t); sSInq(null); sSEv(null); sSSng(null); sSPro(null) }
  const openEvent = id => { sSInq(null); sSPro(null); sSSng(null); sSEv(id); sTab('events') }
  const openBooking = id => { sSEv(null); sSPro(null); sSSng(null); sSInq(id); sTab('bookings') }

  useEffect(() => { (async () => {
    try {
      const [r, m, i, e, a, pr, u] = await Promise.all([
        sb.from('roster').select('*').order('id'), sb.from('music_library').select('*').order('id'),
        sb.from('inquiries').select('*').order('created_at', { ascending: false }),
        sb.from('events').select('*').order('event_date'), sb.from('member_availability').select('*'),
        sb.from('prospects').select('*').order('fit_score', { ascending: false }),
        sb.from('unavailability').select('*')])
      if (r.error) throw r.error
      sR(r.data || []); sM(m.data || []); sI(i.data || []); sE(e.data || []); sA(a.data || []); sP(pr.data || []); sU(u.data || [])
    } catch (e) { sErr(e.message || 'Connection failed') }
    sLd(false)
  })() }, [])

  useEffect(() => { (async () => { try { const { data, error } = await sb.functions.invoke('send-email', { body: { ping: true } }); if (error || !data) { setEmailCfg('error'); return } setEmailCfg(data.configured ? 'on' : 'off'); if (data.from) setEmailFrom(data.from) } catch { setEmailCfg('error') } })() }, [])

  const aM = useMemo(() => { const o = {}; A.forEach(a => { if (a.event_id != null) (o[a.event_id] ||= {})[a.roster_id] = a.response }); return o }, [A])
  const aMI = useMemo(() => { const o = {}; A.forEach(a => { if (a.inquiry_id != null) (o[a.inquiry_id] ||= {})[a.roster_id] = a.response }); return o }, [A])
  const aR = R.filter(r => r.active)
  const core = aR.filter(r => r.singer_type === 'member'); const guests = aR.filter(r => r.singer_type === 'guest')
  const dirs = aR.filter(r => r.singer_type === 'director'); const lineupR = aR.filter(r => r.singer_type !== 'director') // directors/managers don't sing
  const tMB = M.reduce((s, x) => s + Number(x.file_size_mb), 0).toFixed(1)
  const sN = M.filter(x => !x.cloud_only).length; const sMB = M.filter(x => !x.cloud_only).reduce((s, x) => s + Number(x.file_size_mb), 0).toFixed(1)
  const pFU = I.filter(x => x.status !== 'lost' && x.next_follow_up && new Date(x.next_follow_up + 'T12:00:00') <= new Date(Date.now() + 3 * 86400000)).length
  const pipe = I.filter(x => x.status !== 'lost').reduce((s, x) => s + Number(x.expected_donation), 0)

  /* data ops */
  const delI = async id => { const x = I.find(i => i.id === id); if (!window.confirm(`Delete the booking for ${x?.contact_name || 'this contact'}? This can’t be undone.`)) return; await sb.from('member_availability').delete().eq('inquiry_id', id); const { error } = await sb.from('inquiries').delete().eq('id', id); if (error) { noti('Delete failed — try again'); return } sA(p => p.filter(a => a.inquiry_id !== id)); sI(p => p.filter(i => i.id !== id)); sSInq(null); noti('Booking deleted') }
  const delEv = async id => { const x = E.find(e => e.id === id); if (!window.confirm(`Delete the event “${x?.title || ''}”? This can’t be undone.`)) return; await sb.from('member_availability').delete().eq('event_id', id); const { error } = await sb.from('events').delete().eq('id', id); if (error) { noti('Delete failed — try again'); return } sA(p => p.filter(a => a.event_id !== id)); sE(p => p.filter(e => e.id !== id)); sSEv(null); noti('Event deleted') }
  const delS = async id => { const x = R.find(r => r.id === id); if (!window.confirm(`Remove ${x?.name || 'this singer'} from the ensemble? This deletes their record and availability history.`)) return; await sb.from('member_availability').delete().eq('roster_id', id); const { error } = await sb.from('roster').delete().eq('id', id); if (error) { noti('Delete failed — try again'); return } sA(p => p.filter(a => a.roster_id !== id)); sR(p => p.filter(r => r.id !== id)); sSSng(null); noti(`${x?.name || 'Singer'} removed`) }
  const togSync = async id => { const s = M.find(x => x.id === id); await sb.from('music_library').update({ cloud_only: !s.cloud_only }).eq('id', id); sM(p => p.map(x => x.id === id ? { ...x, cloud_only: !x.cloud_only } : x)); noti(s.cloud_only ? `“${s.title}” synced to iPads` : `“${s.title}” set to cloud only`) }
  const updIS = async (id, st) => { const t = new Date().toISOString().split('T')[0]; await sb.from('inquiries').update({ status: st, last_follow_up: t }).eq('id', id); sI(p => p.map(x => x.id === id ? { ...x, status: st, last_follow_up: t } : x)); noti(`Marked “${st}”`) }
  const logFU = async id => { const t = new Date().toISOString().split('T')[0], n = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]; await sb.from('inquiries').update({ last_follow_up: t, next_follow_up: n }).eq('id', id); sI(p => p.map(x => x.id === id ? { ...x, last_follow_up: t, next_follow_up: n } : x)); noti('Follow-up logged · next in 7 days') }
  const addI = async d => { const n = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]; const { data: ins } = await sb.from('inquiries').insert({ contact_name: d.contact, organization: d.org, phone: d.phone, email: d.email, event_date: d.eventDate || null, event_type: d.eventType, format: d.format || 'Quartet', singers_needed: fmtNeed(d.format), expected_donation: d.expectedDonation, notes: d.notes, status: 'new', next_follow_up: n }).select().single(); if (ins) { sI(p => [ins, ...p]); sShI(false); noti('Booking inquiry added') } }
  const updRI = async (inqId, rid, resp) => { const ex = A.find(a => a.inquiry_id === inqId && a.roster_id === rid); if (ex) { await sb.from('member_availability').update({ response: resp }).eq('id', ex.id); sA(p => p.map(a => a.id === ex.id ? { ...a, response: resp } : a)) } else { const { data: ins, error } = await sb.from('member_availability').insert({ inquiry_id: inqId, roster_id: rid, response: resp }).select().single(); if (error) { noti('Could not save — try again'); return } if (ins) sA(p => [...p, ins]) } }
  // toggle a singer in/out of the invited lineup for an inquiry or event
  const togSel = async (scope, id, rid) => { const fld = scope === 'event' ? 'event_id' : 'inquiry_id'; const ex = A.find(a => a[fld] === id && a.roster_id === rid); if (ex) { await sb.from('member_availability').delete().eq('id', ex.id); sA(p => p.filter(a => a.id !== ex.id)) } else { const { data: ins, error } = await sb.from('member_availability').insert({ [fld]: id, roster_id: rid, response: 'pending' }).select().single(); if (error) { noti('Could not update lineup — try again'); return } if (ins) sA(p => [...p, ins]) } }
  const setFmt = async (id, f) => { const patch = { format: f, singers_needed: fmtNeed(f) }; await sb.from('inquiries').update(patch).eq('id', id); sI(p => p.map(x => x.id === id ? { ...x, ...patch } : x)); noti(`Format → ${f} (needs ${fmtNeed(f)})`) }
  const addS = async d => { const { data: ins } = await sb.from('roster').insert({ name: d.name, phone: d.phone, email: d.email, voice_part: d.voicePart, singer_type: d.type, active: true }).select().single(); if (ins) { sR(p => [...p, ins]); sShS(false); noti(`${d.name} added`) } }
  const addG = async d => { const { data: ins } = await sb.from('roster').insert({ name: d.name, phone: d.phone || '', email: d.email, voice_part: d.voicePart, singer_type: 'guest', active: true }).select().single(); if (ins) { sR(p => [...p, ins]); sShG(false); noti(`Guest ${d.name} added — invite them above`) } }
  const updS = async d => { const id = eSng; const patch = { name: d.name, phone: d.phone, email: d.email, voice_part: d.voicePart, singer_type: d.type }; const { error } = await sb.from('roster').update(patch).eq('id', id); if (error) { noti('Save failed — try again'); return } sR(p => p.map(r => r.id === id ? { ...r, ...patch } : r)); sESng(null); noti(`${d.name} updated`) }
  const updM = async d => { const id = eMus; const patch = { title: d.title, arranger: d.arranger, category: d.category, pages: d.pages, file_size_mb: d.size, file_url: d.fileUrl || null, cloud_only: d.dest === 'Cloud only' }; const { error } = await sb.from('music_library').update(patch).eq('id', id); if (error) { noti('Save failed — try again'); return } sM(p => p.map(x => x.id === id ? { ...x, ...patch } : x)); sEMus(null); noti(`“${d.title}” updated`) }
  const updI = async d => { const id = eInq; const patch = { contact_name: d.contact, organization: d.org, phone: d.phone, email: d.email, event_date: d.eventDate || null, event_type: d.eventType, format: d.format || 'Quartet', singers_needed: fmtNeed(d.format), expected_donation: d.expectedDonation, notes: d.notes }; const { error } = await sb.from('inquiries').update(patch).eq('id', id); if (error) { noti('Save failed — try again'); return } sI(p => p.map(x => x.id === id ? { ...x, ...patch } : x)); sEInq(null); noti('Booking updated') }
  const addM = async d => { const { data: ins } = await sb.from('music_library').insert({ title: d.title, arranger: d.arranger, category: d.category, voice_parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], pages: d.pages, file_size_mb: d.size, file_url: d.fileUrl || null, cloud_only: d.dest === 'Cloud only' }).select().single(); if (ins) { sM(p => [...p, ins]); sShM(false); noti(`“${d.title}” uploaded${d.dest === 'Cloud only' ? '' : ' & synced to iPads'}`) } }
  const updR = async (eid, rid, resp) => { const ex = A.find(a => a.event_id === eid && a.roster_id === rid); if (ex) { await sb.from('member_availability').update({ response: resp }).eq('id', ex.id); sA(p => p.map(a => a.id === ex.id ? { ...a, response: resp } : a)) } else { const { data: ins } = await sb.from('member_availability').insert({ event_id: eid, roster_id: rid, response: resp }).select().single(); if (ins) sA(p => [...p, ins]) } }
  const togAct = async id => { const s = R.find(r => r.id === id); await sb.from('roster').update({ active: !s.active }).eq('id', id); sR(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r)); noti(`${s.name} ${s.active ? 'set inactive' : 'reactivated'}`) }
  const togTy = async id => { const s = R.find(r => r.id === id); const nt = s.singer_type === 'member' ? 'guest' : 'member'; await sb.from('roster').update({ singer_type: nt }).eq('id', id); sR(p => p.map(r => r.id === id ? { ...r, singer_type: nt } : r)); noti(`${s.name} → ${nt === 'member' ? 'core member' : 'guest singer'}`) }
  /* prospects (CRM) */
  const addP = async d => { const { data: ins } = await sb.from('prospects').insert({ organization: d.org, org_type: d.type, city: d.city, organizer_name: d.organizer, organizer_role: d.role, email: d.email, phone: d.phone, website: d.website, fit_score: Number(d.fit) || 3, status: 'prospect', notes: d.notes }).select().single(); if (ins) { sP(p => [ins, ...p]); sShP(false); noti('Prospect added') } }
  const updP = async d => { const id = eP; const patch = { organization: d.org, org_type: d.type, city: d.city, organizer_name: d.organizer, organizer_role: d.role, email: d.email, phone: d.phone, website: d.website, fit_score: Number(d.fit) || 3, notes: d.notes }; const { error } = await sb.from('prospects').update(patch).eq('id', id); if (error) { noti('Save failed — try again'); return } sP(p => p.map(x => x.id === id ? { ...x, ...patch } : x)); sEP(null); noti('Prospect updated') }
  const updPS = async (id, st) => { const t = new Date().toISOString().split('T')[0]; const patch = st === 'contacted' ? { status: st, last_contacted: t } : { status: st }; await sb.from('prospects').update(patch).eq('id', id); sP(p => p.map(x => x.id === id ? { ...x, ...patch } : x)); noti(`Marked “${PS[st]?.l || st}”`) }
  const convP = async x => { const n = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]; const { data: ins } = await sb.from('inquiries').insert({ contact_name: x.organizer_name || x.organization, organization: x.organization, phone: x.phone, email: x.email, event_type: 'Other', expected_donation: 0, notes: `From prospect (${x.org_type}${x.city ? ', ' + x.city : ''}).${x.notes ? ' ' + x.notes : ''}`, status: 'new', next_follow_up: n }).select().single(); if (ins) { sI(p => [ins, ...p]); await sb.from('prospects').update({ status: 'interested' }).eq('id', x.id); sP(p => p.map(y => y.id === x.id ? { ...y, status: 'interested' } : y)); sSPro(null); sTab('bookings'); noti('Added to Bookings as a new lead') } }
  const convE = async inq => { const title = `${inq.event_type || 'Performance'}${inq.organization ? ' · ' + inq.organization : ''}`; const { data: ins, error } = await sb.from('events').insert({ title, event_date: inq.event_date || null, event_time: '', venue: inq.organization || '', donation: inq.expected_donation || 0, status: 'confirmed', songs_planned: [], format: inq.format || 'Quartet', singers_needed: inq.singers_needed ?? fmtNeed(inq.format) }).select().single(); if (error || !ins) { noti('Could not create event — try again'); return } const rows = A.filter(a => a.inquiry_id === inq.id).map(a => ({ event_id: ins.id, roster_id: a.roster_id, response: a.response })); if (rows.length) { const { data: cp } = await sb.from('member_availability').insert(rows).select(); if (cp) sA(p => [...p, ...cp]) } sE(p => [...p, ins].sort(byEvDate)); sSInq(null); sTab('events'); noti('Event created — availability carried over') }
  const addEv = async d => { const { data: ins, error } = await sb.from('events').insert({ title: d.title, event_date: d.date || null, event_time: d.time, venue: d.venue, donation: d.fee, status: d.status, songs_planned: [] }).select().single(); if (error || !ins) { noti('Could not save — try again'); return } sE(p => [...p, ins].sort(byEvDate)); sShEv(false); noti('Event added') }
  const updEv = async d => { const id = eEv; const patch = { title: d.title, event_date: d.date || null, event_time: d.time, venue: d.venue, donation: d.fee, status: d.status }; const { error } = await sb.from('events').update(patch).eq('id', id); if (error) { noti('Save failed — try again'); return } sE(p => p.map(x => x.id === id ? { ...x, ...patch } : x).sort(byEvDate)); sEEv(null); noti('Event updated') }
  const togProg = async (eid, sid) => { const ev = E.find(e => e.id === eid); const cur = ev.songs_planned || []; const next = cur.includes(sid) ? cur.filter(x => x !== sid) : [...cur, sid]; const { error } = await sb.from('events').update({ songs_planned: next }).eq('id', eid); if (error) { noti('Save failed — try again'); return } sE(p => p.map(x => x.id === eid ? { ...x, songs_planned: next } : x)) }

  if (ld) return <Splash />
  if (err) return <ErrorView err={err} />

  const tabs = [['dashboard', 'Dashboard', Sparkle], ['ensemble', 'Ensemble', Users], ['bookings', 'Bookings', Mail], ['events', 'Events', Calendar], ['music', 'Music', Note], ['prospects', 'Prospects', Target]]

  return <div style={{ position: 'relative', zIndex: 1 }}>
    <style>{css}</style><Defs /><div className="mesh" />
    {toast && <div style={{ position: 'fixed', top: 22, right: 22, zIndex: 2000, background: '#1a1a2e', color: '#fff', padding: '13px 20px', borderRadius: 13, fontSize: 13, fontWeight: 600, boxShadow: '0 14px 40px rgba(0,0,0,.25)', animation: 'slideIn .3s ease', display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ color: '#34D399', display: 'flex' }}><Check size={17} /></span>{toast}</div>}

    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0d1a30', boxShadow: '0 2px 18px rgba(13,26,48,.25)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }} onClick={() => nav('dashboard')}>
          <Logo size={38} />
          <div>
            <div className="ui" style={{ fontSize: 8.5, fontWeight: 300, letterSpacing: '.42em', color: '#e8b430' }}>THE</div>
            <div className="serif" style={{ fontSize: 19, fontWeight: 700, lineHeight: 1, letterSpacing: '.12em', textTransform: 'uppercase', color: '#fdf8ee' }}>Masterpieces</div>
          </div>
        </div>
        <nav className="ui" style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,.06)', padding: 4, borderRadius: 11 }}>{tabs.map(([id, l, Ic]) => <button key={id} onClick={() => nav(id)} style={{ padding: '8px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: tab === id ? '#0d1a30' : '#9aa6bd', background: tab === id ? '#e8b430' : 'transparent', transition: 'all .2s' }}><Ic size={14} />{l}</button>)}</nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }} className="ui"><div style={{ fontSize: 12.5, fontWeight: 600, color: '#fdf8ee' }}>Beth</div><div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9aa6bd' }}>Manager</div></div>
          <div className="serif" style={{ width: 38, height: 38, borderRadius: '50%', background: '#e8b430', color: '#0d1a30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17 }}>B</div>
        </div>
      </div>
      <div style={{ display: 'flex', height: 3 }}>{['#e8b430', '#e07830', '#d03a6a', '#20a89a', '#7b52c4'].map(c => <div key={c} style={{ flex: 1, background: c }} />)}</div>
    </header>

    <main style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 22px 70px' }}>
      {tab === 'dashboard' && <Dash {...{ R, aR, core, guests, M, I, E, aM, tMB, sN, sMB, pFU, pipe, nav, emailCfg, emailFrom, openEvent, openBooking, U }} />}
      {tab === 'ensemble' && <Ensemble {...{ core, guests, dirs, rf, sRf, sSSng, addS, togAct, togTy, shS, sShS }} />}
      {tab === 'music' && <Music {...{ M, q, sQ, mf, sMf, togSync, tMB, sN, sMB, shM, sShM, addM, sEMus }} />}
      {tab === 'bookings' && <Bookings {...{ I, lf, sLf, shI, sShI, sInq, sSInq, updIS, logFU, addI, sEmail, sEInq, convE, aMI, updRI, aR: lineupR, setFmt, sShG, togSel, delI, U }} />}
      {tab === 'prospects' && <Prospects {...{ P, pf, sPf, ptf, sPtf, pq, sPq, shP, sShP, sPro, sSPro, updPS, sEP, convP, sEmail }} />}
      {tab === 'events' && <Events {...{ E, sEv, sSEv, updR, M, R, aR: lineupR, aM, sEmail, sShEv, sEEv, sShProg, sShG, togSel, delEv, U }} />}
    </main>

    {sSng && <SingerDetail {...{ R, sSng, sSSng, togAct, togTy, sESng, noti, delS }} />}
    {shS && <FModal t="Add a Singer" sub="Add a core member or guest singer" onX={() => sShS(false)} onOk={addS} fs={[{ k: 'name', l: 'Full name', rq: 1 }, { k: 'phone', l: 'Phone' }, { k: 'email', l: 'Email' }, { k: 'voicePart', l: 'Voice part', ty: 'sel', opts: ['Soprano', 'Alto', 'Tenor', 'Bass'], df: 'Soprano' }, { k: 'type', l: 'Role', ty: 'tog', opts: ['member', 'guest'], df: 'member' }]} />}
    {shG && <FModal t="Invite a Guest Singer" sub="Bring in a sub to fill out the lineup" onX={() => sShG(false)} onOk={addG} fs={[{ k: 'name', l: 'Full name', rq: 1 }, { k: 'voicePart', l: 'Voice part', ty: 'sel', opts: ['Soprano', 'Alto', 'Tenor', 'Bass'], df: 'Soprano' }, { k: 'email', l: 'Email (so you can invite them)', rq: 1 }, { k: 'phone', l: 'Phone' }]} />}
    {eSng != null && (() => { const s = R.find(r => r.id === eSng); return s ? <FModal t="Edit Singer" sub={`Update ${s.name}’s details`} onX={() => sESng(null)} onOk={updS} fs={[{ k: 'name', l: 'Full name', rq: 1, df: s.name }, { k: 'phone', l: 'Phone', df: s.phone || '' }, { k: 'email', l: 'Email', df: s.email || '' }, { k: 'voicePart', l: 'Voice part', ty: 'sel', opts: ['Soprano', 'Alto', 'Tenor', 'Bass'], df: s.voice_part }, { k: 'type', l: 'Role', ty: 'tog', opts: ['member', 'guest'], df: s.singer_type }]} /> : null })()}
    {shI && <BookingWizard onX={() => sShI(false)} onOk={addI} />}
    {shM && <FModal t="Upload Arrangement" sub="Add sheet music to the cloud library" onX={() => sShM(false)} onOk={addM} fs={[{ k: 'title', l: 'Title', rq: 1 }, { k: 'arranger', l: 'Arranger / Composer' }, { k: 'category', l: 'Category', ty: 'sel', opts: ['Jazz', 'Swing', 'Pop', 'Standards', 'Christmas', 'Patriotic', 'Other'], df: 'Jazz' }, { k: 'pages', l: 'Pages', ty: 'num', df: 4 }, { k: 'size', l: 'File size (MB)', ty: 'num', df: 2 }, { k: 'fileUrl', l: 'Download link (PDF URL for singers)' }, { k: 'dest', l: 'Destination', ty: 'tog', opts: ['Sync to iPads', 'Cloud only'], df: 'Sync to iPads' }]} />}
    {eMus != null && (() => { const s = M.find(x => x.id === eMus); return s ? <FModal t="Edit Arrangement" sub={`Update “${s.title}”`} onX={() => sEMus(null)} onOk={updM} fs={[{ k: 'title', l: 'Title', rq: 1, df: s.title }, { k: 'arranger', l: 'Arranger / Composer', df: s.arranger || '' }, { k: 'category', l: 'Category', ty: 'sel', opts: ['Jazz', 'Swing', 'Pop', 'Standards', 'Christmas', 'Patriotic', 'Other'], df: s.category }, { k: 'pages', l: 'Pages', ty: 'num', df: s.pages }, { k: 'size', l: 'File size (MB)', ty: 'num', df: s.file_size_mb }, { k: 'fileUrl', l: 'Download link (PDF URL for singers)', df: s.file_url || '' }, { k: 'dest', l: 'Destination', ty: 'tog', opts: ['Sync to iPads', 'Cloud only'], df: s.cloud_only ? 'Cloud only' : 'Sync to iPads' }]} /> : null })()}
    {eInq != null && (() => { const inq = I.find(x => x.id === eInq); return inq ? <FModal t="Edit Booking Inquiry" sub={`Update ${inq.contact_name}’s inquiry`} onX={() => sEInq(null)} onOk={updI} fs={[{ k: 'contact', l: 'Contact name', rq: 1, df: inq.contact_name }, { k: 'org', l: 'Organization', rq: 1, df: inq.organization || '' }, { k: 'phone', l: 'Phone', df: inq.phone || '' }, { k: 'email', l: 'Email', df: inq.email || '' }, { k: 'eventDate', l: 'Event date', ty: 'date', df: inq.event_date || '' }, { k: 'eventType', l: 'Occasion', ty: 'sel', opts: ['Luncheon', 'Sunday Service', 'Club Meeting', 'Holiday Celebration', 'Annual Gala', 'Concert', 'Wedding', 'Memorial', 'Other'], df: inq.event_type }, { k: 'format', l: 'Performance format (sets singers needed)', ty: 'sel', opts: FORMATS, df: inq.format || 'Quartet' }, { k: 'expectedDonation', l: 'Expected fee ($)', ty: 'num', df: inq.expected_donation }, { k: 'notes', l: 'Notes', ty: 'area', df: inq.notes || '' }]} /> : null })()}
    {shP && <FModal t="Add a Prospect" sub="A local group to introduce the ensemble to" onX={() => sShP(false)} onOk={addP} fs={PFIELDS()} />}
    {eP != null && (() => { const pr = P.find(x => x.id === eP); return pr ? <FModal t="Edit Prospect" sub={pr.organization} onX={() => sEP(null)} onOk={updP} fs={PFIELDS(pr)} /> : null })()}
    {shEv && <FModal t="Add an Event" sub="Schedule a performance" onX={() => sShEv(false)} onOk={addEv} fs={EVFIELDS()} />}
    {eEv != null && (() => { const ev = E.find(x => x.id === eEv); return ev ? <FModal t="Edit Event" sub={ev.title} onX={() => sEEv(null)} onOk={updEv} fs={EVFIELDS(ev)} /> : null })()}
    {shProg != null && (() => { const ev = E.find(x => x.id === shProg); return ev ? <ProgramPicker ev={ev} M={M} onX={() => sShProg(null)} onTog={togProg} /> : null })()}
    {email && <EmailComposer {...{ email, sEmail, aR, onLogged: logFU, noti, emailCfg, emailFrom }} />}
  </div>
}

/* ---------- splash / error ---------- */
const Splash = () => <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}><style>{css}</style><Defs /><div className="mesh" /><div style={{ animation: 'pop .5s ease' }}><Logo size={64} /></div><div style={{ textAlign: 'center', zIndex: 1 }}><div className="ui" style={{ fontSize: 9, fontWeight: 300, letterSpacing: '.4em', color: '#c9a23a' }}>THE</div><div className="serif" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0d1a30' }}>Masterpieces</div><div style={{ width: 240, maxWidth: '70vw', margin: '14px auto 0' }}><MusicalPhrase variant="light" vh={40} /></div><div className="ui" style={{ fontSize: 12, color: '#6e6e82', marginTop: 10 }}>Tuning up…</div></div></div>
const ErrorView = ({ err }) => <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><style>{css}</style><div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 380 }}><div style={{ fontSize: 17, fontWeight: 700, color: '#B91C1C' }}>Connection Error</div><div style={{ fontSize: 13, color: '#888', margin: '10px 0 18px' }}>{err}</div><button onClick={() => location.reload()} style={{ padding: '11px 24px', borderRadius: 11, background: G.purple, color: '#fff', fontSize: 13, fontWeight: 700 }}>Retry</button></div></div>

/* ---------- musical phrase (brand motif) ---------- */
const MP_NOTES = [
  [0.20, 0.78, '#7b52c4', 'quarter'], [0.31, 0.60, '#20a89a', 'eighth'],
  [0.42, 0.44, '#e07830', 'quarter'], [0.53, 0.28, '#d03a6a', 'eighth'],
  [0.64, 0.44, '#e05545', 'half'], [0.75, 0.60, '#3898d4', 'quarter'],
  [0.86, 0.30, '#c035a0', 'eighth'],
]
const MPNote = ({ x, y, color, type, s }) => <g>
  <ellipse cx={x} cy={y} rx={5.5 * s} ry={4 * s} fill={type === 'half' ? 'none' : color} stroke={color} strokeWidth={type === 'half' ? 1.5 * s : 0} transform={`rotate(-18 ${x} ${y})`} />
  <line x1={x + 4.5 * s} y1={y} x2={x + 4.5 * s} y2={y - 22 * s} stroke={color} strokeWidth={1.3 * s} />
  {type === 'eighth' && <path d={`M ${x + 4.5 * s} ${y - 22 * s} C ${x + 12 * s} ${y - 18 * s} ${x + 14 * s} ${y - 12 * s} ${x + 10 * s} ${y - 8 * s}`} fill="none" stroke={color} strokeWidth={1.2 * s} />}
</g>
function MusicalPhrase({ variant = 'dark', vw = 600, vh = 48 }) {
  const line = variant === 'dark' ? '#e8b430' : '#0d1a30'
  const clef = variant === 'dark' ? '#f0c850' : '#0d1a30'
  const lineOp = variant === 'dark' ? 0.3 : 0.16
  const gap = vh / 6, s = 0.82 * (vh / 50)
  return <svg viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}>
    {[1, 2, 3, 4, 5].map(i => <line key={i} x1="0" y1={gap * i} x2={vw} y2={gap * i} stroke={line} strokeWidth="0.6" opacity={lineOp} />)}
    <g transform={`translate(4 1) scale(${vh / 85})`}><path d="M 18 58 C 14 54 8 46 8 38 C 8 30 12 26 18 24 L 18 24 C 18 18 18 10 20 6 C 22 2 26 0 28 2 C 30 4 28 8 26 12 C 24 16 20 22 18 28 L 18 28 C 24 28 30 32 30 40 C 30 48 24 52 18 52 C 14 52 12 48 12 44 C 12 40 14 38 18 38 C 22 38 24 40 24 44 C 24 46 22 48 20 48" fill="none" stroke={clef} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></g>
    {MP_NOTES.map(([px, py, c, t], i) => <MPNote key={i} x={vw * px} y={vh * py} color={c} type={t} s={s} />)}
  </svg>
}

/* ---------- note dots (brand signature flourish) ---------- */
const NOTE_COLORS = ['#d03a6a', '#e07830', '#e8b430', '#20a89a', '#3898d4', '#7b52c4', '#c035a0']
const NoteDots = ({ size = 6, gap = 5, op = 0.9 }) => <div style={{ display: 'flex', gap, alignItems: 'center' }}>{NOTE_COLORS.map((c, i) => <span key={i} style={{ width: size, height: size, borderRadius: '50%', background: c, opacity: op }} />)}</div>

/* ---------- mission hero (shows group photo when present at /ensemble.jpg) ---------- */
const MISSION = <span><b style={{ color: '#e8b430' }}>A mixed vocal ensemble</b> — the energy of a jazz club with the polish of a concert hall. Jazz, swing &amp; pop standards from the 1930s to today, plus Christmas and patriotic favorites, tailored to every occasion.</span>
function MissionHero() {
  const [hasPhoto, setHasPhoto] = useState(true)
  return <div className="card" style={{ marginBottom: 22, overflow: 'hidden', display: 'grid', gridTemplateColumns: hasPhoto ? '300px 1fr' : '1fr' }}>
    {hasPhoto && <img src="/ensemble.jpg" alt="The Masterpieces" onError={() => setHasPhoto(false)} style={{ width: '100%', height: '100%', maxHeight: 178, objectFit: 'cover', display: 'block' }} />}
    <div style={{ position: 'relative', padding: '20px 24px 16px', background: '#0d1a30', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 25%, rgba(28,53,100,.6), transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 13 }}>
        <IconChip grad={G.amber} size={38}><Sparkle size={18} /></IconChip>
        <div style={{ fontSize: 12.5, color: '#e8dfce', lineHeight: 1.6 }}>{MISSION}</div>
      </div>
      <div style={{ position: 'relative', marginTop: 14 }}><MusicalPhrase variant="dark" vh={42} /></div>
    </div>
  </div>
}

/* ---------- month calendar (dashboard) ---------- */
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const dayAdd = (k, n) => { const d = new Date(k + 'T12:00:00'); d.setDate(d.getDate() + n); return ymd(d) }
const shortD = k => new Date(k + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const groupPeriods = dates => { const s = [...dates].sort(); const out = []; let st = null, pv = null; for (const k of s) { if (st && k === dayAdd(pv, 1)) pv = k; else { if (st) out.push([st, pv]); st = k; pv = k } } if (st) out.push([st, pv]); return out }
function CalendarCard({ E, I, openEvent, openBooking, U, R }) {
  const today = new Date(); const tkey = ymd(today)
  const [off, setOff] = useState(0)
  const [sel, setSel] = useState(tkey)
  const base = new Date(today.getFullYear(), today.getMonth() + off, 1)
  const y = base.getFullYear(), m = base.getMonth()
  const items = useMemo(() => {
    const o = {}
    E.forEach(e => { if (e.event_date) (o[e.event_date] ||= []).push({ type: 'event', id: e.id, title: e.title, time: e.event_time, venue: e.venue, color: '#16a34a' }) })
    I.forEach(i => { if (i.event_date && i.status !== 'lost') (o[i.event_date] ||= []).push({ type: 'booking', id: i.id, title: `${i.contact_name} · ${i.event_type}`, color: '#e8b430' }) })
    return o
  }, [E, I])
  const awayBy = useMemo(() => { const o = {}; (U || []).forEach(u => { const r = (R || []).find(x => x.id === u.roster_id); (o[u.date] ||= []).push(r ? r.name.split(' ')[0] : '?') }); return o }, [U, R])
  const awayUpcoming = useMemo(() => {
    const byR = {}; (U || []).forEach(u => { if (u.date >= tkey) (byR[u.roster_id] ||= []).push(u.date) })
    return Object.entries(byR).map(([rid, dates]) => { const r = (R || []).find(x => x.id === +rid); return { name: r ? r.name : 'Unknown', part: r ? r.voice_part : '', periods: groupPeriods(dates) } }).filter(x => x.periods.length).sort((a, b) => a.periods[0][0] < b.periods[0][0] ? -1 : 1)
  }, [U, R, tkey])
  const firstDow = new Date(y, m, 1).getDay(); const days = new Date(y, m + 1, 0).getDate()
  const cells = []; for (let i = 0; i < firstDow; i++) cells.push(null); for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d)); while (cells.length % 7) cells.push(null)
  const selItems = items[sel] || []
  const navBtn = { width: 30, height: 30, borderRadius: 8, border: '1px solid #e2d6bd', background: '#fff', color: '#1c3564', fontSize: 16, fontWeight: 700, cursor: 'pointer' }
  return <div className="card" style={{ padding: 20, marginBottom: 22 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Calendar size={18} color="#1c3564" /><span className="serif" style={{ fontSize: 18, fontWeight: 700 }}>{base.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => setOff(off - 1)} style={navBtn}>‹</button>
        <button onClick={() => { setOff(0); setSel(tkey) }} style={{ ...navBtn, width: 'auto', padding: '0 12px', fontSize: 12, fontWeight: 700 }}>Today</button>
        <button onClick={() => setOff(off + 1)} style={navBtn}>›</button>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, i) => <div key={i} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 800, color: '#a8a3b5', padding: '0 0 4px' }}>{w}</div>)}
      {cells.map((d, i) => {
        if (!d) return <div key={i} />
        const k = ymd(d); const its = items[k] || []; const isToday = k === tkey; const isSel = k === sel
        return <button key={i} onClick={() => setSel(k)} style={{ minHeight: 50, borderRadius: 9, border: isSel ? '2px solid #1c3564' : '1px solid #f0e8d6', background: isToday ? '#faf3e6' : '#fff', padding: '5px 0 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12.5, fontWeight: isToday ? 800 : 600, color: isToday ? '#1c3564' : '#4a4a5e' }}>{d.getDate()}</span>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>{its.slice(0, 3).map((it, j) => <span key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: it.color }} />)}{awayBy[k] && <span title="Singer(s) unavailable" style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} />}</div>
        </button>
      })}
    </div>
    <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#8a8598', margin: '12px 0 4px', flexWrap: 'wrap' }}><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />Events</span><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e8b430' }} />Bookings</span><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />Singer away</span></div>
    <div style={{ borderTop: '1px solid #efe6d4', marginTop: 8, paddingTop: 12 }}>
      <SectionTitle>{new Date(sel + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
        {selItems.length ? selItems.map((it, i) => <button key={i} onClick={() => it.type === 'event' ? openEvent(it.id) : openBooking(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 11, background: '#faf5e9', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: it.color, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>{it.type === 'event' && (it.time || it.venue) && <div style={{ fontSize: 11.5, color: '#8a8598' }}>{[it.time, it.venue].filter(Boolean).join(' · ')}</div>}</div>
          <Pill bg={it.type === 'event' ? '#D1FAE5' : '#FEF3C7'} fg={it.type === 'event' ? '#047857' : '#B45309'}>{it.type}</Pill>
          <Arrow size={15} style={{ color: '#cfc8d8', flexShrink: 0 }} />
        </button>) : <div style={{ fontSize: 13, color: '#a8a3b5', padding: '6px 0' }}>Nothing scheduled this day.</div>}
        {awayBy[sel]?.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEE2E2', color: '#B91C1C', borderRadius: 10, padding: '9px 12px', fontSize: 12.5, fontWeight: 700 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />Unavailable: {awayBy[sel].join(', ')}</div>}
      </div>
    </div>
    {awayUpcoming.length > 0 && <div style={{ borderTop: '1px solid #efe6d4', marginTop: 12, paddingTop: 12 }}>
      <SectionTitle>Who’s away · upcoming</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>{awayUpcoming.map((s, i) => { const pc = VP[s.part] || VP.Soprano; return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 11, background: '#fdf1f1' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: pc.fg, flexShrink: 0 }} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e', flexShrink: 0 }}>{s.name.split(' ')[0]}</span>
        <span style={{ fontSize: 12.5, color: '#B91C1C', textAlign: 'right', flex: 1 }}>{s.periods.map(([a, b]) => a === b ? shortD(a) : `${shortD(a)}–${shortD(b)}`).join(', ')}</span>
      </div> })}</div>
    </div>}
  </div>
}

/* ---------- dashboard ---------- */
function Dash({ R, aR, core, guests, M, I, E, aM, tMB, sN, sMB, pFU, pipe, nav, emailCfg, emailFrom, openEvent, openBooking, U }) {
  const hr = new Date().getHours()
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'
  const nxt = E.filter(e => dU(e.event_date) > 0).sort((a, b) => new Date(a.event_date) - new Date(b.event_date))[0]
  const nA = nxt ? (aM[nxt.id] || {}) : {}
  const cards = [
    { l: 'The Ensemble', v: core.length, s: guests.length ? `+ ${guests.length} guest singer${guests.length > 1 ? 's' : ''}` : 'Core voices', grad: G.purple, ic: <Users size={20} />, go: 'ensemble' },
    { l: 'Cloud Library', v: M.length, s: `${sN} on iPads · ${tMB} MB`, grad: G.teal, ic: <Note size={20} />, go: 'music' },
    { l: 'Follow-ups Due', v: pFU, s: 'within 3 days', grad: G.amber, ic: <Bell size={20} />, go: 'bookings' },
    { l: 'Booking Value', v: $(pipe), s: `pipeline · ${I.filter(i => i.status !== 'lost').length} active leads`, grad: G.green, ic: <Dollar size={20} />, go: 'bookings' },
  ]
  return <div className="fade">
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#0d1a30' }}>{greet}, Beth</h1>
          <p className="ui" style={{ color: '#6e6e82', fontSize: 13.5, marginTop: 4 }}>Here’s what’s happening with The Masterpieces today.</p>
        </div>
        <EmailStatus cfg={emailCfg} from={emailFrom} />
      </div>
      <div style={{ marginTop: 10 }}><NoteDots /></div>
    </div>
    <MissionHero />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
      {cards.map((c, i) => <div key={i} className="card lift" onClick={() => nav(c.go)} style={{ padding: 20, cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a8598' }}>{c.l}</div><IconChip grad={c.grad} size={40}>{c.ic}</IconChip></div>
        <div style={{ fontSize: 32, fontWeight: 800, marginTop: 14, color: '#1a1a2e' }}>{c.v}</div>
        <div style={{ fontSize: 12.5, color: '#8a8598', marginTop: 2 }}>{c.s}</div>
      </div>)}
    </div>
    <CalendarCard E={E} I={I} openEvent={openEvent} openBooking={openBooking} U={U} R={R} />
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18 }}>
      {nxt ? <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ background: G.purple, padding: '20px 24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: .18 }}><Note size={92} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', opacity: .85 }}>Next Performance</span><span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,.2)', padding: '3px 11px', borderRadius: 20 }}>in {dU(nxt.event_date)} days</span></div>
          <div className="serif" style={{ fontSize: 21, fontWeight: 700 }}>{nxt.title}</div>
          <div style={{ fontSize: 13, opacity: .9, marginTop: 5, display: 'flex', gap: 14, flexWrap: 'wrap' }}><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={14} />{fmtLong(nxt.event_date)} · {nxt.event_time}</span><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} />{nxt.venue}</span></div>
        </div>
        <div style={{ padding: '18px 24px 22px' }}>
          <SectionTitle>Who’s confirmed</SectionTitle>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>{Object.entries(nA).map(([rid, resp]) => { const m = R.find(x => x.id === +rid); if (!m) return null; const c = RESP[resp] || RESP.pending; return <div key={rid} title={`${m.name}: ${resp}`} style={{ width: 38, height: 38, borderRadius: '50%', background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, border: `2px solid ${c.bd}` }}>{ini(m.name)}</div> })}</div>
          <div style={{ display: 'flex', gap: 8 }}>{['yes', 'pending', 'no'].map(r => { const c = RESP[r]; const n = Object.values(nA).filter(x => x === r).length; return <div key={r} style={{ flex: 1, textAlign: 'center', background: c.bg, color: c.fg, borderRadius: 10, padding: '8px 0', fontSize: 12.5, fontWeight: 700 }}>{n} {r}</div> })}</div>
        </div>
      </div> : <div className="card" style={{ padding: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8598' }}>No upcoming performances scheduled.</div>}

      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><SectionTitle>The Four Voices</SectionTitle><button onClick={() => nav('ensemble')} style={{ fontSize: 12, color: '#1c3564', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>Manage <Arrow size={14} /></button></div>
        {['Soprano', 'Alto', 'Tenor', 'Bass'].map(part => { const pc = VP[part]; const m = aR.filter(r => r.voice_part === part); const lead = m.find(r => r.singer_type === 'member') || m[0]; return <div key={part} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0', borderBottom: '1px solid #efe6d4' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: pc.grad, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, boxShadow: `0 4px 10px ${pc.fg}33` }}>{part[0]}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{part}</div><div style={{ fontSize: 12, color: '#8a8598' }}>{lead ? lead.name : <span style={{ color: '#EF4444' }}>No singer assigned</span>}</div></div>
          {m.length > 1 && <Pill bg={pc.bg} fg={pc.fg}>+{m.length - 1}</Pill>}
        </div> })}
      </div>
    </div>
  </div>
}

/* ---------- ensemble (roster) ---------- */
function Ensemble({ core, guests, dirs, rf, sRf, sSSng, addS, togAct, togTy, shS, sShS }) {
  const filt = [['all', 'Everyone'], ['member', 'Core'], ['guest', 'Guests']]
  const showCore = rf === 'all' || rf === 'member'
  const showGuest = rf === 'all' || rf === 'guest'
  const Card = ({ s }) => { const pc = VP[s.voice_part] || VP.Soprano; return <div className="card lift" onClick={() => sSSng(s.id)} style={{ padding: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, borderTop: `3px solid ${pc.fg}` }}>
    <Avatar name={s.name} part={s.voice_part} type={s.singer_type} size={48} />
    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.name}</div><div style={{ display: 'flex', gap: 6 }}><Pill bg={pc.bg} fg={pc.fg}>{s.voice_part}</Pill>{s.singer_type === 'guest' && <Pill bg="#FEF3C7" fg="#B45309">Guest</Pill>}</div></div>
    <span style={{ color: '#cfc8d8' }}><Arrow size={18} /></span>
  </div> }
  return <div className="fade">
    <Header title="The Ensemble" sub={`${core.length} core voices${guests.length ? ` · ${guests.length} guest singers` : ''}`} action={{ label: 'Add Singer', on: () => sShS(true) }} />
    {(dirs || []).map(d => <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px', marginBottom: 14, background: '#0d1a30', borderRadius: 13, color: '#fff' }}>
      <Avatar name={d.name} part={d.voice_part} type="director" size={42} />
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 700 }}>{d.name}</div><div style={{ fontSize: 12, color: '#c9d2e2', marginTop: 1 }}>{d.email || d.phone || 'Music director'}</div></div>
      <Pill bg="rgba(255,255,255,.18)" fg="#fff">Director · Manager</Pill>
    </div>)}
    <Filter opts={filt} val={rf} set={sRf} />
    {showCore && <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 12px' }}><Sparkle size={16} color="#1c3564" /><span style={{ fontSize: 13, fontWeight: 800, color: '#1c3564' }}>Core Members</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 12, marginBottom: guests.length && showGuest ? 28 : 0 }}>{core.map(s => <Card key={s.id} s={s} />)}{!core.length && <Empty>No core members yet.</Empty>}</div>
    </>}
    {showGuest && <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 12px' }}><Users size={16} color="#D97706" /><span style={{ fontSize: 13, fontWeight: 800, color: '#D97706' }}>Guest Singers</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 12 }}>{guests.map(s => <Card key={s.id} s={s} />)}{!guests.length && <Empty>No guest singers right now — add one as the ensemble grows.</Empty>}</div>
    </>}
  </div>
}

function SingerDetail({ R, sSng, sSSng, togAct, togTy, sESng, noti, delS }) {
  const s = R.find(r => r.id === sSng); if (!s) return null
  const pc = VP[s.voice_part] || VP.Soprano
  const portalLink = `${window.location.origin}/?member=${s.portal_token || ''}`
  const first = (s.name || '').split(' ')[0]
  const copyPortal = () => { navigator.clipboard?.writeText(portalLink).then(() => noti('Portal link copied'), () => noti('Copy unavailable')) }
  const emailPortal = () => { window.location.href = mailto(s.email, 'Your Masterpieces singer portal', `Hi ${first},\n\nHere's your private portal — it shows your upcoming events and lets you download the sheet music for each one:\n\n${portalLink}\n\nNo password needed. Keep this link just for you.\n\n— The Masterpieces`) }
  return <Modal onX={() => sSSng(null)}>
    <div style={{ background: pc.grad, height: 86, position: 'relative' }}><div style={{ position: 'absolute', right: 16, top: 14, opacity: .25, color: '#fff' }}><Note size={56} /></div></div>
    <div style={{ padding: '0 26px 26px', marginTop: -34 }}>
      <Avatar name={s.name} part={s.voice_part} type={s.singer_type} size={68} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}><h2 className="serif" style={{ fontSize: 23, fontWeight: 700 }}>{s.name}</h2>{!s.active && <Pill bg="#FEE2E2" fg="#B91C1C">Inactive</Pill>}</div>
      <div style={{ display: 'flex', gap: 7, marginTop: 8 }}><Pill bg={pc.bg} fg={pc.fg}>{s.voice_part}</Pill><Pill bg={s.singer_type === 'member' ? '#EDE9FE' : '#FEF3C7'} fg={s.singer_type === 'member' ? '#1c3564' : '#B45309'}>{s.singer_type === 'member' ? 'Core Member' : 'Guest Singer'}</Pill></div>
      <div style={{ display: 'grid', gap: 10, margin: '20px 0', background: '#faf5e9', borderRadius: 13, padding: 16 }}>
        <Row ic={<Phone size={16} />}>{s.phone || 'No phone on file'}</Row>
        <Row ic={<Mail size={16} />}>{s.email || 'No email on file'}</Row>
        <Row ic={<Clock size={16} />}>Joined {fmt(s.joined_date)}</Row>
      </div>
      {s.singer_type !== 'director' && <div style={{ background: '#0d1a30', borderRadius: 13, padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}><Mail size={14} color="#e8b430" /><span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#e8b430' }}>Singer Portal</span></div>
        <div style={{ fontSize: 12, color: '#c9d2e2', marginBottom: 10 }}>{first}’s private link to their schedule &amp; sheet music — no password needed.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Btn small grad={G.amber} onClick={copyPortal}><Copy size={13} />Copy link</Btn>{s.email && <Btn small ghost onClick={emailPortal}><Send size={13} />Email it to {first}</Btn>}</div>
      </div>}
      <div style={{ display: 'flex', gap: 9, marginBottom: 9 }}>
        <Btn grad={G.purple} onClick={() => { sSSng(null); sESng(s.id) }}><Pencil size={16} />Edit Details</Btn>
      </div>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <Btn ghost onClick={() => togAct(s.id)}>{s.active ? 'Mark Inactive' : 'Reactivate'}</Btn>
        <Btn ghost onClick={() => togTy(s.id)}>{s.singer_type === 'member' ? '→ Make Guest' : '→ Make Core'}</Btn>
        <Btn ghost danger onClick={() => delS(s.id)}><Trash size={15} />Delete</Btn>
      </div>
    </div>
  </Modal>
}

/* ---------- music ---------- */
function Music({ M, q, sQ, mf, sMf, togSync, tMB, sN, sMB, shM, sShM, addM, sEMus }) {
  const cats = ['all', ...new Set(M.map(s => s.category))]
  const fd = M.filter(s => (s.title.toLowerCase().includes(q.toLowerCase()) || (s.arranger || '').toLowerCase().includes(q.toLowerCase())) && (mf === 'all' || s.category === mf))
  const pct = Math.min(100, (parseFloat(sMB) / Math.max(parseFloat(tMB), 1)) * 100)
  return <div className="fade">
    <Header title="Music Library" sub={`${M.length} arrangements · ${tMB} MB in the cloud`} action={{ label: 'Upload Arrangement', on: () => sShM(true), icon: <Plus size={16} /> }} />
    <div className="card" style={{ padding: 0, marginBottom: 18, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ padding: 22, background: G.teal, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -8, bottom: -8, opacity: .18 }}><Tablet size={86} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}><Tablet size={22} /><span style={{ fontWeight: 800, fontSize: 14 }}>iPad Sync</span></div>
        <div style={{ fontSize: 30, fontWeight: 800 }}>{sN}<span style={{ fontSize: 15, fontWeight: 600, opacity: .8 }}> / {M.length}</span></div>
        <div style={{ fontSize: 12.5, opacity: .9, marginBottom: 12 }}>arrangements on every singer’s iPad</div>
        <div style={{ height: 8, borderRadius: 5, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: '#fff', borderRadius: 5, transition: 'width .6s' }} /></div>
        <div style={{ fontSize: 11.5, opacity: .85, marginTop: 7 }}>{sMB} MB stored per device</div>
      </div>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><IconChip grad={G.green} size={38}><Cloud size={18} /></IconChip><div><div style={{ fontSize: 13.5, fontWeight: 700 }}>One library, every iPad</div><div style={{ fontSize: 12, color: '#8a8598' }}>Toggle a piece to push or pull it from devices instantly — no more loading each iPad by hand.</div></div></div>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: G.green, display: 'inline-block' }} /> On iPads</span><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#cbd5e1', display: 'inline-block' }} /> Cloud only</span></div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200, position: 'relative' }}><span style={{ position: 'absolute', left: 13, top: 11, color: '#a8a3b5' }}><Search size={17} /></span><input value={q} onChange={e => sQ(e.target.value)} placeholder="Search by title or arranger…" style={{ width: '100%', padding: '11px 12px 11px 38px', borderRadius: 12, border: '1px solid #e2d6bd', fontSize: 13.5, background: '#fff' }} /></div>
      <Filter opts={cats.map(c => [c, c === 'all' ? 'All' : c])} val={mf} set={sMf} bare />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 12 }}>{fd.map(s => { const onPad = !s.cloud_only; return <div key={s.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
      <IconChip grad={onPad ? G.green : 'linear-gradient(135deg,#cbd5e1,#94a3b8)'} size={42}>{onPad ? <Tablet size={19} /> : <Cloud size={19} />}</IconChip>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div><div style={{ fontSize: 12, color: '#8a8598', marginBottom: 4 }}>{s.arranger || 'Traditional'}</div><div style={{ fontSize: 11, color: '#9a94a8' }}>{s.category} · {s.pages}pg · {s.file_size_mb}MB</div></div>
      <button onClick={() => sEMus(s.id)} title="Edit arrangement" style={{ padding: 8, borderRadius: 10, color: '#6e6e82', background: '#efe6d4', display: 'flex', alignItems: 'center' }}><Pencil size={15} /></button>
      <button onClick={() => togSync(s.id)} style={{ padding: '8px 13px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, background: onPad ? '#D1FAE5' : '#f0e8d6', color: onPad ? '#047857' : '#6e6e82' }}>{onPad ? <><Check size={14} />iPad</> : <><Cloud size={14} />Cloud</>}</button>
    </div> })}{!fd.length && <Empty>No arrangements match your search.</Empty>}</div>
  </div>
}

/* ---------- shared lineup list: pick singers inline + track availability ---------- */
function LineupList({ aR, ea, onTog, onSet, away }) {
  const order = { Soprano: 0, Alto: 1, Tenor: 2, Bass: 3 }
  const list = [...aR].sort((a, b) => (order[a.voice_part] ?? 9) - (order[b.voice_part] ?? 9))
  if (!list.length) return <Empty>No active singers — add singers in the Ensemble tab first.</Empty>
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>{list.map(m => {
    const inL = ea[m.id] !== undefined; const resp = ea[m.id] || 'pending'; const pcv = VP[m.voice_part] || VP.Soprano; const isAway = away && away.has(m.id)
    return <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '9px 13px', background: isAway ? '#fdf1f1' : inL ? '#eef2fb' : '#faf5e9', border: `1px solid ${isAway ? '#f3cccc' : inL ? '#cbd8f0' : 'transparent'}`, borderRadius: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <button onClick={() => onTog(m.id)} title={inL ? 'Remove from lineup' : 'Add to lineup'} style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: inL ? '#1c3564' : '#fff', border: `1.5px solid ${inL ? '#1c3564' : '#d8cbb0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{inL ? <Check size={14} color="#fff" /> : <Plus size={14} color="#b6a98c" />}</button>
        <Avatar name={m.name} part={m.voice_part} type={m.singer_type} size={34} />
        <div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 700 }}>{m.name}</div><div style={{ display: 'flex', gap: 5, marginTop: 2 }}><Pill bg={pcv.bg} fg={pcv.fg}>{m.voice_part}</Pill>{m.singer_type === 'guest' && <Pill bg="#FEF3C7" fg="#B45309">guest</Pill>}{isAway && <Pill bg="#FEE2E2" fg="#B91C1C">✕ Away this date</Pill>}</div></div>
      </div>
      {inL ? <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>{['yes', 'pending', 'no'].map(r => { const c = RESP[r]; const on = resp === r; return <button key={r} onClick={() => onSet(m.id, r)} style={{ padding: '6px 12px', borderRadius: 9, fontSize: 11.5, fontWeight: 700, background: on ? c.fg : '#eee', color: on ? '#fff' : '#9ca3af' }}>{r === 'pending' ? 'maybe' : r}</button> })}</div> : <button onClick={() => onTog(m.id)} style={{ fontSize: 11.5, color: '#1c3564', fontWeight: 700, flexShrink: 0 }}>Add to lineup</button>}
    </div>
  })}</div>
}

/* ---------- bookings (leads) ---------- */
function Bookings({ I, lf, sLf, shI, sShI, sInq, sSInq, updIS, logFU, addI, sEmail, sEInq, convE, aMI, updRI, aR, setFmt, sShG, togSel, delI, U }) {
  const sts = [['all', 'All'], ['new', 'New'], ['contacted', 'Contacted'], ['confirmed', 'Confirmed'], ['lost', 'Lost']]
  const fd = I.filter(i => lf === 'all' || i.status === lf).slice().sort((a, b) => {
    const la = a.status === 'lost' ? 1 : 0, lb = b.status === 'lost' ? 1 : 0
    if (la !== lb) return la - lb
    const da = a.event_date ? new Date(a.event_date + 'T12:00:00').getTime() : Infinity
    const db = b.event_date ? new Date(b.event_date + 'T12:00:00').getTime() : Infinity
    return da - db
  })
  const od = I.filter(i => i.status !== 'lost' && i.next_follow_up && new Date(i.next_follow_up + 'T12:00:00') < new Date())

  if (sInq) { const inq = I.find(i => i.id === sInq); if (!inq) return null; const isOD = inq.next_follow_up && new Date(inq.next_follow_up + 'T12:00:00') < new Date()
    const need = inq.singers_needed ?? 4; const ea = aMI[inq.id] || {}; const yc = Object.values(ea).filter(r => r === 'yes').length; const covered = yc >= need; const isDJ = need === 0; const smaller = NEED_LABEL[Math.max(0, need - 1)]
    const sel = aR.filter(m => ea[m.id] !== undefined); const recips = sel.filter(m => m.email).map(m => m.email).join(',')
    const away = new Set((U || []).filter(u => inq.event_date && u.date === inq.event_date).map(u => u.roster_id)); const awayNames = aR.filter(m => away.has(m.id)).map(m => m.name.split(' ')[0])
    const availObj = { title: `${inq.event_type || 'Performance'} · ${inq.organization || ''}`, event_date: inq.event_date, event_time: '', venue: inq.organization || '' }
    const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const steps = [
      { key: 'details', label: 'Details', done: !!inq.event_date, hint: 'Add the event date so you can plan around it.', actionLabel: 'Edit details', onAction: () => sEInq(inq.id) },
      ...(isDJ ? [] : [
        { key: 'lineup', label: 'Lineup', done: sel.length > 0, hint: 'Pick the singers who fit this event.', actionLabel: 'Choose singers', onAction: () => scrollTo('avail-panel') },
        { key: 'avail', label: 'Availability', done: covered, hint: sel.length > 0 ? 'Email your singers, then mark their replies until you’re covered.' : 'Add singers first, then email them to check availability.', actionLabel: sel.length > 0 ? 'Email availability' : null, onAction: () => sEmail({ availability: availObj, recipients: recips }) },
      ]),
      { key: 'confirm', label: 'Confirm', done: inq.status === 'confirmed', hint: covered || isDJ ? 'Lock it in with the client.' : 'You can confirm now, or get more singers first.', actionLabel: 'Confirm with client', onAction: () => updIS(inq.id, 'confirmed') },
      { key: 'event', label: 'Event', done: false, hint: 'Add it to Events, then build the song program.', actionLabel: 'Add to Events', onAction: () => convE(inq) },
    ]
    return <div className="fade">
      <BackBtn onClick={() => sSInq(null)} />
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ background: G.purple, padding: '24px 26px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h2 className="serif" style={{ fontSize: 24, fontWeight: 700 }}>{inq.contact_name}</h2><div style={{ fontSize: 13.5, opacity: .9, marginTop: 3 }}>{inq.organization}</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 24, fontWeight: 800 }}>{$(inq.expected_donation)}</div><div style={{ marginTop: 5 }}><Badge s={inq.status} /></div></div>
        </div>
        <div style={{ padding: 26 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
            <Stat ic={<Calendar size={16} />} l="Date" v={inq.event_date ? fmt(inq.event_date) : 'TBD'} />
            <Stat ic={<Sparkle size={16} />} l="Occasion" v={inq.event_type} />
            <Stat ic={<Users size={16} />} l="Format" v={`${inq.format || 'Quartet'}${isDJ ? '' : ` · needs ${need}`}`} />
            <Stat ic={<Phone size={16} />} l="Phone" v={inq.phone || '—'} />
          </div>
          {inq.notes && <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#4b5563', background: '#faf5e9', padding: 15, borderRadius: 12, marginBottom: 20 }}>{inq.notes}</div>}
          {inq.status !== 'lost' && <NextStepCard steps={steps} />}
          {!isDJ && <div id="avail-panel" style={{ border: `1px solid ${covered ? '#A7E8C6' : '#efe6d4'}`, background: covered ? '#eafaf1' : '#fff', borderRadius: 13, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
              <SectionTitle>Singer Availability · {yc}/{need} confirmed</SectionTitle>
              <div style={{ display: 'flex', gap: 8 }}><Btn small ghost onClick={() => sShG(true)}><Plus size={14} />Guest</Btn>{sel.length > 0 && <Btn small grad={G.amber} onClick={() => sEmail({ availability: availObj, recipients: recips })}><Send size={14} />Email Availability</Btn>}</div>
            </div>
            <div style={{ fontSize: 12, color: '#8a8598', marginBottom: 12 }}>Tap a singer to add them to this event’s lineup, then mark their replies.</div>
            {awayNames.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEE2E2', color: '#B91C1C', borderRadius: 10, padding: '9px 13px', marginBottom: 12, fontSize: 12.5, fontWeight: 700 }}><Bell size={15} />Marked unavailable on {fmt(inq.event_date)}: {awayNames.join(', ')}</div>}
            <LineupList aR={aR} ea={ea} away={away} onTog={rid => togSel('inquiry', inq.id, rid)} onSet={(rid, r) => updRI(inq.id, rid, r)} />
            <div style={{ marginTop: 14, padding: '11px 14px', borderRadius: 11, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, background: covered ? '#D1FAE5' : '#FEF3C7', color: covered ? '#047857' : '#B45309' }}>{covered ? <><Check size={16} />Lineup covered — clear to confirm with the client.</> : <><Bell size={16} />{need - yc} more confirmed needed. Add singers above, or downsize below.</>}</div>
            {!covered && <div style={{ display: 'flex', gap: 9, marginTop: 12, flexWrap: 'wrap' }}><Btn small ghost onClick={() => setFmt(inq.id, smaller)}><Arrow size={14} />Downsize to {smaller}</Btn><Btn small ghost onClick={() => setFmt(inq.id, 'DJ')}>Make it a DJ engagement</Btn></div>}
          </div>}
          {isDJ && <div style={{ border: '1px solid #efe6d4', background: '#faf5e9', borderRadius: 13, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#4a4a5e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}><span><b>DJ engagement</b> — no singers required.</span><Btn small ghost onClick={() => setFmt(inq.id, 'Quartet')}>Back to a singing format</Btn></div>}
          <div style={{ background: isOD ? '#FEF2F2' : '#faf5e9', border: `1px solid ${isOD ? '#FECACA' : '#efe6d4'}`, borderRadius: 13, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}><SectionTitle>Follow-up</SectionTitle>{isOD && <Pill bg="#FEE2E2" fg="#B91C1C">Overdue</Pill>}</div>
            <div style={{ display: 'flex', gap: 22, fontSize: 12.5, flexWrap: 'wrap', color: '#6b7280' }}>
              <span>Created <b style={{ color: '#1a1a2e' }}>{fmt(inq.created_at?.split('T')[0])}</b></span>
              <span>Last <b style={{ color: '#1a1a2e' }}>{inq.last_follow_up ? fmt(inq.last_follow_up) : 'never'}</b></span>
              <span>Next <b style={{ color: isOD ? '#B91C1C' : '#1a1a2e' }}>{inq.next_follow_up ? fmt(inq.next_follow_up) : 'N/A'}</b></span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <Btn grad={G.purple} onClick={() => sEmail({ lead: inq })}><Mail size={16} />Compose Email</Btn>
            <Btn ghost onClick={() => sEInq(inq.id)}><Pencil size={16} />Edit</Btn>
            <Btn ghost onClick={() => logFU(inq.id)}><Check size={16} />Log Follow-up</Btn>
            {inq.status === 'new' && <Btn ghost onClick={() => updIS(inq.id, 'contacted')}>Mark Contacted</Btn>}
            {(inq.status === 'new' || inq.status === 'contacted') && <Btn grad={covered || isDJ ? G.green : G.amber} onClick={() => updIS(inq.id, 'confirmed')}><Check size={16} />Confirm with client{!covered && !isDJ ? ' anyway' : ''}</Btn>}
            {inq.status === 'confirmed' && <Btn grad={G.green} onClick={() => convE(inq)}><Calendar size={16} />Add to Events</Btn>}
            {inq.status !== 'lost' && inq.status !== 'confirmed' && <Btn ghost danger onClick={() => updIS(inq.id, 'lost')}>Mark Lost</Btn>}
            <Btn ghost danger onClick={() => delI(inq.id)}><Trash size={15} />Delete</Btn>
          </div>
        </div>
      </div>
    </div>
  }

  return <div className="fade">
    <Header title="Bookings" sub="Track every inquiry from first hello to confirmed performance." action={{ label: 'New Inquiry', on: () => sShI(true) }} />
    {od.length > 0 && <div style={{ background: G.amber, color: '#fff', borderRadius: 14, padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 11, boxShadow: '0 8px 22px rgba(13,26,48,.18)' }}><Bell size={20} /><div style={{ fontSize: 13.5 }}><b>{od.length} overdue follow-up{od.length > 1 ? 's' : ''}:</b> {od.map(i => i.contact_name).join(', ')}</div></div>}
    <Filter opts={sts} val={lf} set={sLf} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{fd.map(inq => { const isOD = inq.status !== 'lost' && inq.next_follow_up && new Date(inq.next_follow_up + 'T12:00:00') < new Date()
      const fmtL = inq.format || 'Quartet'; const need = inq.singers_needed ?? 4; const ea = aMI[inq.id] || {}; const yc = Object.values(ea).filter(r => r === 'yes').length; const picked = Object.keys(ea).length
      let lp = null
      if (inq.status !== 'lost') {
        if (need === 0) lp = ['#CCFBF1', '#0f766e', 'DJ — no singers']
        else if (yc >= need) lp = ['#D1FAE5', '#047857', `${fmtL} ✓`]
        else if (picked === 0) lp = ['#f0e8d6', '#8a7a52', `${fmtL} · lineup TBD`]
        else lp = ['#FEF3C7', '#B45309', `${fmtL} · ${yc}/${need}`]
      }
      return <div key={inq.id} className="card lift" onClick={() => sSInq(inq.id)} style={{ padding: 17, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderLeft: isOD ? '4px solid #FB7185' : '4px solid transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <IconChip grad={inq.status === 'confirmed' ? G.green : inq.status === 'lost' ? 'linear-gradient(135deg,#cbd5e1,#94a3b8)' : G.purple} size={44}><Mail size={19} /></IconChip>
        <div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}><span style={{ fontSize: 15, fontWeight: 700 }}>{inq.contact_name}</span><Badge s={inq.status} />{isOD && <Pill bg="#FEE2E2" fg="#B91C1C">Overdue</Pill>}{lp && <Pill bg={lp[0]} fg={lp[1]}>{lp[2]}</Pill>}</div><div style={{ fontSize: 12.5, color: '#8a8598' }}>{inq.organization} · {inq.event_type}</div></div>
      </div>
      <div style={{ textAlign: 'right' }}><div style={{ fontSize: 16, fontWeight: 800, color: '#1c3564' }}>{$(inq.expected_donation)}</div><div style={{ fontSize: 11.5, color: '#8a8598' }}>{inq.event_date ? fmt(inq.event_date) : 'TBD'}</div></div>
    </div> })}{!fd.length && <Empty>No bookings in this view.</Empty>}</div>
  </div>
}

/* ---------- prospects (CRM) ---------- */
function Prospects({ P, pf, sPf, ptf, sPtf, pq, sPq, shP, sShP, sPro, sSPro, updPS, sEP, convP, sEmail }) {
  const statuses = [['all', 'All'], ['prospect', 'Prospect'], ['contacted', 'Contacted'], ['interested', 'Interested'], ['booked', 'Booked'], ['passed', 'Passed']]
  const stars = n => '★★★★★'.slice(0, Math.max(0, Math.min(5, n || 0)))
  const composeP = x => sEmail({ lead: { contact_name: x.organizer_name || '', organization: x.organization, email: x.email, status: x.status } })
  const [dq, setDq] = useState({ email: false, contact: false, phone: false })
  const dqDefs = [['email', 'Has email', '#20a89a'], ['contact', 'Has contact', '#e07830'], ['phone', 'Has phone', '#3898d4']]
  const has = (x, k) => k === 'contact' ? !!(x.organizer_name || '').trim() : !!(x[k] || '').trim()

  if (sPro) {
    const x = P.find(p => p.id === sPro); if (!x) return null
    const ps = PS[x.status] || PS.prospect
    return <div className="fade">
      <BackBtn onClick={() => sSPro(null)} />
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ background: PTC[x.org_type] || G.purple, padding: '24px 26px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h2 className="serif" style={{ fontSize: 24, fontWeight: 700 }}>{x.organization}</h2><div style={{ fontSize: 13, opacity: .92, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}><span>{x.org_type}</span>{x.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{x.city}</span>}</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, color: '#FDE68A', letterSpacing: 1 }} title={`Fit ${x.fit_score}/5`}>{stars(x.fit_score)}</div><div style={{ marginTop: 6 }}><Pill bg="rgba(255,255,255,.2)" fg="#fff">{ps.l}</Pill></div></div>
        </div>
        <div style={{ padding: 26 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 18 }}>
            <Stat ic={<Users size={16} />} l="Contact" v={x.organizer_name ? `${x.organizer_name}${x.organizer_role ? ` · ${x.organizer_role}` : ''}` : '—'} />
            <Stat ic={<Phone size={16} />} l="Phone" v={x.phone || '—'} />
            <Stat ic={<Mail size={16} />} l="Email" v={x.email || '— (not public — call to confirm)'} />
            <Stat ic={<Globe size={16} />} l="Website" v={x.website ? <a href={x.website} target="_blank" rel="noreferrer" style={{ color: '#1c3564' }}>{x.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a> : '—'} />
          </div>
          {x.notes && <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#4b5563', background: '#faf5e9', padding: 15, borderRadius: 12, marginBottom: 16 }}>{x.notes}</div>}
          {x.source && <div style={{ fontSize: 11.5, color: '#8a8598', marginBottom: 18 }}>Source: <a href={x.source} target="_blank" rel="noreferrer" style={{ color: '#6e6e82' }}>{x.source.replace(/^https?:\/\//, '').slice(0, 60)}</a></div>}
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <Btn grad={G.purple} onClick={() => composeP(x)}><Mail size={16} />Compose Email</Btn>
            {x.status === 'prospect' && <Btn ghost onClick={() => updPS(x.id, 'contacted')}><Check size={16} />Mark Contacted</Btn>}
            {x.status !== 'interested' && x.status !== 'booked' && <Btn ghost onClick={() => updPS(x.id, 'interested')}>Mark Interested</Btn>}
            <Btn grad={G.green} onClick={() => convP(x)}><Send size={16} />Convert to Booking</Btn>
            <Btn ghost onClick={() => sEP(x.id)}><Pencil size={16} />Edit</Btn>
            {x.status !== 'passed' && <Btn ghost danger onClick={() => updPS(x.id, 'passed')}>Pass</Btn>}
          </div>
        </div>
      </div>
    </div>
  }

  const fd = P.filter(x => (pf === 'all' || x.status === pf) && (ptf === 'all' || x.org_type === ptf) && (!pq || [x.organization, x.city, x.organizer_name, x.org_type].some(v => (v || '').toLowerCase().includes(pq.toLowerCase()))) && dqDefs.every(([k]) => !dq[k] || has(x, k)))
  const byType = PTYPES.map(t => [t, P.filter(x => x.org_type === t).length]).filter(([, n]) => n)
  const active = P.filter(x => x.status !== 'passed').length

  return <div className="fade">
    <Header title="Prospects" sub="Local Houston-area groups that book a vocal ensemble like ours." action={{ label: 'Add Prospect', on: () => sShP(true) }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 18 }}>
      <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 800, color: '#8a8598', textTransform: 'uppercase', letterSpacing: '.05em' }}>Active Targets</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{active}</div></div>
      {byType.map(([t, n]) => <div key={t} className="card lift" style={{ padding: 16, cursor: 'pointer' }} onClick={() => sPtf(ptf === t ? 'all' : t)}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IconChip grad={PTC[t]} size={30}><Target size={15} /></IconChip><div style={{ fontSize: 11.5, fontWeight: 700, color: '#4a4a5e', lineHeight: 1.15 }}>{t}</div></div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>{n}</div></div>)}
    </div>
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <Filter opts={statuses} val={pf} set={sPf} />
      <div style={{ flex: 1, minWidth: 200, position: 'relative', marginBottom: 18 }}><span style={{ position: 'absolute', left: 13, top: 11, color: '#a8a3b5' }}><Search size={17} /></span><input value={pq} onChange={e => sPq(e.target.value)} placeholder="Search org, city, or contact…" style={{ width: '100%', padding: '11px 12px 11px 38px', borderRadius: 12, border: '1px solid #e2d6bd', fontSize: 13.5, background: '#fff' }} /></div>
    </div>
    <div className="ui" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16, marginTop: -4 }}>
      <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8a8598' }}>Only show</span>
      {dqDefs.map(([k, label, c]) => { const on = dq[k]; const n = P.filter(x => has(x, k)).length; return <button key={k} onClick={() => setDq(d => ({ ...d, [k]: !d[k] }))} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, border: `1px solid ${on ? c : '#e2d6bd'}`, background: on ? c : '#fff', color: on ? '#fff' : '#4a4a5e' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: on ? '#fff' : c }} />{label}<span style={{ opacity: .7, fontWeight: 700 }}>{n}</span></button> })}
      {(dq.email || dq.contact || dq.phone) && <button onClick={() => setDq({ email: false, contact: false, phone: false })} style={{ fontSize: 11, color: '#8a8598', fontWeight: 700 }}>clear</button>}
    </div>
    {ptf !== 'all' && <div style={{ marginBottom: 14, fontSize: 12.5 }}><Pill bg="#EDE9FE" fg="#1c3564">{ptf}</Pill> <button onClick={() => sPtf('all')} style={{ fontSize: 12, color: '#8a8598', fontWeight: 700 }}>clear type filter</button></div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>{fd.map(x => { const ps = PS[x.status] || PS.prospect; return <div key={x.id} className="card lift" onClick={() => sSPro(x.id)} style={{ padding: 16, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <IconChip grad={PTC[x.org_type] || G.purple} size={40}><Target size={18} /></IconChip>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.organization}</div>
          <div style={{ fontSize: 11.5, color: '#8a8598', marginTop: 2 }}>{x.org_type}{x.city ? ` · ${x.city}` : ''}</div>
        </div>
        <Pill bg={ps.bg} fg={ps.fg}>{ps.l}</Pill>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 8 }}>
        <div style={{ fontSize: 12, color: '#4a4a5e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.organizer_name || x.email || x.phone || 'No contact yet'}</div>
        <div style={{ fontSize: 13, color: '#F59E0B', letterSpacing: 1, flexShrink: 0 }} title={`Fit ${x.fit_score}/5`}>{stars(x.fit_score)}</div>
      </div>
    </div> })}{!fd.length && <Empty>No prospects in this view.</Empty>}</div>
  </div>
}

/* ---------- events ---------- */
function Events({ E, sEv, sSEv, updR, M, R, aR, aM, sEmail, sShEv, sEEv, sShProg, sShG, togSel, delEv, U }) {
  const [evf, setEvf] = useState('upcoming')
  if (sEv) { const ev = E.find(e => e.id === sEv); if (!ev) return null; const ea = aM[ev.id] || {}; const yc = Object.values(ea).filter(r => r === 'yes').length; const pc = Object.values(ea).filter(r => r === 'pending').length; const need = ev.singers_needed ?? 4; const ok = yc >= need
    const sel = aR.filter(m => ea[m.id] !== undefined); const recips = sel.filter(m => m.email).map(m => m.email).join(',')
    const away = new Set((U || []).filter(u => ev.event_date && u.date === ev.event_date).map(u => u.roster_id)); const awayNames = aR.filter(m => away.has(m.id)).map(m => m.name.split(' ')[0])
    const progN = (ev.songs_planned || []).length
    const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const evSteps = [
      ...(need > 0 ? [{ key: 'lineup', label: 'Lineup', done: ok, hint: ok ? 'Lineup confirmed for the date.' : 'Confirm enough singers for the date.', actionLabel: 'Manage availability', onAction: () => scrollTo('ev-avail') }] : []),
      { key: 'program', label: 'Program', done: progN > 0, hint: 'Choose the songs for this performance.', actionLabel: 'Pick songs', onAction: () => sShProg(ev.id) },
      { key: 'proposal', label: 'Proposal', done: false, hint: 'Send the song program to the client.', actionLabel: progN > 0 ? 'Send proposal' : null, onAction: () => sEmail({ proposal: ev, songs: (ev.songs_planned || []).map(sid => M.find(x => x.id === sid)?.title).filter(Boolean) }) },
    ]
    return <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><BackBtn onClick={() => sSEv(null)} /><div style={{ display: 'flex', gap: 8 }}><Btn ghost small onClick={() => sEEv(ev.id)}><Pencil size={14} />Edit Event</Btn><Btn ghost small danger onClick={() => delEv(ev.id)}><Trash size={14} />Delete</Btn></div></div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ background: ok ? G.green : pc ? G.amber : 'linear-gradient(135deg,#F87171,#EF4444)', padding: '24px 26px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><h2 className="serif" style={{ fontSize: 24, fontWeight: 700 }}>{ev.title}</h2><div style={{ fontSize: 13.5, opacity: .92, marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={14} />{ev.event_date ? fmtLong(ev.event_date) : 'Date TBD'}{ev.event_time ? ` · ${ev.event_time}` : ''}</span>{ev.venue && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} />{ev.venue}</span>}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{$(ev.donation)}</div><div style={{ marginTop: 5 }}><Badge s={ev.status} /></div></div>
          </div>
          <div style={{ marginTop: 16, background: 'rgba(255,255,255,.18)', borderRadius: 11, padding: '11px 15px', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>{need === 0 ? <><Check size={17} />DJ engagement — no singers required.</> : ok ? <><Check size={17} />{yc} confirmed — full {ev.format || 'lineup'}!</> : <><Bell size={17} />{yc} confirmed{pc ? `, ${pc} pending` : ''} — need {need}.</>}</div>
        </div>
        <div style={{ padding: 26 }}>
          {(ev.contact_name || ev.notes) && <div style={{ display: 'grid', gap: 9, marginBottom: 20, background: '#faf5e9', borderRadius: 13, padding: 16 }}>
            {ev.contact_name && <Row ic={<Phone size={16} />}>{ev.contact_name}</Row>}
            {ev.notes && <Row ic={<Sparkle size={16} />}>{ev.notes}</Row>}
          </div>}
          {!(ev.event_date && ev.event_date < ymd(new Date())) && <NextStepCard steps={evSteps} />}
          {need > 0 && <><div id="ev-avail" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}><SectionTitle>Singer Availability · {yc}/{need} confirmed</SectionTitle><div style={{ display: 'flex', gap: 8 }}><Btn small ghost onClick={() => sShG(true)}><Plus size={14} />Guest</Btn>{sel.length > 0 && <Btn small grad={G.amber} onClick={() => sEmail({ availability: ev, recipients: recips })}><Send size={14} />Email Request</Btn>}</div></div>
          {awayNames.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEE2E2', color: '#B91C1C', borderRadius: 10, padding: '9px 13px', marginBottom: 12, fontSize: 12.5, fontWeight: 700 }}><Bell size={15} />Unavailable on {fmt(ev.event_date)}: {awayNames.join(', ')}</div>}
          <div style={{ marginBottom: 22 }}><LineupList aR={aR} ea={ea} away={away} onTog={rid => togSel('event', ev.id, rid)} onSet={(rid, r) => updR(ev.id, rid, r)} /></div></>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}><SectionTitle>Program ({(ev.songs_planned || []).length} pieces)</SectionTitle><div style={{ display: 'flex', gap: 8 }}><Btn small ghost onClick={() => sShProg(ev.id)}><Plus size={14} />Edit Program</Btn>{(ev.songs_planned || []).length > 0 && <Btn small grad={G.purple} onClick={() => sEmail({ proposal: ev, songs: (ev.songs_planned || []).map(sid => M.find(x => x.id === sid)?.title).filter(Boolean) })}><Send size={14} />Send Proposal</Btn>}</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{(ev.songs_planned || []).map((sid, i) => { const s = M.find(x => x.id === sid); return s ? <div key={sid} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', background: '#faf5e9', borderRadius: 10 }}><span style={{ width: 24, height: 24, borderRadius: 7, background: G.purple, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span><span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{s.title}</span><Pill bg={s.cloud_only ? '#f0e8d6' : '#D1FAE5'} fg={s.cloud_only ? '#6e6e82' : '#047857'}>{s.cloud_only ? 'Cloud' : 'iPad'}</Pill></div> : null })}{!(ev.songs_planned || []).length && <Empty>No program set yet.</Empty>}</div>
        </div>
      </div>
    </div>
  }

  const tkey = ymd(new Date()); const yr = String(new Date().getFullYear())
  const totalRev = E.reduce((s, e) => s + Number(e.donation || 0), 0)
  const yearRev = E.filter(e => (e.event_date || '').slice(0, 4) === yr).reduce((s, e) => s + Number(e.donation || 0), 0)
  const upN = E.filter(e => e.event_date && e.event_date >= tkey).length
  const fE = E.filter(e => evf === 'all' ? true : evf === 'upcoming' ? (e.event_date && e.event_date >= tkey) : (!e.event_date || e.event_date < tkey))
    .sort((a, b) => { const da = a.event_date || '', db = b.event_date || ''; return evf === 'upcoming' ? (da < db ? -1 : 1) : (da > db ? -1 : 1) })
  return <div className="fade">
    <Header title="Events" sub="Performances, revenue, and lineups." action={{ label: 'Add Event', on: () => sShEv(true) }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
      {[['All-time revenue', $(totalRev)], [`${yr} revenue`, $(yearRev)], ['Performances', E.length]].map(([l, v], i) => <div key={i} className="card" style={{ padding: '14px 16px' }}><div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: '#8a8598' }}>{l}</div><div style={{ fontSize: 22, fontWeight: 800, color: '#1c3564', marginTop: 4 }}>{v}</div></div>)}
    </div>
    <Filter opts={[['upcoming', `Upcoming${upN ? ` · ${upN}` : ''}`], ['past', 'Past'], ['all', `All · ${E.length}`]]} val={evf} set={setEvf} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{fE.map(ev => { const ea = aM[ev.id] || {}; const yc = Object.values(ea).filter(r => r === 'yes').length; const pcn = Object.values(ea).filter(r => r === 'pending').length; const need = ev.singers_needed ?? 4; const tot = need || aR.length || 1; const d = dU(ev.event_date); const ok = yc >= need; const isPast = ev.event_date && ev.event_date < tkey
    return <div key={ev.id} className="card lift" onClick={() => sSEv(ev.id)} style={{ padding: 19, cursor: 'pointer', display: 'flex', gap: 18, alignItems: 'center' }}>
      <div style={{ textAlign: 'center', width: 58, flexShrink: 0 }}>{ev.event_date ? <><div style={{ fontSize: 11, fontWeight: 800, color: '#8a8598', textTransform: 'uppercase' }}>{new Date(ev.event_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}</div><div className="serif" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: '#1a1a2e' }}>{new Date(ev.event_date + 'T12:00:00').getDate()}</div><div style={{ fontSize: 10, color: '#a8a3b5', fontWeight: 700 }}>{new Date(ev.event_date + 'T12:00:00').getFullYear()}</div></> : <div className="serif" style={{ fontSize: 15, fontWeight: 700, color: '#8a8598' }}>TBD</div>}</div>
      <div style={{ width: 1, alignSelf: 'stretch', background: '#efe6d4' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><span className="serif" style={{ fontSize: 18, fontWeight: 700 }}>{ev.title}</span>{!isPast && <Badge s={ev.status} />}</div>
        <div style={{ fontSize: 12.5, color: '#8a8598', marginBottom: isPast ? 0 : 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>{ev.event_time && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} />{ev.event_time}</span>}{ev.venue && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{ev.venue}</span>}{ev.contact_name && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} />{ev.contact_name}</span>}</div>
        {!isPast && <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><div style={{ flex: 1, maxWidth: 220, height: 7, borderRadius: 4, background: '#f0e8d6', overflow: 'hidden', display: 'flex' }}><div style={{ width: `${(yc / tot) * 100}%`, background: G.green }} /><div style={{ width: `${(pcn / tot) * 100}%`, background: 'linear-gradient(90deg,#FBBF24,#F59E0B)' }} /></div><span style={{ fontSize: 12, fontWeight: 700, color: ok ? '#047857' : '#6b7280' }}>{need === 0 ? 'DJ' : `${yc}/${need} yes`}</span>{(ok || need === 0) && <Pill bg="#D1FAE5" fg="#047857">{need === 0 ? 'DJ set' : `${ev.format || 'Lineup'} ready`}</Pill>}</div>}
        {isPast && ev.notes && <div style={{ fontSize: 12, color: '#a8a3b5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.notes}</div>}
      </div>
      <div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 800, color: Number(ev.donation) > 0 ? '#1c3564' : '#cfc8d8' }}>{$(ev.donation)}</div><div style={{ fontSize: 11.5, fontWeight: 700, color: d <= 7 && d > 0 && ev.event_date ? '#EF4444' : '#8a8598' }}>{!ev.event_date ? 'Set date' : d > 0 ? `${d} days` : 'Past'}</div></div>
    </div> })}{!fE.length && <Empty>No {evf === 'upcoming' ? 'upcoming ' : evf === 'past' ? 'past ' : ''}events.</Empty>}</div>
  </div>
}

/* ---------- program picker (build an event's set list) ---------- */
function ProgramPicker({ ev, M, onX, onTog }) {
  const [q, setQ] = useState('')
  const sel = new Set(ev.songs_planned || [])
  const fd = M.filter(s => !q || s.title.toLowerCase().includes(q.toLowerCase()) || (s.arranger || '').toLowerCase().includes(q.toLowerCase()))
  return <Modal onX={onX}>
    <div style={{ background: G.purple, padding: '20px 26px', color: '#fff' }}><h2 className="serif" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>Program</h2><div className="ui" style={{ fontSize: 12, opacity: .9, marginTop: 2 }}>{ev.title} · {sel.size} piece{sel.size === 1 ? '' : 's'} selected</div></div>
    <div style={{ padding: 22 }}>
      <div style={{ position: 'relative', marginBottom: 14 }}><span style={{ position: 'absolute', left: 13, top: 11, color: '#a8a3b5' }}><Search size={17} /></span><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the library…" style={{ width: '100%', padding: '11px 12px 11px 38px', borderRadius: 11, border: '1px solid #e2d6bd', fontSize: 13.5, background: '#fff' }} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 360, overflow: 'auto' }}>
        {fd.map(s => { const on = sel.has(s.id); return <button key={s.id} onClick={() => onTog(ev.id, s.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 13px', borderRadius: 11, border: `1px solid ${on ? '#20a89a' : '#e2d6bd'}`, background: on ? '#d6f3ef' : '#fff', textAlign: 'left' }}>
          <div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e' }}>{s.title}</div><div style={{ fontSize: 11.5, color: '#8a8598' }}>{s.arranger || 'Traditional'} · {s.category}</div></div>
          <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: on ? '#20a89a' : '#f0e8d6', color: on ? '#fff' : '#8a8598', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on ? <Check size={15} /> : <Plus size={15} />}</span>
        </button> })}
        {!fd.length && <Empty>{M.length ? 'No arrangements match your search.' : 'Your library is empty — add arrangements in the Music tab first.'}</Empty>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}><Btn grad={G.purple} onClick={onX}><Check size={15} />Done</Btn></div>
    </div>
  </Modal>
}

/* ---------- email composer ---------- */
function EmailComposer({ email, sEmail, aR, onLogged, noti, emailCfg, emailFrom }) {
  const isAvail = !!email.availability
  const isProposal = !!email.proposal
  const isFollowup = !isAvail && !isProposal
  const lead = email.lead
  const ev = email.availability || email.proposal
  const defType = isFollowup ? (lead.status === 'prospect' ? 'intro' : lead.status === 'contacted' ? 'followup' : lead.status === 'confirmed' ? 'confirmation' : lead.status === 'lost' ? 'thanks' : 'outreach') : null
  const [type, sType] = useState(defType)
  const built = useMemo(() => isAvail ? buildAvailabilityEmail(ev) : isProposal ? buildProposalEmail(email.proposal, email.songs) : buildEmail(type, lead), [type, isAvail, isProposal, lead, ev, email.songs, email.proposal])
  const [subject, sSubject] = useState(built.subject)
  const [body, sBody] = useState(built.text)
  useEffect(() => { sSubject(built.subject); sBody(built.text) }, [built])

  const accent = isAvail ? G.amber : G.purple
  const recipients = isAvail ? (email.recipients || '') : isProposal ? '' : (lead.email || '')
  const copy = async (html) => {
    try {
      if (html && navigator.clipboard && navigator.clipboard.write) await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([built.html], { type: 'text/html' }), 'text/plain': new Blob([body], { type: 'text/plain' }) })])
      else await navigator.clipboard.writeText(body)
      noti(html ? 'Formatted email copied' : 'Email text copied')
    } catch { noti('Copy unavailable — please select the text manually') }
  }
  const openMail = () => { window.location.href = mailto(recipients, subject, body); if (isFollowup && onLogged) onLogged(lead.id) }
  const [sending, setSending] = useState(false)
  const sendNow = async () => {
    if (!recipients) { noti('Add a recipient first'); return }
    setSending(true)
    const { data, error } = await sb.functions.invoke('send-email', { body: { to: recipients, subject, html: built.html, text: body } })
    setSending(false)
    if (error) { let msg = 'Send failed — try again'; try { const j = await error.context.json(); if (j?.error) msg = j.error } catch { /* ignore */ } noti(msg); return }
    if (data?.error) { noti(data.error); return }
    noti(`Sent the branded email to ${data.sent} recipient${data.sent > 1 ? 's' : ''} 🎵`)
    if (isFollowup && onLogged) onLogged(lead.id)
    sEmail(null)
  }
  const title = isAvail ? 'Availability Request' : isProposal ? 'Program Proposal' : 'Compose Follow-up'
  const sub = isAvail ? `To the ensemble · ${ev.title}` : isProposal ? `To the client · ${ev.title}` : `To ${lead.contact_name} · ${lead.organization}`

  return <Modal onX={() => sEmail(null)} wide>
    <div style={{ background: accent, padding: '20px 26px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Mail size={24} /><div><div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div><div style={{ fontSize: 12.5, opacity: .9 }}>{sub}</div></div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
      <div style={{ padding: 22, overflowY: 'auto', borderRight: '1px solid #efe6d4' }}>
        {isFollowup && <><SectionTitle>Template</SectionTitle><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>{Object.entries(TEMPLATES).map(([k, t]) => <button key={k} onClick={() => sType(k)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 11, border: type === k ? '2px solid #1c3564' : '1px solid #e2d6bd', background: type === k ? '#faf3e6' : '#fff' }}><div style={{ fontSize: 12.5, fontWeight: 800, color: type === k ? '#1c3564' : '#1a1a2e' }}>{t.label}</div><div style={{ fontSize: 10.5, color: '#8a8598', marginTop: 2 }}>{t.hint}</div></button>)}</div></>}
        <SectionTitle>Recipients</SectionTitle>
        <div style={{ fontSize: 12.5, color: recipients ? '#4b5563' : '#8a8598', background: '#faf5e9', borderRadius: 10, padding: '9px 12px', marginBottom: 16, wordBreak: 'break-all' }}>{recipients || (isAvail ? 'No emails on file for the picked singers' : isProposal ? 'Add the client’s email in your mail app' : 'No email address on file')}</div>
        <SectionTitle>Subject</SectionTitle>
        <input value={subject} onChange={e => sSubject(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 11, border: '1px solid #e2d6bd', fontSize: 13.5, marginBottom: 16 }} />
        <SectionTitle>Message</SectionTitle>
        <textarea value={body} onChange={e => sBody(e.target.value)} style={{ width: '100%', minHeight: 190, padding: 12, borderRadius: 11, border: '1px solid #e2d6bd', fontSize: 13, lineHeight: 1.55, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>
      <div style={{ padding: 22, background: '#fdf8ee', overflowY: 'auto' }}>
        <SectionTitle>Live Preview</SectionTitle>
        <iframe title="preview" srcDoc={built.html} style={{ width: '100%', height: 430, border: '1px solid #e2d6bd', borderRadius: 13, background: '#fff' }} />
      </div>
    </div>
    <div style={{ padding: '16px 22px', borderTop: '1px solid #efe6d4', display: 'flex', gap: 9, justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ marginRight: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}><EmailStatus cfg={emailCfg} from={emailFrom} /><span style={{ fontSize: 10.5, color: '#8a8598' }}>{emailCfg === 'on' ? 'Send Now delivers the branded email directly.' : 'Set up Gmail to enable Send Now · Open in Mail App sends plain text'}</span></div>
      <Btn ghost onClick={() => copy(true)}><Copy size={15} />Copy Formatted</Btn>
      <Btn ghost onClick={openMail}><Mail size={15} />Open in Mail App</Btn>
      <Btn grad={accent} onClick={sendNow}><Send size={15} />{sending ? 'Sending…' : 'Send Now'}</Btn>
    </div>
  </Modal>
}

/* ---------- shared ui ---------- */
const Header = ({ title, sub, action }) => <div style={{ marginBottom: 22 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
    <div><h1 className="serif gtext" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>{title}</h1><p className="ui" style={{ color: '#6e6e82', fontSize: 13.5, marginTop: 4 }}>{sub}</p></div>
    {action && <button onClick={action.on} className="ui" style={{ padding: '11px 20px', borderRadius: 8, background: '#0d1a30', color: '#e8b430', fontSize: 11.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 8px 20px rgba(13,26,48,.22)' }}>{action.icon || <Plus size={17} />}{action.label}</button>}
  </div>
  <div style={{ marginTop: 12 }}><MusicalPhrase variant="light" vh={34} /></div>
</div>
const Filter = ({ opts, val, set }) => <div style={{ display: 'inline-flex', gap: 3, background: '#fff', borderRadius: 12, padding: 4, border: '1px solid #efe6d4', marginBottom: 18, flexWrap: 'wrap' }}>{opts.map(([v, l]) => <button key={v} onClick={() => set(v)} style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, background: val === v ? G.purple : 'transparent', color: val === v ? '#fff' : '#6e6e82', transition: 'all .15s' }}>{l}</button>)}</div>
const Btn = ({ children, grad, ghost, danger, small, ...p }) => { const isNavy = !ghost && (!grad || grad === G.purple); return <button {...p} className="ui" style={{ padding: small ? '7px 13px' : '10px 17px', borderRadius: 8, fontSize: small ? 11 : 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 7, background: ghost ? '#fff' : (grad || G.purple), color: ghost ? (danger ? '#B91C1C' : '#4a4a5e') : (isNavy ? '#e8b430' : '#fff'), border: ghost ? `1px solid ${danger ? '#FECACA' : '#e2d6bd'}` : 'none', boxShadow: ghost ? 'none' : '0 6px 16px rgba(13,26,48,.18)' }}>{children}</button> }
const BackBtn = ({ onClick }) => <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1c3564', fontSize: 13.5, fontWeight: 700, marginBottom: 18 }}><Arrow size={16} style={{ transform: 'rotate(180deg)' }} />Back</button>
const EmailStatus = ({ cfg, from }) => { const map = { checking: ['#f0e8d6', '#6e6e82', 'Checking email…'], on: ['#D1FAE5', '#047857', `Email connected${from ? ' · ' + from : ''}`], off: ['#FEF3C7', '#B45309', 'Email not configured'], error: ['#FEE2E2', '#B91C1C', 'Email check failed'] }; const [bg, fg, label] = map[cfg] || map.checking; return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999, background: bg, color: fg, fontSize: 11.5, fontWeight: 700 }}><Mail size={13} />{label}</span> }
// Guided "what's next" coach. `steps` = [{ key, label, done, hint, actionLabel?, onAction? }]
function NextStepCard({ steps }) {
  const nextIdx = steps.findIndex(s => !s.done)
  const cur = nextIdx === -1 ? null : steps[nextIdx]
  const doneN = steps.filter(s => s.done).length
  return <div style={{ background: '#0d1a30', borderRadius: 14, padding: '15px 18px', marginBottom: 20, color: '#fff', boxShadow: '0 10px 28px rgba(13,26,48,.22)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <Sparkle size={15} color="#e8b430" />
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#e8b430' }}>{cur ? 'Next step' : 'All set 🎉'}</span>
      <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9aa4b8', fontWeight: 700 }}>{doneN}/{steps.length} done</span>
    </div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: cur ? 13 : 0 }}>
      {steps.map((s, i) => { const isCur = i === nextIdx; return <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: s.done ? 'rgba(32,168,154,.22)' : isCur ? '#e8b430' : 'rgba(255,255,255,.07)', color: s.done ? '#7ee0cf' : isCur ? '#0d1a30' : '#9aa4b8' }}>
        <span style={{ width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 800, background: s.done ? '#20a89a' : isCur ? '#0d1a30' : 'rgba(255,255,255,.14)', color: '#fff' }}>{s.done ? '✓' : i + 1}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700 }}>{s.label}</span>
      </div> })}
    </div>
    {cur && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13.5, color: '#dbe2ef' }}>{cur.hint}</span>
      {cur.actionLabel && <Btn small grad={G.amber} onClick={cur.onAction}>{cur.actionLabel}</Btn>}
    </div>}
  </div>
}
const Empty = ({ children }) => <div className="card" style={{ padding: 32, textAlign: 'center', color: '#8a8598', fontSize: 13.5, gridColumn: '1/-1' }}>
  <svg width="22" height="34" viewBox="0 0 38 62" style={{ display: 'block', margin: '0 auto 12px', opacity: .55 }}><path d="M 18 58 C 14 54 8 46 8 38 C 8 30 12 26 18 24 L 18 24 C 18 18 18 10 20 6 C 22 2 26 0 28 2 C 30 4 28 8 26 12 C 24 16 20 22 18 28 L 18 28 C 24 28 30 32 30 40 C 30 48 24 52 18 52 C 14 52 12 48 12 44 C 12 40 14 38 18 38 C 22 38 24 40 24 44 C 24 46 22 48 20 48" fill="none" stroke="#c9a23a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  {children}
</div>
const Row = ({ ic, children }) => <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}><span style={{ color: '#a8a3b5' }}>{ic}</span>{children}</div>
const Stat = ({ ic, l, v }) => <div style={{ background: '#faf5e9', borderRadius: 12, padding: 14 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#8a8598', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '.05em', marginBottom: 6 }}>{ic}{l}</div><div style={{ fontSize: 14.5, fontWeight: 700 }}>{v}</div></div>
function Modal({ children, onX, wide }) { return <div onClick={onX} style={{ position: 'fixed', inset: 0, background: 'rgba(30,20,55,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500, padding: 20 }}><div onClick={e => e.stopPropagation()} className="card" style={{ width: wide ? 880 : 440, maxWidth: '100%', maxHeight: '92vh', overflow: 'auto', animation: 'pop .25s ease' }}>{children}</div></div> }

function FModal({ t, sub, onX, fs, onOk }) {
  const gd = f => f.df !== undefined ? f.df : (f.ty === 'num' ? 0 : '')
  const [fm, sFm] = useState(Object.fromEntries(fs.map(f => [f.k, gd(f)])))
  const up = (k, v) => sFm(p => ({ ...p, [k]: v }))
  const ok = fs.filter(f => f.rq).every(f => fm[f.k])
  const st = { width: '100%', padding: '10px 12px', borderRadius: 11, border: '1px solid #e2d6bd', fontSize: 13.5, background: '#fff' }
  return <Modal onX={onX}>
    <div style={{ background: G.purple, padding: '20px 26px', color: '#fff' }}><h2 className="serif" style={{ fontSize: 20, fontWeight: 700 }}>{t}</h2>{sub && <div style={{ fontSize: 12.5, opacity: .9, marginTop: 2 }}>{sub}</div>}</div>
    <div style={{ padding: 26 }}>
      <div style={{ display: 'grid', gap: 13 }}>{fs.map(f => { const lbl = <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6e6e82', marginBottom: 5, display: 'block' }}>{f.l}{f.rq ? <span style={{ color: '#d03a6a' }}> *</span> : null}</label>
        if (f.ty === 'sel') return <div key={f.k}>{lbl}<select style={st} value={fm[f.k]} onChange={e => up(f.k, e.target.value)}>{f.opts.map(o => <option key={o}>{o}</option>)}</select></div>
        if (f.ty === 'tog') return <div key={f.k}>{lbl}<div style={{ display: 'flex', gap: 7 }}>{f.opts.map(o => <button key={o} onClick={() => up(f.k, o)} style={{ flex: 1, padding: '10px 0', borderRadius: 11, fontSize: 12.5, fontWeight: 700, border: fm[f.k] === o ? '2px solid #1c3564' : '1px solid #e2d6bd', background: fm[f.k] === o ? '#faf3e6' : '#fff', color: fm[f.k] === o ? '#1c3564' : '#9ca3af' }}>{o === 'member' ? 'Core' : o === 'guest' ? 'Guest' : o}</button>)}</div></div>
        if (f.ty === 'area') return <div key={f.k}>{lbl}<textarea style={{ ...st, minHeight: 72, resize: 'vertical' }} value={fm[f.k]} onChange={e => up(f.k, e.target.value)} /></div>
        if (f.ty === 'date') return <div key={f.k}>{lbl}<input type="date" style={st} value={fm[f.k]} onChange={e => up(f.k, e.target.value)} /></div>
        if (f.ty === 'num') return <div key={f.k}>{lbl}<input type="number" style={st} value={fm[f.k]} onChange={e => up(f.k, parseFloat(e.target.value) || 0)} /></div>
        return <div key={f.k}>{lbl}<input style={st} value={fm[f.k]} onChange={e => up(f.k, e.target.value)} /></div>
      })}</div>
      <div style={{ display: 'flex', gap: 9, marginTop: 22, justifyContent: 'flex-end' }}>
        <Btn ghost onClick={onX}>Cancel</Btn>
        <button onClick={() => ok && onOk(fm)} style={{ padding: '10px 22px', borderRadius: 11, background: G.purple, color: '#fff', fontSize: 13, fontWeight: 700, opacity: ok ? 1 : .4, boxShadow: '0 6px 16px rgba(13,26,48,.22)' }}>Save</button>
      </div>
    </div>
  </Modal>
}

// Guided, step-by-step creation of a new booking inquiry.
const OCCASIONS = ['Luncheon', 'Sunday Service', 'Club Meeting', 'Holiday Celebration', 'Annual Gala', 'Concert', 'Wedding', 'Memorial', 'Other']
function BookingWizard({ onX, onOk }) {
  const [step, setStep] = useState(0)
  const [d, setD] = useState({ contact: '', org: '', phone: '', email: '', eventDate: '', eventType: 'Luncheon', format: 'Quartet', expectedDonation: 0, notes: '' })
  const set = (k, v) => setD(p => ({ ...p, [k]: v }))
  const steps = [
    { t: 'Who’s asking?', sub: 'The client and how to reach them.' },
    { t: 'What’s the event?', sub: 'When it is and what kind of occasion.' },
    { t: 'What will you send?', sub: 'The format sets how many singers you’ll need.' },
    { t: 'Anything else?', sub: 'Add any notes, then create the booking.' },
  ]
  const last = step === steps.length - 1
  const canNext = step === 0 ? !!(d.contact.trim() && d.org.trim()) : true
  const st = { width: '100%', padding: '11px 13px', borderRadius: 11, border: '1px solid #e2d6bd', fontSize: 13.5, background: '#fff', boxSizing: 'border-box' }
  const Lbl = ({ children, req }) => <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.4px', color: '#8a8598', textTransform: 'uppercase', margin: '14px 0 6px' }}>{children}{req && <span style={{ color: '#d03a6a' }}> *</span>}</div>
  const need = fmtNeed(d.format)
  return <Modal onX={onX}>
    <div style={{ background: G.purple, padding: '20px 26px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 className="serif" style={{ fontSize: 20, fontWeight: 700 }}>New Booking · {steps[step].t}</h2>
        <span style={{ fontSize: 12, color: '#e8b430', fontWeight: 700 }}>Step {step + 1} of {steps.length}</span>
      </div>
      <div style={{ fontSize: 12.5, opacity: .9, marginTop: 2 }}>{steps[step].sub}</div>
      <div style={{ height: 6, background: 'rgba(255,255,255,.15)', borderRadius: 4, marginTop: 12 }}><div style={{ height: '100%', width: `${(step + 1) / steps.length * 100}%`, background: '#e8b430', borderRadius: 4, transition: 'width .3s' }} /></div>
    </div>
    <div style={{ padding: '8px 26px 26px', minHeight: 230 }}>
      {step === 0 && <>
        <Lbl req>Contact name</Lbl><input autoFocus style={st} value={d.contact} onChange={e => set('contact', e.target.value)} placeholder="e.g. Ms. Carter" />
        <Lbl req>Organization</Lbl><input style={st} value={d.org} onChange={e => set('org', e.target.value)} placeholder="e.g. Houston Heights Woman’s Club" />
        <Lbl>Phone</Lbl><input style={st} value={d.phone} onChange={e => set('phone', e.target.value)} placeholder="optional" />
        <Lbl>Email</Lbl><input style={st} value={d.email} onChange={e => set('email', e.target.value)} placeholder="optional — needed to email them later" />
      </>}
      {step === 1 && <>
        <Lbl>Event date</Lbl><input type="date" style={st} value={d.eventDate} onChange={e => set('eventDate', e.target.value)} />
        <Lbl>Occasion</Lbl><select style={st} value={d.eventType} onChange={e => set('eventType', e.target.value)}>{OCCASIONS.map(o => <option key={o}>{o}</option>)}</select>
      </>}
      {step === 2 && <>
        <Lbl>Performance format</Lbl>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{FORMATS.map(f => { const on = d.format === f; const n = fmtNeed(f); return <button key={f} onClick={() => set('format', f)} style={{ textAlign: 'left', padding: '11px 13px', borderRadius: 11, border: on ? '2px solid #1c3564' : '1px solid #e2d6bd', background: on ? '#eef2fb' : '#fff' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e' }}>{f}</div>
          <div style={{ fontSize: 11.5, color: '#8a8598' }}>{n === 0 ? 'no singers (DJ set)' : `needs ${n} singer${n > 1 ? 's' : ''}`}</div>
        </button> })}</div>
        <Lbl>Expected fee ($)</Lbl><input type="number" style={st} value={d.expectedDonation} onChange={e => set('expectedDonation', parseFloat(e.target.value) || 0)} />
      </>}
      {step === 3 && <>
        <Lbl>Notes</Lbl><textarea style={{ ...st, minHeight: 80, resize: 'vertical' }} value={d.notes} onChange={e => set('notes', e.target.value)} placeholder="Special requests, logistics, repertoire ideas…" />
        <div style={{ marginTop: 16, background: '#faf5e9', border: '1px solid #efe6d4', borderRadius: 12, padding: '13px 15px', fontSize: 12.5, color: '#4b5563', lineHeight: 1.7 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.5px', color: '#8a8598', textTransform: 'uppercase', marginBottom: 4 }}>Review</div>
          <b style={{ color: '#1a1a2e' }}>{d.contact || '—'}</b>{d.org ? ` · ${d.org}` : ''}<br />
          {d.eventType}{d.eventDate ? ` · ${fmt(d.eventDate)}` : ' · date TBD'} · <b style={{ color: '#1a1a2e' }}>{d.format}</b>{need ? ` (needs ${need})` : ''}{d.expectedDonation ? ` · ${$(d.expectedDonation)}` : ''}
        </div>
      </>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 26px', borderTop: '1px solid #efe6d4' }}>
      {step > 0 ? <Btn ghost onClick={() => setStep(step - 1)}><Arrow size={15} style={{ transform: 'rotate(180deg)' }} />Back</Btn> : <Btn ghost onClick={onX}>Cancel</Btn>}
      {!canNext && <span style={{ fontSize: 11.5, color: '#B45309' }}>Add a contact name &amp; organization</span>}
      <div style={{ marginLeft: 'auto' }}>
        {last
          ? <Btn grad={G.green} onClick={() => onOk(d)}><Check size={15} />Create Booking</Btn>
          : <button onClick={() => canNext && setStep(step + 1)} style={{ padding: '10px 22px', borderRadius: 11, background: G.purple, color: '#fff', fontSize: 13, fontWeight: 700, opacity: canNext ? 1 : .4, boxShadow: '0 6px 16px rgba(13,26,48,.22)', display: 'flex', alignItems: 'center', gap: 7 }}>Next<Arrow size={15} /></button>}
      </div>
    </div>
  </Modal>
}
