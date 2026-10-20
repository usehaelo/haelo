'use client'

import Logo from '@/components/ui/Logo'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users, CreditCard, Activity, TrendingUp, AlertCircle,
  CheckCircle, Clock, BarChart2, ArrowRight, Mail,
  Shield, LogOut, LayoutDashboard, Search, Download,
  RefreshCw, Zap, Bell, ChevronRight, X
} from 'lucide-react'

// ── TOKENS ───────────────────────────────────────────────────────────────────
const INK        = '#11270B'
const NAVY       = '#0A1628'
const NAVY_LIGHT = '#0F1F3D'
const CREAM      = '#F7F4EE'
const WHITE      = '#FFFFFF'
const GOLD       = '#B8962E'
const GOLD_LIGHT = '#D4AE52'
const GOLD_BG    = 'rgba(184,150,46,0.1)'
const GREEN      = '#2E7D52'
const GREEN_BG   = 'rgba(46,125,82,0.1)'
const INK_10     = 'rgba(17,39,11,0.1)'
const INK_20     = 'rgba(17,39,11,0.2)'
const INK_40     = 'rgba(17,39,11,0.4)'
const INK_60     = 'rgba(17,39,11,0.6)'
const INK_06     = 'rgba(17,39,11,0.06)'
const RED        = '#C0392B'
const RED_BG     = 'rgba(192,57,43,0.08)'
const AMBER      = '#B45309'
const AMBER_BG   = 'rgba(180,83,9,0.08)'

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body,html{font-family:'Plus Jakarta Sans',sans-serif;background:${CREAM};-webkit-font-smoothing:antialiased;height:100%}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes breathe{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-up{animation:fadeUp .32s cubic-bezier(.4,0,.2,1) both}
`

// ── DATA ─────────────────────────────────────────────────────────────────────
const CLIENTS = [
  { id: 1, name: 'Adaeze Okonkwo',  company: 'Acme Corporation',  plan: 'Team', seats: 5, seatsUsed: 5, status: 'active', joined: 'Apr 2026', emails: 1203, mrr: 500000, provider: 'Gmail'   },
  { id: 2, name: 'Kunle Adeyemi',   company: 'BuildRight Nigeria', plan: 'Solo', seats: 1, seatsUsed: 1, status: 'active', joined: 'May 2026', emails: 487,  mrr: 150000, provider: 'Outlook' },
  { id: 3, name: 'Temi Babatunde',  company: 'FinServe Ltd',       plan: 'Team', seats: 5, seatsUsed: 3, status: 'active', joined: 'May 2026', emails: 922,  mrr: 500000, provider: 'Gmail'   },
  { id: 4, name: 'Ngozi Eze',       company: 'Radiant Health',     plan: 'Solo', seats: 1, seatsUsed: 1, status: 'trial',  joined: 'Jun 2026', emails: 134,  mrr: 0,      provider: 'Gmail'   },
  { id: 5, name: 'Femi Okafor',     company: 'Okafor & Sons',      plan: 'Solo', seats: 1, seatsUsed: 1, status: 'error',  joined: 'Jun 2026', emails: 61,   mrr: 0,      provider: 'Gmail'   },
]

const ALERTS = [
  { type: 'error',   message: 'Gmail OAuth expired for Femi Okafor — re-auth needed',        time: '2h ago',  id: 1 },
  { type: 'warning', message: 'Ngozi Eze trial ends in 5 days — no payment method added',    time: '4h ago',  id: 2 },
  { type: 'info',    message: 'WhatsApp API message limit at 68% for this month',            time: '1d ago',  id: 3 },
]

const MILESTONES = [
  { label: 'Month 1 — 3 clients',  target: 450000,   current: 1650000 },
  { label: 'Month 3 — 10 clients', target: 3000000,  current: 1650000 },
  { label: 'Month 6 — 25 clients', target: 7500000,  current: 1650000 },
]

const METRICS = [
  { label: 'Avg email-to-WhatsApp time', value: '42s',     target: '<60s',  ok: true  },
  { label: 'AI approval rate (no edits)',  value: '91%',    target: '>90%',  ok: true  },
  { label: 'Auto-send rate',              value: '24%',     target: '<30%',  ok: true  },
  { label: 'Edit rate (after 60 days)',   value: '12%',     target: '<15%',  ok: true  },
  { label: 'Avg executive action time',   value: '2.8 min', target: '<3 min',ok: true  },
  { label: 'Onboarding completion',       value: '83%',     target: '>80%',  ok: true  },
]

const NPS_BARS = [
  { label: 'Promoters (9–10)',  pct: 73, color: GREEN  },
  { label: 'Passives (7–8)',    pct: 16, color: INK_20 },
  { label: 'Detractors (0–6)', pct: 11, color: RED    },
]

const fmt = (n: number) => `₦${(n / 1000).toFixed(0)}k`

// ── HELPERS ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}

// ── LOGO ─────────────────────────────────────────────────────────────────────
function HaeloLogo() {
  return <Logo variant="white-on-navy" size="sm" />
}

// ── NAV ITEM ─────────────────────────────────────────────────────────────────
type Section = 'overview' | 'clients' | 'metrics'
function NavItem({ id, label, icon: Icon, active, onClick }: {
  id: Section; label: string; icon: typeof LayoutDashboard; active: boolean; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 9, border: 'none',
        background: active ? 'rgba(255,255,255,0.1)' : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: 'relative', transition: 'all .18s',
      }}>
      {active && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: GOLD_LIGHT, borderRadius: 2 }} />}
      <Icon size={15} color={active ? '#fff' : 'rgba(255,255,255,0.4)'} />
      <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'color .18s' }}>{label}</span>
    </button>
  )
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, sub, up }: {
  icon: typeof CreditCard; value: string; label: string; sub: string; up?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? WHITE : 'transparent',
        border: `1.5px solid ${hov ? INK_20 : INK_10}`,
        borderRadius: 14, padding: '20px',
        transition: 'all .22s cubic-bezier(.4,0,.2,1)',
        boxShadow: hov ? '0 8px 28px rgba(17,39,11,0.09)' : 'none',
        cursor: 'default',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: hov ? INK : INK_06, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .22s', flexShrink: 0 }}>
          <Icon size={16} color={hov ? '#fff' : INK_40} />
        </div>
        {up !== undefined && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 20, background: up ? GREEN_BG : RED_BG, color: up ? GREEN : RED }}>
            {up ? '↑ Up' : '↓ Down'}
          </span>
        )}
      </div>
      <p style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 11, fontWeight: 600, color: INK_60, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 11, color: INK_40 }}>{sub}</p>
    </div>
  )
}

// ── ALERT ROW ─────────────────────────────────────────────────────────────────
function AlertRow({ a, onResolve }: { a: typeof ALERTS[0]; onResolve: () => void }) {
  const [hov, setHov] = useState(false)
  const color  = a.type === 'error' ? RED   : a.type === 'warning' ? AMBER   : GREEN
  const bgCol  = a.type === 'error' ? RED_BG : a.type === 'warning' ? AMBER_BG : GREEN_BG
  const border = a.type === 'error' ? 'rgba(192,57,43,0.18)' : a.type === 'warning' ? 'rgba(180,83,9,0.18)' : 'rgba(46,125,82,0.2)'
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: hov ? WHITE : 'transparent', border: `1.5px solid ${hov ? border : INK_06}`, borderRadius: 11, transition: 'all .18s', boxShadow: hov ? `0 4px 14px ${bgCol}` : 'none' }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: bgCol, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <AlertCircle size={14} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: INK, marginBottom: 2 }}>{a.message}</p>
        <p style={{ fontSize: 11, color: INK_40 }}>{a.time}</p>
      </div>
      <button onClick={onResolve}
        style={{ fontSize: 11, fontWeight: 700, color: GREEN, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0 }}>
        Resolve
      </button>
    </div>
  )
}

// ── CLIENT ROW ────────────────────────────────────────────────────────────────
function ClientRow({ c }: { c: typeof CLIENTS[0] }) {
  const [hov, setHov] = useState(false)
  const statusColor = c.status === 'active' ? GREEN : c.status === 'trial' ? GOLD : RED
  const statusBg    = c.status === 'active' ? GREEN_BG : c.status === 'trial' ? GOLD_BG : RED_BG
  const statusLabel = c.status === 'active' ? 'Active' : c.status === 'trial' ? 'Trial' : 'Error'
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? CREAM : WHITE, transition: 'background .15s', borderBottom: `1px solid ${INK_06}` }}>
      <td style={{ padding: '13px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: hov ? INK : INK_06, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: hov ? '#fff' : INK_40, flexShrink: 0, transition: 'all .2s' }}>
            {initials(c.name)}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 1 }}>{c.name}</p>
            <p style={{ fontSize: 11, color: INK_40 }}>{c.company}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: '13px 20px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: c.plan === 'Team' ? INK_06 : GOLD_BG, color: c.plan === 'Team' ? INK_60 : GOLD }}>
          {c.plan}
        </span>
      </td>
      <td style={{ padding: '13px 20px', fontSize: 12, color: INK_60, fontWeight: 500 }}>
        {c.seatsUsed}/{c.seats}
      </td>
      <td style={{ padding: '13px 20px', fontSize: 12, color: INK_60 }}>{c.emails.toLocaleString()}</td>
      <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: INK }}>
        {c.mrr > 0 ? fmt(c.mrr) : <span style={{ color: INK_20 }}>—</span>}
      </td>
      <td style={{ padding: '13px 20px' }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: statusBg, color: statusColor }}>
          {statusLabel}
        </span>
      </td>
      <td style={{ padding: '13px 20px', fontSize: 11, color: INK_40 }}>{c.provider}</td>
      <td style={{ padding: '13px 20px', fontSize: 11, color: INK_40 }}>{c.joined}</td>
      <td style={{ padding: '13px 20px' }}>
        <ViewBtn />
      </td>
    </tr>
  )
}

function ViewBtn() {
  const [hov, setHov] = useState(false)
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: hov ? INK : GREEN, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'color .15s' }}>
      View <ChevronRight size={11} />
    </button>
  )
}

// ── METRIC CARD ───────────────────────────────────────────────────────────────
function MetricCard({ m }: { m: typeof METRICS[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? WHITE : 'transparent', border: `1.5px solid ${hov ? INK_20 : INK_10}`, borderRadius: 14, padding: '18px 20px', transition: 'all .22s', boxShadow: hov ? '0 6px 20px rgba(17,39,11,0.08)' : 'none', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' as const, color: INK_40, lineHeight: 1.4, flex: 1, marginRight: 8 }}>{m.label}</p>
        {m.ok
          ? <CheckCircle size={14} color={GREEN} style={{ flexShrink: 0 }} />
          : <AlertCircle size={14} color={RED} style={{ flexShrink: 0 }} />
        }
      </div>
      <p style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 5 }}>{m.value}</p>
      <p style={{ fontSize: 11, color: INK_40 }}>Target: <span style={{ color: m.ok ? GREEN : RED, fontWeight: 600 }}>{m.target}</span></p>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [section, setSection]   = useState<Section>('overview')
  const [alerts, setAlerts]     = useState(ALERTS)
  const [search, setSearch]     = useState('')
  const [searchFoc, setSearchFoc] = useState(false)

  const totalMRR    = CLIENTS.reduce((s, c) => s + c.mrr, 0)
  const active      = CLIENTS.filter(c => c.status === 'active').length
  const trial       = CLIENTS.filter(c => c.status === 'trial').length
  const totalEmails = CLIENTS.reduce((s, c) => s + c.emails, 0)

  const filtered = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  )

  const resolveAlert = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id))

  const NAV_ITEMS: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clients',  label: 'Clients',  icon: Users           },
    { id: 'metrics',  label: 'Metrics',  icon: BarChart2       },
  ]

  const titles: Record<Section, string> = {
    overview: 'Admin Overview',
    clients:  'Client Management',
    metrics:  'Platform Metrics',
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div style={{ minHeight: '100vh', display: 'flex', background: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 220, flexShrink: 0, background: NAVY, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
          {/* Logo + admin badge */}
          <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 10 }}>
              <HaeloLogo />
            </Link>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(192,57,43,0.18)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 20, padding: '3px 9px' }}>
              <Shield size={9} color={RED} />
              <span style={{ fontSize: 9, fontWeight: 700, color: RED, letterSpacing: '.07em', textTransform: 'uppercase' as const }}>Admin</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', padding: '4px 12px 6px', marginBottom: 2 }}>Navigation</p>
            {NAV_ITEMS.map(item => (
              <NavItem key={item.id} {...item} active={section === item.id} onClick={() => setSection(item.id)} />
            ))}
          </nav>

          {/* System status */}
          <div style={{ margin: '0 8px 8px', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, background: '#4ABA7A', borderRadius: '50%', animation: 'breathe 2.2s ease-in-out infinite' }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Platform healthy</p>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''} need attention
            </p>
          </div>

          {/* Bottom */}
          <div style={{ padding: '8px 8px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <ExitBtn />
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'auto' }}>

          {/* Sticky top bar */}
          <div style={{ background: WHITE, borderBottom: `1px solid ${INK_10}`, padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-.015em', marginBottom: 1 }}>{titles[section]}</h1>
              <p style={{ fontSize: 11, color: INK_40 }}>Haelo internal admin · Restricted access</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {alerts.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: RED_BG, border: `1px solid rgba(192,57,43,0.2)`, borderRadius: 20 }}>
                  <Bell size={12} color={RED} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: RED }}>{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              <RefreshCwBtn />
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '32px', flex: 1 }}>

            {/* ── OVERVIEW ── */}
            {section === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* KPI grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  <StatCard icon={CreditCard} value={`₦${(totalMRR/1000).toFixed(0)}k`} label="Monthly Revenue" sub="+₦500k this month" up={true} />
                  <StatCard icon={Users}      value={String(active)}                     label="Active clients"  sub={`${trial} on trial`} up={true} />
                  <StatCard icon={Mail}       value={totalEmails.toLocaleString()}        label="Emails processed" sub="Across all accounts" up={true} />
                  <StatCard icon={Activity}   value="99.8%"                               label="Platform uptime" sub="Last 30 days" up={true} />
                </div>

                {/* Two columns: alerts + milestones */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* System alerts */}
                  <OverviewCard title="System alerts">
                    {alerts.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px', background: GREEN_BG, border: '1px solid rgba(46,125,82,0.2)', borderRadius: 11 }}>
                        <CheckCircle size={14} color={GREEN} />
                        <p style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>All systems operating normally.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {alerts.map(a => <AlertRow key={a.id} a={a} onResolve={() => resolveAlert(a.id)} />)}
                      </div>
                    )}
                  </OverviewCard>

                  {/* Revenue milestones */}
                  <OverviewCard title="Revenue milestones">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {MILESTONES.map(m => {
                        const pct = Math.min(100, Math.round((m.current / m.target) * 100))
                        const done = pct >= 100
                        return (
                          <div key={m.label}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: INK }}>{m.label}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 11, color: INK_40 }}>₦{(m.current/1000).toFixed(0)}k / ₦{(m.target/1000).toFixed(0)}k</span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: done ? GREEN_BG : INK_06, color: done ? GREEN : INK_40 }}>{pct}%</span>
                              </div>
                            </div>
                            <div style={{ height: 5, background: INK_10, borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: done ? GREEN : INK, borderRadius: 4, width: `${pct}%`, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </OverviewCard>
                </div>

                {/* Recent clients strip */}
                <OverviewCard title="Recent clients" action={{ label: 'View all', onClick: () => setSection('clients') }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: CREAM, borderBottom: `1px solid ${INK_10}` }}>
                          {['Client', 'Plan', 'MRR', 'Status', 'Joined'].map(h => (
                            <th key={h} style={{ textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: INK_40, padding: '9px 16px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CLIENTS.slice(0, 4).map(c => {
                          const statusColor = c.status === 'active' ? GREEN : c.status === 'trial' ? GOLD : RED
                          const statusBg    = c.status === 'active' ? GREEN_BG : c.status === 'trial' ? GOLD_BG : RED_BG
                          return (
                            <tr key={c.id} style={{ borderBottom: `1px solid ${INK_06}` }}>
                              <td style={{ padding: '11px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                  <div style={{ width: 28, height: 28, background: INK_06, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: INK_40, flexShrink: 0 }}>{initials(c.name)}</div>
                                  <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: INK }}>{c.name}</p>
                                    <p style={{ fontSize: 10, color: INK_40 }}>{c.company}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '11px 16px' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: c.plan === 'Team' ? INK_06 : GOLD_BG, color: c.plan === 'Team' ? INK_60 : GOLD }}>{c.plan}</span>
                              </td>
                              <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 700, color: INK }}>{c.mrr > 0 ? fmt(c.mrr) : <span style={{ color: INK_20 }}>—</span>}</td>
                              <td style={{ padding: '11px 16px' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: statusBg, color: statusColor }}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
                              </td>
                              <td style={{ padding: '11px 16px', fontSize: 11, color: INK_40 }}>{c.joined}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </OverviewCard>
              </div>
            )}

            {/* ── CLIENTS ── */}
            {section === 'clients' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Search + export */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} color={INK_40} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="text" placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)}
                      onFocus={() => setSearchFoc(true)} onBlur={() => setSearchFoc(false)}
                      style={{ width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif", background: searchFoc ? WHITE : CREAM, border: `1.5px solid ${searchFoc ? INK : INK_10}`, borderRadius: 10, padding: '10px 14px 10px 40px', fontSize: 13, color: INK, outline: 'none', boxShadow: searchFoc ? '0 0 0 3px rgba(17,39,11,0.06)' : 'none', transition: 'all .18s' }} />
                  </div>
                  <ExportBtn />
                  <AddClientBtn />
                </div>

                {/* Stats strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Total clients',   value: String(CLIENTS.length) },
                    { label: 'Active',          value: String(active)         },
                    { label: 'Trial',           value: String(trial)          },
                    { label: 'Total MRR',       value: `₦${(totalMRR/1000).toFixed(0)}k` },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '14px 16px', background: 'transparent', border: `1.5px solid ${INK_10}`, borderRadius: 12 }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: '-0.02em', marginBottom: 3 }}>{s.value}</p>
                      <p style={{ fontSize: 10, fontWeight: 600, color: INK_40, textTransform: 'uppercase' as const, letterSpacing: '.06em' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div style={{ background: WHITE, border: `1.5px solid ${INK_10}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: CREAM, borderBottom: `1px solid ${INK_10}` }}>
                          {['Client', 'Plan', 'Seats', 'Emails', 'MRR', 'Status', 'Provider', 'Joined', ''].map((h, i) => (
                            <th key={i} style={{ textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: INK_40, padding: '10px 20px', whiteSpace: 'nowrap' as const }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: INK_40 }}>No clients found.</td></tr>
                        ) : (
                          filtered.map(c => <ClientRow key={c.id} c={c} />)
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: CREAM, borderTop: `1px solid ${INK_10}` }}>
                    <p style={{ fontSize: 11, color: INK_40 }}>Showing <strong style={{ color: INK }}>{filtered.length}</strong> of <strong style={{ color: INK }}>{CLIENTS.length}</strong> clients</p>
                    <p style={{ fontSize: 11, color: INK_40 }}>Total MRR: <strong style={{ color: INK }}>₦{(totalMRR/1000).toFixed(0)}k/mo</strong></p>
                  </div>
                </div>
              </div>
            )}

            {/* ── METRICS ── */}
            {section === 'metrics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {METRICS.map(m => <MetricCard key={m.label} m={m} />)}
                </div>

                {/* NPS + breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <OverviewCard title="NPS Score">
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 24 }}>
                      <div>
                        <p style={{ fontSize: 52, fontWeight: 800, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>62</p>
                        <p style={{ fontSize: 11, color: GREEN, fontWeight: 600, marginTop: 5 }}>Target: 50+ by Month 3 ✓</p>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {NPS_BARS.map(n => (
                          <div key={n.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                              <span style={{ fontSize: 11, color: INK_60 }}>{n.label}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>{n.pct}%</span>
                            </div>
                            <div style={{ height: 5, background: INK_10, borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: n.color, borderRadius: 4, width: `${n.pct}%`, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </OverviewCard>

                  <OverviewCard title="Platform health">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: 'API response time',       value: '142ms',  ok: true  },
                        { label: 'WhatsApp delivery rate',  value: '99.1%',  ok: true  },
                        { label: 'Supabase query latency',  value: '38ms',   ok: true  },
                        { label: 'Email webhook success',   value: '99.8%',  ok: true  },
                        { label: 'AI response accuracy',    value: '91.4%',  ok: true  },
                        { label: 'Active connections',      value: `${active} clients`, ok: true },
                      ].map(h => (
                        <div key={h.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: CREAM, border: `1px solid ${INK_06}`, borderRadius: 9 }}>
                          <span style={{ fontSize: 12, color: INK_60, fontWeight: 500 }}>{h.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{h.value}</span>
                            {h.ok
                              ? <CheckCircle size={12} color={GREEN} />
                              : <AlertCircle size={12} color={RED} />
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </OverviewCard>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

// ── CARD WRAPPER ──────────────────────────────────────────────────────────────
function OverviewCard({ title, children, action }: {
  title: string; children: React.ReactNode
  action?: { label: string; onClick: () => void }
}) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? WHITE : 'transparent', border: `1.5px solid ${hov ? INK_20 : INK_10}`, borderRadius: 16, padding: 24, transition: 'all .22s cubic-bezier(.4,0,.2,1)', boxShadow: hov ? '0 8px 28px rgba(17,39,11,0.09)' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${INK_06}` }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: INK, letterSpacing: '-.015em' }}>{title}</p>
        {action && <ActionBtn label={action.label} onClick={action.onClick} />}
      </div>
      {children}
    </div>
  )
}

// ── SMALL EXTRACTED BUTTONS ───────────────────────────────────────────────────
function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: hov ? INK : GREEN, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'color .15s' }}>
      {label} <ArrowRight size={11} />
    </button>
  )
}

function ExitBtn() {
  const [hov, setHov] = useState(false)
  return (
    <Link href="/dashboard/overview"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, textDecoration: 'none', background: hov ? 'rgba(255,255,255,0.07)' : 'transparent', transition: 'all .18s' }}>
      <LogOut size={15} color="rgba(255,255,255,0.4)" />
      <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>Exit admin</span>
    </Link>
  )
}

function RefreshCwBtn() {
  const [hov, setHov] = useState(false)
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${hov ? INK_20 : INK_10}`, background: hov ? CREAM : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .18s' }}>
      <RefreshCw size={14} color={INK_40} />
    </button>
  )
}

function ExportBtn() {
  const [hov, setHov] = useState(false)
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: hov ? CREAM : 'transparent', border: `1.5px solid ${hov ? INK_20 : INK_10}`, borderRadius: 10, padding: '9px 16px', fontSize: 12, fontWeight: 600, color: hov ? INK : INK_60, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all .18s', flexShrink: 0 }}>
      <Download size={13} /> Export CSV
    </button>
  )
}

function AddClientBtn() {
  const [hov, setHov] = useState(false)
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: hov ? '#1a3a12' : INK, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all .18s', transform: hov ? 'translateY(-1px)' : 'none', boxShadow: hov ? '0 4px 14px rgba(17,39,11,0.2)' : 'none', flexShrink: 0 }}>
      <Zap size={13} /> Add client
    </button>
  )
}