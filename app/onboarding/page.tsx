'use client'

import Logo from '@/components/ui/Logo'

import { useState, useRef, useEffect, useCallback } from 'react'
import { connectEmail, saveDomain, addWhatsappNumber, verifyWhatsappNumber, uploadBibleFiles, saveHaeloTone, saveTimerConfig } from '@/lib/api/onboard'

type TimerMode = 'auto-send' | 'remind' | 'hybrid'
type ToneId = 'direct' | 'warm' | 'formal' | 'collaborative' | 'brief' | 'custom'

interface UploadedFile {
  id: string
  name: string
  size: string
  processing: boolean
  file?: File
}

const INK = '#11270B'
const CREAM = '#F7F4EE'
const WHITE = '#FFFFFF'
const NAVY = '#0A1628'
const GOLD = '#B8962E'
const GOLD_LIGHT = '#D4AE52'
const GOLD_BG = 'rgba(184,150,46,0.1)'
const GOLD_BORDER = 'rgba(184,150,46,0.25)'
const GREEN = '#2E7D52'
const GREEN_BG = 'rgba(46,125,82,0.1)'
const INK_10 = 'rgba(17,39,11,0.1)'
const INK_20 = 'rgba(17,39,11,0.2)'
const INK_40 = 'rgba(17,39,11,0.4)'
const INK_60 = 'rgba(17,39,11,0.6)'
const INK_06 = 'rgba(17,39,11,0.06)'
const INK_03 = 'rgba(17,39,11,0.03)'

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:${CREAM};color:${INK};-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes breathe{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes ringPulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.05);opacity:.3}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .35s cubic-bezier(.4,0,.2,1) both}
input::placeholder{color:rgba(17,39,11,0.2);font-family:'Plus Jakarta Sans',sans-serif}
textarea::placeholder{color:rgba(17,39,11,0.2);font-family:'Plus Jakarta Sans',sans-serif}

/* ── LAYOUT ── */
.onboard-wrap{
  max-width:1020px;
  margin:0 auto;
  padding:44px 24px 80px;
}
.progress-wrap{
  display:flex;
  justify-content:center;
  margin-bottom:44px;
  overflow-x:auto;
  padding-bottom:4px;
}
/* Progress rail: hide label text on very small screens */
.step-label{ white-space:nowrap; }

.content-grid{
  display:grid;
  grid-template-columns:248px 1fr;
  gap:20px;
  align-items:start;
}
.sidebar-wrap{
  display:block;
}

/* OTP grid — FIXED: use grid not flex so boxes don't overflow */
.otp-grid{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:8px;
  margin-bottom:20px;
  width:100%;
}
.otp-input{
  width:100%;
  text-align:center;
  font-size:22px;
  font-weight:700;
  color:${INK};
  border-radius:10px;
  padding:12px 0;
  outline:none;
  font-family:'Plus Jakarta Sans',sans-serif;
  transition:all .18s;
  min-width:0;
}

/* Tone grid */
.tone-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-bottom:18px;
}

/* Timer selects */
.timer-selects{
  display:grid;
  gap:12px;
  margin-bottom:22px;
}
.timer-selects-2{ grid-template-columns:1fr 1fr; }
.timer-selects-1{ grid-template-columns:1fr; }

/* Staff template grid */
.staff-tmpl-grid{
  display:grid;
  grid-template-columns:repeat(5,1fr);
}

/* ── TABLET: ≤ 860px ── */
@media(max-width:860px){
  .content-grid{
    grid-template-columns:1fr;
  }
  .sidebar-wrap{
    display:none;
  }
}

/* ── MOBILE: ≤ 600px ── */
@media(max-width:600px){
  .onboard-wrap{
    padding:28px 16px 60px;
  }
  .progress-wrap{
    margin-bottom:28px;
  }
  .step-label{
    font-size:9px !important;
  }
  .otp-grid{
    gap:6px;
  }
  .otp-input{
    font-size:18px;
    padding:10px 0;
    border-radius:8px;
  }
  .tone-grid{
    grid-template-columns:1fr;
  }
  .timer-selects-2{
    grid-template-columns:1fr;
  }
  .staff-tmpl-grid{
    grid-template-columns:repeat(3,1fr);
  }
  .staff-tmpl-col-4,.staff-tmpl-col-5{
    display:none;
  }
}

