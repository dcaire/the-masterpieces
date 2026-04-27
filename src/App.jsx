import {useState,useEffect} from 'react'
import {sb} from './sb'

const fmt=d=>{try{return new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}catch{return d||''}};
const dU=d=>Math.ceil((new Date(d+'T12:00:00')-new Date())/86400000);
const $=n=>'$'+Number(n).toLocaleString();
const ini=n=>n.split(' ').map(w=>w[0]).join('').slice(0,2);
const PC={Soprano:{bg:'#FDE8EF',fg:'#B5315E',bd:'#F5C6D6'},Alto:{bg:'#E8F0FD',fg:'#2B5EA7',bd:'#C6D6F5'},Tenor:{bg:'#FDF3E8',fg:'#A7712B',bd:'#F5DFC6'},Bass:{bg:'#E8FDF0',fg:'#2B7A48',bd:'#C6F5D6'}};
const SB={new:{bg:'#E3F2FD',fg:'#1565C0'},contacted:{bg:'#FFF3E0',fg:'#E65100'},confirmed:{bg:'#E8F5E9',fg:'#2E7D32'},lost:{bg:'#FFEBEE',fg:'#C62828'},pending:{bg:'#FFF8E1',fg:'#F57F17'}};
const Bd=({s})=>{const c=SB[s]||SB.new;return<span style={{display:'inline-block',padding:'2px 8px',borderRadius:5,fontSize:10.5,fontWeight:600,background:c.bg,color:c.fg,textTransform:'capitalize'}}>{s}</span>};

const css=`*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',system-ui,sans-serif;background:#F5F4F0;color:#1a1a1a;min-height:100vh}button{cursor:pointer;font-family:inherit;border:none;background:none}input,textarea,select{font-family:inherit;outline:none}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}@keyframes fadeUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes slideIn{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}`;

