"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  Check,
  ChevronDown,
  Clock3,
  GitCompare,
  Hourglass,
  Inbox,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Sparkles,
  X,
} from "lucide-react";
import {
  type Draft,
  initials,
  timeLabel,
  useWorkspace,
} from "@/components/dashboard/workspace-data";
const samples: Draft[] = [
  {
    id: "sample-tosin",
    name: "Tosin Adeyemi",
    role: "Operations Manager",
    email: "tosin@example.com",
    subject: "Reorder 50kg of rice before Friday’s service",
    summary:
      "Tosin wants your OK to reorder 50kg of rice. Current stock only covers two days and Friday’s service is fully booked.",
    original:
      "Hi Stephen,\n\nWe need your approval to reorder 50kg of rice before Friday’s service. Current stock only covers two days and Friday is fully booked. Please let us know whether to proceed.\n\nThanks,\nTosin",
    reply:
      "Hi Tosin,\n\nApproved. Please log the order and send the receipt to accounts today so it arrives before Friday’s service.\n\nThanks,\nStephen",
    status: "pending",
    time: "9:42 AM",
  },
  {
    id: "sample-kemi",
    name: "Kemi Eze",
    role: "Head of HR",
    email: "kemi@example.com",
    subject: "Annual leave request for 12–16 November",
    original:
      "Please approve five days of annual leave, 12–16 November. Bola will cover HR during my leave.",
    reply:
      "Dear Kemi,\n\nThank you for the request. Your leave from 12 to 16 November is approved. Please share the handover plan with Bola before you go.\n\nKind regards,\nStephen",
    status: "pending",
    time: "9:15 AM",
  },
  {
    id: "sample-ibrahim",
    name: "Ibrahim Bello",
    role: "Finance Lead",
    email: "ibrahim@example.com",
    subject: "Vendor payment of ₦1.2m",
    original:
      "Please review the vendor payment request for ₦1.2m. The invoice is ready for your approval.",
    reply:
      "Hi Ibrahim,\n\nPlease send the invoice and payment breakdown for review before proceeding.\n\nThanks,\nStephen",
    status: "pending",
    time: "8:50 AM",
  },
  {
    id: "sample-chidi",
    name: "Chidi Okafor",
    role: "Shift Supervisor",
    email: "chidi@example.com",
    subject: "Saturday shift swap",
    original:
      "May I swap my Saturday shift? Cover has been arranged with the team.",
    reply:
      "Hi Chidi,\n\nApproved. Please update the rota and confirm the cover with your manager.\n\nThanks,\nStephen",
    status: "pending",
    time: "8:31 AM",
  },
];
function Approvals() {
  const w = useWorkspace();
  const params = useSearchParams();
  const [demo, setDemo] = useState(false);
  const [seconds, setSeconds] = useState(462);
  useEffect(() => {
    if (!demo) return;
    const interval = setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearInterval(interval);
  }, [demo]);
  const [sampleDrafts, setSampleDrafts] = useState(samples);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState("pending");
  const [mode, setMode] = useState<"view" | "changes" | "edit">("view");
  const [instruction, setInstruction] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [previous, setPrevious] = useState<Record<string, string>>({});
  const [compare, setCompare] = useState(false);
  const [original, setOriginal] = useState(false);
  const [hold, setHold] = useState(false);
  const [more, setMore] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [toast, setToast] = useState<{ draft: Draft; expires: number } | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const holdRef = useRef<HTMLDivElement>(null);
  const rewriteTimer = useRef<ReturnType<typeof setTimeout>>();
  const drafts = demo ? sampleDrafts : w.drafts;
  const filtered = drafts.filter((d) =>
    tab === "sent" ? !["pending", "held"].includes(d.status) : d.status === tab,
  );
  const requested = params.get("draft");
  const current =
    filtered.find((d) => d.id === (selected || requested)) || filtered[0];
  const reply = current ? (edits[current.id] ?? current.reply) : "";
  useEffect(() => {
    clearTimeout(rewriteTimer.current);
    setRewriting(false);
    setMode("view");
    setCompare(false);
    setOriginal(false);
    setHold(false);
    setMore(false);
    setNotice("");
    setInstruction("");
  }, [current?.id]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(
      () => setToast(null),
      Math.max(0, toast.expires - Date.now()),
    );
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    function close(e: PointerEvent) {
      if (holdRef.current && !holdRef.current.contains(e.target as Node))
        setHold(false);
    }
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setHold(false);
        setMore(false);
        setCompare(false);
      }
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
      clearTimeout(rewriteTimer.current);
    };
  }, []);
  function approve() {
    if (!demo || !current) return;
    setSampleDrafts((p) =>
      p.map((d) => (d.id === current.id ? { ...d, reply, status: "sent" } : d)),
    );
    setToast({ draft: current, expires: Date.now() + 10000 });
    setSelected(null);
    setMode("view");
  }
  function rewrite() {
    if (!current || !demo || !instruction.trim()) return;
    const id = current.id;
    setRewriting(true);
    setPrevious((p) => ({ ...p, [id]: reply }));
    rewriteTimer.current = setTimeout(() => {
      const first = current.name.split(" ")[0];
      const text = /monday/i.test(instruction)
        ? `Hi ${first},\n\nThanks for flagging this. Please hold the order until Monday. I’ll confirm after Friday’s budget review.\n\nThanks,\nStephen`
        : /shorter/i.test(instruction)
          ? `Hi ${first},\n\nThanks for your message. Please share the details so I can confirm the next step.\n\nStephen`
          : /formal/i.test(instruction)
            ? `Dear ${first},\n\nThank you for bringing this to my attention. Please provide the relevant details for my review before proceeding.\n\nKind regards,\nStephen`
            : `Hi ${first},\n\nThank you for the update. Please send the supporting details so I can review this and confirm how to proceed.\n\nThanks,\nStephen`;
      setEdits((p) => ({ ...p, [id]: text }));
      setRewriting(false);
      setMode("view");
      setNotice(
        "Sample reply updated. Compare it with the previous version below.",
      );
    }, 700);
  }
  function sampleMode() {
    setDemo(!demo);
    setSeconds(462);
    setSelected(null);
    setTab("pending");
    setMode("view");
    setEdits({});
    setPrevious({});
    setToast(null);
    setSampleDrafts(samples);
  }
  return (
    <main className="ws-page ws-approvals">
      <header className="ws-page-heading">
        <div>
          <h1>Approvals</h1>
          <p>
            {drafts.filter((d) => d.status === "pending").length} drafts
            waiting. Approve here or on WhatsApp, whichever is closer.
          </p>
        </div>
        <div
          className="ws-segments"
          role="group"
          aria-label="Filter approval queue"
        >
          {[
            ["pending", "Waiting"],
            ["sent", "Sent"],
            ["held", "On hold"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={tab === id}
              onClick={() => {
                setTab(id);
                setSelected(null);
              }}
            >
              {label} ·{" "}
              {
                drafts.filter((d) =>
                  id === "sent"
                    ? !["pending", "held"].includes(d.status)
                    : d.status === id,
                ).length
              }
            </button>
          ))}
        </div>
      </header>
      <div className={`ws-preview-notice${demo ? " is-demo" : ""}`}>
        <span>
          {demo
            ? "Sample preview · No emails will be sent"
            : "Review drafts here. Web sending, rewriting and hold controls await service integration; you can approve through WhatsApp."}
        </span>
        <button onClick={sampleMode}>
          {demo ? "Exit sample preview" : "Try sample drafts"}
        </button>
      </div>
      {w.error && !demo && (
        <p className="ws-alert" role="alert">
          Some data couldn’t load. <button onClick={w.reload}>Retry</button>
        </p>
      )}
      <div className="ws-approval-columns">
        <section className="ws-queue" aria-label="Draft queue">
          {filtered.map((d) => (
            <button
              className={current?.id === d.id ? "selected" : ""}
              key={d.id}
              aria-pressed={current?.id === d.id}
              onClick={() => setSelected(d.id)}
            >
              <span className="ws-avatar">{initials(d.name)}</span>
              <span className="ws-queue-copy">
                <strong>{d.name}</strong>
                <span>{d.subject}</span>
                <small>
                  <Clock3 size={12} />
                  {d.status === "held"
                    ? "On hold in sample preview"
                    : d.status === "pending"
                      ? "Waiting for your YES"
                      : "Sent"}
                </small>
              </span>
              <time>{timeLabel(d.time)}</time>
            </button>
          ))}
          {!filtered.length && (
            <div className="ws-empty">
              <Inbox size={26} />
              <h2>
                {w.loading && !demo
                  ? "Loading drafts…"
                  : "You’re all caught up"}
              </h2>
              <p>
                {tab === "pending"
                  ? "New drafts will appear here when they need your attention."
                  : "There are no drafts in this view."}
              </p>
            </div>
          )}
        </section>
        <section className="ws-draft" aria-label="Selected draft">
          {current ? (
            <>
              <div className="ws-draft-body">
                <header className="ws-sender">
                  <span className="ws-avatar">{initials(current.name)}</span>
                  <div>
                    <strong>{current.name}</strong>
                    <small>
                      {current.role}
                      {current.role && current.email ? " · " : ""}
                      {current.email}
                    </small>
                  </div>
                  <time>{timeLabel(current.time)}</time>
                  <div className="ws-more-anchor">
                    <button
                      className="ws-icon"
                      aria-label="Draft options"
                      aria-expanded={more}
                      onClick={() => setMore(!more)}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                    {more && (
                      <div className="ws-popover">
                        <button
                          onClick={() => {
                            setOriginal(true);
                            setMore(false);
                          }}
                        >
                          <Mail size={14} />
                          Read original email
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(reply);
                              setNotice("Reply copied.");
                            } catch {
                              setNotice(
                                "Could not copy. Select and copy the reply text.",
                              );
                            }
                            setMore(false);
                          }}
                        >
                          <Pencil size={14} />
                          Copy reply
                        </button>
                      </div>
                    )}
                  </div>
                </header>
                <div
                  className={`ws-draft-timer${demo && current.id === "sample-tosin" && current.status === "pending" ? " urgent" : ""}`}
                >
                  <span>
                    <Clock3 size={14} />
                    {current.status === "held"
                      ? "On hold · sample preview"
                      : current.status === "pending"
                        ? demo && current.id === "sample-tosin"
                          ? `Sample auto-send in ${Math.floor(seconds / 60)
                              .toString()
                              .padStart(
                                2,
                                "0",
                              )}:${(seconds % 60).toString().padStart(2, "0")}`
                          : "Waiting for your YES"
                        : "Reply sent"}
                  </span>
                  {(current.status === "pending" ||
                    current.status === "held") && (
                    <div ref={holdRef} className="ws-hold-anchor">
                      <button
                        className="ws-button"
                        aria-expanded={hold}
                        onClick={() => setHold(!hold)}
                      >
                        <Hourglass size={13} />
                        Give me more time
                      </button>
                      {hold && (
                        <div className="ws-popover ws-hold-menu">
                          <p>Hold this draft for</p>
                          {[
                            "15 minutes",
                            "1 hour",
                            "This afternoon",
                            "Tomorrow morning",
                            "Remind me, don’t send",
                          ].map((label, i) => (
                            <button
                              key={label}
                              disabled={!demo}
                              onClick={() => {
                                setSampleDrafts((p) =>
                                  p.map((d) =>
                                    d.id === current.id
                                      ? { ...d, status: "held" }
                                      : d,
                                  ),
                                );
                                setHold(false);
                                setNotice(`Sample hold selected: ${label}.`);
                                setSelected(null);
                              }}
                            >
                              {i === 4 ? (
                                <Bell size={14} />
                              ) : (
                                <Clock3 size={14} />
                              )}
                              <span>{label}</span>
                            </button>
                          ))}
                          {!demo && (
                            <small>
                              Hold controls aren’t available for live drafts
                              yet.
                            </small>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <h2 className="ws-draft-title">{current.subject}</h2>
                <p className="ws-draft-summary">
                  <Sparkles size={15} />
                  <span>
                    {current.summary ||
                      current.original.slice(0, 260) ||
                      "Email summary is not available."}
                  </span>
                </p>
                {mode === "changes" ? (
                  <>
                    <div className="ws-current-reply">
                      <span>Current reply: {reply.slice(0, 80)}…</span>
                      <button onClick={() => setOriginal(!original)}>
                        {original ? "Hide" : "Show"}
                      </button>
                    </div>
                    {original && <pre className="ws-reply">{reply}</pre>}
                    <div className="ws-change-box">
                      <label htmlFor="change-instructions">
                        What should Haelo change?
                      </label>
                      <textarea
                        id="change-instructions"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="Tell Haelo what to change…"
                      />
                      <div>
                        {[
                          "Shorter",
                          "More formal",
                          "Say no politely",
                          "Ask for details",
                        ].map((label) => (
                          <button
                            key={label}
                            onClick={() =>
                              setInstruction((p) =>
                                p ? `${p}\n${label}` : label,
                              )
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="ws-help">
                      <MessageIcon />
                      Same as replying NO on WhatsApp and typing the change.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="ws-reply-label">
                      <span>
                        {previous[current.id] ? "New reply" : "Haelo’s reply"}
                      </span>
                      {current.role && (
                        <span className="ws-tag">{current.role}</span>
                      )}
                      {previous[current.id] && (
                        <span className="ws-lime-tag">
                          <Sparkles size={12} />
                          Sample rewrite
                        </span>
                      )}
                      <button
                        onClick={() =>
                          setMode(mode === "edit" ? "view" : "edit")
                        }
                      >
                        <Pencil size={13} />
                        {mode === "edit" ? "Done editing" : "Edit text"}
                      </button>
                    </div>
                    {mode === "edit" ? (
                      <>
                        <label className="ws-sr-only" htmlFor="reply-text">
                          Edit reply text
                        </label>
                        <textarea
                          id="reply-text"
                          className="ws-reply ws-edit-reply"
                          value={reply}
                          onChange={(e) =>
                            setEdits((p) => ({
                              ...p,
                              [current.id]: e.target.value,
                            }))
                          }
                        />
                        <p className="ws-help">
                          Edits are kept on this page. Live draft saving is not
                          available yet.
                        </p>
                      </>
                    ) : (
                      <pre className="ws-reply">
                        {reply || "A reply is not available yet."}
                      </pre>
                    )}
                    {previous[current.id] && (
                      <div className="ws-changed">
                        <Check size={14} />
                        <span>Sample reply updated</span>
                        <button onClick={() => setCompare(!compare)}>
                          <GitCompare size={14} />
                          {compare ? "Hide comparison" : "Compare"}
                        </button>
                      </div>
                    )}
                    {compare && (
                      <section className="ws-compare">
                        <h3>Previous version</h3>
                        <pre className="ws-reply">{previous[current.id]}</pre>
                      </section>
                    )}
                    <details className="ws-original">
                      <summary>
                        <Mail size={14} />
                        Read {current.name.split(" ")[0]}’s original email{" "}
                        <span>
                          {current.original.split(/\s+/).filter(Boolean).length}{" "}
                          words
                        </span>
                        <ChevronDown size={13} />
                      </summary>
                      <pre>
                        {current.original || "Original email unavailable."}
                      </pre>
                    </details>
                  </>
                )}
                {notice && (
                  <p className="ws-help" role="status">
                    {notice}
                  </p>
                )}
              </div>
              <footer className="ws-draft-actions">
                {mode === "changes" ? (
                  <>
                    <button
                      className="ws-button"
                      disabled={rewriting}
                      onClick={() => setMode("view")}
                    >
                      Cancel
                    </button>
                    <button
                      className="ws-button ws-dark"
                      disabled={!demo || !instruction.trim() || rewriting}
                      onClick={rewrite}
                    >
                      {rewriting ? (
                        <Loader2 size={14} className="ws-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      Rewrite reply
                    </button>
                  </>
                ) : current.status === "pending" ||
                  current.status === "held" ? (
                  <>
                    {current.status === "held" && demo && (
                      <button
                        className="ws-button"
                        onClick={() => {
                          setSampleDrafts((items) =>
                            items.map((item) =>
                              item.id === current.id
                                ? { ...item, status: "pending" }
                                : item,
                            ),
                          );
                          setTab("pending");
                          setSelected(current.id);
                        }}
                      >
                        Resume draft
                      </button>
                    )}
                    <button
                      className="ws-button"
                      onClick={() => setMode("changes")}
                    >
                      <Pencil size={14} />
                      Ask for changes
                    </button>
                    <button
                      className="ws-button ws-dark"
                      disabled={!demo || !reply.trim()}
                      onClick={approve}
                    >
                      <Check size={14} />
                      {previous[current.id]
                        ? "Approve new reply"
                        : "Approve & send"}
                    </button>
                  </>
                ) : (
                  <span className="ws-help">
                    <Check size={14} />
                    {demo
                      ? "Sent in sample preview"
                      : "Response recorded in your activity log"}
                  </span>
                )}
              </footer>
            </>
          ) : (
            <div className="ws-empty ws-draft-empty">
              <Inbox size={32} />
              <h2>A clear inbox. A lighter day.</h2>
              <p>Select a draft to review the email and Haelo’s reply.</p>
            </div>
          )}
        </section>
      </div>
      {toast && (
        <div className="ws-toast" role="status">
          <span>
            <Check size={17} />
          </span>
          <div>
            <strong>Sample reply sent to {toast.draft.name}</strong>
            <small>Preview only · no email was sent</small>
          </div>
          <button
            onClick={() => {
              setSampleDrafts((p) =>
                p.map((d) => (d.id === toast.draft.id ? toast.draft : d)),
              );
              setTab("pending");
              setSelected(toast.draft.id);
              setToast(null);
            }}
          >
            Undo
          </button>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </main>
  );
}
function MessageIcon() {
  return <span aria-hidden="true">↩</span>;
}
export default function ApprovalsPage() {
  return (
    <Suspense fallback={<p className="ws-empty">Loading approvals…</p>}>
      <Approvals />
    </Suspense>
  );
}