/* ── SMALL MOBILE: ≤ 400px ── */
@media(max-width:400px){
  .otp-grid{
    gap:4px;
  }
  .otp-input{
    font-size:16px;
    padding:9px 0;
  }
  .staff-tmpl-grid{
    grid-template-columns:repeat(2,1fr);
  }
  .staff-tmpl-col-3,.staff-tmpl-col-4,.staff-tmpl-col-5{
    display:none;
  }
}
`

// ── PRIMITIVES ───────────────────────────────────────────────────────────────

function Spinner() {
  return <div style={{ width:15, height:15, border:`2px solid ${INK_10}`, borderTopColor:INK, borderRadius:'50%', animation:'spin .65s linear infinite', flexShrink:0 }} />
}

function ArrowRight({ color='currentColor', size=14 }: { color?:string; size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function ArrowLeft({ color='currentColor', size=13 }: { color?:string; size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function HaeloLogo() {
  return <Logo variant="white-on-navy" size="md" />
}

// ── BUTTONS ──────────────────────────────────────────────────────────────────

function BtnInk({ onClick, children, disabled=false }: { onClick:()=>void; children:React.ReactNode; disabled?:boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', gap:8, background:disabled?INK_20:hov?'#1a3a12':INK, color:disabled?INK_40:'#fff', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:600, padding:'12px 20px', borderRadius:10, border:'none', cursor:disabled?'not-allowed':'pointer', transform:hov&&!disabled?'translateY(-1px)':'none', boxShadow:hov&&!disabled?'0 6px 20px rgba(17,39,11,0.22)':'none', transition:'all .2s cubic-bezier(.4,0,.2,1)', whiteSpace:'nowrap' as const }}>
      {children}
    </button>
  )
}

function BtnGreen({ onClick, children, disabled=false }: { onClick:()=>void; children:React.ReactNode; disabled?:boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', gap:8, background:disabled?INK_20:hov?'#236040':GREEN, color:disabled?INK_40:'#fff', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:600, padding:'12px 20px', borderRadius:10, border:'none', cursor:disabled?'not-allowed':'pointer', transform:hov&&!disabled?'translateY(-1px)':'none', boxShadow:hov&&!disabled?'0 6px 18px rgba(46,125,82,0.3)':'none', transition:'all .2s cubic-bezier(.4,0,.2,1)', whiteSpace:'nowrap' as const }}>
      {children}
    </button>
  )
}

function BtnGhost({ onClick, children, disabled=false }: { onClick:()=>void; children:React.ReactNode; disabled?:boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:disabled?'not-allowed':'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:disabled?INK_20:hov?INK:INK_40, padding:0, transition:'color .15s', whiteSpace:'nowrap' as const }}>
      {children}
    </button>
  )
}

function SelectInput({ value, onChange, children }: { value:string; onChange:(v:string)=>void; children:React.ReactNode }) {
  const [foc, setFoc] = useState(false)
  return (
    <div style={{ position:'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{ width:'100%', appearance:'none', WebkitAppearance:'none', fontFamily:"'Plus Jakarta Sans',sans-serif", background:foc?WHITE:CREAM, border:`1.5px solid ${foc?INK:INK_10}`, borderRadius:10, padding:'11px 38px 11px 14px', fontSize:13, fontWeight:600, color:INK, outline:'none', cursor:'pointer', boxShadow:foc?`0 0 0 3px ${INK_06}`:'none', transition:'all .18s' }}>
        {children}
      </select>
      <svg style={{ position:'absolute', right:13, top:'50%', transform:`translateY(-50%) rotate(${foc?'-180':'0'}deg)`, pointerEvents:'none', transition:'transform .2s' }}
        width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={INK_40} strokeWidth="2.2" strokeLinecap="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}

// ── SHARED UI ────────────────────────────────────────────────────────────────

function Eyebrow({ n, total=6 }: { n:number; total?:number }) {
  return <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:GOLD, marginBottom:8 }}>Step {n} of {total}</p>
}

function StepTitle({ children }: { children:React.ReactNode }) {
  return <h2 style={{ fontSize:24, fontWeight:700, color:INK, lineHeight:1.15, letterSpacing:'-.025em', marginBottom:6 }}>{children}</h2>
}

function StepSub({ children }: { children:React.ReactNode }) {
  return <p style={{ fontSize:13, color:INK_60, lineHeight:1.6, marginBottom:24 }}>{children}</p>
}

function InfoBar({ children }: { children:React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:INK_03, border:`1px solid ${INK_10}`, borderRadius:10, padding:'12px 14px' }}>
      <p style={{ fontSize:12, color:INK_60, lineHeight:1.55, margin:0 }}>{children}</p>
    </div>
  )
}

function FieldInput({ label, placeholder, value, onChange, type='text', prefix }: {
  label:string; placeholder:string; value:string; onChange:(v:string)=>void; type?:string; prefix?:string
}) {
  const [foc, setFoc] = useState(false)
  return (
    <div>
      <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' as const, color:INK_40, marginBottom:5 }}>{label}</label>
      <div style={{ display:'flex', gap:0 }}>
        {prefix && (
          <div style={{ background:CREAM, border:`1.5px solid ${foc?INK:INK_10}`, borderRight:'none', borderRadius:'10px 0 0 10px', padding:'11px 12px', fontSize:13, color:INK_60, fontWeight:600, whiteSpace:'nowrap' as const, display:'flex', alignItems:'center', flexShrink:0 }}>
            {prefix}
          </div>
        )}
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={{ flex:1, fontFamily:"'Plus Jakarta Sans',sans-serif", background:foc?WHITE:CREAM, border:`1.5px solid ${foc?INK:INK_10}`, borderRadius:prefix?'0 10px 10px 0':10, padding:'11px 14px', fontSize:13, color:INK, outline:'none', boxShadow:foc?`0 0 0 3px ${INK_06}`:'none', transition:'all .18s', minWidth:0 }}
        />
      </div>
    </div>
  )
}

function SuccessState({ emoji, eyebrow, title, sub, cta, onCta, green }: {
  emoji:string; eyebrow:string; title:string; sub:string; cta:string; onCta:()=>void; green?:boolean
}) {
  return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ position:'relative', width:76, height:76, margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', inset:-8, borderRadius:'50%', border:'1px solid rgba(46,125,82,0.2)', animation:'ringPulse 2.4s ease-in-out infinite' }} />
        <div style={{ width:76, height:76, background:GREEN_BG, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{emoji}</div>
      </div>
      <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:GREEN, marginBottom:6 }}>{eyebrow}</p>
      <h3 style={{ fontSize:22, fontWeight:700, color:INK, letterSpacing:'-.02em', marginBottom:5 }}>{title}</h3>
      <p style={{ fontSize:13, color:INK_60, marginBottom:24 }}>{sub}</p>
      {green
        ? <BtnGreen onClick={onCta}>{cta} <ArrowRight color="#fff" /></BtnGreen>
        : <BtnInk onClick={onCta}>{cta} <ArrowRight color="#fff" /></BtnInk>}
    </div>
  )
}

// ── PROGRESS RAIL ────────────────────────────────────────────────────────────

const STEP_LABELS = ['Email', 'Domain', 'WhatsApp', 'Bible', 'Tone', 'Timer']

function ProgressRail({ current }: { current:number }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start' }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} style={{ display:'flex', alignItems:'flex-start' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, background:done||active?INK:CREAM, border:`1.5px solid ${done||active?INK:INK_20}`, color:done||active?'#fff':INK_40, boxShadow:active?`0 0 0 4px ${INK_06}`:'none', transition:'all .35s cubic-bezier(.4,0,.2,1)', flexShrink:0 }}>
                {done?'✓':i+1}
              </div>
              <span className="step-label" style={{ fontSize:10, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', color:active?INK:done?INK_60:INK_20, transition:'color .3s' }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length-1 && (
              <div style={{ height:1, width:52, flexShrink:0, background:done?INK:INK_10, marginTop:15, marginLeft:4, marginRight:4, transition:'background .5s cubic-bezier(.4,0,.2,1)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── SIDEBAR ──────────────────────────────────────────────────────────────────

const SIDEBAR_DATA = [
  { title:'Connect your inbox.', items:[{ i:'🔐', t:'<strong>OAuth only.</strong> Your password is never stored, seen, or shared.' },{ i:'🏢', t:'<strong>Company domain only.</strong> External emails are permanently ignored.' },{ i:'⚡', t:'<strong>Under 60 seconds</strong> from email receipt to WhatsApp notification.' }] },
  { title:'Protect your inbox.', items:[{ i:'🏢', t:'<strong>One domain, zero noise.</strong> Haelo exclusively reads emails from your company domain.' },{ i:'🔒', t:'<strong>External emails ignored.</strong> Clients, vendors, spam — none of it reaches Haelo.' },{ i:'⚙️', t:'<strong>Configurable any time</strong> from Settings if your domain ever changes.' }] },
  { title:'Your action layer.', items:[{ i:'💬', t:'<strong>One-tap approvals.</strong> Reply YES, NO, or type a short instruction.' },{ i:'⏱', t:"<strong>Timer handles the rest.</strong> Auto-sends if you don't respond." }] },
  { title:'Upload your company context.', items:[{ i:'📋', t:'<strong>5 document categories.</strong> Each one makes Haelo more accurate.' },{ i:'📥', t:'<strong>Templates included.</strong> Download, fill with AI, upload the result.' },{ i:'🎯', t:'<strong>One-time upload.</strong> Haelo references it on every email.' }] },
  { title:'Define your voice.', items:[{ i:'✍️', t:'<strong>Tone shapes every draft.</strong> Haelo sounds exactly like you.' },{ i:'🔄', t:'<strong>Adjustable any time</strong> from your Settings page.' }] },
  { title:'Set your timer.', items:[{ i:'🕐', t:'<strong>You stay in control.</strong> Nothing sends without your approval.' },{ i:'⚖️', t:'<strong>Hybrid mode</strong> auto-handles routine emails while protecting sensitive ones.' }] },
]

function Sidebar({ step }: { step:number }) {
  const d = SIDEBAR_DATA[step] || SIDEBAR_DATA[0]
  return (
    <div className="sidebar-wrap">
      <div style={{ background:NAVY, borderRadius:16, padding:'28px 24px', position:'sticky', top:80 }}>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:GOLD_LIGHT, marginBottom:6 }}>Step {step+1} of 6</p>
        <h3 style={{ fontSize:18, fontWeight:700, color:'#fff', lineHeight:1.2, letterSpacing:'-.02em', marginBottom:5 }}>{d.title}</h3>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:22, lineHeight:1.5 }}>{STEP_LABELS[step]}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {d.items.map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>{item.i}</span>
              <span style={{ fontSize:11.5, color:'rgba(255,255,255,0.5)', lineHeight:1.5 }} dangerouslySetInnerHTML={{ __html:item.t }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── STEP 0: EMAIL ─────────────────────────────────────────────────────────────

interface ProviderBtnProps {
  id:string; name:string; sub:string; bg:string; letter:string
  connecting:string|null; onConnect:(id:string)=>void
}

function ProviderBtn({ id, name, sub, bg, letter, connecting, onConnect }: ProviderBtnProps) {
  const [hov, setHov] = useState(false)
  const isMe = connecting === id
  return (
    <button
      onClick={() => onConnect(id)} disabled={!!connecting}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:isMe||hov?WHITE:CREAM, border:`1.5px solid ${isMe?INK:hov?INK_20:INK_10}`, borderRadius:12, cursor:connecting?'default':'pointer', width:'100%', fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:8, transform:hov&&!connecting?'translateY(-1px)':'none', boxShadow:hov&&!connecting?`0 2px 12px ${INK_06}`:'none', transition:'all .2s cubic-bezier(.4,0,.2,1)' }}>
      <div style={{ width:38, height:38, borderRadius:9, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:'#fff', flexShrink:0 }}>{letter}</div>
      <div style={{ flex:1, textAlign:'left', minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:INK }}>{name}</div>
        <div style={{ fontSize:11, color:INK_40, marginTop:1 }}>{sub}</div>
      </div>
      {isMe ? <Spinner /> : (
        <svg style={{ marginLeft:'auto', color:hov?INK:INK_20, transition:'all .2s', transform:hov?'translateX(3px)':'none', flexShrink:0 }}
          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  )
}

function StepEmail({ onNext }: { onNext:()=>void }) {
  const [connecting, setConnecting] = useState<string|null>(null)
  const [connected, setConnected] = useState<string|null>(null)

  const [error, setError] = useState('')

  const providers = [
    { id:'gmail',   name:'Gmail',                    sub:'Google OAuth 2.0 · Gmail API',         bg:'#EA4335', letter:'G' },
    { id:'outlook', name:'Outlook / Microsoft 365',  sub:'Microsoft Graph API · OAuth 2.0',       bg:'#0078D4', letter:'O' },
    { id:'zoho',    name:'Zoho Mail',                sub:'Zoho OAuth · Zoho Mail API',            bg:'#E4261C', letter:'Z' },
  ]

  const connect = async (id:string) => {
    setError('')
    setConnecting(id)
    try {
      const providerStr = id === 'zoho' ? 'zoho.com' : id === 'gmail' ? 'gmail.com' : null
      if (!providerStr) {
        setError('Provider not supported yet')
        setConnecting(null)
        return
      }
      
      const res = await connectEmail(providerStr as any)
      
      if (res.data?.authUrl) {
        const width = 500;
        const height = 650;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.screen.availHeight / 2 - height / 2;
        
        window.open(
          res.data.authUrl,
          'OAuthPopup',
          `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        )
        setConnected(id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect email')
    } finally {
      setConnecting(null)
    }
  }

  if (connected) {
    const name = providers.find(p => p.id === connected)?.name
    return <SuccessState emoji="✅" eyebrow="Connected" title={`${name} is connected.`} sub="Haelo is now watching your inbox in real time." cta="Continue to Domain Setup" onCta={onNext} green />
  }

  return (
    <div>
      <Eyebrow n={1} />
      <StepTitle>Connect your inbox.</StepTitle>
      <StepSub>Haelo monitors your company email in real time. OAuth only — your password is never stored or seen.</StepSub>
      
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: 10, marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>{error}</p>
        </div>
      )}

      {providers.map(p => <ProviderBtn key={p.id} {...p} connecting={connecting} onConnect={connect} />)}
      <InfoBar>🔒 Haelo only reads emails from your company domain. External emails are never touched. Access can be revoked instantly from Settings.</InfoBar>
    </div>
  )
}

