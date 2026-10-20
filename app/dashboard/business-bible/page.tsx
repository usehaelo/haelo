"use client";

import { dashboardTheme } from "@/components/dashboard/theme";
const {
  BRAND,
  INK,
  NAVY,
  CREAM,
  WHITE,
  GOLD,
  GOLD_LIGHT,
  GOLD_BG,
  GOLD_BORDER,
  GREEN,
  GREEN_BG,
  INK_10,
  INK_20,
  INK_40,
  INK_60,
  INK_06,
  INK_03,
} = dashboardTheme;

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Download,
  CheckCircle,
  FileText,
  UploadCloud,
  Info,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { getStaffDirectory } from "@/lib/api/staff";
import { uploadBibleFiles, getBibleMetrics } from "@/lib/api/onboard";

// ── TOKENS ───────────────────────────────────────────────────────────────────

const GLOBAL_CSS = `


@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-up{animation:fadeUp .38s cubic-bezier(.4,0,.2,1) both}
.stagger-1{animation-delay:.04s}.stagger-2{animation-delay:.08s}.stagger-3{animation-delay:.12s}

/* ── LAYOUT ── */
.page-main{
  flex:1;
  padding:40px 40px 60px;
  overflow-y:auto;
  max-width:1200px;
  margin:0 auto;
  width:100%;
}

/* Summary bar: 4-col → 2-col → 1-col */
.summary-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
}
.summary-cell{
  padding:0 20px;
}
.summary-cell:not(:last-child){
  border-right:1px solid ${INK_10};
}

/* Main 2-col layout */
.main-grid{
  display:grid;
  grid-template-columns:1fr 320px;
  gap:16px;
  align-items:start;
}

/* Right column */
.right-col{
  display:flex;
  flex-direction:column;
  gap:16px;
}

/* Staff template grid: 5 cols */
.staff-template-grid{
  display:grid;
  grid-template-columns:repeat(5,1fr);
}

/* Category tabs: wrap on small screens */
.tab-row{
  display:flex;
  gap:6px;
  flex-wrap:wrap;
}

/* ── TABLET: ≤ 900px ── */
@media(max-width:900px){
  .main-grid{
    grid-template-columns:1fr;
  }
  .right-col{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:16px;
  }
  .summary-grid{
    grid-template-columns:repeat(2,1fr);
    gap:14px 0;
  }
  .summary-cell:not(:last-child){
    border-right:none;
  }
  .summary-cell:nth-child(odd){
    border-right:1px solid ${INK_10};
  }
  .summary-cell{
    padding:8px 16px;
  }
}

/* ── MOBILE: ≤ 600px ── */
@media(max-width:600px){
  .page-main{
    padding:24px 16px 48px !important;
  }
  .summary-grid{
    grid-template-columns:1fr 1fr;
    gap:14px 0;
  }
  .summary-cell{
    padding:8px 14px;
  }
  .summary-cell:nth-child(odd){
    border-right:1px solid ${INK_10};
  }
  .main-grid{
    grid-template-columns:1fr;
  }
  .right-col{
    display:flex;
    flex-direction:column;
    gap:12px;
  }
  .staff-template-grid{
    grid-template-columns:repeat(3,1fr);
  }
  .staff-template-grid .staff-col-4,
  .staff-template-grid .staff-col-5{
    display:none;
  }
  .doc-header{
    flex-direction:column;
    gap:10px;
  }
  .doc-icon-wrap{
    width:36px !important;
    height:36px !important;
  }
}

/* ── SMALL MOBILE: ≤ 380px ── */
@media(max-width:380px){
  .summary-grid{
    grid-template-columns:1fr;
  }
  .summary-cell:nth-child(odd){
    border-right:none;
  }
  .summary-cell:not(:last-child){
    border-bottom:1px solid ${INK_10};
  }
  .staff-template-grid{
    grid-template-columns:repeat(2,1fr);
  }
  .staff-template-grid .staff-col-3,
  .staff-template-grid .staff-col-4,
  .staff-template-grid .staff-col-5{
    display:none;
  }
}
`;

