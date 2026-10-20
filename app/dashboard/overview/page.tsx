"use client";

import { dashboardTheme } from "@/components/dashboard/theme";
const {
  BRAND,
  INK,
  NAVY,
  CREAM,
  WHITE,
  GOLD,
  GOLD_BG,
  GREEN,
  GREEN_BG,
  INK_10,
  INK_20,
  INK_40,
  INK_60,
  INK_06,
  AMBER,
  AMBER_BG,
} = dashboardTheme;

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Mail,
  Users,
  TrendingUp,
  ArrowRight,
  Zap,
  Loader2,
  Settings2,
} from "lucide-react";
import { getActivityLogs } from "@/lib/api/activity";
import { getOverviewMetric, OverviewMetricType } from "@/lib/api/overview";
import { getUnrecognizedSendersCount } from "@/lib/api/staff";

const GLOBAL_CSS = `


@keyframes breathe{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(0.85)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s cubic-bezier(.4,0,.2,1) both}
.stagger-1{animation-delay:.04s}
.stagger-2{animation-delay:.08s}
.stagger-3{animation-delay:.12s}
.stagger-4{animation-delay:.16s}

/* ── Responsive grid helpers ── */

/* Stat cards: 4 cols desktop → 2 cols tablet → 2 cols mobile */
.stat-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:12px;
  margin-bottom:24px;
}

/* Main content: sidebar layout desktop → single col mobile */
.main-grid{
  display:grid;
  grid-template-columns:1fr 380px;
  gap:12px;
  align-items:start;
}

/* Right column: stacks naturally */
.right-col{
  display:flex;
  flex-direction:column;
  gap:12px;
}

/* Header row */
.header-row{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:24px;
  margin-bottom:32px;
}

/* Alert badge */
.alert-badge{
  flex-shrink:0;
  max-width:310px;
}

/* WhatsApp button */
.whatsapp-btn{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  background:rgba(74,186,122,0.15);
  color:#4ABA7A;
  font-family:var(--dashboard-font),sans-serif;
  font-size:12px;
  font-weight:700;
  padding:10px;
  border-radius:10px;
  border:1px solid rgba(74,186,122,0.2);
  text-decoration:none;
  transition:all .18s;
  letter-spacing:.01em;
}

/* Ellipsis on activity summary */
.activity-summary{
  font-size:12px;
  line-height:1.5;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

/* ── TABLET: ≤ 900px ── */
@media(max-width:900px){
  .main-grid{
    grid-template-columns:1fr;
  }
  .right-col{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:12px;
  }
  .stat-grid{
    grid-template-columns:repeat(2,1fr);
  }
}

/* ── MOBILE: ≤ 600px ── */
@media(max-width:600px){
  .header-row{
    flex-direction:column;
    gap:16px;
    margin-bottom:24px;
  }
  .alert-badge{
    max-width:100%;
    width:100%;
  }
  .stat-grid{
    grid-template-columns:repeat(2,1fr);
    gap:10px;
    margin-bottom:16px;
  }
  .main-grid{
    grid-template-columns:1fr;
    gap:12px;
  }
  .right-col{
    display:flex;
    flex-direction:column;
    gap:12px;
  }
  .activity-summary{
    white-space:normal;
    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .page-main{
    padding:24px 16px 48px !important;
  }
  .whatsapp-btn{
    font-size:13px;
    padding:12px;
  }
}

/* ── SMALL MOBILE: ≤ 380px ── */
@media(max-width:380px){
  .stat-grid{
    grid-template-columns:1fr 1fr;
    gap:8px;
  }
}
`;

// recentActivity array is now handled in the component state

interface StatData {
  label: string;
  metricKey: OverviewMetricType;
  icon: any;
}

const stats: StatData[] = [
  { label: "Emails handled today", metricKey: "emails-handled", icon: Mail },
  { label: "Avg response time", metricKey: "avg-response-time", icon: Clock },
  { label: "Approval rate", metricKey: "approval-rate", icon: CheckCircle },
  { label: "Staff recognised", metricKey: "staff-recognised", icon: Users },
];

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  sent: { label: "Sent", color: GREEN, bg: GREEN_BG },
  "auto-sent": { label: "Auto-sent", color: INK_40, bg: INK_06 },
  pending: { label: "Pending", color: GOLD, bg: GOLD_BG },
  edited: { label: "Edited & sent", color: INK_40, bg: INK_06 },
};