// ── STEP 1: DOMAIN ────────────────────────────────────────────────────────────

function StepDomain({ onNext, onBack }: { onNext:()=>void; onBack:()=>void }) {
  const [domain, setDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const valid = domain.trim().length > 3 && domain.includes('.')

  const handleNext = async () => {
    if (!valid) return
    setSaving(true)
    setError('')
    try {
      await saveDomain(domain.trim())
      onNext()
    } catch (err: any) {
      setError(err.message || 'Failed to save domain')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Eyebrow n={2} />
      <StepTitle>Your company domain.</StepTitle>
      <StepSub>Haelo will only read and respond to emails from this domain. Everything else — clients, vendors, personal mail — is permanently ignored.</StepSub>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: 10, marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>{error}</p>
        </div>
      )}

      <div style={{ marginBottom:20 }}>
        <FieldInput
          label="Company email domain"
          placeholder="company.com"
          value={domain}
          onChange={setDomain}
          prefix="@"
        />
        {domain && !valid && (
          <p style={{ fontSize:11, color:'#C0392B', marginTop:6 }}>Enter a valid domain, e.g. company.com</p>
        )}
        {valid && (
          <p style={{ fontSize:11, color:GREEN, marginTop:6, fontWeight:600 }}>
            ✓ Haelo will only process emails from @{domain}
          </p>
        )}
      </div>

      {/* Preview */}
      <div style={{ background:NAVY, borderRadius:14, padding:18, marginBottom:20 }}>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.09em', textTransform:'uppercase' as const, color:GOLD_LIGHT, marginBottom:12 }}>How it works</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { icon:'✅', label:`tosin@${domain||'yourcompany.com'}`, desc:'Handled by Haelo', color:GREEN },
            { icon:'✅', label:`funke@${domain||'yourcompany.com'}`, desc:'Handled by Haelo', color:GREEN },
            { icon:'🚫', label:'client@gmail.com', desc:'Ignored — external', color:INK_40 },
            { icon:'🚫', label:'vendor@outlook.com', desc:'Ignored — external', color:INK_40 },
          ].map((row, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'rgba(255,255,255,0.04)', borderRadius:9, border:'1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize:13, flexShrink:0 }}>{row.icon}</span>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.55)', flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{row.label}</span>
              <span style={{ fontSize:10, fontWeight:700, color:row.color, flexShrink:0 }}>{row.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <InfoBar>🔒 Your domain setting can be updated any time from Settings. You can also add secondary domains later.</InfoBar>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:20, flexWrap:'wrap' as const }}>
        <BtnGhost onClick={onBack} disabled={saving}><ArrowLeft /> Back</BtnGhost>
        <BtnInk onClick={handleNext} disabled={!valid || saving}>
          {saving ? 'Saving...' : valid ? 'Continue to WhatsApp' : 'Enter your domain first'} 
          {!saving && <ArrowRight color={!valid?INK_40:'#fff'} />}
        </BtnInk>
      </div>
    </div>
  )
}

// ── STEP 2: WHATSAPP ──────────────────────────────────────────────────────────

