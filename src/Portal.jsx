import React, { useEffect, useState } from 'react'
import { sb } from './sb'

const VP = {
  Soprano: { bg: '#FCE7F0', fg: '#d03a6a' }, Alto: { bg: '#FEEAD9', fg: '#e07830' },
  Tenor: { bg: '#D6F3EF', fg: '#1c8f82' }, Bass: { bg: '#EDE7FB', fg: '#7b52c4' },
}
const fmtLong = d => { if (!d) return 'Date TBD'; try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) } catch { return d } }
const RESP = { yes: { fg: '#16a34a', l: 'Yes, I’m in' }, pending: { fg: '#B45309', l: 'Maybe' }, no: { fg: '#dc2626', l: 'Can’t make it' } }

export default function MemberPortal({ token }) {
  const [state, setState] = useState({ loading: true })
  const [saving, setSaving] = useState(null)

  const load = async () => {
    const { data, error } = await sb.functions.invoke('member-portal', { body: { token } })
    if (error) { let m = 'Something went wrong.'; try { const j = await error.context.json(); if (j?.error) m = j.error } catch { /* ignore */ } setState({ loading: false, error: m }); return }
    if (data?.error) { setState({ loading: false, error: data.error }); return }
    setState({ loading: false, member: data.member, events: data.events || [] })
  }
  useEffect(() => { load() }, [])

  const rsvp = async (eventId, response) => {
    setSaving(eventId + response)
    setState(s => ({ ...s, events: s.events.map(e => e.id === eventId ? { ...e, myResponse: response } : e) }))
    await sb.functions.invoke('member-portal', { body: { token, action: 'rsvp', eventId, response } })
    setSaving(null)
  }

  const wrap = { minHeight: '100vh', background: '#fdf8ee', fontFamily: "'Segoe UI',Helvetica,Arial,sans-serif", color: '#1a1a2e' }
  const inner = { maxWidth: 600, margin: '0 auto', padding: '0 16px 60px' }

  if (state.loading) return <div style={{ ...wrap, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#8a8598' }}>Loading your portal…</div></div>

  return <div style={wrap}>
    <div style={{ background: '#0d1a30', padding: '26px 16px 30px', textAlign: 'center', color: '#fff' }}>
      <img src="/logomark.png" alt="" width="58" height="58" style={{ borderRadius: 15 }} />
      <div style={{ marginTop: 8, color: '#e8b430', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' }}>The</div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>Masterpieces</div>
      {state.member && <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', padding: '7px 16px', borderRadius: 999 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{state.member.name}</span>
        {state.member.voice_part && <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0d1a30', background: (VP[state.member.voice_part] || VP.Soprano).fg, padding: '2px 9px', borderRadius: 999 }}>{state.member.voice_part}</span>}
      </div>}
    </div>

    <div style={inner}>
      {state.error
        ? <div style={{ marginTop: 40, textAlign: 'center', color: '#B45309', background: '#FEF3C7', borderRadius: 14, padding: 24, fontSize: 14 }}>{state.error}<div style={{ fontSize: 12.5, color: '#8a7a52', marginTop: 8 }}>Ask Beth to resend your personal portal link.</div></div>
        : <>
          <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8a8598', margin: '26px 0 14px' }}>Your Performances</h2>
          {(!state.events || state.events.length === 0) && <div style={{ textAlign: 'center', color: '#8a8598', background: '#fff', border: '1px solid #efe6d4', borderRadius: 14, padding: 30, fontSize: 14 }}>You’re not on any upcoming events yet. When Beth adds you to one, it’ll show up here.</div>}

          {(state.events || []).map(ev => <div key={ev.id} style={{ background: '#fff', border: '1px solid #efe6d4', borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: '0 8px 22px rgba(13,26,48,.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: '#1c3564' }}>{fmtLong(ev.event_date)}{ev.event_time ? ` · ${ev.event_time}` : ''}</div>
            <div className="serif" style={{ fontSize: 19, fontWeight: 700, margin: '4px 0 2px', fontFamily: 'Georgia,serif' }}>{ev.title}</div>
            {ev.venue && <div style={{ fontSize: 13, color: '#6b7280' }}>📍 {ev.venue}</div>}

            <div style={{ marginTop: 14, background: '#faf5e9', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4a4a5e', marginBottom: 9 }}>Can you sing this one?</div>
              <div style={{ display: 'flex', gap: 7 }}>{['yes', 'pending', 'no'].map(r => { const on = ev.myResponse === r; const c = RESP[r]; return <button key={r} onClick={() => rsvp(ev.id, r)} disabled={saving === ev.id + r} style={{ flex: 1, padding: '10px 6px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: 'none', background: on ? c.fg : '#fff', color: on ? '#fff' : '#9ca3af', boxShadow: on ? 'none' : 'inset 0 0 0 1px #e2d6bd' }}>{c.l}</button> })}</div>
            </div>

            {ev.lineup && ev.lineup.length > 0 && <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8a8598', marginBottom: 9 }}>Singing with you</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{ev.lineup.map((p, i) => { const c = VP[p.voice_part] || VP.Soprano; return <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, background: p.me ? '#0d1a30' : '#faf5e9', color: p.me ? '#fff' : '#1a1a2e', fontSize: 12, fontWeight: 600 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: c.fg }} />{p.me ? 'You' : p.name.split(' ')[0]}<span style={{ color: p.me ? '#9aa4b8' : '#8a8598', fontSize: 10.5 }}>{p.voice_part}{p.response === 'pending' ? ' · TBD' : ''}</span></span> })}</div>
            </div>}

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8a8598', marginBottom: 9 }}>Music — {ev.songs.length} {ev.songs.length === 1 ? 'piece' : 'pieces'}</div>
              {ev.songs.length === 0 && <div style={{ fontSize: 13, color: '#8a8598' }}>The program hasn’t been set yet — check back soon.</div>}
              {ev.songs.map((s, i) => <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid #f0e8d6' : 'none' }}>
                <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 8, background: '#0d1a30', color: '#e8b430', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</div><div style={{ fontSize: 12, color: '#8a8598' }}>{s.arranger || 'Traditional'}{s.pages ? ` · ${s.pages} pp` : ''}</div></div>
                {s.file_url
                  ? <a href={s.file_url} target="_blank" rel="noreferrer" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#20a89a', color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>⬇ Download</a>
                  : <span style={{ flexShrink: 0, fontSize: 11.5, color: '#b6a98c', fontWeight: 600 }}>Not posted yet</span>}
              </div>)}
            </div>
          </div>)}

          {state.director
            ? <div style={{ background: '#fff', border: '1px solid #efe6d4', borderRadius: 14, padding: '16px 18px', marginTop: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#8a8598' }}>Questions about a performance?</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>{state.director.name}</div>
              <div style={{ fontSize: 11.5, color: '#a8a3b5', marginBottom: 10 }}>Music Director</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {state.director.email && <a href={`mailto:${state.director.email}`} style={{ flex: '1 1 120px', maxWidth: 200, background: '#1c3564', color: '#e8b430', padding: '10px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>✉ Email</a>}
                {state.director.phone && <a href={`tel:${state.director.phone}`} style={{ flex: '1 1 120px', maxWidth: 200, background: '#fff', color: '#1c3564', border: '1px solid #e2d6bd', padding: '10px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>☎ Call</a>}
              </div>
            </div>
            : <div style={{ textAlign: 'center', color: '#a8a3b5', fontSize: 12, marginTop: 26 }}>Questions? Just reply to the director’s email.</div>}
        </>}
    </div>
  </div>
}