export default function App(){
  const[tab,sTab]=useState('dashboard');
  const[R,sR]=useState([]);const[M,sM]=useState([]);const[I,sI]=useState([]);const[E,sE]=useState([]);const[A,sA]=useState([]);
  const[ld,sLd]=useState(true);const[err,sErr]=useState(null);const[toast,sTst]=useState(null);
  const[sInq,sSInq]=useState(null);const[sEv,sSEv]=useState(null);const[sSng,sSSng]=useState(null);
  const[mf,sMf]=useState('all');const[lf,sLf]=useState('all');const[rf,sRf]=useState('all');const[q,sQ]=useState('');
  const[shS,sShS]=useState(false);const[shI,sShI]=useState(false);

  const noti=m=>{sTst(m);setTimeout(()=>sTst(null),3000)};
  const nav=t=>{sTab(t);sSInq(null);sSEv(null);sSSng(null)};

  useEffect(()=>{(async()=>{try{
    const[r,m,i,e,a]=await Promise.all([sb.from('roster').select('*').order('id'),sb.from('music_library').select('*').order('id'),sb.from('inquiries').select('*').order('created_at',{ascending:false}),sb.from('events').select('*').order('event_date'),sb.from('member_availability').select('*')]);
    if(r.error)throw r.error;sR(r.data||[]);sM(m.data||[]);sI(i.data||[]);sE(e.data||[]);sA(a.data||[]);
  }catch(e){sErr(e.message||'Connection failed')}sLd(false)})()},[]);

  const aM={};A.forEach(a=>{if(!aM[a.event_id])aM[a.event_id]={};aM[a.event_id][a.roster_id]=a.response});
  const aR=R.filter(r=>r.active);
  const tMB=M.reduce((s,x)=>s+Number(x.file_size_mb),0).toFixed(1);
  const sN=M.filter(x=>!x.cloud_only).length;const sMB=M.filter(x=>!x.cloud_only).reduce((s,x)=>s+Number(x.file_size_mb),0).toFixed(1);
  const pFU=I.filter(x=>x.next_follow_up&&new Date(x.next_follow_up+'T12:00:00')<=new Date(Date.now()+3*86400000)).length;
  const pipe=I.filter(x=>x.status!=='lost').reduce((s,x)=>s+Number(x.expected_donation),0);

  const togSync=async id=>{const s=M.find(x=>x.id===id);await sb.from('music_library').update({cloud_only:!s.cloud_only}).eq('id',id);sM(p=>p.map(x=>x.id===id?{...x,cloud_only:!x.cloud_only}:x));noti(s.cloud_only?`"${s.title}" synced to iPads`:`"${s.title}" cloud only`)};
  const updIS=async(id,st)=>{const t=new Date().toISOString().split('T')[0];await sb.from('inquiries').update({status:st,last_follow_up:t}).eq('id',id);sI(p=>p.map(x=>x.id===id?{...x,status:st,last_follow_up:t}:x));noti(`Updated to "${st}"`)};
  const logFU=async id=>{const t=new Date().toISOString().split('T')[0],n=new Date(Date.now()+7*86400000).toISOString().split('T')[0];await sb.from('inquiries').update({last_follow_up:t,next_follow_up:n}).eq('id',id);sI(p=>p.map(x=>x.id===id?{...x,last_follow_up:t,next_follow_up:n}:x));noti('Follow-up logged')};
  const addI=async d=>{const n=new Date(Date.now()+3*86400000).toISOString().split('T')[0];const{data:ins}=await sb.from('inquiries').insert({contact_name:d.contact,organization:d.org,phone:d.phone,email:d.email,event_date:d.eventDate||null,event_type:d.eventType,expected_donation:d.expectedDonation,notes:d.notes,status:'new',next_follow_up:n}).select().single();if(ins){sI(p=>[ins,...p]);sShI(false);noti('Inquiry added')}};
  const addS=async d=>{const{data:ins}=await sb.from('roster').insert({name:d.name,phone:d.phone,email:d.email,voice_part:d.voicePart,singer_type:d.type}).select().single();if(ins){sR(p=>[...p,ins]);sShS(false);noti(`${d.name} added`)}};
  const updR=async(eid,rid,resp)=>{const ex=A.find(a=>a.event_id===eid&&a.roster_id===rid);if(ex){await sb.from('member_availability').update({response:resp}).eq('id',ex.id);sA(p=>p.map(a=>a.id===ex.id?{...a,response:resp}:a))}else{const{data:ins}=await sb.from('member_availability').insert({event_id:eid,roster_id:rid,response:resp}).select().single();if(ins)sA(p=>[...p,ins])}};
  const togAct=async id=>{const s=R.find(r=>r.id===id);await sb.from('roster').update({active:!s.active}).eq('id',id);sR(p=>p.map(r=>r.id===id?{...r,active:!r.active}:r));noti(`${s.name} ${s.active?'deactivated':'activated'}`)};
  const togTy=async id=>{const s=R.find(r=>r.id===id);const nt=s.singer_type==='member'?'guest':'member';await sb.from('roster').update({singer_type:nt}).eq('id',id);sR(p=>p.map(r=>r.id===id?{...r,singer_type:nt}:r));noti(`${s.name} now ${nt}`)};

  if(ld)return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div><div style={{fontSize:18,fontWeight:600}}>Loading The Masterpieces...</div><div style={{fontSize:13,color:'#888',marginTop:6}}>Connecting to database</div></div></div>;
  if(err)return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:18,fontWeight:600,color:'#C44D3F'}}>Connection Error</div><div style={{fontSize:13,color:'#888',margin:'8px 0 16px'}}>{err}</div><button onClick={()=>location.reload()} style={{padding:'10px 20px',borderRadius:8,background:'#1a1a1a',color:'#fff',fontSize:13,fontWeight:600}}>Retry</button></div></div>;

  const tabs=[['dashboard','Dashboard'],['roster','Roster'],['music','Music'],['leads','Leads'],['events','Events']];

  return<div><style>{css}</style>
    {toast&&<div style={{position:'fixed',top:20,right:20,zIndex:1000,background:'#1a1a1a',color:'#fff',padding:'12px 20px',borderRadius:10,fontSize:13,fontWeight:500,boxShadow:'0 8px 32px rgba(0,0,0,.2)',animation:'slideIn .3s ease'}}>{toast}</div>}
    <header style={{background:'#1a1a1a',color:'#fff'}}><div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:58}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#C9956B,#E8C17A)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff'}}>M</div><span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600}}>The Masterpieces</span></div>
      <div style={{display:'flex',gap:2}}>{tabs.map(([id,l])=><button key={id} onClick={()=>nav(id)} style={{padding:'7px 14px',borderRadius:7,background:tab===id?'rgba(255,255,255,.13)':'transparent',color:tab===id?'#fff':'rgba(255,255,255,.45)',fontSize:12.5,fontWeight:500}}>{l}</button>)}</div>
      <div style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>Beth, Manager</div>
    </div></header>
    <main style={{maxWidth:1200,margin:'0 auto',padding:'24px 24px 60px'}}>
      {tab==='dashboard'&&<Dash {...{R,aR,M,I,E,aM,tMB,sN,sMB,pFU,pipe,nav}}/>}
      {tab==='roster'&&<Rost {...{R,rf,sRf,shS,sShS,sSng,sSSng,addS,togAct,togTy,E,aM}}/>}
      {tab==='music'&&<Mus {...{M,q,sQ,mf,sMf,togSync,tMB,sN,sMB}}/>}
      {tab==='leads'&&<Leads {...{I,lf,sLf,shI,sShI,sInq,sSInq,updIS,logFU,addI}}/>}
      {tab==='events'&&<Evts {...{E,sEv,sSEv,updR,M,R:R,aM,noti}}/>}
    </main>
  </div>;
}