function StepWhatsApp({ onNext, onBack }: { onNext:()=>void; onBack:()=>void }) {
  const [phone, setPhone] = useState('')
  const [phoneFoc, setPhoneFoc] = useState(false)
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState(['','','','','',''])
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef<(HTMLInputElement|null)[]>([])

  const handleSend = async () => {
    if (phone.length < 8) return
    setLoading(true)
    setError('')
    try {
      await addWhatsappNumber(`234${phone}`)
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to add WhatsApp number')
    } finally {
      setLoading(false)
    }
  }

  const triggerVerify = async (otpCode: string[]) => {
    setVerifying(true)
    setError('')
    try {
      await verifyWhatsappNumber(`234${phone}`, otpCode.join(''))
      setVerified(true)
    } catch (err: any) {
      setError(err.message || 'OTP verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleCode = (i:number, val:string) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9]/g, '')
    
    if (cleanVal.length > 1) {
      const next = [...code]
      for (let j = 0; j < cleanVal.length && i + j < 6; j++) {
        next[i + j] = cleanVal[j]
      }
      setCode(next)
      if (i + cleanVal.length < 6) refs.current[i + cleanVal.length]?.focus()
      else refs.current[5]?.focus()
      
      if (next.every(c => c !== '')) triggerVerify(next)
      return
    }

    if (val !== '' && cleanVal === '') return

    const v = cleanVal.slice(-1)
    const next = [...code]
    next[i] = v
    setCode(next)
    
    if (v && i < 5) refs.current[i+1]?.focus()
    
    if (next.every(c => c !== '')) {
      triggerVerify(next)
    }
  }

  if (verified) {
    return <SuccessState emoji="💬" eyebrow="Verified" title="WhatsApp connected." sub={`+234 ${phone} is your daily action layer.`} cta="Build your Business Bible" onCta={onNext} />
  }

  if (sent) {
    return (
      <div>
        <Eyebrow n={3} />
        <StepTitle>Enter your code.</StepTitle>
        <StepSub>Sent to +234 {phone} via WhatsApp.</StepSub>
        
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: 10, marginBottom: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>{error}</p>
          </div>
        )}

        {/* OTP GRID — uses CSS grid so boxes never overflow */}
        <div className="otp-grid">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              type="text" inputMode="text" value={digit}
              onChange={e => handleCode(i, e.target.value)}
              onKeyDown={e => { if (e.key==='Backspace' && !code[i] && i>0) { refs.current[i-1]?.focus(); const next = [...code]; next[i-1] = ''; setCode(next); } }}
              className="otp-input"
              style={{ background:digit?WHITE:CREAM, border:`1.5px solid ${digit?INK_40:INK_10}`, color: INK, textAlign: 'center' }}
            />
          ))}
        </div>
        {verifying && (
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:INK_40, marginBottom:16 }}>
            <Spinner /> Verifying…
          </div>
        )}
        <BtnGhost onClick={() => { setSent(false); setCode(['','','','','','']) }}>
          <ArrowLeft size={11} /> Resend code
        </BtnGhost>
      </div>
    )
  }

  return (
    <div>
      <Eyebrow n={3} />
      <StepTitle>Your WhatsApp number.</StepTitle>
      <StepSub>This is where every email notification lands — fast, familiar, and frictionless.</StepSub>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: 10, marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>{error}</p>
        </div>
      )}

      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' as const, color:INK_40, marginBottom:5 }}>WhatsApp number</label>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ background:CREAM, border:`1.5px solid ${INK_10}`, borderRadius:10, padding:'11px 14px', fontSize:13, fontWeight:700, color:INK, whiteSpace:'nowrap' as const, flexShrink:0, display:'flex', alignItems:'center', gap:6 }}>
            🇳🇬 +234
          </div>
          <input
            type="tel" placeholder="801 234 5678" value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g,''))}
            onFocus={() => setPhoneFoc(true)} onBlur={() => setPhoneFoc(false)}
            style={{ flex:1, fontFamily:"'Plus Jakarta Sans',sans-serif", background:phoneFoc?WHITE:CREAM, border:`1.5px solid ${phoneFoc?INK:INK_10}`, borderRadius:10, padding:'11px 14px', fontSize:13, color:INK, outline:'none', boxShadow:phoneFoc?`0 0 0 3px ${INK_06}`:'none', transition:'all .18s', minWidth:0 }}
          />
        </div>
      </div>

      {/* WhatsApp preview */}
      <div style={{ background:NAVY, borderRadius:14, padding:18, marginBottom:20 }}>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.09em', textTransform:'uppercase' as const, color:GOLD_LIGHT, marginBottom:12 }}>What you'll receive</p>
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, padding:14 }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' as const, color:'#4ABA7A', marginBottom:8 }}>New Internal Email</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginBottom:2 }}><strong style={{ color:'rgba(255,255,255,0.8)', fontWeight:600 }}>From:</strong> Tosin Adeyemi · Operations Manager</p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)', margin:'8px 0 12px', lineHeight:1.5 }}>Requesting approval to reorder 50kg of rice before Friday's service.</p>
          <div style={{ display:'flex', flexWrap:'wrap' as const, gap:6 }}>
            <span style={{ fontSize:10, fontWeight:600, padding:'4px 10px', borderRadius:20, background:'rgba(74,186,122,0.18)', color:'#4ABA7A' }}>Reply YES to send</span>
            <span style={{ fontSize:10, fontWeight:600, padding:'4px 10px', borderRadius:20, background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.45)' }}>Reply NO to edit</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)', padding:'4px 0' }}>· Auto-sends in 10 min</span>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' as const }}>
        <BtnGhost onClick={onBack} disabled={loading}><ArrowLeft /> Back</BtnGhost>
        <BtnInk onClick={handleSend} disabled={phone.length < 8 || loading}>
          {loading ? 'Sending...' : 'Send verification code'} {!loading && <ArrowRight color={phone.length < 8?INK_40:'#fff'} />}
        </BtnInk>
      </div>
    </div>
  )
}

// ── STEP 3: BUSINESS BIBLE ────────────────────────────────────────────────────

