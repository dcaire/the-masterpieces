import { useState, useEffect, useMemo } from 'react'
import { sb } from './sb'
import { buildEmail, buildAvailabilityEmail, buildProposalEmail, mailto, TEMPLATES } from './email'
import { Defs, Logo, Note, Mail, Cloud, Tablet, Calendar, Users, Sparkle, Phone, Check, Clock, Plus, Copy, Send, Bell, MapPin, Arrow, Search, Dollar, Pencil, Target, Globe } from './icons'

/* ---------- helpers ---------- */
const fmt = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d || '' } }
const fmtLong = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }) } catch { return d || '' } }
const dU = d => Math.ceil((new Date(d + 'T12:00:00') - new Date()) / 86400000)
const $ = n => '$' + Number(n || 0).toLocaleString()
const ini = n => (n || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

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
  const [R, sR] = useState([]); const [M, sM] = useState([]); const [I, sI] = useState([]); const [E, sE] = useState([]); const [A, sA] = useState([])
  const [ld, sLd] = useState(true); const [err, sErr] = useState(null); const [toast, sTst] = useState(null)
  const [sInq, sSInq] = useState(null); const [sEv, sSEv] = useState(null); const [sSng, sSSng] = useState(null)
  const [rf, sRf] = useState('all'); const [lf, sLf] = useState('all'); const [mf, sMf] = useState('all'); const [q, sQ] = useState('')
  const [shS, sShS] = useState(false); const [shI, sShI] = useState(false); const [shM, sShM] = useState(false)
  const [eSng, sESng] = useState(null) // roster id being edited
  const [eMus, sEMus] = useState(null) // music_library id being edited
  const [eInq, sEInq] = useState(null) // inquiry id being edited
  const [email, sEmail] = useState(null) // {lead} or {availability:ev}
  const [P, sP] = useState([]) // prospects (CRM)
  const [pf, sPf] = useState('all'); const [ptf, sPtf] = useState('all'); const [pq, sPq] = useState('')
  const [shP, sShP] = useState(false); const [eP, sEP] = useState(null); const [sPro, sSPro] = useState(null)

  const noti = m => { sTst(m); setTimeout(() => sTst(null), 3000) }
  const nav = t => { sTab(t); sSInq(null); sSEv(null); sSSng(null); sSPro(null) }

  useEffect(() => { (async () => {
    try {
      const [r, m, i, e, a, pr] = await Promise.all([
        sb.from('roster').select('*').order('id'), sb.from('music_library').select('*').order('id'),
        sb.from('inquiries').select('*').order('created_at', { ascending: false }),
        sb.from('events').select('*').order('event_date'), sb.from('member_availability').select('*'),
        sb.from('prospects').select('*').order('fit_score', { ascending: false })])
      if (r.error) throw r.error
      sR(r.data || []); sM(m.data || []); sI(i.data || []); sE(e.data || []); sA(a.data || []); sP(pr.data || [])
    } catch (e) { sErr(e.message || 'Connection failed') }
    sLd(false)
  })() }, [])

  const aM = useMemo(() => { const o = {}; A.forEach(a => { (o[a.event_id] ||= {})[a.roster_id] = a.response }); return o }, [A])
  const aR = R.filter(r => r.active)
  const core = aR.filter(r => r.singer_type === 'member'); const guests = aR.filter(r => r.singer_type === 'guest')
  const tMB = M.reduce((s, x) => s + Number(x.file_size_mb), 0).toFixed(1)
  const sN = M.filter(x => !x.cloud_only).length; const sMB = M.filter(x => !x.cloud_only).reduce((s, x) => s + Number(x.file_size_mb), 0).toFixed(1)
  const pFU = I.filter(x => x.status !== 'lost' && x.next_follow_up && new Date(x.next_follow_up + 'T12:00:00') <= new Date(Date.now() + 3 * 86400000)).length
  const pipe = I.filter(x => x.status !== 'lost').reduce((s, x) => s + Number(x.expected_donation), 0)

  /* data ops */
  const togSync = async id => { const s = M.find(x => x.id === id); await sb.from('music_library').update({ cloud_only: !s.cloud_only }).eq('id', id); sM(p => p.map(x => x.id === id ? { ...x, cloud_only: !x.cloud_only } : x)); noti(s.cloud_only ? `“${s.title}” synced to iPads` : `“${s.title}” set to cloud only`) }
  const updIS = async (id, st) => { const t = new Date().toISOString().split('T')[0]; await sb.from('inquiries').update({ status: st, last_follow_up: t }).eq('id', id); sI(p => p.map(x => x.id === id ? { ...x, status: st, last_follow_up: t } : x)); noti(`Marked “${st}”`) }
  const logFU = async id => { const t = new Date().toISOString().split('T')[0], n = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]; await sb.from('inquiries').update({ last_follow_up: t, next_follow_up: n }).eq('id', id); sI(p => p.map(x => x.id === id ? { ...x, last_follow_up: t, next_follow_up: n } : x)); noti('Follow-up logged · next in 7 days') }
  const addI = async d => { const n = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]; const { data: ins } = await sb.from('inquiries').insert({ contact_name: d.contact, organization: d.org, phone: d.phone, email: d.email, event_date: d.eventDate || null, event_type: d.eventType, expected_donation: d.expectedDonation, notes: d.notes, status: 'new', next_follow_up: n }).select().single(); if (ins) { sI(p => [ins, ...p]); sShI(false); noti('Booking inquiry added') } }
  const addS = async d => { const { data: ins } = await sb.from('roster').insert({ name: d.name, phone: d.phone, email: d.email, voice_part: d.voicePart, singer_type: d.type, active: true }).select().single(); if (ins) { sR(p => [...p, ins]); sShS(false); noti(`${d.name} added`) } }
  const updS = async d => { const id = eSng; const patch = { name: d.name, phone: d.phone, email: d.email, voice_part: d.voicePart, singer_type: d.type }; const { error } = await sb.from('roster').update(patch).eq('id', id); if (error) { noti('Save failed — try again'); return } sR(p => p.map(r => r.id === id ? { ...r, ...patch } : r)); sESng(null); noti(`${d.name} updated`) }
  const updM = async d => { const id = eMus; const patch = { title: d.title, arranger: d.arranger, category: d.category, pages: d.pages, file_size_mb: d.size, cloud_only: d.dest === 'Cloud only' }; const { error } = await sb.from('music_library').update(patch).eq('id', id); if (error) { noti('Save failed — try again'); return } sM(p => p.map(x => x.id === id ? { ...x, ...patch } : x)); sEMus(null); noti(`“${d.title}” updated`) }
  const updI = async d => { const id = eInq; const patch = { contact_name: d.contact, organization: d.org, phone: d.phone, email: d.email, event_date: d.eventDate || null, event_type: d.eventType, expected_donation: d.expectedDonation, notes: d.notes }; const { error } = await sb.from('inquiries').update(patch).eq('id', id); if (error) { noti('Save failed — try again'); return } sI(p => p.map(x => x.id === id ? { ...x, ...patch } : x)); sEInq(null); noti('Booking updated') }
  const addM = async d => { const { data: ins } = await sb.from('music_library').insert({ title: d.title, arranger: d.arranger, category: d.category, voice_parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], pages: d.pages, file_size_mb: d.size, cloud_only: d.dest === 'Cloud only' }).select().single(); if (ins) { sM(p => [...p, ins]); sShM(false); noti(`“${d.title}” uploaded${d.dest === 'Cloud only' ? '' : ' & synced to iPads'}`) } }
  const updR = async (eid, rid, resp) => { const ex = A.find(a => a.event_id === eid && a.roster_id === rid); if (ex) { await sb.from('member_availability').update({ response: resp }).eq('id', ex.id); sA(p => p.map(a => a.id === ex.id ? { ...a, response: resp } : a)) } else { const { data: ins } = await sb.from('member_availability').insert({ event_id: eid, roster_id: rid, response: resp }).select().single(); if (ins) sA(p => [...p, ins]) } }
  const togAct = async id => { const s = R.find(r => r.id === id); await sb.from('roster').update({ active: !s.active }).eq('id', id); sR(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r)); noti(`${s.name} ${s.active ? 'set inactive' : 'reactivated'}`) }
  const togTy = async id => { const s = R.find(r => r.id === id); const nt = s.singer_type === 'member' ? 'guest' : 'member'; await sb.from('roster').update({ singer_type: nt }).eq('id', id); sR(p => p.map(r => r.id === id ? { ...r, singer_type: nt } : r)); noti(`${s.name} → ${nt === 'member' ? 'core member' : 'guest singer'}`) }
  /* prospects (CRM) */
  const addP = async d => { const { data: ins } = await sb.from('prospects').insert({ organization: d.org, org_type: d.type, city: d.city, organizer_name: d.organizer, organizer_role: d.role, email: d.email, phone: d.phone, website: d.website, fit_score: Number(d.fit) || 3, status: 'prospect', notes: d.notes }).select().single(); if (ins) { sP(p => [ins, ...p]); sShP(false); noti('Prospect added') } }
  const updP = async d => { const id = eP; const patch = { organization: d.org, org_type: d.type, city: d.city, organizer_name: d.organizer, organizer_role: d.role, email: d.email, phone: d.phone, website: d.website, fit_score: Number(d.fit) || 3, notes: d.notes }; const { error } = await sb.from('prospects').update(patch).eq('id', id); if (error) { noti('Save failed — try again'); return } sP(p => p.map(x => x.id === id ? { ...x, ...patch } : x)); sEP(null); noti('Prospect updated') }
  const updPS = async (id, st) => { const t = new Date().toISOString().split('T')[0]; const patch = st === 'contacted' ? { status: st, last_contacted: t } : { status: st }; await sb.from('prospects').update(patch).eq('id', id); sP(p => p.map(x => x.id === id ? { ...x, ...patch } : x)); noti(`Marked “${PS[st]?.l || st}”`) }
  const convP = async x => { const n = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]; const { data: ins } = await sb.from('inquiries').insert({ contact_name: x.organizer_name || x.organization, organization: x.organization, phone: x.phone, email: x.email, event_type: 'Other', expected_donation: 0, notes: `From prospect (${x.org_type}${x.city ? ', ' + x.city : ''}).${x.notes ? ' ' + x.notes : ''}`, status: 'new', next_follow_up: n }).select().single(); if (ins) { sI(p => [ins, ...p]); await sb.from('prospects').update({ status: 'interested' }).eq('id', x.id); sP(p => p.map(y => y.id === x.id ? { ...y, status: 'interested' } : y)); sSPro(null); sTab('bookings'); noti('Added to Bookings as a new lead') } }

  if (ld) return <Splash />
  if (err) return <ErrorView err={err} />

  const tabs = [['dashboard', 'Dashboard', Sparkle], ['ensemble', 'Ensemble', Users], ['music', 'Music', Note], ['bookings', 'Bookings', Mail], ['prospects', 'Prospects', Target], ['events', 'Events', Calendar]]

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
      {tab === 'dashboard' && <Dash {...{ R, aR, core, guests, M, I, E, aM, tMB, sN, sMB, pFU, pipe, nav }} />}
      {tab === 'ensemble' && <Ensemble {...{ core, guests, rf, sRf, sSSng, addS, togAct, togTy, shS, sShS }} />}
      {tab === 'music' && <Music {...{ M, q, sQ, mf, sMf, togSync, tMB, sN, sMB, shM, sShM, addM, sEMus }} />}
      {tab === 'bookings' && <Bookings {...{ I, lf, sLf, shI, sShI, sInq, sSInq, updIS, logFU, addI, sEmail, sEInq }} />}
      {tab === 'prospects' && <Prospects {...{ P, pf, sPf, ptf, sPtf, pq, sPq, shP, sShP, sPro, sSPro, updPS, sEP, convP, sEmail }} />}
      {tab === 'events' && <Events {...{ E, sEv, sSEv, updR, M, R, aR, aM, sEmail }} />}
    </main>

    {sSng && <SingerDetail {...{ R, sSng, sSSng, togAct, togTy, sESng }} />}
    {shS && <FModal t="Add a Singer" sub="Add a core member or guest singer" onX={() => sShS(false)} onOk={addS} fs={[{ k: 'name', l: 'Full name', rq: 1 }, { k: 'phone', l: 'Phone' }, { k: 'email', l: 'Email' }, { k: 'voicePart', l: 'Voice part', ty: 'sel', opts: ['Soprano', 'Alto', 'Tenor', 'Bass'], df: 'Soprano' }, { k: 'type', l: 'Role', ty: 'tog', opts: ['member', 'guest'], df: 'member' }]} />}
    {eSng != null && (() => { const s = R.find(r => r.id === eSng); return s ? <FModal t="Edit Singer" sub={`Update ${s.name}’s details`} onX={() => sESng(null)} onOk={updS} fs={[{ k: 'name', l: 'Full name', rq: 1, df: s.name }, { k: 'phone', l: 'Phone', df: s.phone || '' }, { k: 'email', l: 'Email', df: s.email || '' }, { k: 'voicePart', l: 'Voice part', ty: 'sel', opts: ['Soprano', 'Alto', 'Tenor', 'Bass'], df: s.voice_part }, { k: 'type', l: 'Role', ty: 'tog', opts: ['member', 'guest'], df: s.singer_type }]} /> : null })()}
    {shI && <FModal t="New Booking Inquiry" sub="Log a new performance request" onX={() => sShI(false)} onOk={addI} fs={[{ k: 'contact', l: 'Contact name', rq: 1 }, { k: 'org', l: 'Organization', rq: 1 }, { k: 'phone', l: 'Phone' }, { k: 'email', l: 'Email' }, { k: 'eventDate', l: 'Event date', ty: 'date' }, { k: 'eventType', l: 'Occasion', ty: 'sel', opts: ['Luncheon', 'Sunday Service', 'Club Meeting', 'Holiday Celebration', 'Annual Gala', 'Concert', 'Wedding', 'Memorial', 'Other'], df: 'Luncheon' }, { k: 'expectedDonation', l: 'Expected fee ($)', ty: 'num', df: 0 }, { k: 'notes', l: 'Notes', ty: 'area' }]} />}
    {shM && <FModal t="Upload Arrangement" sub="Add sheet music to the cloud library" onX={() => sShM(false)} onOk={addM} fs={[{ k: 'title', l: 'Title', rq: 1 }, { k: 'arranger', l: 'Arranger / Composer' }, { k: 'category', l: 'Category', ty: 'sel', opts: ['Jazz', 'Swing', 'Pop', 'Standards', 'Christmas', 'Patriotic', 'Other'], df: 'Jazz' }, { k: 'pages', l: 'Pages', ty: 'num', df: 4 }, { k: 'size', l: 'File size (MB)', ty: 'num', df: 2 }, { k: 'dest', l: 'Destination', ty: 'tog', opts: ['Sync to iPads', 'Cloud only'], df: 'Sync to iPads' }]} />}
    {eMus != null && (() => { const s = M.find(x => x.id === eMus); return s ? <FModal t="Edit Arrangement" sub={`Update “${s.title}”`} onX={() => sEMus(null)} onOk={updM} fs={[{ k: 'title', l: 'Title', rq: 1, df: s.title }, { k: 'arranger', l: 'Arranger / Composer', df: s.arranger || '' }, { k: 'category', l: 'Category', ty: 'sel', opts: ['Jazz', 'Swing', 'Pop', 'Standards', 'Christmas', 'Patriotic', 'Other'], df: s.category }, { k: 'pages', l: 'Pages', ty: 'num', df: s.pages }, { k: 'size', l: 'File size (MB)', ty: 'num', df: s.file_size_mb }, { k: 'dest', l: 'Destination', ty: 'tog', opts: ['Sync to iPads', 'Cloud only'], df: s.cloud_only ? 'Cloud only' : 'Sync to iPads' }]} /> : null })()}
    {eInq != null && (() => { const inq = I.find(x => x.id === eInq); return inq ? <FModal t="Edit Booking Inquiry" sub={`Update ${inq.contact_name}’s inquiry`} onX={() => sEInq(null)} onOk={updI} fs={[{ k: 'contact', l: 'Contact name', rq: 1, df: inq.contact_name }, { k: 'org', l: 'Organization', rq: 1, df: inq.organization || '' }, { k: 'phone', l: 'Phone', df: inq.phone || '' }, { k: 'email', l: 'Email', df: inq.email || '' }, { k: 'eventDate', l: 'Event date', ty: 'date', df: inq.event_date || '' }, { k: 'eventType', l: 'Occasion', ty: 'sel', opts: ['Luncheon', 'Sunday Service', 'Club Meeting', 'Holiday Celebration', 'Annual Gala', 'Concert', 'Wedding', 'Memorial', 'Other'], df: inq.event_type }, { k: 'expectedDonation', l: 'Expected fee ($)', ty: 'num', df: inq.expected_donation }, { k: 'notes', l: 'Notes', ty: 'area', df: inq.notes || '' }]} /> : null })()}
    {shP && <FModal t="Add a Prospect" sub="A local group to introduce the ensemble to" onX={() => sShP(false)} onOk={addP} fs={PFIELDS()} />}
    {eP != null && (() => { const pr = P.find(x => x.id === eP); return pr ? <FModal t="Edit Prospect" sub={pr.organization} onX={() => sEP(null)} onOk={updP} fs={PFIELDS(pr)} /> : null })()}
    {email && <EmailComposer {...{ email, sEmail, aR, onLogged: logFU, noti }} />}
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