function Dash({R,aR,M,I,E,aM,tMB,sN,sMB,pFU,pipe,nav}){
  const cards=[[`Active Singers`,aR.length,`${R.filter(r=>r.active&&r.singer_type==='member').length} members, ${R.filter(r=>r.active&&r.singer_type==='guest').length} guests`,'#3B7C8C'],['Cloud Library',M.length,`${tMB} MB total, ${sN} on iPads`,'#6B5CA5'],['Follow-ups',pFU,'within 3 days',pFU>0?'#C44D3F':'#5A8F5C'],['Pipeline',$(pipe),`${I.filter(i=>i.status!=='lost').length} leads`,'#C9956B']];
  const nxt=E.filter(e=>dU(e.event_date)>0).sort((a,b)=>new Date(a.event_date)-new Date(b.event_date))[0];
  const nA=nxt?(aM[nxt.id]||{}):{};
  return<div style={{animation:'fadeUp .4s ease'}}>
    <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,marginBottom:4}}>Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, Beth</h1>
    <p style={{color:'#888',fontSize:13.5,marginBottom:24}}>Here's what needs your attention today.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
      {cards.map(([l,v,s,c],i)=><div key={i} style={{background:'#fff',borderRadius:12,padding:18,border:'1px solid #eae9e4'}}>
        <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa',marginBottom:10}}>{l}</div>
        <div style={{fontSize:24,fontWeight:700,color:c}}>{v}</div>
        <div style={{fontSize:11.5,color:'#aaa',marginTop:2}}>{s}</div>
      </div>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      {nxt&&<div style={{background:'#fff',borderRadius:12,padding:22,border:'1px solid #eae9e4'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}><span style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa'}}>Next Performance</span><span style={{fontSize:11,color:'#C44D3F',fontWeight:600}}>{dU(nxt.event_date)} days</span></div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:600,marginBottom:3}}>{nxt.title}</div>
        <div style={{fontSize:12.5,color:'#888',marginBottom:14}}>{fmt(nxt.event_date)} at {nxt.event_time}</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>{Object.entries(nA).map(([rid,resp])=>{const m=R.find(x=>x.id===+rid);if(!m)return null;const bg=resp==='yes'?'#E8F5E9':resp==='no'?'#FFEBEE':'#FFF8E1';const fg=resp==='yes'?'#2E7D32':resp==='no'?'#C62828':'#F57F17';return<div key={rid} style={{width:32,height:32,borderRadius:'50%',background:bg,color:fg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,border:`2px solid ${fg}30`}} title={`${m.name}: ${resp}`}>{ini(m.name)}</div>})}</div>
        <div style={{display:'flex',gap:14,fontSize:12}}><span style={{color:'#2E7D32'}}>{Object.values(nA).filter(r=>r==='yes').length} yes</span><span style={{color:'#F57F17'}}>{Object.values(nA).filter(r=>r==='pending').length} pending</span><span style={{color:'#C62828'}}>{Object.values(nA).filter(r=>r==='no').length} no</span></div>
      </div>}
      <div style={{background:'#fff',borderRadius:12,padding:22,border:'1px solid #eae9e4'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}><span style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa'}}>Voice Parts</span><button onClick={()=>nav('roster')} style={{fontSize:11.5,color:'#3B7C8C',fontWeight:600}}>View all →</button></div>
        {['Soprano','Alto','Tenor','Bass'].map(p=>{const pc=PC[p];const pm=aR.filter(r=>r.voice_part===p);return<div key={p} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #f0efeb'}}>
          <span style={{padding:'3px 8px',borderRadius:5,fontSize:11,fontWeight:700,background:pc.bg,color:pc.fg}}>{p[0]}</span>
          <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:500}}>{p}</div><div style={{fontSize:11.5,color:'#aaa'}}>{pm.filter(r=>r.singer_type==='member').length}m{pm.filter(r=>r.singer_type==='guest').length>0?` ${pm.filter(r=>r.singer_type==='guest').length}g`:''}</div></div>
          <div style={{display:'flex',gap:3}}>{pm.slice(0,4).map(x=><div key={x.id} style={{width:28,height:28,borderRadius:'50%',background:pc.bg,color:pc.fg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9.5,fontWeight:700,border:x.singer_type==='guest'?`2px dashed ${pc.bd}`:`2px solid ${pc.bd}`}}>{ini(x.name)}</div>)}</div>
        </div>})}
      </div>
    </div>
  </div>;
}

function Rost({R,rf,sRf,shS,sShS,sSng,sSSng,addS,togAct,togTy,E,aM}){
  const fl=['all','member','guest','inactive'];
  const fd=R.filter(r=>{if(rf==='inactive')return!r.active;if(rf==='all')return r.active;return r.singer_type===rf&&r.active});

  if(sSng){const s=R.find(r=>r.id===sSng);if(!s)return null;const pc=PC[s.voice_part]||PC.Soprano;
    return<div style={{animation:'fadeUp .3s ease'}}>
      <button onClick={()=>sSSng(null)} style={{color:'#3B7C8C',fontSize:13,fontWeight:600,marginBottom:20}}>← Back</button>
      <div style={{background:'#fff',borderRadius:12,padding:28,border:'1px solid #eae9e4'}}>
        <div style={{display:'flex',gap:20,marginBottom:24}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:pc.bg,color:pc.fg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,border:s.singer_type==='guest'?`3px dashed ${pc.bd}`:`3px solid ${pc.bd}`,flexShrink:0}}>{ini(s.name)}</div>
          <div><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600}}>{s.name}</h2><span style={{padding:'3px 10px',borderRadius:5,fontSize:10.5,fontWeight:700,background:s.singer_type==='member'?'#E8F5E9':'#FFF3E0',color:s.singer_type==='member'?'#2E7D32':'#E65100',textTransform:'capitalize'}}>{s.singer_type}</span>{!s.active&&<span style={{padding:'3px 10px',borderRadius:5,fontSize:10.5,fontWeight:700,background:'#FFEBEE',color:'#C62828'}}>Inactive</span>}</div>
            <div style={{display:'flex',gap:6}}><span style={{padding:'2px 8px',borderRadius:4,fontSize:11,fontWeight:600,background:pc.bg,color:pc.fg}}>{s.voice_part}</span><span style={{fontSize:12.5,color:'#aaa'}}>Joined {fmt(s.joined_date)}</span></div></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24,padding:18,background:'#F5F4F0',borderRadius:10}}><div style={{fontSize:13.5}}>{s.phone||'No phone'}</div><div style={{fontSize:13.5}}>{s.email||'No email'}</div></div>
        <div style={{display:'flex',gap:8}}><button onClick={()=>togAct(s.id)} style={{padding:'8px 16px',borderRadius:7,border:'1px solid #ddd',background:'#fff',fontSize:12.5,fontWeight:600}}>{s.active?'Mark Inactive':'Mark Active'}</button><button onClick={()=>togTy(s.id)} style={{padding:'8px 16px',borderRadius:7,border:'1px solid #ddd',background:'#fff',fontSize:12.5,fontWeight:600}}>→ {s.singer_type==='member'?'Guest':'Member'}</button></div>
      </div></div>}

  return<div style={{animation:'fadeUp .4s ease'}}>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}>
      <div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600}}>Roster</h1><p style={{color:'#888',marginTop:4,fontSize:13.5}}>{R.filter(r=>r.active&&r.singer_type==='member').length} members, {R.filter(r=>r.active&&r.singer_type==='guest').length} guests</p></div>
      <button onClick={()=>sShS(true)} style={{padding:'9px 16px',borderRadius:9,background:'#1a1a1a',color:'#fff',fontSize:12.5,fontWeight:600}}>+ Add Singer</button></div>
    <div style={{display:'flex',gap:3,marginBottom:20,background:'#fff',borderRadius:9,padding:3,border:'1px solid #e0dfda',width:'fit-content'}}>{fl.map(f=><button key={f} onClick={()=>sRf(f)} style={{padding:'6px 14px',borderRadius:6,fontSize:12,fontWeight:500,background:rf===f?'#1a1a1a':'transparent',color:rf===f?'#fff':'#888',textTransform:'capitalize'}}>{f==='all'?'All':f==='inactive'?'Inactive':`${f}s`}</button>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>{fd.map(s=>{const pc=PC[s.voice_part]||PC.Soprano;return<div key={s.id} onClick={()=>sSSng(s.id)} style={{background:'#fff',borderRadius:11,padding:16,border:'1px solid #eae9e4',cursor:'pointer',display:'flex',alignItems:'center',gap:14,opacity:s.active?1:.55}}>
      <div style={{width:44,height:44,borderRadius:'50%',background:pc.bg,color:pc.fg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,border:s.singer_type==='guest'?`2px dashed ${pc.bd}`:`2px solid ${pc.bd}`,flexShrink:0}}>{ini(s.name)}</div>
      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{s.name}</div><div style={{display:'flex',gap:6}}><span style={{fontSize:11,fontWeight:600,padding:'1px 6px',borderRadius:4,background:pc.bg,color:pc.fg}}>{s.voice_part}</span><span style={{fontSize:11,fontWeight:600,padding:'1px 6px',borderRadius:4,background:s.singer_type==='member'?'#E8F5E9':'#FFF3E0',color:s.singer_type==='member'?'#2E7D32':'#E65100'}}>{s.singer_type}</span></div></div>
      <span style={{color:'#ccc',fontSize:18}}>›</span></div>})}</div>
    {shS&&<FModal t="Add Singer" onX={()=>sShS(false)} fs={[{k:'name',l:'Name *',rq:1},{k:'phone',l:'Phone'},{k:'email',l:'Email'},{k:'voicePart',l:'Voice Part',ty:'sel',opts:['Soprano','Alto','Tenor','Bass'],df:'Soprano'},{k:'type',l:'Type',ty:'tog',opts:['member','guest'],df:'guest'}]} onOk={addS}/>}
  </div>;
}

function Mus({M,q,sQ,mf,sMf,togSync,tMB,sN,sMB}){
  const cats=['all',...new Set(M.map(s=>s.category))];
  const fd=M.filter(s=>(s.title.toLowerCase().includes(q.toLowerCase())||(s.arranger||'').toLowerCase().includes(q.toLowerCase()))&&(mf==='all'||s.category===mf));
  return<div style={{animation:'fadeUp .4s ease'}}>
    <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,marginBottom:4}}>Music Library</h1>
    <p style={{color:'#888',fontSize:13.5,marginBottom:24}}>{M.length} arrangements ({tMB} MB) · {sN} on iPads ({sMB} MB/device)</p>
    <div style={{background:'#fff',borderRadius:12,padding:18,border:'1px solid #eae9e4',marginBottom:18}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><span style={{fontSize:12.5,fontWeight:600,color:'#666'}}>iPad Storage</span><span style={{fontSize:12.5,color:'#aaa'}}>{sMB} MB on each device</span></div>
      <div style={{height:7,borderRadius:4,background:'#f0efeb',overflow:'hidden'}}><div style={{height:'100%',width:`${(parseFloat(sMB)/parseFloat(tMB))*100}%`,borderRadius:4,background:'linear-gradient(90deg,#3B7C8C,#5BA3B3)',transition:'width .5s'}}/></div>
    </div>
    <div style={{display:'flex',gap:10,marginBottom:18}}>
      <input value={q} onChange={e=>sQ(e.target.value)} placeholder="Search..." style={{flex:1,padding:'9px 12px',borderRadius:9,border:'1px solid #ddd',fontSize:13.5,background:'#fff'}}/>
      <div style={{display:'flex',gap:3,background:'#fff',borderRadius:9,padding:3,border:'1px solid #e0dfda'}}>{cats.map(c=><button key={c} onClick={()=>sMf(c)} style={{padding:'6px 12px',borderRadius:6,fontSize:11.5,fontWeight:500,background:mf===c?'#1a1a1a':'transparent',color:mf===c?'#fff':'#888'}}>{c==='all'?'All':c}</button>)}</div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:10}}>{fd.map(s=><div key={s.id} style={{background:'#fff',borderRadius:10,padding:14,border:'1px solid #eae9e4',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{s.title}</div><div style={{fontSize:11.5,color:'#aaa',marginBottom:4}}>{s.arranger}</div><div style={{fontSize:10.5,color:'#bbb'}}>{(s.voice_parts||[]).join(', ')} · {s.pages}pg · {s.file_size_mb}MB</div></div>
      <button onClick={()=>togSync(s.id)} style={{padding:'7px 12px',borderRadius:7,fontSize:11.5,fontWeight:600,background:s.cloud_only?'#f0efeb':'#E8F5E9',color:s.cloud_only?'#888':'#2E7D32'}}>{s.cloud_only?'Cloud':'iPad'}</button>
    </div>)}</div>
  </div>;
}

function Leads({I,lf,sLf,shI,sShI,sInq,sSInq,updIS,logFU,addI}){
  const sts=['all','new','contacted','confirmed','lost'];
  const fd=I.filter(i=>lf==='all'||i.status===lf);
  const od=I.filter(i=>i.next_follow_up&&new Date(i.next_follow_up+'T12:00:00')<new Date());

  if(sInq){const inq=I.find(i=>i.id===sInq);if(!inq)return null;
    return<div style={{animation:'fadeUp .3s ease'}}>
      <button onClick={()=>sSInq(null)} style={{color:'#3B7C8C',fontSize:13,fontWeight:600,marginBottom:20}}>← Back</button>
      <div style={{background:'#fff',borderRadius:12,padding:26,border:'1px solid #eae9e4'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:22}}><div><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600}}>{inq.contact_name}</h2><div style={{fontSize:13.5,color:'#888',marginTop:3}}>{inq.organization}</div></div><Bd s={inq.status}/></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:22,padding:18,background:'#F5F4F0',borderRadius:10}}>
          <div><div style={{fontSize:10.5,color:'#aaa',textTransform:'uppercase',fontWeight:600,marginBottom:3}}>Date</div><div style={{fontSize:14,fontWeight:600}}>{inq.event_date?fmt(inq.event_date):'TBD'}</div></div>
          <div><div style={{fontSize:10.5,color:'#aaa',textTransform:'uppercase',fontWeight:600,marginBottom:3}}>Type</div><div style={{fontSize:14,fontWeight:600}}>{inq.event_type}</div></div>
          <div><div style={{fontSize:10.5,color:'#aaa',textTransform:'uppercase',fontWeight:600,marginBottom:3}}>Donation</div><div style={{fontSize:14,fontWeight:600,color:'#6B5CA5'}}>{$(inq.expected_donation)}</div></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:22}}><div style={{fontSize:13.5}}>{inq.phone||'No phone'}</div><div style={{fontSize:13.5}}>{inq.email||'No email'}</div></div>
        {inq.notes&&<div style={{marginBottom:22,fontSize:13.5,lineHeight:1.6,color:'#666',background:'#F5F4F0',padding:14,borderRadius:9}}>{inq.notes}</div>}
        <div style={{marginBottom:22,padding:18,background:'#F5F4F0',borderRadius:10}}>
          <div style={{fontSize:10.5,color:'#aaa',textTransform:'uppercase',fontWeight:600,marginBottom:10}}>Follow-up</div>
          <div style={{display:'flex',gap:20,fontSize:12.5,flexWrap:'wrap'}}>
            <span><span style={{color:'#aaa'}}>Created: </span>{fmt(inq.created_at?.split('T')[0])}</span>
            <span><span style={{color:'#aaa'}}>Last: </span>{inq.last_follow_up?fmt(inq.last_follow_up):'None'}</span>
            <span><span style={{color:'#aaa'}}>Next: </span><span style={{color:inq.next_follow_up&&new Date(inq.next_follow_up+'T12:00:00')<new Date()?'#C62828':'inherit'}}>{inq.next_follow_up?fmt(inq.next_follow_up):'N/A'}</span></span>
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={()=>logFU(inq.id)} style={{padding:'9px 16px',borderRadius:7,background:'#3B7C8C',color:'#fff',fontSize:12.5,fontWeight:600}}>Log Follow-up</button>
          {inq.status==='new'&&<button onClick={()=>updIS(inq.id,'contacted')} style={{padding:'9px 16px',borderRadius:7,border:'1px solid #ddd',background:'#fff',fontSize:12.5,fontWeight:600}}>Mark Contacted</button>}
          {inq.status==='contacted'&&<button onClick={()=>updIS(inq.id,'confirmed')} style={{padding:'9px 16px',borderRadius:7,background:'#2E7D32',color:'#fff',fontSize:12.5,fontWeight:600}}>Confirm</button>}
          {inq.status!=='lost'&&inq.status!=='confirmed'&&<button onClick={()=>updIS(inq.id,'lost')} style={{padding:'9px 16px',borderRadius:7,border:'1px solid #FFCDD2',background:'#fff',color:'#C62828',fontSize:12.5,fontWeight:600}}>Lost</button>}
        </div>
      </div></div>}

  return<div style={{animation:'fadeUp .4s ease'}}>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}>
      <div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600}}>Leads & Inquiries</h1><p style={{color:'#888',marginTop:4,fontSize:13.5}}>Track booking interest.</p></div>
      <button onClick={()=>sShI(true)} style={{padding:'9px 16px',borderRadius:9,background:'#1a1a1a',color:'#fff',fontSize:12.5,fontWeight:600}}>+ New Inquiry</button></div>
    {od.length>0&&<div style={{background:'#FFF3E0',border:'1px solid #FFE0B2',borderRadius:10,padding:14,marginBottom:18}}><span style={{fontWeight:600,color:'#E65100'}}>{od.length} overdue follow-up{od.length>1?'s':''}: </span><span style={{color:'#E65100',opacity:.8}}>{od.map(i=>i.contact_name).join(', ')}</span></div>}
    <div style={{display:'flex',gap:3,marginBottom:18,background:'#fff',borderRadius:9,padding:3,border:'1px solid #e0dfda',width:'fit-content'}}>{sts.map(s=><button key={s} onClick={()=>sLf(s)} style={{padding:'6px 12px',borderRadius:6,fontSize:11.5,fontWeight:500,background:lf===s?'#1a1a1a':'transparent',color:lf===s?'#fff':'#888',textTransform:'capitalize'}}>{s}</button>)}</div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}>{fd.map(inq=>{const isOD=inq.next_follow_up&&new Date(inq.next_follow_up+'T12:00:00')<new Date();return<div key={inq.id} onClick={()=>sSInq(inq.id)} style={{background:'#fff',borderRadius:10,padding:16,border:isOD?'1px solid #FFCDD2':'1px solid #eae9e4',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}><span style={{fontSize:14,fontWeight:600}}>{inq.contact_name}</span><Bd s={inq.status}/>{isOD&&<span style={{fontSize:10.5,fontWeight:600,color:'#C62828',background:'#FFEBEE',padding:'2px 7px',borderRadius:4}}>Overdue</span>}</div><div style={{fontSize:12.5,color:'#888'}}>{inq.organization} · {inq.event_type}</div></div>
      <div style={{textAlign:'right'}}><div style={{fontSize:14,fontWeight:700,color:'#6B5CA5'}}>{$(inq.expected_donation)}</div><div style={{fontSize:11.5,color:'#aaa'}}>{inq.event_date?fmt(inq.event_date):'TBD'}</div></div>
    </div>})}</div>
    {shI&&<FModal t="New Inquiry" onX={()=>sShI(false)} fs={[{k:'contact',l:'Contact *',rq:1},{k:'org',l:'Organization *',rq:1},{k:'phone',l:'Phone'},{k:'email',l:'Email'},{k:'eventDate',l:'Event Date',ty:'date'},{k:'eventType',l:'Type',ty:'sel',opts:['Luncheon','Sunday Service','Club Meeting','Holiday Celebration','Annual Gala','Concert','Memorial','Other'],df:'Luncheon'},{k:'expectedDonation',l:'Donation ($)',ty:'num',df:0},{k:'notes',l:'Notes',ty:'area'}]} onOk={addI}/>}
  </div>;
}

