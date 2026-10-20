"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, ChevronRight, Mail } from "lucide-react";
import { getActivityMetrics, getActivityLogs } from "@/lib/api/activity";

// Data replaced with state from API

const statusColor: Record<string, string> = {
  sent: "badge-lime",
  "auto-sent": "badge-silver",
  edited: "badge-navy",
  pending: "badge-navy",
};

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filterDept, setFilterDept] = useState("All");
  const [metrics, setMetrics] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    allTime: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await getActivityMetrics();
        if (res?.data?.metrics) {
          setMetrics(res.data.metrics);
        }
      } catch (err) {
        console.error("Failed to fetch activity metrics:", err);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const logsRes = await getActivityLogs(page);

        if (logsRes?.data?.logs) {
          setActivities(
            logsRes.data.logs.map((item: any) => {
              const dateObj = new Date(item.sentAt || item.createdAt);
              return {
                id: item.id || item.uid,
                from: item.staff?.name || item.senderEmail || "Unknown",
                role: item.staff?.role || "Unknown",
                dept: item.staff?.department || item.department || "",
                summary: (item.originalMessage || "").substring(0, 100) + "...",
                original: item.originalMessage || "",
                suggested: item.aiSuggested || "",
                sent: item.responseSent || "",
                status: (item.sentType || "pending").toLowerCase(),
                method: item.sentType || "Unknown",
                time: dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                date: dateObj.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              };
            }),
          );
          setMeta(logsRes.data.meta);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  const depts = [
    "All",
    "Operations",
    "Human Resources",
    "Finance",
    "Sales",
    "Product",
  ];

  const filtered = activities.filter(
    (a) =>
      (filterDept === "All" || a.dept === filterDept) &&
      (a.from.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <main className="activity-page flex-1 p-6 lg:p-8 overflow-auto">
      <div className="mb-8 lg:ml-0 ml-12">
        <p className="section-label mb-1">Activity Log</p>
        <h1
          className="text-2xl font-bold text-navy"
          style={{ letterSpacing: "-0.02em" }}
        >
          Every email. Every response.
        </h1>
        <p className="text-midgray text-sm mt-1">
          Complete history of everything Haelo has handled on your behalf.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today", value: metrics.today.toLocaleString() },
          { label: "This week", value: metrics.thisWeek.toLocaleString() },
          { label: "This month", value: metrics.thisMonth.toLocaleString() },
          { label: "All time", value: metrics.allTime.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p
              className="text-2xl font-bold text-navy"
              style={{ letterSpacing: "-0.02em" }}
            >
              {s.value}
            </p>
            <p className="text-xs text-midgray mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver"
          />
          <input
            type="text"
            aria-label="Search activity"
            placeholder="Search by name or content..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {depts.map((d) => (
            <button
              key={d}
              aria-pressed={filterDept === d}
              onClick={() => setFilterDept(d)}
              className={`text-xs font-bold px-3 py-2 rounded-lg transition-all ${
                filterDept === d
                  ? "bg-navy text-white"
                  : "bg-white border border-border text-midgray hover:text-navy"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p role="status" className="text-sm text-midgray mb-4">
          Loading communication history…
        </p>
      )}
      {/* Activity list */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="card overflow-hidden p-0">
            {/* Row header */}
            <button
              className="w-full flex items-start gap-4 p-5 text-left hover:bg-offwhite/60 transition-colors"
              aria-expanded={expanded === item.id}
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="w-9 h-9 bg-navy rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                {item.from.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-bold text-navy">{item.from}</p>
                  <p className="text-xs text-midgray">· {item.role}</p>
                  <span
                    className={`badge ${statusColor[item.status] || "badge-navy"} ml-auto`}
                  >
                    {item.status === "auto-sent"
                      ? "Auto-sent"
                      : item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-midgray leading-relaxed">
                  {item.summary}
                </p>
                <p className="text-xs text-silver mt-1">{item.time}</p>
              </div>
              <ChevronRight
                size={16}
                className={`text-silver shrink-0 mt-1 transition-transform ${expanded === item.id ? "rotate-90" : ""}`}
              />
            </button>

            {/* Expanded detail */}
            {expanded === item.id && (
              <div className="border-t border-border bg-offwhite/50 p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-midgray mb-2">
                      Original email
                    </p>
                    <div className="bg-white border border-border rounded-lg p-3">
                      <p className="text-xs text-nearblack leading-relaxed">
                        {item.original}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-midgray mb-2">
                      AI suggested
                    </p>
                    <div className="bg-white border border-border rounded-lg p-3">
                      <p className="text-xs text-nearblack leading-relaxed">
                        {item.suggested}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-midgray mb-2">
                      Response sent
                    </p>
                    <div className="bg-lime/5 border border-lime/20 rounded-lg p-3">
                      <p className="text-xs text-nearblack leading-relaxed">
                        {item.sent}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-midgray">
                  <span>
                    Method: <strong className="text-navy">{item.method}</strong>
                  </span>
                  <span>
                    Dept: <strong className="text-navy">{item.dept}</strong>
                  </span>
                  <span>
                    Date: <strong className="text-navy">{item.date}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="card text-center py-12">
          <Mail size={32} className="text-silver mx-auto mb-3" />
          <p className="text-sm font-bold text-navy mb-1">No results found</p>
          <p className="text-xs text-midgray">
            Try adjusting your search or filter.
          </p>
        </div>
      )}

      {/* Pagination controls */}
      {meta && (
        <div className="mt-6 flex justify-center gap-4">
          {meta.previousPage && (
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-white border border-border text-navy text-sm font-bold rounded-lg hover:bg-offwhite transition-colors"
            >
              Previous Page
            </button>
          )}
          {meta.nextPage && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-navy text-white text-sm font-bold rounded-lg hover:bg-navy/90 transition-colors"
            >
              Next Page
            </button>
          )}
        </div>
      )}
    </main>
  );
}