const quickActions = [
  { label: "Update Business Bible", href: "/dashboard/business-bible" },
  { label: "Add staff member", href: "/dashboard/staff" },
  { label: "Change timer settings", href: "/dashboard/settings" },
  { label: "View billing", href: "/dashboard/billing" },
];

// ── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ s, delay }: { s: StatData; delay: number }) {
  const [hov, setHov] = useState(false);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("-");
  const [sub, setSub] = useState("");
  const [up, setUp] = useState(false);

  useEffect(() => {
    const fetchMetric = async () => {
      try {
        const res = await getOverviewMetric(s.metricKey);
        if (res?.data) {
          setValue(res.data.value);
          setSub(res.data.subtitle);
          setUp(res.data.trend === "up");
        }
      } catch (err) {
        console.error("Failed to fetch metric", s.metricKey, err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetric();
  }, [s.metricKey]);

  return (
    <div
      className={`fade-up stagger-${delay}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: WHITE,
        border: `1.5px solid ${hov ? INK_20 : INK_10}`,
        borderRadius: 14,
        padding: "18px 16px 16px",
        transition: "all .22s cubic-bezier(.4,0,.2,1)",
        boxShadow: hov ? "0 8px 28px rgba(44,32,35,0.09)" : "none",
        cursor: "default",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: hov ? BRAND : INK_06,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .22s",
            flexShrink: 0,
          }}
        >
          <s.icon size={15} color={hov ? "#fff" : INK_40} />
        </div>
        {!loading && up && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              fontWeight: 700,
              color: GREEN,
              background: GREEN_BG,
              padding: "3px 7px",
              borderRadius: 20,
              flexShrink: 0,
            }}
          >
            <TrendingUp size={10} /> Up
          </div>
        )}
      </div>
      {loading ? (
        <div style={{ height: 42, display: "flex", alignItems: "center" }}>
          <Loader2 size={20} color={INK_20} className="spinner" />
          <style
            dangerouslySetInnerHTML={{
              __html: `@keyframes spin { 100% { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }`,
            }}
          />
        </div>
      ) : (
        <>
          <p
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {value}
          </p>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: INK_60,
              marginBottom: 2,
              textTransform: "uppercase" as const,
              letterSpacing: ".05em",
              lineHeight: 1.3,
            }}
          >
            {s.label}
          </p>
          <p style={{ fontSize: 11, color: INK_40, lineHeight: 1.4 }}>{sub}</p>
        </>
      )}
    </div>
  );
}

// ── ACTIVITY ROW ─────────────────────────────────────────────────────────────
interface ActivityItem {
  id: number | string;
  from: string;
  role: string;
  summary: string;
  status: string;
  time: string;
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const [hov, setHov] = useState(false);
  const meta = STATUS_META[item.status] || STATUS_META.pending;
  const initials = (item.from || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 10px",
        borderRadius: 12,
        background: hov ? CREAM : "transparent",
        transition: "all .18s cubic-bezier(.4,0,.2,1)",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: hov ? BRAND : INK_06,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: hov ? "#fff" : INK_40,
          flexShrink: 0,
          transition: "all .2s",
          letterSpacing: ".02em",
        }}
      >
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
            flexWrap: "wrap" as const,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>
            {item.from}
          </span>
          <span style={{ fontSize: 11, color: INK_40, fontWeight: 500 }}>
            · {item.role}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
              background: meta.bg,
              color: meta.color,
              flexShrink: 0,
            }}
          >
            {meta.label}
          </span>
        </div>
        <p className="activity-summary" style={{ color: INK_60 }}>
          {item.summary}
        </p>
        <p
          style={{ fontSize: 10, color: INK_40, marginTop: 4, fontWeight: 500 }}
        >
          {item.time}
        </p>
      </div>
    </div>
  );
}

// ── QUICK ACTION ROW ──────────────────────────────────────────────────────────
function QuickActionRow({ label, href }: { label: string; href: string }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        borderRadius: 10,
        background: hov ? CREAM : "transparent",
        textDecoration: "none",
        transition: "all .16s",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: hov ? INK : INK_60,
          transition: "color .16s",
        }}
      >
        {label}
      </span>
      <ArrowRight size={13} color={hov ? INK : INK_20} />
    </a>
  );
}

// ── CARD SHELL ────────────────────────────────────────────────────────────────
function Card({
  children,
  hov,
  onEnter,
  onLeave,
  style: extra,
}: {
  children: React.ReactNode;
  hov?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background: WHITE,
        border: `1.5px solid ${hov ? INK_20 : INK_10}`,
        borderRadius: 16,
        padding: "24px",
        transition: "all .22s cubic-bezier(.4,0,.2,1)",
        boxShadow: hov ? "0 8px 32px rgba(44,32,35,0.09)" : "none",
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

// ── ALERT BADGE ───────────────────────────────────────────────────────────────
function AlertBadge() {
  const [hov, setHov] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await getUnrecognizedSendersCount();
        if (res?.data?.count !== undefined) {
          setCount(res.data.count);
        }
      } catch (err) {
        console.error("Failed to fetch unrecognized senders count", err);
      }
    };
    fetchCount();
  }, []);

  if (count === 0) return null;

  return (
    <div
      className="alert-badge"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: hov ? "#FFFBF5" : "transparent",
        border: `1.5px solid ${hov ? "rgba(180,83,9,0.28)" : "rgba(180,83,9,0.18)"}`,
        borderRadius: 14,
        padding: "13px 16px",
        transition: "all .22s cubic-bezier(.4,0,.2,1)",
        boxShadow: hov ? "0 6px 20px rgba(180,83,9,0.08)" : "none",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: AMBER_BG,
          border: "1px solid rgba(180,83,9,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Zap size={14} color={AMBER} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 2 }}
        >
          {count === null ? "..." : count} unrecognised sender
          {count === 1 ? "" : "s"}
        </p>
        <p
          style={{
            fontSize: 11,
            color: INK_60,
            lineHeight: 1.5,
            marginBottom: 9,
          }}
        >
          Emails from addresses not in your Staff Directory.
        </p>
        <a
          href="/dashboard/staff"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            color: AMBER,
            textDecoration: "none",
            background: AMBER_BG,
            padding: "5px 10px",
            borderRadius: 7,
            border: "1px solid rgba(180,83,9,0.15)",
            transition: "all .16s",
          }}
        >
          Review now <ArrowRight size={11} />
        </a>
      </div>
    </div>
  );
}

function HaeloStatusMetric({
  label,
  metricKey,
}: {
  label: string;
  metricKey: OverviewMetricType;
}) {
  const [loading, setLoading] = useState(true);
  const [val, setVal] = useState("-");

  useEffect(() => {
    const fetchMetric = async () => {
      try {
        const res = await getOverviewMetric(metricKey);
        if (res?.data) {
          setVal(res.data.value);
        }
      } catch (err) {
        console.error("Failed to fetch metric", metricKey, err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetric();
  }, [metricKey]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 10,
        padding: "10px 12px",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <div
          style={{
            height: 18,
            display: "flex",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Loader2
            size={14}
            color="rgba(255,255,255,0.4)"
            className="spinner"
          />
        </div>
      ) : (
        <p
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-.02em",
            lineHeight: 1,
          }}
        >
          {val}
        </p>
      )}
      <p
        style={{
          fontSize: 10,
          color: "#DAB8C3",
          marginTop: 3,
          fontWeight: 500,
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ── HAELO STATUS CARD ─────────────────────────────────────────────────────────
function HaeloStatusCard() {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="fade-up stagger-2 workspace-status-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: NAVY,
        borderRadius: 16,
        padding: "22px 24px",
        transition: "all .22s cubic-bezier(.4,0,.2,1)",
        boxShadow: hov
          ? "0 10px 36px rgba(67,14,22,0.28)"
          : "0 2px 8px rgba(67,14,22,0.12)",
        transform: hov ? "translateY(-1px)" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            background: "#F2B0AF",
            borderRadius: "50%",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase" as const,
            color: "#F2B0AF",
          }}
        >
          YOUR WORKSPACE
        </span>
      </div>
      <p
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 6,
          letterSpacing: "-.01em",
        }}
      >
        A little more headspace.
      </p>
      <p
        style={{
          fontSize: 12,
          color: "#DAB8C3",
          lineHeight: 1.6,
          marginBottom: 18,
        }}
      >
        Keep your email connections, WhatsApp details, and response timing in
        tune with your day.
      </p>
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.08)",
          marginBottom: 14,
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <HaeloStatusMetric label="Emails today" metricKey="emails-handled" />
        <HaeloStatusMetric label="Avg response" metricKey="avg-response-time" />
      </div>
      <a
        href="/dashboard/settings"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
      >
        <Settings2 size={15} />
        Manage connections
      </a>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const [activityHov, setActivityHov] = useState(false);
  const [actionsHov, setActionsHov] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [emailsHandled, setEmailsHandled] = useState<string>("...");

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await getActivityLogs(1, 5);
        if (res?.data?.logs) {
          setRecentActivity(
            res.data.logs.map((item: any) => {
              const dateObj = new Date(item.sentAt || item.createdAt);

              // Format time string
              const now = new Date();
              const diffMs = now.getTime() - dateObj.getTime();
              const diffMins = Math.round(diffMs / 60000);
              const diffHours = Math.round(diffMins / 60);

              let timeStr = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              if (diffMins < 60 && diffMins > 0) timeStr = `${diffMins}m ago`;
              else if (diffHours < 24 && diffHours > 0)
                timeStr = `${diffHours}h ago`;
              else if (diffMins === 0) timeStr = "Just now";

              return {
                id: item.id || item.uid,
                from: item.staff?.name || item.senderEmail || "Unknown",
                role: item.staff?.role || "Unknown",
                summary: (item.originalMessage || "").substring(0, 100) + "...",
                status: (item.sentType || "pending").toLowerCase(),
                time: timeStr,
              };
            }),
          );
        }
      } catch (err) {
        console.error("Failed to fetch recent activity:", err);
      } finally {
        setActivityLoading(false);
      }
    };
    const fetchEmailsHandled = async () => {
      try {
        const res = await getOverviewMetric("emails-handled");
        if (res?.data) setEmailsHandled(res.data.value);
      } catch (err) {
        console.error("Failed to fetch emails handled:", err);
        setEmailsHandled("-");
      }
    };
    fetchActivity();
    fetchEmailsHandled();

    import("@/lib/api/auth").then(({ getProfile }) => {
      getProfile()
        .then((res) => {
          if (res?.data?.name) {
            // Capitalize first letter for the greeting
            const capitalized =
              res.data.name.charAt(0).toUpperCase() + res.data.name.slice(1);
            setUserName(capitalized);
          }
        })
        .catch((err) => console.error(err));
    });
  }, []);

  const [userName, setUserName] = useState<string>("...");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <main
        className="page-main overview-page"
        style={{
          flex: 1,
          padding: "40px 40px 60px",
          overflowY: "auto",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ── HEADER ROW ── */}
        <div className="header-row fade-up">
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: 6,
              }}
            >
              Dashboard
            </p>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: INK,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: 4,
              }}
            >
              Welcome back, {userName}.
            </h1>
            <p style={{ fontSize: 13, color: INK_60, fontWeight: 500 }}>
              Haelo has handled{" "}
              <strong style={{ color: INK, fontWeight: 700 }}>
                {emailsHandled} emails
              </strong>{" "}
              today. Your team is covered.
            </p>
          </div>
          <AlertBadge />
        </div>

        {/* ── STAT CARDS ── */}
        <div className="stat-grid">
          {stats.map((s, i) => (
            <StatCard key={s.label} s={s} delay={(i + 1) as 1 | 2 | 3 | 4} />
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="main-grid">
          {/* LEFT: Activity feed */}
          <Card
            hov={activityHov}
            onEnter={() => setActivityHov(true)}
            onLeave={() => setActivityHov(false)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: INK,
                  letterSpacing: "-.01em",
                }}
              >
                Recent activity
              </h2>
              <a
                href="/dashboard/activity"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  color: BRAND,
                  textDecoration: "none",
                  padding: "5px 10px",
                  borderRadius: 8,
                  background: GOLD_BG,
                  transition: "all .16s",
                }}
              >
                View all <ArrowRight size={11} />
              </a>
            </div>
            <div style={{ height: 1, background: INK_10, marginBottom: 6 }} />
            <div>
              {recentActivity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
              {activityLoading && (
                <div className="overview-empty" role="status">
                  Loading communication history…
                </div>
              )}
              {!activityLoading && recentActivity.length === 0 && (
                <div className="overview-empty">
                  <Mail size={26} strokeWidth={1.4} />
                  <p>Your communication history will appear here.</p>
                  <a href="/dashboard/settings">Manage your connections →</a>
                </div>
              )}
            </div>
          </Card>

          {/* RIGHT: stacked cards */}
          <div className="right-col">
            <HaeloStatusCard />

            {/* Quick actions */}
            <Card
              hov={actionsHov}
              onEnter={() => setActionsHov(true)}
              onLeave={() => setActionsHov(false)}
              style={{ padding: "20px 22px" }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: INK_40,
                  marginBottom: 12,
                }}
              >
                Quick actions
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {quickActions.map((a) => (
                  <QuickActionRow key={a.label} {...a} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