const BIBLE_DOCS = [
  {
    id:'overview', icon:'🏢', name:'Company Overview', required:true, isStaff:false,
    hint:'The foundation of every Haelo response. Describe your company — what it does, who it serves, core values, and how it operates.',
    accept:'.csv',
    templateCols:['section','content'] as string[],
    templateRows:[['Company name & industry','e.g. Acme Corp — FMCG distribution'],['What we do','Products / services description'],['Who we serve','Target clients and markets'],['Company values','Core principles and culture'],['Key facts','Founded, headcount, revenue range']] as string[][],
    templateFile:'haelo_company_overview_template.csv',
    aiPrompt:'Fill this template for my company. We are called [name] and we do [description]. Format it as Section | Content.',
  },
  {
    id:'directory', icon:'👥', name:'Staff Directory', required:true, isStaff:true,
    hint:'Every person Haelo will recognise. Each row must include first name, last name, role, email, and a one-sentence description.',
    accept:'.csv',
    templateFile:'haelo_staff_directory_template.csv',
    aiPrompt:'Fill this staff directory CSV for my team. My staff: [list names, roles]. Add a one-sentence description per person. Use columns: First Name, Last Name, Role, Email, Description.',
    templateCols:undefined as string[]|undefined,
    templateRows:undefined as string[][]|undefined,
  },
  {
    id:'chart', icon:'🏗️', name:'Org Chart', required:true, isStaff:false,
    hint:'Your hierarchy and reporting lines. Haelo uses this to understand seniority and route responses correctly.',
    accept:'.csv',
    templateCols:['name','reportsTo','department','level'] as string[],
    templateRows:[['John Adeyemi','CEO','Executive','Director'],['Grace Obi','John Adeyemi','Operations','Manager'],['Finance Team','Grace Obi','Finance','Team Lead']] as string[][],
    templateFile:'haelo_org_structure_template.csv',
    aiPrompt:'Create an org chart CSV for my company. Hierarchy: [describe]. Columns: Name, Reports To, Department, Level.',
  },
  {
    id:'sop', icon:'📋', name:'SOPs & Policies', required:false, isStaff:false,
    hint:'Approval thresholds, leave policies, procurement rules, escalation paths.',
    accept:'.csv',
    templateCols:['situation','action','whoApproves'] as string[],
    templateRows:[['Leave request','Approve if 5 days notice and cover confirmed','CEO'],['Purchase above ₦500k','Requires Finance + CEO sign-off','CEO + Finance'],['Client complaint','Acknowledge 2hrs, resolve 24hrs','Operations Manager']] as string[][],
    templateFile:'haelo_sops_template.csv',
    aiPrompt:'Create a SOPs document for my business. Key processes: [describe]. Format: Situation | Standard Action | Who Approves.',
  },
  {
    id:'comms', icon:'💬', name:'Comms Style', required:false, isStaff:false,
    hint:'How you communicate with your team. Formal or direct? Long or brief? Haelo mirrors this in every draft.',
    accept:'.csv',
    templateCols:['aspect','preference'] as string[],
    templateRows:[['Tone','e.g. Direct and brief'],['With senior staff','e.g. Peer-to-peer, no formality'],['With junior staff','e.g. Warm but firm, action-oriented'],['Phrases to avoid','e.g. filler words, "I will try"'],['Format','e.g. One idea per message']] as string[][],
    templateFile:'haelo_comms_style_template.csv',
    aiPrompt:'Write a communication style guide for my AI assistant. My preferences: [describe]. Format: Aspect | Your Preference.',
  },
]

const EXT_ICON: Record<string,string> = { pdf:'📄',docx:'📝',doc:'📝',csv:'📊',xlsx:'📊',xls:'📊',txt:'📃',png:'🖼️',jpg:'🖼️',jpeg:'🖼️' }
const EXT_COLOR: Record<string,string> = { pdf:'#E74C3C',docx:'#2980B9',doc:'#2980B9',csv:'#27AE60',xlsx:'#27AE60',xls:'#27AE60',txt:'#7F8C8D',png:'#8E44AD',jpg:'#8E44AD',jpeg:'#8E44AD' }

function downloadCSV(filename:string, cols:string[], rows:string[][]) {
  const csv = [cols.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = filename; a.click()
}

function downloadStaffTemplate() {
  const csv = 'firstName,lastName,role,email,description\nTosin,Adeyemi,Operations Manager,goziemanapple@gmail.com,"Manages day-to-day operations and procurement approvals"\nFunke,Balogun,HR Manager,chigozieokoroaformichael@gmail.com,"Handles leave requests, recruitment, and staff welfare"\n'
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = 'haelo_staff_directory_template.csv'; a.click()
}

function FileRow({ file, onRemove }: { file:UploadedFile; onRemove:(id:string)=>void }) {
  const [hov, setHov] = useState(false)
  const ext = file.name.split('.').pop()?.toLowerCase()||''
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:CREAM, border:`1.5px solid ${file.processing?INK_20:INK_10}`, borderRadius:10 }}>
      <div style={{ width:32, height:32, borderRadius:7, background:`${EXT_COLOR[ext]||'#7F8C8D'}15`, color:EXT_COLOR[ext]||'#7F8C8D', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
        {EXT_ICON[ext]||'📎'}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:600, color:INK, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</div>
        <div style={{ fontSize:10, color:INK_40, marginTop:1 }}>{file.size}</div>
      </div>
      <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, flexShrink:0, background:file.processing?INK_06:GREEN_BG, color:file.processing?INK_40:GREEN }}>
        {file.processing?'Processing…':'Uploaded'}
      </span>
      {!file.processing && (
        <button onClick={() => onRemove(file.id)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{ background:'none', border:'none', cursor:'pointer', color:hov?'#C0392B':INK_20, fontSize:16, padding:'2px 5px', borderRadius:5, lineHeight:1, transition:'all .15s', flexShrink:0 }}>×</button>
      )}
    </div>
  )
}

function BibleTabBtn({ doc, active, hasFiles, onClick }: {
  doc:typeof BIBLE_DOCS[0]; active:boolean; hasFiles:boolean; onClick:()=>void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontSize:11, fontWeight:600, padding:'5px 11px', borderRadius:20, border:`1.5px solid ${active?INK:hasFiles?GREEN:hov?INK_20:INK_10}`, background:active?INK:'transparent', color:active?'#fff':hasFiles?GREEN:hov?INK:INK_40, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'all .18s', whiteSpace:'nowrap' as const }}>
      {hasFiles&&!active?'✓ ':''}{doc.icon} {doc.name}
      {doc.required&&!active?<span style={{ color:GOLD, marginLeft:2 }}>*</span>:null}
    </button>
  )
}

