"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Mail,
  Search,
  Send,
  Sparkles,
  Timer,
} from "lucide-react";
import { getActivityLogs, getActivityMetrics } from "@/lib/api/activity";
import { initials } from "@/components/dashboard/workspace-data";
import {
  Badge,
  exportCSV,
  Overlay,
  Segments,
} from "@/components/dashboard/WorkspaceUI";
type Entry = {
  id: string;
  name: string;
  role: string;
  subject: string;
  original: string;
  suggested: string;
  sent: string;
  status: string;
  received: string;
  date: string;
  drafted: string;
  delivered: string;
  sentAt: string;
  details: string;
  replyTime: string;
  mailUrl: string;
};
function category(status: string) {
  if (/held|hold/.test(status)) return "held";
  if (/edit|chang|rewrit/.test(status)) return "changed";
  if (/auto/.test(status)) return "automatic";
  if (/approv|manual|sent|whatsapp/.test(status)) return "approved";
  return "pending";
}
const labels: Record<string, string> = {
  held: "Held",
  changed: "Changed, then sent",
  automatic: "Sent automatically",
  approved: "Approved by you",
  pending: "Waiting for you",
};
const displayDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString([], {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
};
const displayTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};
function within(entry: Entry, range: string, start: string, end: string) {
  if (range === "all") return true;
  const time = new Date(entry.date).getTime();
  if (!Number.isFinite(time)) return false;
  const now = new Date();
  let from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let to = new Date(now);
  to.setHours(23, 59, 59, 999);
  if (range === "week")
    from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
  if (range === "month") from.setDate(from.getDate() - 29);
  if (range === "year") from = new Date(now.getFullYear(), 0, 1);
  if (range === "custom") {
    if (start) from = new Date(`${start}T00:00:00`);
    if (end) to = new Date(`${end}T23:59:59`);
  }
  return time >= from.getTime() && time <= to.getTime();
}
export default function ActivityPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverPage, setServerPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("week");
  const [rangeOpen, setRangeOpen] = useState(false);
  useEffect(() => {
    if (!rangeOpen) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRangeOpen(false);
    };
    const outside = (event: PointerEvent) => {
      if (!(event.target as Element)?.closest(".ws-menu-anchor"))
        setRangeOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [rangeOpen]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let active = true;
    getActivityMetrics()
      .then((r) => {
        if (active) setCounts(r.data?.metrics || {});
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getActivityLogs(serverPage, 100)
      .then((r) => {
        if (!active) return;
        const rows = (r.data?.logs || []).map((item: any, index: number) => {
          const elapsed =
            new Date(item.sentAt).getTime() -
            new Date(item.createdAt).getTime();
          return {
            id: String(item.id || item.uid || `${serverPage}-${index}`),
            name: item.staff?.name || item.senderEmail || "Unknown sender",
            role: item.staff?.role || "Not on staff list",
            subject:
              item.subject ||
              item.originalMessage?.split("\n")[0]?.slice(0, 90) ||
              "Internal email",
            original: item.originalMessage || "",
            suggested: item.aiSuggested || "",
            sent: item.responseSent || "",
            status: String(
              item.sentType || (item.responseSent ? "sent" : "pending"),
            ).toLowerCase(),
            received: item.createdAt || "",
            date: item.sentAt || item.createdAt || "",
            drafted: item.draftedAt || "",
            delivered: item.whatsappSentAt || "",
            sentAt: item.sentAt || "",
            details: item.details || item.channel || "",
            replyTime: item.responseTime
              ? String(item.responseTime)
              : Number.isFinite(elapsed) && elapsed >= 0
                ? `${Math.max(1, Math.round(elapsed / 60000))} min`
                : "—",
            mailUrl: item.mailUrl || item.emailUrl || "",
          } as Entry;
        });
        setEntries((previous) =>
          serverPage === 1
            ? rows
            : Array.from(
                new Map(
                  [...previous, ...rows].map((item) => [item.id, item]),
                ).values(),
              ),
        );
        const meta = r.data?.meta;
        setHasMore(
          Boolean(meta?.nextPage) ||
            (meta?.totalPages && serverPage < meta.totalPages),
        );
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load activity.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [serverPage, attempt]);
  useEffect(() => setPage(1), [range, start, end, query, filter]);
  const inRange = useMemo(
    () => entries.filter((entry) => within(entry, range, start, end)),
    [entries, range, start, end],
  );
  const filtered = inRange
    .filter(
      (entry) =>
        (filter === "all" || category(entry.status) === filter) &&
        `${entry.name} ${entry.subject} ${entry.details} ${entry.role}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      const left =
        sort === "date"
          ? new Date(a.date).getTime() || 0
          : sort === "replyTime"
            ? parseFloat(a.replyTime) || 0
            : sort === "status"
              ? category(a.status)
              : a[sort as "name" | "subject"];
      const right =
        sort === "date"
          ? new Date(b.date).getTime() || 0
          : sort === "replyTime"
            ? parseFloat(b.replyTime) || 0
            : sort === "status"
              ? category(b.status)
              : b[sort as "name" | "subject"];
      return (
        (typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right))) * (ascending ? 1 : -1)
      );
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8));
  const shown = filtered.slice(
    (Math.min(page, totalPages) - 1) * 8,
    Math.min(page, totalPages) * 8,
  );
  const ranges = [
    { id: "today", label: "Today" },
    { id: "week", label: "This week" },
    { id: "month", label: "Last 30 days" },
    { id: "year", label: "This year" },
    { id: "all", label: "All loaded history" },
    { id: "custom", label: "Pick dates…" },
  ];
  function download() {
    exportCSV("haelo_activity.csv", [
      ["Date & time", "From", "Email", "Outcome", "Details", "Reply time"],
      ...filtered.map((e) => [
        e.date,
        e.name,
        e.subject,
        labels[category(e.status)],
        e.details,
        e.replyTime,
      ]),
    ]);
  }
  useEffect(() => {
    const listener = () => download();
    window.addEventListener("haelo:download-activity", listener);
    return () =>
      window.removeEventListener("haelo:download-activity", listener);
  });
  return (
    <main className="ws-page ws-activity">
      <header className="ws-page-heading">
        <div>
          <h1>Activity log</h1>
          <p>Everything Haelo did, in plain words.</p>
        </div>
        <div className="ws-page-tools">
          <label className="ws-local-search">
            <Search size={15} />
            <input
              aria-label="Search activity"
              placeholder="Search activity"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="ws-menu-anchor">
            <button
              className="ws-button"
              aria-expanded={rangeOpen}
              onClick={() => setRangeOpen(!rangeOpen)}
            >
              <CalendarDays size={14} />
              {ranges.find((item) => item.id === range)?.label}
              <ChevronDown size={13} />
            </button>
            {rangeOpen && (
              <div className="ws-popover ws-range-menu">
                {ranges.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setRange(item.id);
                      setRangeOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    <small>
                      {
                        entries.filter((e) => within(e, item.id, start, end))
                          .length
                      }{" "}
                      loaded
                    </small>
                    {range === item.id && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="ws-icon"
            aria-label="Download activity report"
            onClick={download}
          >
            <Download size={15} />
          </button>
        </div>
      </header>
      {range === "custom" && (
        <div className="ws-date-range">
          <label>
            From{" "}
            <input
              aria-label="Start date"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            To{" "}
            <input
              aria-label="End date"
              type="date"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          {start && end && start > end && (
            <span role="alert">End date must follow the start date.</span>
          )}
        </div>
      )}
      <Segments
        label="Activity outcomes"
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "All", count: inRange.length },
          ...Object.entries({
            approved: "Approved by you",
            automatic: "Sent automatically",
            changed: "Changed",
            held: "Held",
          }).map(([id, label]) => ({
            id,
            label,
            count: inRange.filter((e) => category(e.status) === id).length,
          })),
        ]}
      />
      {error && (
        <p className="ws-alert" role="alert">
          {error}{" "}
          <button onClick={() => setAttempt((value) => value + 1)}>
            Retry
          </button>
        </p>
      )}
      <div className="ws-data-table">
        <table>
          <thead>
            <tr>
              {[
                ["date", "Date & time"],
                ["name", "From"],
                ["subject", "Email"],
                ["status", "Outcome"],
                ["details", "Details"],
                ["replyTime", "Reply time"],
              ].map(([id, label]) => (
                <th
                  key={id}
                  aria-sort={
                    sort === id
                      ? ascending
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {id === "details" ? (
                    label
                  ) : (
                    <button
                      onClick={() => {
                        if (sort === id) setAscending(!ascending);
                        else {
                          setSort(id);
                          setAscending(true);
                        }
                      }}
                    >
                      {label}
                      <ArrowDownUp size={11} />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((entry) => (
              <tr key={entry.id} onClick={() => setSelected(entry)}>
                <td>
                  <strong>{displayTime(entry.date)}</strong>
                  <small>{displayDate(entry.date)}</small>
                </td>
                <td>
                  <div className="ws-table-person">
                    <span className="ws-avatar">{initials(entry.name)}</span>
                    <div>
                      <strong>{entry.name}</strong>
                      <small>{entry.role}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <button
                    className="ws-table-open"
                    aria-label={`View activity: ${entry.subject}`}
                  >
                    {entry.subject}
                  </button>
                </td>
                <td>
                  <Badge
                    tone={
                      category(entry.status) === "approved"
                        ? "green"
                        : category(entry.status) === "changed"
                          ? "amber"
                          : category(entry.status) === "held"
                            ? "red"
                            : "neutral"
                    }
                  >
                    {labels[category(entry.status)]}
                  </Badge>
                </td>
                <td>{entry.details || "—"}</td>
                <td>{entry.replyTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && (
          <p className="ws-empty" role="status">
            {loading ? "Loading activity…" : "No activity matches this view."}
          </p>
        )}
        <footer>
          <span>
            Showing {shown.length} of {filtered.length} loaded entries
            {counts.allTime ? ` · ${counts.allTime} total recorded` : ""}
          </span>
          <div>
            <button
              className="ws-button"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </button>
            <button
              className="ws-button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next <ArrowRight size={13} />
            </button>
            {hasMore && (
              <button
                className="ws-button"
                disabled={loading}
                onClick={() => setServerPage((value) => value + 1)}
              >
                Load more history
              </button>
            )}
          </div>
        </footer>
      </div>
      {selected && (
        <Overlay
          drawer
          title="Activity details"
          subtitle={displayDate(selected.date)}
          onClose={() => setSelected(null)}
          footer={
            <>
              {/^https:\/\//.test(selected.mailUrl) && (
                <a
                  className="ws-button"
                  href={selected.mailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open original email <ArrowRight size={13} />
                </a>
              )}
              <button
                className="ws-button ws-dark"
                onClick={() => setSelected(null)}
              >
                Done
              </button>
            </>
          }
        >
          <div className="ws-detail-person">
            <span className="ws-avatar">{initials(selected.name)}</span>
            <div>
              <h3>{selected.name}</h3>
              <p>{selected.role}</p>
            </div>
            <Badge>{labels[category(selected.status)]}</Badge>
          </div>
          <h3 className="ws-detail-subject">{selected.subject}</h3>
          <section className="ws-detail-box">
            <h4>What happened</h4>
            <ol className="ws-timeline">
              {[
                [
                  Mail,
                  `${selected.name.split(" ")[0]} emailed you`,
                  selected.received,
                ],
                [Sparkles, "Haelo drafted a reply", selected.drafted],
                [Mail, "Draft delivered to WhatsApp", selected.delivered],
                [
                  Send,
                  selected.sent ? "Reply sent" : "Waiting for your approval",
                  selected.sentAt,
                ],
              ]
                .filter(
                  ([, label, time], index) =>
                    index === 0 || Boolean(time) || index === 3,
                )
                .map(([Icon, label, time], index) => {
                  const EventIcon = Icon as typeof Mail;
                  return (
                    <li key={index}>
                      <span>
                        <EventIcon size={14} />
                      </span>
                      <div>
                        <strong>{label as string}</strong>
                        <small>
                          {time
                            ? displayTime(time as string)
                            : "Time not recorded"}
                        </small>
                      </div>
                    </li>
                  );
                })}
            </ol>
          </section>
          <section className="ws-detail-box ws-soft">
            <h4>{selected.sent ? "What was sent" : "Suggested reply"}</h4>
            <pre>
              {selected.sent ||
                selected.suggested ||
                "No response is recorded."}
            </pre>
          </section>
          <details className="ws-original">
            <summary>
              <Mail size={14} />
              Read original email <ChevronDown size={13} />
            </summary>
            <pre>{selected.original || "Original email unavailable."}</pre>
          </details>
        </Overlay>
      )}
    </main>
  );
}