// ── DATA ─────────────────────────────────────────────────────────────────────
const BIBLE_DOCS = [
  {
    id: "overview",
    icon: "🏢",
    name: "Company Overview",
    required: true,
    hint: "What your company does, who it serves, its core values and how it operates.",
    accept: ".csv",
    templateCols: ["section", "content"],
    templateRows: [
      ["Company name & industry", "e.g. Acme Corp — FMCG distribution"],
      ["What we do", "Products / services description"],
      ["Who we serve", "Target clients and markets"],
      ["Company values", "Core principles and culture"],
      ["Key facts", "Founded, headcount, revenue range"],
    ],
    templateFile: "haelo_company_overview_template.csv",
    aiPrompt:
      "Fill this template for my company. We are called [name] and we do [description]. Format it as Section | Content.",
    isStaff: false,
  },
  {
    id: "staff",
    icon: "👥",
    name: "Staff Directory",
    required: true,
    hint: "Every person Haelo will recognise. Must include first name, last name, role, email, and a one-sentence description.",
    accept: ".csv",
    isStaff: true,
    templateFile: "haelo_staff_directory_template.csv",
    aiPrompt:
      "Fill this staff directory CSV for my team. My staff: [list names, roles]. Add a one-sentence description per person. Columns: First Name, Last Name, Role, Email, Description.",
    templateCols: undefined as string[] | undefined,
    templateRows: undefined as string[][] | undefined,
  },
  {
    id: "org",
    icon: "🏗️",
    name: "Org Chart",
    required: true,
    hint: "Your hierarchy and reporting lines. Helps Haelo understand seniority and route responses correctly.",
    accept: ".csv",
    templateCols: ["name", "reportsTo", "department", "level"],
    templateRows: [
      ["John Adeyemi", "CEO", "Executive", "Director"],
      ["Grace Obi", "John Adeyemi", "Operations", "Manager"],
      ["Finance Team", "Grace Obi", "Finance", "Team Lead"],
    ],
    templateFile: "haelo_org_structure_template.csv",
    aiPrompt:
      "Create an org chart CSV for my company. Hierarchy: [describe]. Columns: Name, Reports To, Department, Level.",
    isStaff: false,
  },
  {
    id: "sops",
    icon: "📋",
    name: "SOPs & Policies",
    required: false,
    hint: "Approval thresholds, leave policies, procurement rules, escalation paths.",
    accept: ".csv",
    templateCols: ["situation", "action", "whoApproves"],
    templateRows: [
      ["Leave request", "Approve if 5 days notice & cover confirmed", "CEO"],
      [
        "Purchase above ₦500k",
        "Requires Finance + CEO sign-off",
        "CEO + Finance",
      ],
      ["Client complaint", "Acknowledge 2hrs, resolve 24hrs", "Ops Manager"],
    ],
    templateFile: "haelo_sops_template.csv",
    aiPrompt:
      "Create a SOPs document for my business. Key processes: [describe]. Format: Situation | Standard Action | Who Approves.",
    isStaff: false,
  },
  {
    id: "comms",
    icon: "💬",
    name: "Comms Style",
    required: false,
    hint: "How you communicate — formal or direct, long or brief, phrases you use or avoid.",
    accept: ".csv",
    templateCols: ["aspect", "preference"],
    templateRows: [
      ["Tone", "e.g. Direct and brief"],
      ["With senior staff", "e.g. Peer-to-peer, no formality"],
      ["With junior staff", "e.g. Warm but firm, action-oriented"],
      ["Phrases to avoid", 'e.g. filler words, "I will try"'],
      ["Format", "e.g. One idea per message"],
    ],
    templateFile: "haelo_comms_style_template.csv",
    aiPrompt:
      "Write a communication style guide for my AI assistant. My preferences: [describe]. Format: Aspect | Your Preference.",
    isStaff: false,
  },
];

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  processing: boolean;
}

