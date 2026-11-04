"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCheck,
  Clock3,
  Hourglass,
  Inbox,
  Mail,
  MessageCircle,
  Sparkles,
  Timer,
  UserRoundX,
} from "lucide-react";
import { initials, useWorkspace } from "@/components/dashboard/workspace-data";
export default function OverviewPage() {
  const w = useWorkspace();
  const waiting = w.drafts.filter((d) => d.status === "pending");
  const sent = w.drafts.filter((d) => d.status !== "pending");
  const automated = sent.filter((d) => /auto/.test(d.status));
  const approved = sent.filter((d) => /approv|manual|whatsapp/.test(d.status));
  const changed = sent.filter((d) => /edit|rewrit|chang/.test(d.status));
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening",
    );
  }, []);
  return (
    <main className="ws-page ws-overview">
      <header className="ws-page-heading">
        <div>
          <h1>
            {greeting}
            {w.name ? `, ${w.name.split(" ")[0]}` : ""}
          </h1>
          <p>
            {w.loading ? (
              "Loading your workspace…"
            ) : (
              <>
                <strong className="ws-burgundy">
                  {waiting.length} drafts are waiting for you.
                </strong>{" "}
                Keep your team moving, wherever you are.
              </>
            )}
          </p>
        </div>
        <span className="ws-period">Latest activity</span>
      </header>
      {w.error && (
        <p className="ws-alert" role="alert">
          Some workspace information couldn’t load.{" "}
          <button onClick={w.reload}>Try again</button>
        </p>
      )}
      <section className="ws-metrics" aria-label="Workspace metrics">
        {[
          [
            "Drafts waiting",
            w.loading ? "—" : waiting.length,
            Inbox,
            "Ready for your review",
          ],
          [
            "Emails handled",
            w.metrics["emails-handled"] || "—",
            Mail,
            "Across your workspace",
          ],
          [
            "Sent automatically",
            w.loading ? "—" : automated.length,
            Timer,
            "In the latest activity",
          ],
          [
            "Average reply time",
            w.metrics["avg-response-time"] || "—",
            Clock3,
            "Average turnaround",
          ],
        ].map(([label, value, Icon, note]) => {
          const MetricIcon = Icon as typeof Mail;
          return (
            <article key={label as string}>
              <div>
                {label as string}
                <MetricIcon size={16} />
              </div>
              <strong>{value as string}</strong>
              <small>{note as string}</small>
            </article>
          );
        })}
      </section>
      <div className="ws-overview-grid">
        <section className="ws-card ws-awaiting">
          <header>
            <div>
              <h2>Awaiting your approval</h2>
              <p>Approve here or on WhatsApp, whichever is closer</p>
            </div>
            <Link href="/dashboard/approvals">
              View all <ArrowRight size={14} />
            </Link>
          </header>
          <div className="ws-awaiting-list">
            {waiting.slice(0, 3).map((d) => (
              <article key={d.id}>
                <span className="ws-avatar">{initials(d.name)}</span>
                <div>
                  <strong>{d.subject}</strong>
                  <small>
                    {d.name}
                    {d.role ? ` · ${d.role}` : ""} · Waiting for you
                  </small>
                </div>
                <Link
                  className="ws-button"
                  href={`/dashboard/approvals?draft=${encodeURIComponent(d.id)}`}
                >
                  Review
                </Link>
              </article>
            ))}
            {!waiting.length && (
              <div className="ws-empty">
                <Inbox size={24} />
                <strong>
                  {w.loading ? "Checking your drafts…" : "Your queue is clear"}
                </strong>
                <p>
                  {w.loading
                    ? ""
                    : "New drafts will appear here when they need your attention."}
                </p>
                <Link href="/dashboard/approvals">
                  Open approvals <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>
        <section className="ws-card ws-week">
          <header>
            <div>
              <h2>Your activity with Haelo</h2>
              <p>What happened in your latest activity</p>
            </div>
          </header>
          {[
            [
              CheckCheck,
              "You approved the reply",
              "Approved responses",
              approved.length,
            ],
            [
              Timer,
              "Haelo sent for you",
              "Your timer ran out",
              automated.length,
            ],
            [
              Sparkles,
              "You asked for changes",
              "Rewritten responses",
              changed.length,
            ],
          ].map(([Icon, title, caption, count]) => {
            const RowIcon = Icon as typeof Timer;
            return (
              <div className="ws-week-row" key={title as string}>
                <span className="ws-round-icon">
                  <RowIcon size={18} />
                </span>
                <div>
                  <strong>{title as string}</strong>
                  <small>{caption as string}</small>
                </div>
                <b>{w.loading ? "—" : (count as number)}</b>
              </div>
            );
          })}
          <Link className="ws-inline-link" href="/dashboard/activity">
            Explore your activity <ArrowRight size={14} />
          </Link>
        </section>
        <section className="ws-card ws-attention">
          <header>
            <h2>Needs your attention</h2>
          </header>
          <div>
            {[
              [
                UserRoundX,
                "Unrecognised senders",
                w.unknown === null
                  ? "Checking your directory…"
                  : `${w.unknown} senders to review`,
                "/dashboard/staff",
                "Review",
              ],
              [
                BookOpen,
                "Business Bible",
                "Keep your business context current",
                "/dashboard/business-bible",
                "Update",
              ],
              [
                MessageCircle,
                "WhatsApp",
                w.connected ? "Connected" : "Complete your connection",
                "/dashboard/settings",
                "Details",
              ],
            ].map(([Icon, title, caption, href, action]) => {
              const ItemIcon = Icon as typeof BookOpen;
              return (
                <Link key={title as string} href={href as string}>
                  <span className="ws-round-icon">
                    <ItemIcon size={18} />
                  </span>
                  <strong>{title as string}</strong>
                  <small>{caption as string}</small>
                  <span>
                    {action as string} <ArrowRight size={13} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
        <div className="ws-impact">
          <article className="ws-card ws-impact-dark">
            <span className="ws-round-icon">
              <Hourglass size={19} />
            </span>
            <div>
              <p>Time, back on your side</p>
              <h2>
                A lighter
                <br />
                working day.
              </h2>
              <span className="ws-lime-tag">Made for the way you lead</span>
            </div>
          </article>
          <article className="ws-card">
            <span className="ws-round-icon">
              <Sparkles size={19} />
            </span>
            <div>
              <p>Approved responses</p>
              <strong className="ws-impact-value">
                {w.metrics["approval-rate"] || "—"}
              </strong>
              <p>Across your workspace</p>
              <Link href="/dashboard/settings">
                Your writing preferences <ArrowRight size={13} />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
