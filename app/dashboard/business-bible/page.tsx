"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Eye,
  FileText,
  Loader2,
  MessageCircle,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { getBibleMetrics, uploadBibleFiles } from "@/lib/api/onboard";
import { getStaffDirectory, getUnrecognizedSenders } from "@/lib/api/staff";
import { BIBLE_DOCS } from "@/components/setup/bible-documents";
import {
  Badge,
  BusyButton,
  Choice,
  downloadText,
  exportCSV,
  Field,
  Overlay,
  PreviewNotice,
  SectionHeader,
} from "@/components/dashboard/WorkspaceUI";
import { initials, useWorkspace } from "@/components/dashboard/workspace-data";
type Rule = {
  id: string;
  title: string;
  action: string;
  amount: string;
  situation: string;
};
const demoRules: Rule[] = [
  {
    id: "leave",
    title: "Leave of 5 days or less",
    action: "approve",
    amount: "5",
    situation: "Take annual leave",
  },
  {
    id: "payment",
    title: "Payments above ₦500k",
    action: "ask",
    amount: "500000",
    situation: "Make a payment",
  },
  {
    id: "stock",
    title: "Stock reorders within budget",
    action: "approve",
    amount: "",
    situation: "Reorder stock",
  },
  {
    id: "board",
    title: "Anything from the board",
    action: "ask",
    amount: "",
    situation: "Request from the board",
  },
];
const learned = [
  {
    id: "overview",
    title: "Company overview",
    hint: "What the company does, branches and opening hours",
  },
  {
    id: "chart",
    title: "Organisation structure",
    hint: "Departments and who leads each one",
  },
  {
    id: "directory",
    title: "Staff directory",
    hint: "People with their roles and levels",
  },
  {
    id: "sop",
    title: "Standard procedures",
    hint: "Ordering, leave, payments and shift changes",
  },
  {
    id: "rules",
    title: "Decision rules",
    hint: "What you approve, decline or delegate",
  },
  {
    id: "comms",
    title: "How you write",
    hint: "Greetings, sign-off and words to avoid",
  },
];
export default function BusinessBiblePage() {
  const w = useWorkspace();
  const [metrics, setMetrics] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [unknown, setUnknown] = useState<any[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [demo, setDemo] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [category, setCategory] = useState("overview");
  const [files, setFiles] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [review, setReview] = useState(false);
  const [ruleList, setRuleList] = useState(false);
  const [rules, setRules] = useState(demoRules);
  const [rule, setRule] = useState<Rule | null>(null);
  const [view, setView] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.allSettled([
      getBibleMetrics(),
      getStaffDirectory(),
      getUnrecognizedSenders(1, 7),
    ]).then((results) => {
      if (!active) return;
      const m = results[0];
      if (m.status === "fulfilled") setMetrics(m.value.data || null);
      else setError(m.reason.message || "Could not load your Business Bible.");
      const s = results[1];
      if (s.status === "fulfilled") setStaff(s.value.data?.staff || []);
      const u = results[2];
      if (u.status === "fulfilled") setUnknown(u.value.data?.senders || []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [attempt]);
  function template() {
    const doc = BIBLE_DOCS.find((d) => d.id === category)!;
    exportCSV(doc.templateFile, [
      doc.templateCols || [
        "firstName",
        "lastName",
        "role",
        "email",
        "description",
      ],
      ...(doc.templateRows || [["", "", "", "", ""]]),
    ]);
  }
  useEffect(() => {
    window.addEventListener("haelo:download-template", template);
    return () =>
      window.removeEventListener("haelo:download-template", template);
  });
  function selectFiles(list: File[]) {
    if (
      list.some(
        (file) =>
          file.size === 0 ||
          file.size > 25 * 1024 * 1024 ||
          !(demo ? /\.(pdf|docx?|csv)$/i : /\.csv$/i).test(file.name),
      )
    ) {
      setError(
        demo
          ? "Choose PDF, Word or CSV files, up to 25 MB each."
          : "Choose non-empty CSV files, up to 25 MB each.",
      );
      return;
    }
    setError("");
    setFiles((previous) => [...previous, ...list]);
  }
  async function upload() {
    if (busy || !files.length) return;
    if (demo) {
      setUploadOpen(false);
      setReview(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = new FormData();
      files.forEach((file) => data.append(category, file));
      await uploadBibleFiles(data);
      setUploaded((previous) => [
        ...previous,
        ...files.map((file) => file.name),
      ]);
      setFiles([]);
      setUploadOpen(false);
      setNotice(
        "Documents uploaded. The service will report their processing status below.",
      );
      setAttempt((value) => value + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function preview() {
    setDemo(!demo);
    setRules(demoRules);
    setFiles([]);
    setRule(null);
    setView(null);
    setReview(false);
    setNotice("");
    setError("");
  }
  const liveRules: Rule[] = Array.isArray(metrics?.rules)
    ? metrics.rules.map((r: any, i: number) => ({
        id: String(r.id || i),
        title: r.title || r.name || "Decision rule",
        action: r.action || "ask",
        amount: String(r.amount || ""),
        situation: r.situation || r.title || "",
      }))
    : [];
  const shownRules = demo ? rules : liveRules;
  const task = (id: string) =>
    metrics?.tasks?.[id] ??
    metrics?.tasks?.[
      { chart: "org", directory: "staff", sop: "sops" }[id] || id
    ];
  return (
    <main className="ws-page ws-bible">
      <header className="ws-page-heading">
        <div>
          <h1>Business Bible</h1>
          <p>
            What Haelo knows about {w.company || "your company"}. It uses this
            to write every reply.
          </p>
        </div>
        <div className="ws-page-tools">
          <button
            className="ws-button"
            disabled={!/^https:\/\//.test(metrics?.downloadUrl || "")}
            onClick={() =>
              window.open(metrics.downloadUrl, "_blank", "noopener,noreferrer")
            }
          >
            <Download size={14} />
            Download
          </button>
          <button
            className="ws-button ws-dark"
            onClick={() => {
              setFiles([]);
              setUploadOpen(true);
              setError("");
            }}
          >
            <Upload size={14} />
            Upload new version
          </button>
        </div>
      </header>
      <PreviewNotice
        active={demo}
        onToggle={preview}
        text="CSV imports are connected. Explore PDF/Word version review and decision-rule editing in sample preview."
      />
      {error && !uploadOpen && (
        <p className="ws-alert" role="alert">
          {error}{" "}
          <button onClick={() => setAttempt((value) => value + 1)}>
            Retry
          </button>
        </p>
      )}
      {notice && (
        <p className="ws-success-note" role="status">
          {notice}
        </p>
      )}
      <div className="ws-bible-grid">
        <div className="ws-bible-primary">
          <section className="ws-document-card">
            <span className="ws-round-icon">
              <FileText size={21} />
            </span>
            <div>
              <strong>
                {demo
                  ? "Example Company Business Bible.pdf"
                  : uploaded[uploaded.length - 1] ||
                    "Your Business Bible documents"}
              </strong>
              <small>
                {demo
                  ? "18 pages · Sample document"
                  : loading
                    ? "Checking document status…"
                    : `${metrics?.documentUploadCount ?? 0} documents uploaded`}
              </small>
            </div>
            <Badge
              tone={
                demo || metrics?.status === "Complete" ? "green" : "neutral"
              }
            >
              {demo ? "Read by Haelo" : metrics?.status || "No documents yet"}
            </Badge>
            <button
              className="ws-icon"
              aria-label="View Business Bible document"
              onClick={() => setView("document")}
            >
              <Eye size={16} />
            </button>
          </section>
          <section className="ws-card">
            <SectionHeader
              title="What Haelo learned"
              description="Six things it uses when writing your replies"
            />
            <div className="ws-learned-list">
              {learned.map((item) => (
                <div key={item.id}>
                  <span
                    className={`ws-round-icon${demo || task(item.id) ? " ws-learned-check" : ""}`}
                  >
                    {demo || task(item.id) ? (
                      <Check size={16} />
                    ) : (
                      <BookOpen size={15} />
                    )}
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.hint}</small>
                  </div>
                  <button onClick={() => setView(item.id)}>View</button>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="ws-bible-secondary">
          {(demo || unknown.length > 0) && (
            <section className="ws-card">
              <SectionHeader
                title={
                  demo || unknown.length !== 1
                    ? `${demo ? 2 : unknown.length} senders aren’t in your directory`
                    : "1 sender isn’t in your directory"
                }
                description="Review the people Haelo doesn’t recognise."
              />
              <div className="ws-people-tags">
                {(demo
                  ? [
                      { email: "bola@example.com", name: "Bola Ogun" },
                      { email: "david@example.com", name: "David Olu" },
                    ]
                  : unknown.slice(0, 4)
                ).map((person: any, index: number) => {
                  const name =
                    person.name ||
                    person.emailAddress ||
                    person.email ||
                    String(person);
                  return (
                    <span key={index}>
                      <i>{initials(name)}</i>
                      {name}
                    </span>
                  );
                })}
              </div>
              <Link className="ws-button" href="/dashboard/staff">
                Update directory
              </Link>
            </section>
          )}
          <section className="ws-card">
            <SectionHeader
              title="Decision rules"
              description="What Haelo does on your behalf"
              action={
                <button
                  className="ws-text-link"
                  onClick={() => setRuleList(true)}
                >
                  All {shownRules.length} <ArrowRight size={13} />
                </button>
              }
            />
            <div className="ws-rule-list">
              {shownRules.slice(0, 4).map((item) => (
                <button key={item.id} onClick={() => setRule({ ...item })}>
                  <span>{item.title}</span>
                  <Badge
                    tone={
                      item.action === "approve"
                        ? "green"
                        : item.action === "decline"
                          ? "amber"
                          : "red"
                    }
                  >
                    {item.action === "approve"
                      ? "Approve"
                      : item.action === "decline"
                        ? "Polite no"
                        : "Always ask me"}
                  </Badge>
                </button>
              ))}
              {!shownRules.length && (
                <p className="ws-help">
                  Decision-rule details aren’t provided by the current service.
                  Try the sample preview to explore this screen.
                </p>
              )}
            </div>
          </section>
          <button className="ws-text-link" onClick={template}>
            <Download size={14} />
            Download a CSV template
          </button>
        </div>
      </div>
      {uploadOpen && (
        <Overlay
          wide
          title="Upload a new version"
          subtitle={
            demo
              ? "Explore the document comparison flow with a sample."
              : "Upload a CSV category to update Haelo’s knowledge."
          }
          onClose={() => {
            if (!busy) setUploadOpen(false);
          }}
          footer={
            <>
              <button
                className="ws-button"
                disabled={busy}
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </button>
              <BusyButton busy={busy} disabled={!files.length} onClick={upload}>
                {demo ? "Continue" : "Upload documents"}
              </BusyButton>
            </>
          }
        >
          <div className="ws-form">
            <Field label="Document category">
              <select
                value={category}
                disabled={busy}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setFiles([]);
                }}
              >
                {BIBLE_DOCS.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </Field>
            <input
              ref={input}
              hidden
              type="file"
              multiple
              accept={demo ? ".pdf,.doc,.docx,.csv" : ".csv,text/csv"}
              onChange={(e) => {
                selectFiles(Array.from(e.target.files || []));
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className={`ws-upload-zone${dragging ? " dragging" : ""}`}
              disabled={busy}
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!busy) selectFiles(Array.from(e.dataTransfer.files));
              }}
            >
              <span className="ws-round-icon">
                <Upload size={22} />
              </span>
              <strong>
                {demo
                  ? "Drop your PDF or Word file here"
                  : "Drop your CSV files here"}
              </strong>
              <small>or browse your files · up to 25 MB each</small>
            </button>
            {files.map((file, index) => (
              <div className="ws-upload-file" key={`${file.name}-${index}`}>
                <FileText size={20} />
                <div>
                  <strong>{file.name}</strong>
                  <small>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                    {busy ? " · Uploading…" : ""}
                  </small>
                </div>
                {busy ? (
                  <Loader2 className="ws-spin" size={16} />
                ) : (
                  <button
                    className="ws-icon"
                    aria-label={`Remove ${file.name}`}
                    onClick={() =>
                      setFiles((items) => items.filter((_, i) => i !== index))
                    }
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button className="ws-text-link" onClick={template}>
              <Download size={13} />
              Download the template to fill in
            </button>
            <p className="ws-help">
              {demo
                ? "This preview shows an illustrative comparison, not an analysis of the selected file. No file is uploaded."
                : "The current service accepts categorized CSV files and applies accepted uploads directly. PDF/Word imports and confirm-before-replace versioning are not available yet."}
            </p>
            {error && (
              <p className="ws-alert" role="alert">
                {error}
              </p>
            )}
          </div>
        </Overlay>
      )}
      {review && (
        <Overlay
          wide
          title="Here’s what changed"
          subtitle="Sample comparison · Your workspace is unchanged until a real versioning service is connected."
          onClose={() => setReview(false)}
          footer={
            <>
              <button className="ws-button" onClick={() => setReview(false)}>
                Keep current version
              </button>
              <button
                className="ws-button ws-dark"
                onClick={() => {
                  setReview(false);
                  setNotice("New version selected in sample preview only.");
                }}
              >
                <Check size={14} />
                Use new version
              </button>
            </>
          }
        >
          <div className="ws-change-list">
            {[
              [
                "green",
                "Added",
                "2 new staff",
                "Bola Ogun, HR Officer · David Olu, Procurement Officer",
              ],
              [
                "amber",
                "Changed",
                "Payment approvals",
                "Payments above ₦500k need approval (was ₦1m)",
              ],
              [
                "green",
                "Added",
                "New procedure",
                "Daily cold room temperature checks at the Lekki branch",
              ],
              [
                "red",
                "Removed",
                "Old opening hours",
                "Saturday opening hours were removed",
              ],
            ].map(([tone, status, title, description]) => (
              <article key={title}>
                <Badge tone={tone as "green" | "amber" | "red"}>{status}</Badge>
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </Overlay>
      )}
      {view && (
        <Overlay
          drawer
          title={
            view === "document"
              ? "Business Bible document"
              : learned.find((item) => item.id === view)?.title ||
                "Business Bible"
          }
          onClose={() => setView(null)}
          footer={
            <button className="ws-button ws-dark" onClick={() => setView(null)}>
              Done
            </button>
          }
        >
          {view === "directory" ? (
            <div className="ws-mini-directory">
              {staff.map((person: any, index: number) => (
                <article key={person.id || index}>
                  <span className="ws-avatar">
                    {initials(person.name || "Staff")}
                  </span>
                  <div>
                    <strong>{person.name}</strong>
                    <small>
                      {person.role} · {person.department}
                    </small>
                  </div>
                </article>
              ))}
              {!staff.length && (
                <p className="ws-help">
                  No staff directory entries are available.
                </p>
              )}
              <Link href="/dashboard/staff" className="ws-button">
                Open staff directory <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <>
              <p className="ws-help">
                {demo
                  ? "Sample document view. A connected document service will supply the full extracted content here."
                  : "The current service provides upload status, but does not provide a document viewer or extracted content."}
              </p>
              <div className="ws-detail-box">
                <strong>
                  {view === "document"
                    ? "Uploaded documents"
                    : learned.find((item) => item.id === view)?.title}
                </strong>
                <p>
                  {demo
                    ? "Sample content available in preview"
                    : String(
                        task(view) || metrics?.status || "No status available",
                      )}
                </p>
                {uploaded.map((name, index) => (
                  <p key={index}>{name}</p>
                ))}
              </div>
              <button className="ws-button" onClick={template}>
                Download category template <Download size={13} />
              </button>
            </>
          )}
        </Overlay>
      )}
      {ruleList && (
        <Overlay
          title="Decision rules"
          onClose={() => setRuleList(false)}
          footer={
            <button className="ws-button" onClick={() => setRuleList(false)}>
              Done
            </button>
          }
        >
          <div className="ws-rule-list">
            {shownRules.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setRule({ ...item });
                  setRuleList(false);
                }}
              >
                {item.title}
                <ArrowRight size={13} />
              </button>
            ))}
            {!shownRules.length && (
              <p className="ws-help">
                No decision rules are available from the service.
              </p>
            )}
          </div>
        </Overlay>
      )}
      {rule && (
        <Overlay
          drawer
          title="Decision rule"
          subtitle={rule.situation}
          onClose={() => setRule(null)}
          footer={
            <>
              <button className="ws-button" onClick={() => setRule(null)}>
                Cancel
              </button>
              <button
                className="ws-button ws-dark"
                disabled={!demo}
                onClick={() => {
                  setRules((items) =>
                    items.map((item) =>
                      item.id === rule.id
                        ? {
                            ...rule,
                            title:
                              rule.situation === "Make a payment"
                                ? `Payments above ₦${Number(rule.amount || 0).toLocaleString()}`
                                : rule.title,
                          }
                        : item,
                    ),
                  );
                  setRule(null);
                  setNotice("Decision rule updated in sample preview.");
                }}
              >
                Save rule
              </button>
            </>
          }
        >
          <div className="ws-form">
            <Field label="When a staff member asks to">
              <select
                value={rule.situation}
                disabled={!demo}
                onChange={(e) =>
                  setRule({ ...rule, situation: e.target.value })
                }
              >
                {Array.from(
                  new Set([
                    rule.situation,
                    "Make a payment",
                    "Take annual leave",
                    "Reorder stock",
                    "Request from the board",
                  ]),
                ).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
            <Field label="And the amount is more than">
              <input
                type="number"
                min={0}
                disabled={!demo}
                value={rule.amount}
                onChange={(e) => setRule({ ...rule, amount: e.target.value })}
              />
            </Field>
            <div className="ws-field">
              <span>Haelo should</span>
              <div className="ws-choices">
                {[
                  [
                    "approve",
                    "Draft an approval",
                    "You still see it before it’s sent",
                  ],
                  [
                    "decline",
                    "Draft a polite no",
                    "Explains it needs more information",
                  ],
                  [
                    "ask",
                    "Always ask me first",
                    "Sends you the details, no draft",
                  ],
                ].map(([id, title, description]) => (
                  <Choice
                    key={id}
                    title={title}
                    description={description}
                    selected={rule.action === id}
                    disabled={!demo}
                    onClick={() => setRule({ ...rule, action: id })}
                  />
                ))}
              </div>
            </div>
            <section className="ws-detail-box ws-soft">
              <h4>
                <MessageCircle size={13} />
                Example message on WhatsApp
              </h4>
              <p>
                {rule.action === "ask"
                  ? `A staff member requests approval for ${rule.situation.toLowerCase()}. Reply YES to approve or tell Haelo what to say.`
                  : rule.action === "decline"
                    ? "Thanks for your request. Please send the supporting details before proceeding."
                    : "Approved. Please log the request and share the confirmation."}
              </p>
            </section>
            {!demo && (
              <p className="ws-help">
                Decision-rule saving requires additional service support.
              </p>
            )}
            <button
              className="ws-danger-link"
              disabled={!demo}
              onClick={() => {
                setRules((items) =>
                  items.filter((item) => item.id !== rule.id),
                );
                setRule(null);
                setNotice("Rule deleted in sample preview.");
              }}
            >
              Delete rule
            </button>
          </div>
        </Overlay>
      )}
    </main>
  );
}