function StepBible({ onNext, onBack }: { onNext:()=>void; onBack:()=>void }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [uploads, setUploads] = useState<Record<string,UploadedFile[]>>({})
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const doc = BIBLE_DOCS.find(d => d.id === activeTab)!
  const currentFiles = uploads[activeTab]||[]
  const doneCount = BIBLE_DOCS.filter(d => (uploads[d.id]||[]).length>0).length
  const allRequired = BIBLE_DOCS.filter(d => d.required).every(d => (uploads[d.id]||[]).length>0)

  const handleSubmit = async () => {
    if (!allRequired) return
    setLoading(true)
    setError('')
    
    try {
      const formData = new FormData()
      
      // Append files for each category
      BIBLE_DOCS.forEach(docType => {
        const categoryFiles = uploads[docType.id] || []
        categoryFiles.forEach(fileObj => {
          if (fileObj.file) {
            formData.append(docType.id, fileObj.file)
          }
        })
      })
      
      await uploadBibleFiles(formData)
      onNext()
    } catch (err: any) {
      setError(err.message || 'Failed to upload files')
    } finally {
      setLoading(false)
    }
  }

  const handleFiles = useCallback((files:File[]) => {
    const validFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv'))
    if (validFiles.length === 0 && files.length > 0) {
      setError('Only CSV files are accepted.')
      return
    }
    setError('')
    
    const newFiles:UploadedFile[] = validFiles.map(f => ({
      id:`${Date.now()}-${Math.random()}`, name:f.name,
      size:f.size>1048576?`${(f.size/1048576).toFixed(1)} MB`:`${Math.round(f.size/1024)} KB`,
      processing:true,
      file: f,
    }))
    setUploads(prev => ({ ...prev, [activeTab]:[...(prev[activeTab]||[]),...newFiles] }))
    newFiles.forEach(nf => {
      setTimeout(() => {
        setUploads(prev => ({ ...prev, [activeTab]:(prev[activeTab]||[]).map(f => f.id===nf.id?{...f,processing:false}:f) }))
      }, 900+Math.random()*700)
    })
  }, [activeTab])

  const removeFile = (id:string) => setUploads(prev => ({ ...prev, [activeTab]:(prev[activeTab]||[]).filter(f => f.id!==id) }))

  return (
    <div>
      <Eyebrow n={4} />
      <StepTitle>Business Bible.</StepTitle>
      <StepSub>Upload the documents that teach Haelo your business. Each category has a downloadable template — use AI to fill it, then upload the result.</StepSub>

      {/* Mini progress */}
      <div style={{ height:2, background:INK_10, borderRadius:2, marginBottom:20, overflow:'hidden' }}>
        <div style={{ height:'100%', background:INK, borderRadius:2, width:`${Math.max(4,(doneCount/BIBLE_DOCS.length)*100)}%`, transition:'width .55s cubic-bezier(.4,0,.2,1)' }} />
      </div>

      {/* Category tabs */}
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' as const, marginBottom:20 }}>
        {BIBLE_DOCS.map(d => (
          <BibleTabBtn key={d.id} doc={d} active={d.id===activeTab} hasFiles={(uploads[d.id]||[]).length>0} onClick={() => setActiveTab(d.id)} />
        ))}
      </div>

      {/* Section header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:18 }}>
        <div style={{ width:40, height:40, background:INK, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{doc.icon}</div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:INK, letterSpacing:'-.015em', marginBottom:2 }}>
            {doc.name}{doc.required&&<span style={{ color:GOLD, marginLeft:3, fontSize:14 }}>*</span>}
          </div>
          <div style={{ fontSize:12, color:INK_60, lineHeight:1.55 }}>{doc.hint}</div>
        </div>
      </div>

      {/* Staff template */}
      {doc.isStaff && (
        <div style={{ background:NAVY, borderRadius:12, padding:16, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:12, flexWrap:'wrap' as const }}>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' as const, color:GOLD_LIGHT }}>📥 Staff Directory Template</span>
            <button onClick={downloadStaffTemplate} style={{ display:'inline-flex', alignItems:'center', gap:5, background:GOLD_BG, color:GOLD_LIGHT, fontSize:11, fontWeight:600, padding:'5px 10px', borderRadius:7, border:`1px solid ${GOLD_BORDER}`, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              ↓ Download CSV
            </button>
          </div>
          <div style={{ border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, overflow:'hidden', marginBottom:10 }}>
            <div className="staff-tmpl-grid" style={{ background:'rgba(255,255,255,0.1)' }}>
              {['First Name','Last Name','Role','Email','Description'].map((col,idx) => (
                <div key={col} className={`staff-tmpl-col-${idx+1}`} style={{ padding:'7px 8px', fontSize:10, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.6)', borderRight:'1px solid rgba(255,255,255,0.07)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>
                  {col}<span style={{ color:GOLD_LIGHT, marginLeft:2 }}>*</span>
                </div>
              ))}
            </div>
            <div className="staff-tmpl-grid" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              {['Tosin','Adeyemi','Ops Manager','tosin@co.com','Manages daily ops…'].map((cell,i) => (
                <div key={i} className={`staff-tmpl-col-${i+1}`} style={{ padding:'7px 8px', fontSize:11, color:'rgba(255,255,255,0.38)', fontStyle:'italic', borderRight:'1px solid rgba(255,255,255,0.05)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>
                  {cell}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, background:GOLD_BG, border:`1px solid ${GOLD_BORDER}`, borderRadius:9, padding:'10px 12px' }}>
            <span style={{ fontSize:14, flexShrink:0 }}>✨</span>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.6)', lineHeight:1.55, margin:0 }}>
              <strong style={{ color:GOLD_LIGHT }}>Build this fast with AI.</strong> Download the template, then tell Claude or ChatGPT: <em style={{ color:'rgba(255,255,255,0.45)' }}>"Fill this CSV with my team. Staff: [list names and roles]. Add a one-sentence description per person."</em>
            </p>
          </div>
        </div>
      )}

      {/* Generic template */}
      {!doc.isStaff && doc.templateCols && (
        <div style={{ background:NAVY, borderRadius:12, padding:16, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:12, flexWrap:'wrap' as const }}>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' as const, color:GOLD_LIGHT }}>📥 {doc.name} Template</span>
            <button onClick={() => downloadCSV(doc.templateFile!,doc.templateCols!,doc.templateRows!)}
              style={{ display:'inline-flex', alignItems:'center', gap:5, background:GOLD_BG, color:GOLD_LIGHT, fontSize:11, fontWeight:600, padding:'5px 10px', borderRadius:7, border:`1px solid ${GOLD_BORDER}`, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              ↓ Download template
            </button>
          </div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, padding:'11px 14px', marginBottom:10, overflowX:'auto' as const }}>
            <div style={{ display:'grid', gridTemplateColumns:doc.templateCols.map(()=>'1fr').join(' '), gap:12, paddingBottom:6, marginBottom:6, borderBottom:'1px solid rgba(255,255,255,0.07)', minWidth:220 }}>
              {doc.templateCols.map(c => <span key={c} style={{ fontSize:10, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.3)' }}>{c}</span>)}
            </div>
            {doc.templateRows!.slice(0,3).map((row,ri) => (
              <div key={ri} style={{ display:'grid', gridTemplateColumns:doc.templateCols!.map(()=>'1fr').join(' '), gap:12, paddingBottom:4, marginBottom:4, borderBottom:'1px solid rgba(255,255,255,0.04)', minWidth:220 }}>
                {row.map((cell,ci) => <span key={ci} style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontStyle:'italic' }}>{cell}</span>)}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, background:GOLD_BG, border:`1px solid ${GOLD_BORDER}`, borderRadius:9, padding:'10px 12px' }}>
            <span style={{ fontSize:14, flexShrink:0 }}>✨</span>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.6)', lineHeight:1.55, margin:0 }}>
              <strong style={{ color:GOLD_LIGHT }}>Build this fast with AI.</strong> Download the template, then prompt: <em style={{ color:'rgba(255,255,255,0.45)' }}>"{doc.aiPrompt}"</em>
            </p>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)) }}
        onClick={() => fileRef.current?.click()}
        style={{ border:`2px dashed ${dragOver?INK:INK_20}`, borderRadius:12, padding:'28px 20px', textAlign:'center' as const, cursor:'pointer', background:dragOver?INK_03:'transparent', transition:'all .2s', marginBottom:12 }}
      >
        <input ref={fileRef} type="file" accept={doc.accept} multiple style={{ display:'none' }}
          onChange={e => { if(e.target.files) handleFiles(Array.from(e.target.files)) }} />
        <div style={{ fontSize:22, marginBottom:8 }}>📎</div>
        <div style={{ fontSize:13, fontWeight:600, color:INK, marginBottom:3 }}>Drop files here or click to browse</div>
        <div style={{ fontSize:11, color:INK_40 }}>Only CSV files accepted</div>
      </div>

      {currentFiles.length>0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:12 }}>
          {currentFiles.map(f => <FileRow key={f.id} file={f} onRemove={removeFile} />)}
        </div>
      )}

      {!doc.required && <p style={{ fontSize:11, color:INK_40, marginBottom:14 }}>Optional — you can add this document later from the Business Bible page.</p>}

      {/* ── PROFESSIONAL HELP CTA ── */}
      <div style={{ background:NAVY, borderRadius:14, padding:18, marginBottom:16, marginTop:4 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
          <div style={{ width:36, height:36, background:GOLD_BG, border:`1px solid ${GOLD_BORDER}`, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🤝</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:700, color:GOLD_LIGHT, marginBottom:3 }}>Need help building your Business Bible?</p>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)', lineHeight:1.6, marginBottom:12 }}>
              Not sure where to start? Our team can help you structure and write every document — company overview, staff directory, org chart, SOPs, and communication guide — in a single session.
            </p>
            <a
              href="https://wa.me/2347048048164?text=Hi%2C%20I%20need%20help%20building%20my%20Business%20Bible%20for%20Haelo.%20Can%20you%20help%3F"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(74,186,122,0.15)', color:'#4ABA7A', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:700, padding:'10px 16px', borderRadius:9, border:'1px solid rgba(74,186,122,0.2)', textDecoration:'none', transition:'all .18s', letterSpacing:'.01em' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact a professional
            </a>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: 10, marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>{error}</p>
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:4, flexWrap:'wrap' as const }}>
        <BtnGhost onClick={onBack} disabled={loading}><ArrowLeft /> Back</BtnGhost>
        <BtnInk onClick={handleSubmit} disabled={!allRequired || loading}>
          {loading ? 'Uploading...' : allRequired ? 'Continue to Tone' : 'Upload required files first'} 
          {!loading && <ArrowRight color={!allRequired?INK_40:'#fff'} />}
        </BtnInk>
      </div>
      {!allRequired && <p style={{ fontSize:10.5, color:INK_40, marginTop:8 }}>Required: Company Overview ✱ Staff Directory ✱ Org Chart ✱</p>}
    </div>
  )
}