const EXT_ICON: Record<string, string> = {
  pdf: "📄",
  docx: "📝",
  doc: "📝",
  csv: "📊",
  xlsx: "📊",
  xls: "📊",
  txt: "📃",
  png: "🖼️",
  jpg: "🖼️",
  jpeg: "🖼️",
};
const EXT_COLOR: Record<string, string> = {
  pdf: "#E74C3C",
  docx: "#2980B9",
  doc: "#2980B9",
  csv: "#27AE60",
  xlsx: "#27AE60",
  xls: "#27AE60",
  txt: "#7F8C8D",
  png: "#8E44AD",
  jpg: "#8E44AD",
  jpeg: "#8E44AD",
};

const versionHistory = [
  { version: "v3", date: "Jun 18, 2026", docs: 5, staff: 47, active: true },
  { version: "v2", date: "May 2, 2026", docs: 3, staff: 41, active: false },
  { version: "v1", date: "Apr 10, 2026", docs: 2, staff: 35, active: false },
];

// identifiedStaff array is now handled in the component state
// ── HELPERS ──────────────────────────────────────────────────────────────────
function downloadCSV(filename: string, cols: string[], rows: string[][]) {
  const csv = [
    cols.join(","),
    ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
  ].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = filename;
  a.click();
}

function downloadStaffTemplate() {
  const csv =
    'firstName,lastName,role,email,description\nTosin,Adeyemi,Operations Manager,tosin@company.com,"Manages day-to-day operations and procurement approvals"\nFunke,Balogun,HR Manager,funke@company.com,"Handles leave requests, recruitment, and staff welfare"\n';
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "haelo_staff_directory_template.csv";
  a.click();
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
        padding: 24,
        transition: "all .22s cubic-bezier(.4,0,.2,1)",
        boxShadow: hov ? "0 8px 32px rgba(44,32,35,0.09)" : "none",
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

// ── FILE ROW ──────────────────────────────────────────────────────────────────
function FileRow({
  file,
  onRemove,
}: {
  file: UploadedFile;
  onRemove: (id: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: hov ? WHITE : CREAM,
        border: `1.5px solid ${hov ? INK_20 : INK_10}`,
        borderRadius: 10,
        transition: "all .18s",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: `${EXT_COLOR[ext] || "#7F8C8D"}15`,
          color: EXT_COLOR[ext] || "#7F8C8D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {EXT_ICON[ext] || "📎"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: INK,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.name}
        </div>
        <div style={{ fontSize: 10, color: INK_40, marginTop: 1 }}>
          {file.size}
        </div>
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: "3px 9px",
          borderRadius: 20,
          flexShrink: 0,
          background: file.processing ? INK_06 : GREEN_BG,
          color: file.processing ? INK_40 : GREEN,
        }}
      >
        {file.processing ? "Processing…" : "Uploaded"}
      </span>
      {!file.processing && (
        <button
          aria-label={`Remove ${file.name}`}
          onClick={() => onRemove(file.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: hov ? "#C0392B" : INK_20,
            fontSize: 16,
            padding: "2px 5px",
            borderRadius: 5,
            lineHeight: 1,
            transition: "all .15s",
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ── TAB BUTTON ────────────────────────────────────────────────────────────────
function BibleTabBtn({
  doc,
  active,
  hasFiles,
  onClick,
}: {
  doc: (typeof BIBLE_DOCS)[0];
  active: boolean;
  hasFiles: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 12px",
        borderRadius: 20,
        border: `1.5px solid ${active ? INK : hasFiles ? GREEN : hov ? INK_20 : INK_10}`,
        background: active ? BRAND : "transparent",
        color: active ? "#fff" : hasFiles ? GREEN : hov ? INK : INK_40,
        cursor: "pointer",
        fontFamily: "var(--dashboard-font), sans-serif",
        transition: "all .18s",
        whiteSpace: "nowrap" as const,
      }}
    >
      {hasFiles && !active ? "✓ " : ""}
      {doc.icon} {doc.name}
      {doc.required && !active ? (
        <span style={{ color: GOLD, marginLeft: 2 }}>*</span>
      ) : null}
    </button>
  );
}

interface StaffItem {
  name: string;
  role: string;
  dept: string;
  email: string;
}

function StaffRow({ s }: { s: StaffItem }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 12,
        background: hov ? CREAM : "transparent",
        transition: "all .18s",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
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
        }}
      >
        {s.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 1 }}
        >
          {s.name}
        </p>
        <p
          style={{
            fontSize: 11,
            color: INK_40,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {s.role} · {s.dept}
        </p>
      </div>
      <CheckCircle size={14} color={GREEN} style={{ flexShrink: 0 }} />
    </div>
  );
}

// ── VERSION ROW ───────────────────────────────────────────────────────────────
function VersionRow({ v }: { v: (typeof versionHistory)[0] }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        background: v.active
          ? hov
            ? "rgba(46,125,82,0.1)"
            : GREEN_BG
          : hov
            ? CREAM
            : "transparent",
        border: `1.5px solid ${v.active ? "rgba(46,125,82,0.2)" : hov ? INK_10 : "transparent"}`,
        transition: "all .2s",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: v.active ? GREEN_BG : INK_06,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <FileText size={14} color={v.active ? GREEN : INK_40} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 2,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: INK }}>
            {v.version}
          </p>
          {v.active && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 20,
                background: GREEN_BG,
                color: GREEN,
              }}
            >
              Active
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: INK_40 }}>
          {v.date} · {v.docs} docs · {v.staff} staff
        </p>
      </div>
      {!v.active && (
        <button
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: GREEN,
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            fontFamily: "var(--dashboard-font), sans-serif",
          }}
        >
          Restore
        </button>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function BusinessBiblePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [uploads, setUploads] = useState<Record<string, UploadedFile[]>>({});
  const [dragOver, setDragOver] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [summaryHov, setSummaryHov] = useState(false);
  const [staffHov, setStaffHov] = useState(false);
  const [historyHov, setHistoryHov] = useState(false);
  const [guideHov, setGuideHov] = useState(false);

  const [identifiedStaff, setIdentifiedStaff] = useState<any[]>([]);

  const [metrics, setMetrics] = useState<any>(null);

  const fetchMetrics = async () => {
    try {
      const res = await getBibleMetrics();
      if (res?.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffRes = await getStaffDirectory(1);
        if (staffRes?.data?.staff) {
          setIdentifiedStaff(
            staffRes.data.staff.map((s: any) => ({
              name: s.name,
              role: s.role,
              dept: s.department || "",
              email: s.email,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch staff data:", err);
      }
    };
    fetchStaff();
    fetchMetrics();
  }, []);

  const doc = BIBLE_DOCS.find((d) => d.id === activeTab)!;
  const currentFiles = uploads[activeTab] || [];

  const doneCount = metrics ? metrics.documentUploadCount : 0;
  const allRequired = metrics ? metrics.status === "Complete" : false;
  const identifiedCount = metrics ? metrics.staffCount : 0;
  const lastUpdatedStr =
    metrics && metrics.uploadedDocumentCountUpdatedAt
      ? new Date(metrics.uploadedDocumentCountUpdatedAt).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric", year: "numeric" },
        )
      : "N/A";

  const handleFiles = useCallback(
    async (files: File[]) => {
      setAlert(null);
      const validFiles = files.filter((f) =>
        f.name.toLowerCase().endsWith(".csv"),
      );

      if (validFiles.length === 0 && files.length > 0) {
        setAlert({ type: "error", text: "Only CSV files are accepted." });
        return;
      }

      setAlert({
        type: "success",
        text: `Uploading ${validFiles.length} file(s)...`,
      });

      // Upload each file individually
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileId = `${Date.now()}-${Math.random()}`;

        try {
          const formData = new FormData();

          let fieldName = activeTab;
          if (activeTab === "staff") fieldName = "directory";
          else if (activeTab === "org") fieldName = "chart";
          else if (activeTab === "sops") fieldName = "sop";

          formData.append(fieldName, file);

          const res = await uploadBibleFiles(formData);

          if (res?.status === "success" || res?.ok !== false) {
            // If successful, add to dashboard list
            const newFile: UploadedFile = {
              id: fileId,
              name: file.name,
              size:
                file.size > 1048576
                  ? `${(file.size / 1048576).toFixed(1)} MB`
                  : `${Math.round(file.size / 1024)} KB`,
              processing: false,
            };
            setUploads((prev) => ({
              ...prev,
              [activeTab]: [...(prev[activeTab] || []), newFile],
            }));
            setAlert({
              type: "success",
              text: `${file.name} uploaded successfully.`,
            });
            fetchMetrics(); // Refresh metrics
          } else {
            setAlert({
              type: "error",
              text: res?.message || `Failed to upload ${file.name}.`,
            });
          }
        } catch (err: any) {
          console.error("Failed to upload file:", file.name, err);
          setAlert({
            type: "error",
            text:
              err.message || `An error occurred while uploading ${file.name}.`,
          });
        }
      }
    },
    [activeTab],
  );

  const removeFile = (id: string) =>
    setUploads((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).filter((f) => f.id !== id),
    }));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <main className="page-main bible-page">
        {/* ── HEADER ── */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
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
            Business Bible
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
            Company knowledge base
          </h1>
          <p style={{ fontSize: 13, color: INK_60, fontWeight: 500 }}>
            The documents that teach Haelo your business. Upload once —
            referenced on every email, forever.
          </p>
        </div>

        {/* ── SUMMARY BAR ── */}
        <Card
          hov={summaryHov}
          onEnter={() => setSummaryHov(true)}
          onLeave={() => setSummaryHov(false)}
          style={{ marginBottom: 20, padding: "18px 4px" }}
        >
          <div className="summary-grid">
            {[
              {
                label: "Documents uploaded",
                value: `${doneCount} / ${BIBLE_DOCS.length}`,
              },
              { label: "Staff identified", value: identifiedCount.toString() },
              { label: "Last updated", value: lastUpdatedStr },
              {
                label: "Status",
                value: allRequired ? "Complete" : "Incomplete",
                highlight: true,
              },
            ].map((m) => (
              <div key={m.label} className="summary-cell">
                <p
                  style={{
                    fontSize: 11,
                    color: INK_40,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    marginBottom: 4,
                  }}
                >
                  {m.label}
                </p>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: m.highlight ? (allRequired ? GREEN : GOLD) : INK,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="main-grid">
          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Progress bar */}
            <div
              style={{
                height: 2,
                background: INK_10,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: BRAND,
                  borderRadius: 2,
                  width: `${Math.max(4, (doneCount / BIBLE_DOCS.length) * 100)}%`,
                  transition: "width .55s cubic-bezier(.4,0,.2,1)",
                }}
              />
            </div>

            {/* Category tabs */}
            <div className="tab-row">
              {BIBLE_DOCS.map((d) => {
                const docKey = d.id === "org" ? "chart" : d.id;
                const hasFiles =
                  (uploads[d.id] || []).length > 0 ||
                  metrics?.tasks?.[docKey] ||
                  false;
                return (
                  <BibleTabBtn
                    key={d.id}
                    doc={d}
                    active={d.id === activeTab}
                    hasFiles={hasFiles}
                    onClick={() => setActiveTab(d.id)}
                  />
                );
              })}
            </div>

            {/* Active doc card */}
            <div
              style={{
                background: WHITE,
                border: `1.5px solid ${INK_10}`,
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 1px 12px rgba(44,32,35,0.05)",
              }}
            >
              {/* Section header */}
              <div
                className="doc-header"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div
                  className="doc-icon-wrap"
                  style={{
                    width: 42,
                    height: 42,
                    background: BRAND,
                    borderRadius: 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {doc.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: INK,
                      letterSpacing: "-.015em",
                      marginBottom: 3,
                    }}
                  >
                    {doc.name}
                    {doc.required && (
                      <span
                        style={{ color: GOLD, marginLeft: 4, fontSize: 13 }}
                      >
                        *
                      </span>
                    )}
                    {((uploads[doc.id] || []).length > 0 ||
                      metrics?.tasks?.[
                        doc.id === "org" ? "chart" : doc.id
                      ]) && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: GREEN_BG,
                          color: GREEN,
                        }}
                      >
                        Uploaded
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: INK_60, lineHeight: 1.6 }}>
                    {doc.hint}
                  </div>
                </div>
              </div>

              {/* Template block */}
              {doc.isStaff ? (
                <div
                  style={{
                    background: NAVY,
                    borderRadius: 12,
                    padding: 18,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 14,
                      flexWrap: "wrap" as const,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".08em",
                        textTransform: "uppercase" as const,
                        color: GOLD_LIGHT,
                      }}
                    >
                      📥 Staff Directory Template
                    </span>
                    <button
                      onClick={downloadStaffTemplate}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: GOLD_BG,
                        color: BRAND,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "5px 11px",
                        borderRadius: 7,
                        border: `1px solid ${GOLD_BORDER}`,
                        cursor: "pointer",
                        fontFamily: "var(--dashboard-font), sans-serif",
                      }}
                    >
                      ↓ Download CSV
                    </button>
                  </div>
                  <div
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      overflow: "hidden",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      className="staff-template-grid"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    >
                      {[
                        "First Name",
                        "Last Name",
                        "Role",
                        "Email",
                        "Description",
                      ].map((col, idx) => (
                        <div
                          key={col}
                          className={`staff-col-${idx + 1}`}
                          style={{
                            padding: "7px 10px",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: ".06em",
                            textTransform: "uppercase" as const,
                            color: "rgba(255,255,255,0.6)",
                            borderRight: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          {col}
                          <span style={{ color: GOLD_LIGHT, marginLeft: 2 }}>
                            *
                          </span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="staff-template-grid"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {[
                        "Tosin",
                        "Adeyemi",
                        "Ops Manager",
                        "tosin@co.com",
                        "Manages daily operations…",
                      ].map((cell, idx) => (
                        <div
                          key={idx}
                          className={`staff-col-${idx + 1}`}
                          style={{
                            padding: "7px 10px",
                            fontSize: 11,
                            color: "rgba(255,255,255,0.8)",
                            fontStyle: "italic",
                            borderRight: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          {cell}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${GOLD_BORDER}`,
                      borderRadius: 9,
                      padding: "10px 12px",
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>✨</span>
                    <p
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      <strong style={{ color: GOLD_LIGHT }}>
                        Build this fast with AI.
                      </strong>{" "}
                      Download the template, then tell Claude or ChatGPT:{" "}
                      <em style={{ color: "rgba(255,255,255,0.8)" }}>
                        &quot;Fill this CSV with my team. Staff: [list names and
                        roles]. Add a one-sentence description per person.&quot;
                      </em>
                    </p>
                  </div>
                </div>
              ) : doc.templateCols ? (
                <div
                  style={{
                    background: NAVY,
                    borderRadius: 12,
                    padding: 18,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 14,
                      flexWrap: "wrap" as const,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".08em",
                        textTransform: "uppercase" as const,
                        color: GOLD_LIGHT,
                      }}
                    >
                      📥 {doc.name} Template
                    </span>
                    <button
                      onClick={() =>
                        downloadCSV(
                          doc.templateFile!,
                          doc.templateCols!,
                          doc.templateRows!,
                        )
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: GOLD_BG,
                        color: BRAND,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "5px 11px",
                        borderRadius: 7,
                        border: `1px solid ${GOLD_BORDER}`,
                        cursor: "pointer",
                        fontFamily: "var(--dashboard-font), sans-serif",
                      }}
                    >
                      ↓ Download template
                    </button>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 9,
                      padding: "11px 14px",
                      marginBottom: 12,
                      overflowX: "auto" as const,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: doc.templateCols
                          .map(() => "1fr")
                          .join(" "),
                        gap: 12,
                        paddingBottom: 6,
                        marginBottom: 6,
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        minWidth: 260,
                      }}
                    >
                      {doc.templateCols.map((c) => (
                        <span
                          key={c}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: ".06em",
                            textTransform: "uppercase" as const,
                            color: "rgba(255,255,255,0.8)",
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    {doc.templateRows!.slice(0, 3).map((row, ri) => (
                      <div
                        key={ri}
                        style={{
                          display: "grid",
                          gridTemplateColumns: doc
                            .templateCols!.map(() => "1fr")
                            .join(" "),
                          gap: 12,
                          paddingBottom: 4,
                          marginBottom: 4,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          minWidth: 260,
                        }}
                      >
                        {row.map((cell, ci) => (
                          <span
                            key={ci}
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.8)",
                              fontStyle: "italic",
                            }}
                          >
                            {cell}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${GOLD_BORDER}`,
                      borderRadius: 9,
                      padding: "10px 12px",
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>✨</span>
                    <p
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      <strong style={{ color: GOLD_LIGHT }}>
                        Build this fast with AI.
                      </strong>{" "}
                      Download the template, then prompt:{" "}
                      <em style={{ color: "rgba(255,255,255,0.8)" }}>
                        &quot;{doc.aiPrompt}&quot;
                      </em>
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(Array.from(e.dataTransfer.files));
                }}
                role="button"
                tabIndex={0}
                aria-label={`Upload ${doc.name} CSV`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileRef.current?.click();
                  }
                }}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? INK : INK_20}`,
                  borderRadius: 12,
                  padding: "28px 20px",
                  textAlign: "center" as const,
                  cursor: "pointer",
                  background: dragOver ? INK_03 : "transparent",
                  transition: "all .2s",
                  marginBottom: 14,
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={doc.accept}
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files) handleFiles(Array.from(e.target.files));
                  }}
                />
                <div style={{ fontSize: 22, marginBottom: 8 }}>📎</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: INK,
                    marginBottom: 3,
                  }}
                >
                  Drop files here or click to browse
                </div>
                <div style={{ fontSize: 11, color: INK_40 }}>
                  Only CSV files are accepted
                </div>
              </div>

              {alert && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: "10px 12px",
                    background:
                      alert.type === "error"
                        ? "rgba(180,83,9,0.1)"
                        : "rgba(46,125,82,0.1)",
                    color: alert.type === "error" ? "#B45309" : GREEN,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {alert.text}
                </div>
              )}

              {currentFiles.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    marginBottom: 10,
                  }}
                >
                  {currentFiles.map((f) => (
                    <FileRow key={f.id} file={f} onRemove={removeFile} />
                  ))}
                </div>
              )}

              {!doc.required && (
                <p style={{ fontSize: 11, color: INK_40 }}>
                  Optional — you can add this later from the Business Bible
                  page.
                </p>
              )}
            </div>

            {/* Staff identified card */}
            <Card
              hov={staffHov}
              onEnter={() => setStaffHov(true)}
              onLeave={() => setStaffHov(false)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
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
                  Staff identified
                </h2>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: GREEN_BG,
                    color: GREEN,
                  }}
                >
                  {identifiedStaff.length} found
                </span>
              </div>
              <div style={{ height: 1, background: INK_10, marginBottom: 6 }} />
              <div>
                {identifiedStaff.map((s) => (
                  <StaffRow key={s.email} s={s} />
                ))}
              </div>
            </Card>
          </div>

          {/* ── RIGHT ── */}
          <div className="right-col">
            {/* Version history
            <Card hov={historyHov} onEnter={() => setHistoryHov(true)} onLeave={() => setHistoryHov(false)}>
              <h2 style={{ fontSize:13, fontWeight:700, color:INK, letterSpacing:'-.01em', marginBottom:14 }}>Version history</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {versionHistory.map(v => <VersionRow key={v.version} v={v} />)}
              </div>
            </Card> */}

            {/* What to include */}
            <Card
              hov={guideHov}
              onEnter={() => setGuideHov(true)}
              onLeave={() => setGuideHov(false)}
            >
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: INK,
                  letterSpacing: "-.01em",
                  marginBottom: 14,
                }}
              >
                What to include
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Company overview and services",
                  "Organisational structure",
                  "Full staff directory with roles",
                  "Standard operating procedures",
                  "Decision-making rules",
                  "Communication preferences",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 9,
                    }}
                  >
                    <CheckCircle
                      size={13}
                      color={GREEN}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <p style={{ fontSize: 12, color: INK_60, lineHeight: 1.5 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: NAVY,
                  borderRadius: 12,
                  padding: 16,
                  marginTop: 18,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase" as const,
                    color: GOLD_LIGHT,
                    marginBottom: 8,
                  }}
                >
                  ✨ Pro tip
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                    marginBottom: 12,
                  }}
                >
                  Use AI to build your Business Bible documents in minutes.
                  Download any template, paste it into Claude or ChatGPT with
                  your company details, and upload the result.
                </p>
                <button
                  onClick={() =>
                    downloadCSV(
                      "haelo_company_overview_template.csv",
                      ["Section", "Content"],
                      [
                        ["Company name & industry", ""],
                        ["What we do", ""],
                        ["Who we serve", ""],
                        ["Company values", ""],
                        ["Key facts", ""],
                      ],
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    width: "100%",
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "var(--dashboard-font), sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "10px",
                    borderRadius: 9,
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "all .18s",
                  }}
                >
                  <Download size={13} /> Download all templates
                </button>
              </div>
            </Card>

            {/* Required docs progress */}
            <Card hov={false} style={{ padding: "18px 20px" }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase" as const,
                  color: INK_40,
                  marginBottom: 14,
                }}
              >
                Required documents
              </p>
              {BIBLE_DOCS.filter((d) => d.required).map((d) => {
                const docKey = d.id === "org" ? "chart" : d.id;
                const has =
                  (uploads[d.id] || []).length > 0 ||
                  metrics?.tasks?.[docKey] ||
                  false;
                return (
                  <div
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      borderBottom: `1px solid ${INK_06}`,
                    }}
                  >
                    <span style={{ fontSize: 15, flexShrink: 0 }}>
                      {d.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: INK,
                        flex: 1,
                      }}
                    >
                      {d.name}
                    </span>
                    {has ? (
                      <CheckCircle size={14} color={GREEN} />
                    ) : (
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: `1.5px solid ${INK_20}`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{ fontSize: 11, color: INK_40, fontWeight: 500 }}
                  >
                    Completeness
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: allRequired ? GREEN : GOLD,
                    }}
                  >
                    {Math.round((doneCount / BIBLE_DOCS.length) * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: INK_10,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: allRequired ? GREEN : GOLD,
                      borderRadius: 4,
                      width: `${Math.max(4, (doneCount / BIBLE_DOCS.length) * 100)}%`,
                      transition: "width .55s cubic-bezier(.4,0,.2,1)",
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
