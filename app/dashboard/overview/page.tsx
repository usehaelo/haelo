"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Mail,
  Users,
  BookOpen,
  SlidersHorizontal,
  Clock,
  Check,
  Search,
} from "lucide-react";
import { getOverviewMetric, OverviewMetricType } from "@/lib/api/overview";
import { getActivityLogs } from "@/lib/api/activity";
import { getProfile } from "@/lib/api/auth";
import { getUnrecognizedSendersCount } from "@/lib/api/staff";

type Conversation = {
  id: string;
  name: string;
  role: string;
  original: string;
  suggested: string;
  sent: string;
  status: string;
};
const metricDefinitions: {
  key: OverviewMetricType;
  label: string;
  unit: string;
}[] = [
  {
    key: "emails-handled",
    label: "Emails handled",
    unit: "Communication taken care of",
  },
  {
    key: "avg-response-time",
    label: "Response time",
    unit: "Average turnaround",
  },
  { key: "approval-rate", label: "Approval rate", unit: "Responses approved" },
  {
    key: "staff-recognised",
    label: "People recognised",
    unit: "Context behind every message",
  },
];
export default function OverviewPage() {
  const [name, setName] = useState("");
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unknown, setUnknown] = useState(0);
  const [filter, setFilter] = useState("All activity");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getProfile().then((r) => {
        if (active) setName(r?.data?.name?.split(" ")[0] || "");
      }),
      ...metricDefinitions.map((m) =>
        getOverviewMetric(m.key).then((r) => {
          if (active && r?.data)
            setMetrics((v) => ({ ...v, [m.key]: String(r.data.value ?? "—") }));
        }),
      ),
      getUnrecognizedSendersCount().then((r) => {
        if (active) setUnknown(r?.data?.count || 0);
      }),
      getActivityLogs(1, 20)
        .then((r) => {
          if (active)
            setConversations(
              (r?.data?.logs || []).map((item: any) => ({
                id: String(item.id || item.uid),
                name: item.staff?.name || item.senderEmail || "Unknown sender",
                role: item.staff?.role || "External contact",
                original: item.originalMessage || "",
                suggested: item.aiSuggested || "",
                sent: item.responseSent || "",
                status: (item.sentType || "pending").toLowerCase(),
              })),
            );
        })
        .catch(() => {
          if (active) setError(true);
        }),
    ]).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  const pending = conversations.filter((c) => c.status === "pending").length;
  const filtered = conversations.filter(
    (c) =>
      (filter !== "Needs review" || c.status === "pending") &&
      (filter !== "Completed" || c.status !== "pending") &&
      `${c.name} ${c.original}`.toLowerCase().includes(query.toLowerCase()),
  );
  const current = filtered.find((c) => c.id === selected) || filtered[0];
  return (
    <main className="page-main executive-overview">
      <header className="executive-header">
        <div>
          <p className="workspace-eyebrow">Your daily perspective</p>
          <h1>More room for what matters.</h1>
          <p>
            {name ? `${name}, here` : "Here"} is what’s happening across your
            workspace.
          </p>
        </div>
        <Link className="workspace-button" href="/dashboard/settings">
          Workspace settings <SlidersHorizontal size={16} />
        </Link>
      </header>
      <section className="overview-brief" aria-label="Workspace briefing">
        <div className="brief-copy">
          <span className="brief-kicker">
            <span /> THE WORKSPACE BRIEF
          </span>
          <h2>
            A clear view.
            <br />A lighter day.
          </h2>
          <p>
            Your communication, people and business knowledge, brought into
            focus.
          </p>
          <Link href="/dashboard/business-bible">
            Build Haelo’s understanding <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="brief-attention">
          <p className="workspace-eyebrow">Next on your radar</p>
          <Link href="/dashboard/activity">
            <span className="attention-icon">
              <Mail size={20} />
            </span>
            <div>
              <strong>
                {loading ? "Checking activity…" : `${pending} awaiting review`}
              </strong>
              <p>In your latest conversations</p>
            </div>
            <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard/staff">
            <span className="attention-icon">
              <Users size={20} />
            </span>
            <div>
              <strong>
                {loading
                  ? "Checking directory…"
                  : `${unknown} unrecognised senders`}
              </strong>
              <p>Give every conversation context</p>
            </div>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section
        className="overview-metric-strip"
        aria-label="Workspace performance"
      >
        {metricDefinitions.map((m, i) => (
          <div key={m.key}>
            <span className="metric-index">0{i + 1}</span>
            <p>{m.label}</p>
            <strong>{metrics[m.key] || "—"}</strong>
            <span>{m.unit}</span>
          </div>
        ))}
      </section>
      <section className="communication-workspace">
        <header className="communication-heading">
          <div>
            <p className="workspace-eyebrow">Communication desk</p>
            <h2>The latest, at a glance.</h2>
          </div>
          <Link href="/dashboard/activity">
            All activity <ArrowUpRight size={16} />
          </Link>
        </header>
        <div className="communication-toolbar">
          <div className="workspace-tabs" aria-label="Filter conversations">
            {["All activity", "Needs review", "Completed"].map((t) => (
              <button
                key={t}
                aria-pressed={filter === t}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="workspace-search">
            <Search size={16} />
            <input
              aria-label="Search conversations"
              placeholder="Find a conversation…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="communication-columns">
          <div className="conversation-list" aria-label="Recent conversations">
            {loading ? (
              <p className="workspace-empty" role="status">
                Loading your conversations…
              </p>
            ) : filtered.length ? (
              filtered.map((c) => (
                <button
                  className="conversation-preview"
                  key={c.id}
                  aria-pressed={current?.id === c.id}
                  onClick={() => setSelected(c.id)}
                >
                  <span className="person-monogram">
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span className="conversation-copy">
                    <strong>{c.name}</strong>
                    <span>{c.original || "Message details unavailable"}</span>
                    <small>{c.role}</small>
                  </span>
                  <span
                    className={`conversation-status ${c.status === "pending" ? "is-pending" : ""}`}
                  >
                    {c.status === "pending" ? (
                      <Clock size={13} />
                    ) : (
                      <Check size={13} />
                    )}
                    <span>{c.status === "pending" ? "Review" : "Done"}</span>
                  </span>
                </button>
              ))
            ) : (
              <p className="workspace-empty">
                {error
                  ? "Activity couldn’t load. Open Activity Log to try again."
                  : "No conversations in this view."}
              </p>
            )}
          </div>
          <aside
            className="conversation-inspector"
            aria-label="Conversation details"
          >
            {current ? (
              <>
                <p className="workspace-eyebrow">Conversation context</p>
                <h3>{current.name}</h3>
                <span className="inspector-role">{current.role}</span>
                <div className="message-excerpt">
                  <span>INCOMING MESSAGE</span>
                  <p>{current.original || "No message content available."}</p>
                </div>
                <div className="response-excerpt">
                  <span>
                    {current.sent
                      ? "RESPONSE SENT"
                      : "HAELO’S SUGGESTED RESPONSE"}
                  </span>
                  <p>
                    {current.sent ||
                      current.suggested ||
                      "A suggested response is not available yet."}
                  </p>
                </div>
                <Link href="/dashboard/activity">
                  Open activity details <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <BookOpen size={30} />
                <h3>A little context goes a long way.</h3>
                <p>
                  Conversations will appear here as Haelo handles your
                  communication.
                </p>
                <Link href="/dashboard/business-bible">
                  Explore your Business Bible <ArrowRight size={16} />
                </Link>
              </>
            )}
          </aside>
        </div>
      </section>
      <footer className="overview-footnote">
        <BookOpen size={16} />
        <span>Better context makes better responses.</span>
        <Link href="/dashboard/business-bible">
          Keep your Business Bible up to date <ArrowUpRight size={14} />
        </Link>
      </footer>
    </main>
  );
}