// ── STEP 4: TONE ──────────────────────────────────────────────────────────────

const TONES: { id:ToneId; name:string; desc:string; example:string }[] = [
  { id:'direct',        name:'Direct & Concise',     desc:'Short, clear, action-oriented.',          example:'"Approved. Submit the receipt to accounts today."' },
  { id:'warm',          name:'Warm & Professional',   desc:'Cordial, constructive, human.',            example:'"Thanks for flagging this. Approved — please log in the system."' },
  { id:'formal',        name:'Formal & Authoritative',desc:'Structured, measured, institutional.',     example:'"This is approved. Kindly ensure all documentation is filed accordingly."' },
  { id:'collaborative', name:'Collaborative',         desc:'Inclusive, consultative, team-first.',     example:'"Good thinking. Let\'s proceed — co-ordinate with Finance and keep me posted."' },
  { id:'brief',         name:'Ultra Brief',           desc:'Minimal words. Maximum speed.',            example:'"Approved."' },
  { id:'custom',        name:'Custom',                desc:'Write your own tone instruction.',         example:'e.g. "Warm but brief. Never start with I. Avoid filler words."' },
]

function ToneCard({ tone, active, onClick }: { tone:typeof TONES[0]; active:boolean; onClick:()=>void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', flexDirection:'column', gap:3, padding:'13px 15px', background:active||hov?WHITE:CREAM, border:`1.5px solid ${active?INK:hov?INK_20:INK_10}`, borderRadius:11, cursor:'pointer', textAlign:'left', fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', overflow:'hidden', transition:'all .18s' }}>
      {active && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:INK, borderRadius:'2px 0 0 2px' }} />}
      <div style={{ fontSize:12, fontWeight:700, color:INK }}>{tone.name}</div>
      <div style={{ fontSize:11, color:INK_60, lineHeight:1.4 }}>{tone.desc}</div>
      <div style={{ fontSize:10.5, color:INK_40, fontStyle:'italic', marginTop:3, lineHeight:1.4 }}>{tone.example}</div>
    </button>
  )
}

function StepTone({ onNext, onBack }: { onNext:()=>void; onBack:()=>void }) {
  const [selected, setSelected] = useState<ToneId>('direct')
  const [customText, setCustomText] = useState('')
  const [textFoc, setTextFoc] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNext = async () => {
    setLoading(true)
    setError('')
    try {
      const toneValue = selected === 'custom' ? customText : selected
      if (selected === 'custom' && !customText.trim()) {
        throw new Error('Please describe your custom tone.')
      }
      await saveHaeloTone(toneValue)
      onNext()
    } catch(err: any) {
      setError(err.message || 'Failed to save tone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Eyebrow n={5} />
      <StepTitle>How should Haelo sound?</StepTitle>
      <StepSub>Select your default response tone. Every AI draft will follow this voice. You can override it per email directly from WhatsApp.</StepSub>

      <div className="tone-grid">
        {TONES.map(t => <ToneCard key={t.id} tone={t} active={selected===t.id} onClick={() => setSelected(t.id)} />)}
      </div>

      {selected==='custom' && (
        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' as const, color:INK_40, marginBottom:5 }}>Describe your tone</label>
          <textarea value={customText} onChange={e => setCustomText(e.target.value)}
            onFocus={() => setTextFoc(true)} onBlur={() => setTextFoc(false)}
            placeholder='e.g. Warm but brief. Always acknowledge before directing. Never start a reply with "I". Avoid corporate language.'
            rows={3}
            style={{ width:'100%', background:textFoc?WHITE:CREAM, border:`1.5px solid ${textFoc?INK:INK_10}`, borderRadius:10, padding:'11px 14px', fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", color:INK, outline:'none', resize:'none', lineHeight:1.6, boxShadow:textFoc?`0 0 0 3px ${INK_06}`:'none', transition:'all .18s' }} />
        </div>
      )}

      <div style={{ marginBottom:22 }}>
        <InfoBar>💡 Your tone setting shapes every AI-drafted response. You can still edit any response on WhatsApp before it sends.</InfoBar>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: 10, marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>{error}</p>
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' as const }}>
        <BtnGhost onClick={onBack} disabled={loading}><ArrowLeft /> Back</BtnGhost>
        <BtnInk onClick={handleNext} disabled={loading}>
          {loading ? 'Saving...' : 'Continue to Timer'} {!loading && <ArrowRight color="#fff" />}
        </BtnInk>
      </div>
    </div>
  )
}

// ── STEP 5: TIMER ─────────────────────────────────────────────────────────────

const TIMER_OPTS: { id:TimerMode; icon:string; iconBg:string; name:string; tag?:string; desc:string }[] = [
  { id:'auto-send', icon:'⚡', iconBg:'rgba(46,125,82,0.1)',    name:'Auto-Send',    desc:'After the timer expires, Haelo sends the AI-drafted response automatically. Zero inbox backlog.' },
  { id:'remind',    icon:'🔔', iconBg:'rgba(10,22,40,0.07)',    name:'Remind & Wait', desc:'Haelo sends a WhatsApp reminder every few minutes until you respond. Nothing sends without your explicit approval.' },
  { id:'hybrid',    icon:'⚖️', iconBg:GOLD_BG,                  name:'Hybrid',       tag:'Recommended', desc:'Auto-send for routine and junior-staff emails. Remind and wait for senior staff, HR, Finance, or flagged senders.' },
]

function TimerOpt({ opt, active, onClick }: { opt:typeof TIMER_OPTS[0]; active:boolean; onClick:()=>void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'15px 16px', background:active||hov?WHITE:CREAM, border:`1.5px solid ${active?INK:hov?INK_20:INK_10}`, borderRadius:12, cursor:'pointer', textAlign:'left', width:'100%', fontFamily:"'Plus Jakarta Sans',sans-serif", transform:hov&&!active?'translateX(2px)':'none', transition:'all .2s cubic-bezier(.4,0,.2,1)' }}>
      <div style={{ width:34, height:34, borderRadius:9, background:opt.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, marginTop:1 }}>{opt.icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2, flexWrap:'wrap' as const }}>
          <span style={{ fontSize:13, fontWeight:700, color:INK }}>{opt.name}</span>
          {opt.tag && <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:8, background:GOLD_BG, color:GOLD, border:`1px solid ${GOLD_BORDER}` }}>{opt.tag}</span>}
        </div>
        <p style={{ fontSize:11.5, color:INK_60, lineHeight:1.5, margin:0 }}>{opt.desc}</p>
      </div>
      <div style={{ width:17, height:17, borderRadius:'50%', border:`1.5px solid ${active?INK:INK_20}`, flexShrink:0, marginTop:4, background:active?INK:'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s' }}>
        {active && <div style={{ width:7, height:7, background:'#fff', borderRadius:'50%' }} />}
      </div>
    </button>
  )
}