/* ---------- dashboard ---------- */
function Dash({ R, aR, core, guests, M, I, E, aM, tMB, sN, sMB, pFU, pipe, nav }) {
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
      <h1 className="serif" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#0d1a30' }}>{greet}, Beth</h1>
      <p className="ui" style={{ color: '#6e6e82', fontSize: 13.5, marginTop: 4 }}>Here’s what’s happening with The Masterpieces today.</p>
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
function Ensemble({ core, guests, rf, sRf, sSSng, addS, togAct, togTy, shS, sShS }) {
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

function SingerDetail({ R, sSng, sSSng, togAct, togTy, sESng }) {
  const s = R.find(r => r.id === sSng); if (!s) return null
  const pc = VP[s.voice_part] || VP.Soprano
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
      <div style={{ display: 'flex', gap: 9, marginBottom: 9 }}>
        <Btn grad={G.purple} onClick={() => { sSSng(null); sESng(s.id) }}><Pencil size={16} />Edit Details</Btn>
      </div>
      <div style={{ display: 'flex', gap: 9 }}>
        <Btn ghost onClick={() => togAct(s.id)}>{s.active ? 'Mark Inactive' : 'Reactivate'}</Btn>
        <Btn ghost onClick={() => togTy(s.id)}>{s.singer_type === 'member' ? '→ Make Guest' : '→ Make Core'}</Btn>
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

/* ---------- bookings (leads) ---------- */
function Bookings({ I, lf, sLf, shI, sShI, sInq, sSInq, updIS, logFU, addI, sEmail, sEInq }) {
  const sts = [['all', 'All'], ['new', 'New'], ['contacted', 'Contacted'], ['confirmed', 'Confirmed'], ['lost', 'Lost']]
  const fd = I.filter(i => lf === 'all' || i.status === lf)
  const od = I.filter(i => i.status !== 'lost' && i.next_follow_up && new Date(i.next_follow_up + 'T12:00:00') < new Date())

  if (sInq) { const inq = I.find(i => i.id === sInq); if (!inq) return null; const isOD = inq.next_follow_up && new Date(inq.next_follow_up + 'T12:00:00') < new Date()
    return <div className="fade">
      <BackBtn onClick={() => sSInq(null)} />
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ background: G.purple, padding: '24px 26px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div><h2 className="serif" style={{ fontSize: 24, fontWeight: 700 }}>{inq.contact_name}</h2><div style={{ fontSize: 13.5, opacity: .9, marginTop: 3 }}>{inq.organization}</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 24, fontWeight: 800 }}>{$(inq.expected_donation)}</div><div style={{ marginTop: 5 }}><Badge s={inq.status} /></div></div>
        </div>
        <div style={{ padding: 26 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            <Stat ic={<Calendar size={16} />} l="Date" v={inq.event_date ? fmt(inq.event_date) : 'TBD'} />
            <Stat ic={<Sparkle size={16} />} l="Occasion" v={inq.event_type} />
            <Stat ic={<Phone size={16} />} l="Phone" v={inq.phone || '—'} />
          </div>
          {inq.notes && <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#4b5563', background: '#faf5e9', padding: 15, borderRadius: 12, marginBottom: 20 }}>{inq.notes}</div>}
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
            {inq.status === 'contacted' && <Btn grad={G.green} onClick={() => updIS(inq.id, 'confirmed')}><Check size={16} />Confirm</Btn>}
            {inq.status !== 'lost' && inq.status !== 'confirmed' && <Btn ghost danger onClick={() => updIS(inq.id, 'lost')}>Mark Lost</Btn>}
          </div>
        </div>
      </div>
    </div>
  }

  return <div className="fade">
    <Header title="Bookings" sub="Track every inquiry from first hello to confirmed performance." action={{ label: 'New Inquiry', on: () => sShI(true) }} />
    {od.length > 0 && <div style={{ background: G.amber, color: '#fff', borderRadius: 14, padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 11, boxShadow: '0 8px 22px rgba(13,26,48,.18)' }}><Bell size={20} /><div style={{ fontSize: 13.5 }}><b>{od.length} overdue follow-up{od.length > 1 ? 's' : ''}:</b> {od.map(i => i.contact_name).join(', ')}</div></div>}
    <Filter opts={sts} val={lf} set={sLf} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{fd.map(inq => { const isOD = inq.status !== 'lost' && inq.next_follow_up && new Date(inq.next_follow_up + 'T12:00:00') < new Date(); return <div key={inq.id} className="card lift" onClick={() => sSInq(inq.id)} style={{ padding: 17, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderLeft: isOD ? '4px solid #FB7185' : '4px solid transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <IconChip grad={inq.status === 'confirmed' ? G.green : inq.status === 'lost' ? 'linear-gradient(135deg,#cbd5e1,#94a3b8)' : G.purple} size={44}><Mail size={19} /></IconChip>
        <div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{inq.contact_name}</span><Badge s={inq.status} />{isOD && <Pill bg="#FEE2E2" fg="#B91C1C">Overdue</Pill>}</div><div style={{ fontSize: 12.5, color: '#8a8598' }}>{inq.organization} · {inq.event_type}</div></div>
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
function Events({ E, sEv, sSEv, updR, M, R, aR, aM, sEmail }) {
  if (sEv) { const ev = E.find(e => e.id === sEv); if (!ev) return null; const ea = aM[ev.id] || {}; const yc = Object.values(ea).filter(r => r === 'yes').length; const pc = Object.values(ea).filter(r => r === 'pending').length; const ok = yc >= 4
    return <div className="fade">
      <BackBtn onClick={() => sSEv(null)} />
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ background: ok ? G.green : pc ? G.amber : 'linear-gradient(135deg,#F87171,#EF4444)', padding: '24px 26px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><h2 className="serif" style={{ fontSize: 24, fontWeight: 700 }}>{ev.title}</h2><div style={{ fontSize: 13.5, opacity: .92, marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={14} />{fmtLong(ev.event_date)} · {ev.event_time}</span><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} />{ev.venue}</span></div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{$(ev.donation)}</div><div style={{ marginTop: 5 }}><Badge s={ev.status} /></div></div>
          </div>
          <div style={{ marginTop: 16, background: 'rgba(255,255,255,.18)', borderRadius: 11, padding: '11px 15px', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>{ok ? <><Check size={17} />{yc} confirmed — you have a full ensemble!</> : <><Bell size={17} />{yc} confirmed{pc ? `, ${pc} pending` : ''} — need at least 4.</>}</div>
        </div>
        <div style={{ padding: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><SectionTitle>Singer Availability</SectionTitle><Btn small grad={G.amber} onClick={() => sEmail({ availability: ev })}><Send size={14} />Email Request</Btn></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 22 }}>{aR.map(m => { const pcv = VP[m.voice_part] || VP.Soprano; return <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 13px', background: '#faf5e9', borderRadius: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><Avatar name={m.name} part={m.voice_part} type={m.singer_type} size={36} /><div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{m.name}</div><div style={{ display: 'flex', gap: 5, marginTop: 2 }}><Pill bg={pcv.bg} fg={pcv.fg}>{m.voice_part}</Pill>{m.singer_type === 'guest' && <Pill bg="#FEF3C7" fg="#B45309">guest</Pill>}</div></div></div>
            <div style={{ display: 'flex', gap: 5 }}>{['yes', 'pending', 'no'].map(r => { const c = RESP[r]; const on = (ea[m.id] || 'pending') === r; return <button key={r} onClick={() => updR(ev.id, m.id, r)} style={{ padding: '6px 12px', borderRadius: 9, fontSize: 11.5, fontWeight: 700, textTransform: 'capitalize', background: on ? c.fg : '#eee', color: on ? '#fff' : '#9ca3af' }}>{r}</button> })}</div>
          </div> })}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><SectionTitle>Program ({(ev.songs_planned || []).length} pieces)</SectionTitle>{(ev.songs_planned || []).length > 0 && <Btn small grad={G.purple} onClick={() => sEmail({ proposal: ev, songs: (ev.songs_planned || []).map(sid => M.find(x => x.id === sid)?.title).filter(Boolean) })}><Send size={14} />Send Proposal</Btn>}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{(ev.songs_planned || []).map((sid, i) => { const s = M.find(x => x.id === sid); return s ? <div key={sid} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', background: '#faf5e9', borderRadius: 10 }}><span style={{ width: 24, height: 24, borderRadius: 7, background: G.purple, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span><span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{s.title}</span><Pill bg={s.cloud_only ? '#f0e8d6' : '#D1FAE5'} fg={s.cloud_only ? '#6e6e82' : '#047857'}>{s.cloud_only ? 'Cloud' : 'iPad'}</Pill></div> : null })}{!(ev.songs_planned || []).length && <Empty>No program set yet.</Empty>}</div>
        </div>
      </div>
    </div>
  }

  return <div className="fade">
    <Header title="Events" sub="Confirm the ensemble’s availability before you commit to a date." />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{E.map(ev => { const ea = aM[ev.id] || {}; const yc = Object.values(ea).filter(r => r === 'yes').length; const pcn = Object.values(ea).filter(r => r === 'pending').length; const tot = aR.length || 1; const d = dU(ev.event_date); const ok = yc >= 4
    return <div key={ev.id} className="card lift" onClick={() => sSEv(ev.id)} style={{ padding: 19, cursor: 'pointer', display: 'flex', gap: 18, alignItems: 'center' }}>
      <div style={{ textAlign: 'center', width: 58, flexShrink: 0 }}><div style={{ fontSize: 11, fontWeight: 800, color: '#8a8598', textTransform: 'uppercase' }}>{new Date(ev.event_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}</div><div className="serif" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: '#1a1a2e' }}>{new Date(ev.event_date + 'T12:00:00').getDate()}</div></div>
      <div style={{ width: 1, alignSelf: 'stretch', background: '#efe6d4' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><span className="serif" style={{ fontSize: 18, fontWeight: 700 }}>{ev.title}</span><Badge s={ev.status} /></div>
        <div style={{ fontSize: 12.5, color: '#8a8598', marginBottom: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} />{ev.event_time}</span><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{ev.venue}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><div style={{ flex: 1, maxWidth: 220, height: 7, borderRadius: 4, background: '#f0e8d6', overflow: 'hidden', display: 'flex' }}><div style={{ width: `${(yc / tot) * 100}%`, background: G.green }} /><div style={{ width: `${(pcn / tot) * 100}%`, background: 'linear-gradient(90deg,#FBBF24,#F59E0B)' }} /></div><span style={{ fontSize: 12, fontWeight: 700, color: ok ? '#047857' : '#6b7280' }}>{yc}/{tot} yes</span>{ok && <Pill bg="#D1FAE5" fg="#047857">Ensemble ready</Pill>}</div>
      </div>
      <div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 800, color: '#1c3564' }}>{$(ev.donation)}</div><div style={{ fontSize: 11.5, fontWeight: 700, color: d <= 7 && d > 0 ? '#EF4444' : '#8a8598' }}>{d > 0 ? `${d} days` : 'Past'}</div></div>
    </div> })}{!E.length && <Empty>No events scheduled.</Empty>}</div>
  </div>
}

/* ---------- email composer ---------- */
function EmailComposer({ email, sEmail, aR, onLogged, noti }) {
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
  const recipients = isAvail ? aR.map(m => m.email).filter(Boolean).join(',') : isProposal ? '' : (lead.email || '')
  const copy = async (html) => {
    try {
      if (html && navigator.clipboard && navigator.clipboard.write) await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([built.html], { type: 'text/html' }), 'text/plain': new Blob([body], { type: 'text/plain' }) })])
      else await navigator.clipboard.writeText(body)
      noti(html ? 'Formatted email copied' : 'Email text copied')
    } catch { noti('Copy unavailable — please select the text manually') }
  }
  const openMail = () => { window.location.href = mailto(recipients, subject, body); if (isFollowup && onLogged) onLogged(lead.id) }
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
        <div style={{ fontSize: 12.5, color: recipients ? '#4b5563' : '#8a8598', background: '#faf5e9', borderRadius: 10, padding: '9px 12px', marginBottom: 16, wordBreak: 'break-all' }}>{recipients || (isProposal ? 'Add the client’s email in your mail app' : 'No email address on file')}</div>
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
    <div style={{ padding: '16px 22px', borderTop: '1px solid #efe6d4', display: 'flex', gap: 9, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
      <Btn ghost onClick={() => copy(false)}><Copy size={15} />Copy Text</Btn>
      <Btn ghost onClick={() => copy(true)}><Copy size={15} />Copy Formatted</Btn>
      <Btn grad={accent} onClick={openMail}><Send size={15} />Open in Mail App</Btn>
    </div>
  </Modal>
}

/* ---------- shared ui ---------- */
const Header = ({ title, sub, action }) => <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
  <div><h1 className="serif gtext" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>{title}</h1><p className="ui" style={{ color: '#6e6e82', fontSize: 13.5, marginTop: 4 }}>{sub}</p><div style={{ marginTop: 10 }}><NoteDots /></div></div>
  {action && <button onClick={action.on} className="ui" style={{ padding: '11px 20px', borderRadius: 8, background: '#0d1a30', color: '#e8b430', fontSize: 11.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 8px 20px rgba(13,26,48,.22)' }}>{action.icon || <Plus size={17} />}{action.label}</button>}
</div>
const Filter = ({ opts, val, set }) => <div style={{ display: 'inline-flex', gap: 3, background: '#fff', borderRadius: 12, padding: 4, border: '1px solid #efe6d4', marginBottom: 18, flexWrap: 'wrap' }}>{opts.map(([v, l]) => <button key={v} onClick={() => set(v)} style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, background: val === v ? G.purple : 'transparent', color: val === v ? '#fff' : '#6e6e82', transition: 'all .15s' }}>{l}</button>)}</div>
const Btn = ({ children, grad, ghost, danger, small, ...p }) => { const isNavy = !ghost && (!grad || grad === G.purple); return <button {...p} className="ui" style={{ padding: small ? '7px 13px' : '10px 17px', borderRadius: 8, fontSize: small ? 11 : 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 7, background: ghost ? '#fff' : (grad || G.purple), color: ghost ? (danger ? '#B91C1C' : '#4a4a5e') : (isNavy ? '#e8b430' : '#fff'), border: ghost ? `1px solid ${danger ? '#FECACA' : '#e2d6bd'}` : 'none', boxShadow: ghost ? 'none' : '0 6px 16px rgba(13,26,48,.18)' }}>{children}</button> }
const BackBtn = ({ onClick }) => <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1c3564', fontSize: 13.5, fontWeight: 700, marginBottom: 18 }}><Arrow size={16} style={{ transform: 'rotate(180deg)' }} />Back</button>
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