function Evts({E,sEv,sSEv,updR,M,R,aM,noti}){
  if(sEv){const ev=E.find(e=>e.id===sEv);if(!ev)return null;const ea=aM[ev.id]||{};const yc=Object.values(ea).filter(r=>r==='yes').length;const pc=Object.values(ea).filter(r=>r==='pending').length;
    return<div style={{animation:'fadeUp .3s ease'}}>
      <button onClick={()=>sSEv(null)} style={{color:'#3B7C8C',fontSize:13,fontWeight:600,marginBottom:20}}>← Back</button>
      <div style={{background:'#fff',borderRadius:12,padding:26,border:'1px solid #eae9e4'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}>
          <div><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600}}>{ev.title}</h2><div style={{fontSize:13.5,color:'#888',marginTop:3}}>{fmt(ev.event_date)} at {ev.event_time} · {ev.venue}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:20,fontWeight:700,color:'#6B5CA5'}}>{$(ev.donation)}</div><Bd s={ev.status}/></div>
        </div>
        <div style={{background:yc>=5?'#E8F5E9':yc+pc>=5?'#FFF8E1':'#FFEBEE',borderRadius:10,padding:14,marginBottom:22}}>
          <div style={{fontSize:13,fontWeight:600,color:yc>=5?'#2E7D32':yc+pc>=5?'#F57F17':'#C62828'}}>{yc>=5?`${yc} confirmed. Enough singers.`:yc+pc>=5?`${yc} confirmed, ${pc} pending.`:`Only ${yc} confirmed. Need 5+.`}</div>
        </div>
        <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa',marginBottom:12}}>Availability</div>
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:22}}>{Object.keys(ea).map(rid=>{const m=R.find(x=>x.id===+rid);if(!m)return null;const resp=ea[rid];const pc2=PC[m.voice_part]||PC.Soprano;
          return<div key={rid} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#F5F4F0',borderRadius:9}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:resp==='yes'?'#E8F5E9':resp==='no'?'#FFEBEE':'#FFF8E1',color:resp==='yes'?'#2E7D32':resp==='no'?'#C62828':'#F57F17',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,border:`2px solid ${resp==='yes'?'#A5D6A7':resp==='no'?'#EF9A9A':'#FFE082'}`}}>{ini(m.name)}</div>
              <div><div style={{fontSize:13.5,fontWeight:500}}>{m.name}</div><div style={{display:'flex',gap:5}}><span style={{fontSize:10.5,fontWeight:600,padding:'1px 5px',borderRadius:3,background:pc2.bg,color:pc2.fg}}>{m.voice_part}</span>{m.singer_type==='guest'&&<span style={{fontSize:10.5,fontWeight:600,padding:'1px 5px',borderRadius:3,background:'#FFF3E0',color:'#E65100'}}>guest</span>}</div></div>
            </div>
            <div style={{display:'flex',gap:5}}>{['yes','pending','no'].map(r=><button key={r} onClick={()=>updR(ev.id,+rid,r)} style={{padding:'5px 11px',borderRadius:6,fontSize:11.5,fontWeight:600,background:resp===r?(r==='yes'?'#2E7D32':r==='no'?'#C62828':'#F57F17'):'#e8e7e2',color:resp===r?'#fff':'#aaa'}}>{r==='yes'?'Yes':r==='no'?'No':'Pending'}</button>)}</div>
          </div>})}</div>
        <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',color:'#aaa',marginBottom:12}}>Songs</div>
        <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:22}}>{(ev.songs_planned||[]).map((sid,i)=>{const s=M.find(x=>x.id===sid);return s?<div key={sid} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'#F5F4F0',borderRadius:7}}><span style={{fontSize:11.5,fontWeight:700,color:'#bbb',width:18}}>{i+1}</span><span style={{fontSize:13.5,fontWeight:500}}>{s.title}</span><span style={{marginLeft:'auto',fontSize:10.5,color:s.cloud_only?'#aaa':'#2E7D32'}}>{s.cloud_only?'Cloud':'iPad'}</span></div>:null})}</div>
        <button onClick={()=>noti('Availability request sent')} style={{padding:'9px 16px',borderRadius:7,background:'#3B7C8C',color:'#fff',fontSize:12.5,fontWeight:600}}>Send Availability Request</button>
      </div></div>}

  return<div style={{animation:'fadeUp .4s ease'}}>
    <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,marginBottom:4}}>Events & Availability</h1>
    <p style={{color:'#888',fontSize:13.5,marginBottom:24}}>Check availability before committing.</p>
    <div style={{display:'flex',flexDirection:'column',gap:10}}>{E.map(ev=>{const ea=aM[ev.id]||{};const yc=Object.values(ea).filter(r=>r==='yes').length;const pc=Object.values(ea).filter(r=>r==='pending').length;const tot=Object.keys(ea).length||1;const d=dU(ev.event_date);
      return<div key={ev.id} onClick={()=>sSEv(ev.id)} style={{background:'#fff',borderRadius:12,padding:18,border:'1px solid #eae9e4',cursor:'pointer'}}>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <div style={{flex:1}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:600}}>{ev.title}</span><Bd s={ev.status}/></div>
            <div style={{fontSize:12.5,color:'#888',marginBottom:10}}>{fmt(ev.event_date)} at {ev.event_time} · {ev.venue}</div>
            <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{flex:1,maxWidth:180,height:5,borderRadius:3,background:'#f0efeb',overflow:'hidden',display:'flex'}}><div style={{width:`${(yc/tot)*100}%`,background:'#4CAF50'}}/><div style={{width:`${(pc/tot)*100}%`,background:'#FFB74D'}}/></div><span style={{fontSize:11.5,color:'#888'}}>{yc}/{tot} yes</span>{pc>0&&<span style={{fontSize:11.5,color:'#F57F17'}}>{pc} pending</span>}</div>
          </div>
          <div style={{textAlign:'right'}}><div style={{fontSize:17,fontWeight:700,color:'#6B5CA5'}}>{$(ev.donation)}</div><div style={{fontSize:11.5,color:d<=7?'#C62828':'#aaa',fontWeight:d<=7?600:400}}>{d>0?`${d}d`:'Past'}</div></div>
        </div></div>})}</div>
  </div>;
}