function StepTimer({ onNext, onBack }: { onNext:()=>void; onBack:()=>void }) {
  const [mode, setMode] = useState<TimerMode>('hybrid')
  const [duration, setDuration] = useState('10')
  const [reminderFreq, setReminderFreq] = useState('5')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNext = async () => {
    setLoading(true)
    setError('')
    try {
      await saveTimerConfig({
        timer: mode,
        timerConfig: {
          sendAfter: parseInt(duration) || 0,
          remindAfter: mode !== 'auto-send' ? parseInt(reminderFreq) || 0 : 0
        }
      })
      onNext()
    } catch(err: any) {
      setError(err.message || 'Failed to save timer config')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Eyebrow n={6} />
      <StepTitle>Your response window.</StepTitle>
      <StepSub>How long does Haelo wait before acting on your behalf? You can change this any time from Settings.</StepSub>

      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:18 }}>
        {TIMER_OPTS.map(o => <TimerOpt key={o.id} opt={o} active={mode===o.id} onClick={() => setMode(o.id)} />)}
      </div>

      <div className={`timer-selects ${mode!=='auto-send'?'timer-selects-2':'timer-selects-1'}`}>
        <div>
          <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' as const, color:INK_40, marginBottom:5 }}>Auto-send after</label>
          <SelectInput value={duration} onChange={setDuration}>
            {['5','10','15','20','30','60'].map(v => <option key={v} value={v}>{v} minutes</option>)}
          </SelectInput>
        </div>
        {mode!=='auto-send' && (
          <div>
            <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' as const, color:INK_40, marginBottom:5 }}>Reminder every</label>
            <SelectInput value={reminderFreq} onChange={setReminderFreq}>
              {['3','5','10','15'].map(v => <option key={v} value={v}>{v} minutes</option>)}
            </SelectInput>
          </div>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: 10, marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#C0392B' }}>{error}</p>
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' as const }}>
        <BtnGhost onClick={onBack} disabled={loading}><ArrowLeft /> Back</BtnGhost>
        <BtnGreen onClick={handleNext} disabled={loading}>
          {loading ? 'Activating...' : 'Activate Haelo'} {!loading && <ArrowRight color="#fff" />}
        </BtnGreen>
      </div>
    </div>
  )
}

// ── STEP 6: READY ─────────────────────────────────────────────────────────────

function StepReady() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c<=1) { clearInterval(iv); window.location.href='/dashboard/overview'; return 0 }
        return c-1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const checks = ['Email connected','Domain configured','WhatsApp verified','Business Bible uploaded','Response tone set','Timer configured','Monitoring active']

  return (
    <div style={{ textAlign:'center', padding:'28px 0' }}>
      <div style={{ position:'relative', width:110, height:110, margin:'0 auto 24px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', inset:-14, borderRadius:'50%', border:'1px solid rgba(46,125,82,0.15)', animation:'ringPulse 2.6s ease-in-out infinite' }} />
        <div style={{ position:'absolute', inset:-7, borderRadius:'50%', border:'1px solid rgba(46,125,82,0.2)', animation:'ringPulse 2.6s ease-in-out infinite', animationDelay:'.4s' }} />
        <div style={{ width:110, height:110, background:INK, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
            <path d="M5 35 C5 35 5 15 20 8 C35 15 35 35 35 35" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <line x1="13" y1="18" x2="13" y2="33" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
            <line x1="27" y1="18" x2="27" y2="33" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
            <line x1="13" y1="25.5" x2="27" y2="25.5" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <p style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:GREEN, marginBottom:10 }}>Haelo is live</p>
      <h2 style={{ fontSize:28, fontWeight:800, color:INK, lineHeight:1.1, letterSpacing:'-.03em', marginBottom:10 }}>
        You are everywhere.<br />You miss nothing.
      </h2>
      <p style={{ fontSize:13, color:INK_60, maxWidth:380, margin:'0 auto 28px', lineHeight:1.65 }}>
        Haelo is now monitoring your inbox. The next internal email your team sends will arrive on your WhatsApp within 60 seconds.
      </p>

      <div style={{ background:CREAM, border:`1px solid ${INK_10}`, borderRadius:14, overflow:'hidden', maxWidth:300, margin:'0 auto 24px' }}>
        {checks.map((item,i) => (
          <div key={item} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 18px', borderBottom:i<checks.length-1?`1px solid ${INK_10}`:'none', fontSize:12.5, fontWeight:500, color:INK }}>
            <div style={{ width:18, height:18, background:GREEN, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:700, flexShrink:0 }}>✓</div>
            {item}
          </div>
        ))}
      </div>

      <a href="/dashboard/overview" style={{ display:'inline-flex', alignItems:'center', gap:8, background:INK, color:'#fff', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:600, padding:'12px 22px', borderRadius:10, textDecoration:'none', marginBottom:10 }}>
        Open your dashboard <ArrowRight color="#fff" />
      </a>
      <p style={{ fontSize:11, color:INK_20, marginTop:8 }}>Redirecting in {countdown}s</p>
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const next = () => setStep(s => Math.min(s+1, 6))
  const back = () => setStep(s => Math.max(s-1, 0))

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <header style={{ background:NAVY, height:60, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', position:'sticky', top:0, zIndex:200 }}>
        <HaeloLogo />
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:5, height:5, background:GREEN, borderRadius:'50%', animation:'breathe 2s ease-in-out infinite' }} />
          <span style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.3)', letterSpacing:'.05em', textTransform:'uppercase' }}>Setup in progress</span>
        </div>
        <a href="/dashboard/overview" style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.25)', textDecoration:'none' }}>Skip →</a>
      </header>

      <div className="onboard-wrap">
        <div className="progress-wrap">
          <ProgressRail current={step} />
        </div>

        {step < 6 ? (
          <div key={step} className="fade-up content-grid">
            <Sidebar step={step} />
            <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${INK_10}`, padding:32, boxShadow:'0 1px 24px rgba(17,39,11,0.06)' }}>
              {step===0 && <StepEmail onNext={next} />}
              {step===1 && <StepDomain onNext={next} onBack={back} />}
              {step===2 && <StepWhatsApp onNext={next} onBack={back} />}
              {step===3 && <StepBible onNext={next} onBack={back} />}
              {step===4 && <StepTone onNext={next} onBack={back} />}
              {step===5 && <StepTimer onNext={next} onBack={back} />}
            </div>
          </div>
        ) : (
          <div key={6} className="fade-up" style={{ background:WHITE, borderRadius:16, border:`1px solid ${INK_10}`, padding:40, boxShadow:'0 1px 24px rgba(17,39,11,0.06)', maxWidth:600, margin:'0 auto' }}>
            <StepReady />
          </div>
        )}
      </div>
    </>
  )
}