function FModal({t,onX,fs,onOk}){
  const gd=f=>f.df!==undefined?f.df:(f.ty==='num'?0:'');
  const[fm,sFm]=useState(Object.fromEntries(fs.map(f=>[f.k,gd(f)])));
  const up=(k,v)=>sFm(p=>({...p,[k]:v}));
  const ok=fs.filter(f=>f.rq).every(f=>fm[f.k]);
  const st={width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13.5};
  return<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.35)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999}} onClick={onX}>
    <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,padding:26,width:450,maxHeight:'80vh',overflow:'auto'}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,marginBottom:18}}>{t}</h2>
      <div style={{display:'grid',gap:12}}>{fs.map(f=>{
        const lbl=<label style={{fontSize:11.5,fontWeight:600,color:'#666',marginBottom:4,display:'block'}}>{f.l}</label>;
        if(f.ty==='sel')return<div key={f.k}>{lbl}<select style={st} value={fm[f.k]} onChange={e=>up(f.k,e.target.value)}>{f.opts.map(o=><option key={o}>{o}</option>)}</select></div>;
        if(f.ty==='tog')return<div key={f.k}>{lbl}<div style={{display:'flex',gap:6}}>{f.opts.map(o=><button key={o} onClick={()=>up(f.k,o)} style={{flex:1,padding:'9px 0',borderRadius:8,fontSize:12.5,fontWeight:600,textTransform:'capitalize',border:fm[f.k]===o?'2px solid #1a1a1a':'1px solid #ddd',background:fm[f.k]===o?'#1a1a1a':'#fff',color:fm[f.k]===o?'#fff':'#777'}}>{o}</button>)}</div></div>;
        if(f.ty==='area')return<div key={f.k}>{lbl}<textarea style={{...st,minHeight:70,resize:'vertical'}} value={fm[f.k]} onChange={e=>up(f.k,e.target.value)}/></div>;
        if(f.ty==='date')return<div key={f.k}>{lbl}<input type="date" style={st} value={fm[f.k]} onChange={e=>up(f.k,e.target.value)}/></div>;
        if(f.ty==='num')return<div key={f.k}>{lbl}<input type="number" style={st} value={fm[f.k]} onChange={e=>up(f.k,parseInt(e.target.value)||0)}/></div>;
        return<div key={f.k}>{lbl}<input style={st} value={fm[f.k]} onChange={e=>up(f.k,e.target.value)}/></div>;
      })}</div>
      <div style={{display:'flex',gap:8,marginTop:20,justifyContent:'flex-end'}}>
        <button onClick={onX} style={{padding:'9px 18px',borderRadius:8,border:'1px solid #ddd',background:'#fff',fontSize:12.5,fontWeight:600}}>Cancel</button>
        <button onClick={()=>ok&&onOk(fm)} style={{padding:'9px 18px',borderRadius:8,background:'#1a1a1a',color:'#fff',fontSize:12.5,fontWeight:600,opacity:ok?1:.4}}>Save</button>
      </div>
    </div></div>;
}
