"use client";

import DashboardModal from "@/components/dashboard/Modal";
import { dashboardTheme } from "@/components/dashboard/theme";
const {
  BRAND,
  INK,
  NAVY,
  CREAM,
  WHITE,
  GOLD,
  GREEN,
  GREEN_BG,
  INK_10,
  INK_20,
  INK_40,
  INK_60,
  INK_06,
  AMBER,
  AMBER_BG,
  AMBER_BORDER,
} = dashboardTheme;

import { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  Save,
} from "lucide-react";
import {
  getUnrecognizedSenders,
  addStaff as addStaffApi,
  getStaffDirectory,
} from "@/lib/api/staff";

const GLOBAL_CSS = `


@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
@keyframes slideDown{from{opacity:0;max-height:0;transform:translateY(-6px)}to{opacity:1;max-height:600px;transform:translateY(0)}}
.fade-up{animation:fadeUp .38s cubic-bezier(.4,0,.2,1) both}
.fade-in{animation:fadeIn .22s cubic-bezier(.4,0,.2,1) both}
.slide-down{animation:slideDown .25s cubic-bezier(.4,0,.2,1) both;overflow:hidden}

/* ── LAYOUT ── */
.page-main{
  flex:1;
  padding:40px 40px 60px;
  overflow-y:auto;
  max-width:1200px;
  margin:0 auto;
  width:100%;
}

/* Page header row */
.page-header{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:24px;
  margin-bottom:32px;
}

/* Header action buttons row */
.header-actions{
  display:flex;
  gap:8px;
  align-items:center;
  flex-shrink:0;
  flex-wrap:wrap;
}

/* Edit panel fields grid: 5 cols desktop → responsive */
.edit-fields{
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:16px;
  padding:20px 20px 16px;
}

/* Unrecognised row */
.unrec-row{
  display:flex;
  align-items:center;
  gap:12px;
  padding:10px 14px;
}
.unrec-actions{
  display:flex;
  gap:6px;
  flex-shrink:0;
}

/* Table footer */
.table-footer{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:11px 20px;
  background:${CREAM};
  border-top:1px solid ${INK_10};
  flex-wrap:wrap;
  gap:8px;
}

/* Table: hide lower-priority columns on small screens */
.col-dept{ }
.col-timer{ }
.col-status{ }

/* Edit panel actions */
.edit-actions{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:12px 20px;
  border-top:1px solid ${INK_06};
  background:${CREAM};
  flex-wrap:wrap;
  gap:10px;
}

/* ── TABLET: ≤ 900px ── */
@media(max-width:900px){
  .edit-fields{
    grid-template-columns:repeat(3,1fr);
  }
  .col-dept td,.col-dept th{ display:none; }
}

/* ── MOBILE: ≤ 640px ── */
@media(max-width:640px){
  .page-main{
    padding:24px 16px 48px !important;
  }
  .page-header{
    flex-direction:column;
    gap:14px;
    margin-bottom:20px;
  }
  .header-actions{
    width:100%;
    justify-content:flex-start;
  }
  .edit-fields{
    grid-template-columns:1fr 1fr;
  }
  /* Hide Dept, Timer on mobile; keep Name, Role, Status, Actions */
  .col-dept td,.col-dept th{ display:none; }
  .col-timer td,.col-timer th{ display:none; }
  .unrec-row{
    flex-wrap:wrap;
    gap:8px;
  }
  .unrec-email{
    flex:1;
    min-width:0;
  }
}

/* ── SMALL MOBILE: ≤ 420px ── */
@media(max-width:420px){
  .edit-fields{
    grid-template-columns:1fr;
  }
  /* Also hide Status col, leaving only Name + Actions */
  .col-status td,.col-status th{ display:none; }
  .header-actions .btn-export,
  .header-actions .btn-import{
    display:none;
  }
}
`;

interface StaffMember {
  id: number;
  name: string;
  role: string;
  dept: string;
  email: string;
  status: string;
  timer: string;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 1,
    name: "Tosin Adeyemi",
    role: "Operations Manager",
    dept: "Operations",
    email: "tosin@company.com",
    status: "active",
    timer: "10 min",
  },
  {
    id: 2,
    name: "Funke Balogun",
    role: "HR Manager",
    dept: "Human Resources",
    email: "funke@company.com",
    status: "active",
    timer: "10 min",
  },
  {
    id: 3,
    name: "Emeka Obi",
    role: "Finance Analyst",
    dept: "Finance",
    email: "emeka@company.com",
    status: "active",
    timer: "5 min",
  },
  {
    id: 4,
    name: "Aisha Mohammed",
    role: "Sales Lead",
    dept: "Sales",
    email: "aisha@company.com",
    status: "active",
    timer: "10 min",
  },
  {
    id: 5,
    name: "Chidi Nwosu",
    role: "Product Manager",
    dept: "Product",
    email: "chidi@company.com",
    status: "active",
    timer: "10 min",
  },
  {
    id: 6,
    name: "Yetunde Adeyemi",
    role: "Customer Success",
    dept: "Customer Success",
    email: "yetunde@company.com",
    status: "active",
    timer: "15 min",
  },
  {
    id: 7,
    name: "Babatunde Okon",
    role: "Developer",
    dept: "Engineering",
    email: "babatunde@company.com",
    status: "inactive",
    timer: "10 min",
  },
];

const UNRECOGNISED_INIT = [
  { email: "david@company.com", received: "2h ago" },
  { email: "sarah.k@company.com", received: "5h ago" },
];

const TIMER_OPTIONS = ["5 min", "10 min", "15 min", "20 min", "30 min"];

function initials(name: string) {
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── FIELD INPUT ───────────────────────────────────────────────────────────────
function FieldInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  small,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  small?: boolean;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".07em",
          textTransform: "uppercase" as const,
          color: INK_40,
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <input
        aria-label={label}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        style={{
          width: "100%",
          fontFamily: "var(--dashboard-font), sans-serif",
          background: foc ? WHITE : CREAM,
          border: `1.5px solid ${foc ? INK : INK_10}`,
          borderRadius: 10,
          padding: small ? "8px 12px" : "11px 14px",
          fontSize: small ? 12 : 13,
          color: INK,
          outline: "none",
          boxShadow: foc ? `0 0 0 3px rgba(44,32,35,0.06)` : "none",
          transition: "all .18s",
        }}
      />
    </div>
  );
}

// ── SELECT INPUT ──────────────────────────────────────────────────────────────
function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [foc, setFoc] = useState(false);
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".07em",
          textTransform: "uppercase" as const,
          color: INK_40,
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFoc(true)}
          onBlur={() => setFoc(false)}
          style={{
            width: "100%",
            fontFamily: "var(--dashboard-font), sans-serif",
            background: foc ? WHITE : CREAM,
            border: `1.5px solid ${foc ? INK : INK_10}`,
            borderRadius: 10,
            padding: "8px 34px 8px 12px",
            fontSize: 12,
            color: INK,
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            cursor: "pointer",
            boxShadow: foc ? `0 0 0 3px rgba(44,32,35,0.06)` : "none",
            transition: "all .18s",
          }}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: `translateY(-50%) rotate(${foc ? "-180" : "0"}deg)`,
            pointerEvents: "none",
            transition: "transform .2s",
          }}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={INK_40}
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

// ── BUTTONS ───────────────────────────────────────────────────────────────────
function BtnGhost({
  onClick,
  children,
  className,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={className}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: disabled ? "transparent" : hov ? CREAM : "transparent",
        border: `1.5px solid ${disabled ? INK_10 : hov ? INK_20 : INK_10}`,
        borderRadius: 10,
        padding: "9px 14px",
        fontSize: 12,
        fontWeight: 600,
        color: disabled ? INK_20 : hov ? INK : INK_60,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--dashboard-font), sans-serif",
        transition: "all .18s",
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </button>
  );
}

function BtnInk({
  onClick,
  children,
  disabled = false,
  small,
  className,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  small?: boolean;
  className?: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: disabled ? INK_20 : hov ? "#8D2433" : BRAND,
        color: disabled ? INK_40 : "#fff",
        border: "none",
        borderRadius: 10,
        padding: small ? "7px 12px" : "9px 14px",
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--dashboard-font), sans-serif",
        transition: "all .18s",
        transform: hov && !disabled ? "translateY(-1px)" : "none",
        boxShadow: hov && !disabled ? "0 4px 14px rgba(44,32,35,0.2)" : "none",
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </button>
  );
}

function BtnDanger({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: hov ? "rgba(192,57,43,0.08)" : "transparent",
        border: `1.5px solid ${hov ? "rgba(192,57,43,0.25)" : INK_10}`,
        borderRadius: 10,
        padding: "9px 14px",
        fontSize: 12,
        fontWeight: 600,
        color: hov ? "#C0392B" : INK_60,
        cursor: "pointer",
        fontFamily: "var(--dashboard-font), sans-serif",
        transition: "all .18s",
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </button>
  );
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <Search
        size={14}
        color={INK_40}
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />
      <input
        aria-label="Search staff"
        type="text"
        placeholder="Search by name, role, or department…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        style={{
          width: "100%",
          fontFamily: "var(--dashboard-font), sans-serif",
          background: foc ? WHITE : CREAM,
          border: `1.5px solid ${foc ? INK : INK_10}`,
          borderRadius: 10,
          padding: "10px 14px 10px 40px",
          fontSize: 13,
          color: INK,
          outline: "none",
          boxShadow: foc ? `0 0 0 3px rgba(44,32,35,0.06)` : "none",
          transition: "all .18s",
        }}
      />
    </div>
  );
}

// ── UNRECOGNISED ROW ──────────────────────────────────────────────────────────
function UnrecognisedRow({
  u,
  onAdd,
  onDismiss,
}: {
  u: { email: string; received: string };
  onAdd: () => void;
  onDismiss: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="unrec-row"
      style={{
        background: hov ? WHITE : CREAM,
        border: `1.5px solid ${hov ? AMBER_BORDER : "rgba(180,83,9,0.1)"}`,
        borderRadius: 11,
        transition: "all .18s",
        boxShadow: hov ? "0 4px 14px rgba(180,83,9,0.07)" : "none",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          background: AMBER_BG,
          border: `1px solid ${AMBER_BORDER}`,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 14,
          fontWeight: 700,
          color: AMBER,
        }}
      >
        ?
      </div>
      <div className="unrec-email" style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: INK,
            marginBottom: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {u.email}
        </p>
        <p style={{ fontSize: 11, color: INK_40 }}>Received {u.received}</p>
      </div>
      <div className="unrec-actions">
        <BtnInk onClick={onAdd} small>
          <Plus size={12} /> Add
        </BtnInk>
        <BtnGhost onClick={onDismiss}>Dismiss</BtnGhost>
      </div>
    </div>
  );
}

// ── EDIT PANEL ────────────────────────────────────────────────────────────────
function EditPanel({
  staff,
  onSave,
  onCancel,
}: {
  staff: StaffMember;
  onSave: (updated: StaffMember) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: staff.name,
    role: staff.role,
    dept: staff.dept,
    email: staff.email,
    timer: staff.timer,
    status: staff.status,
  });

  const changed =
    form.name !== staff.name ||
    form.role !== staff.role ||
    form.dept !== staff.dept ||
    form.email !== staff.email ||
    form.timer !== staff.timer;

  return (
    <tr className="slide-down">
      <td colSpan={6} style={{ padding: 0, background: "transparent" }}>
        <div
          style={{
            margin: "0 0 2px",
            background: WHITE,
            border: `1.5px solid ${INK_10}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Edit header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: `1px solid ${INK_06}`,
              background: CREAM,
              flexWrap: "wrap" as const,
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: BRAND,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {initials(staff.name)}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: INK }}>
                  Editing {staff.name}
                </p>
                <p style={{ fontSize: 11, color: INK_40 }}>
                  Changes saved immediately to the staff directory
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: `1px solid ${INK_10}`,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all .15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = CREAM)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <X size={13} color={INK_40} />
            </button>
          </div>

          {/* Fields */}
          <div className="edit-fields">
            <FieldInput
              label="Full name"
              placeholder="Full name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              small
            />
            <FieldInput
              label="Role"
              placeholder="Role"
              value={form.role}
              onChange={(v) => setForm((f) => ({ ...f, role: v }))}
              small
            />
            <FieldInput
              label="Department"
              placeholder="Department"
              value={form.dept}
              onChange={(v) => setForm((f) => ({ ...f, dept: v }))}
              small
            />
            <FieldInput
              label="Email"
              placeholder="Email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              small
              type="email"
            />
            <SelectInput
              label="Timer"
              value={form.timer}
              onChange={(v) => setForm((f) => ({ ...f, timer: v }))}
              options={TIMER_OPTIONS}
            />
          </div>

          {/* Actions */}
          <div className="edit-actions">
            <button
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  status: f.status === "active" ? "inactive" : "active",
                }))
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 9,
                border: `1px solid ${INK_10}`,
                background: "transparent",
                cursor: "pointer",
                fontFamily: "var(--dashboard-font), sans-serif",
                color: form.status === "active" ? INK_60 : "#C0392B",
                transition: "all .18s",
                whiteSpace: "nowrap" as const,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = WHITE)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: form.status === "active" ? GREEN : "#C0392B",
                  flexShrink: 0,
                }}
              />
              {form.status === "active" ? "Mark as inactive" : "Mark as active"}
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <BtnGhost onClick={onCancel}>Cancel</BtnGhost>
              <BtnInk
                onClick={() => onSave({ ...staff, ...form })}
                disabled={!changed}
                small
              >
                <Save size={12} />
                {changed ? "Save changes" : "No changes"}
              </BtnInk>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── STAFF TABLE ROW ───────────────────────────────────────────────────────────
function StaffRow({
  s,
  isEditing,
  onEditToggle,
  onDelete,
}: {
  s: StaffMember;
  isEditing: boolean;
  onEditToggle: () => void;
  onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);
  const [delHov, setDelHov] = useState(false);
  const [editHov, setEditHov] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isEditing ? CREAM : hov ? CREAM : WHITE,
        transition: "background .15s",
        borderBottom: `1px solid ${INK_06}`,
        borderLeft: isEditing ? `3px solid ${INK}` : "3px solid transparent",
      }}
    >
      {/* Name */}
      <td style={{ padding: "13px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: hov || isEditing ? INK : INK_06,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: hov || isEditing ? "#fff" : INK_40,
              flexShrink: 0,
              transition: "all .2s",
            }}
          >
            {initials(s.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: INK,
                marginBottom: 1,
              }}
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
              {s.email}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td
        style={{
          padding: "13px 16px",
          fontSize: 12,
          color: INK_60,
          fontWeight: 500,
        }}
      >
        {s.role}
      </td>

      {/* Dept — hidden on mobile via CSS */}
      <td
        className="col-dept"
        style={{
          padding: "13px 16px",
          fontSize: 12,
          color: INK_60,
          fontWeight: 500,
        }}
      >
        {s.dept}
      </td>

      {/* Timer — hidden on mobile */}
      <td className="col-timer" style={{ padding: "13px 16px" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 9px",
            borderRadius: 20,
            background: INK_06,
            color: INK_60,
          }}
        >
          {s.timer}
        </span>
      </td>

      {/* Status */}
      <td className="col-status" style={{ padding: "13px 16px" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 20,
            background: s.status === "active" ? GREEN_BG : INK_06,
            color: s.status === "active" ? GREEN : INK_40,
          }}
        >
          {s.status === "active" ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: "13px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onEditToggle}
            onMouseEnter={() => setEditHov(true)}
            onMouseLeave={() => setEditHov(false)}
            title={isEditing ? "Close editor" : "Edit staff member"}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: `1px solid ${isEditing ? INK_20 : editHov ? INK_20 : "transparent"}`,
              background: isEditing ? INK : editHov ? WHITE : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {isEditing ? (
              <X size={13} color="#fff" />
            ) : (
              <Edit2 size={13} color={editHov ? INK : INK_40} />
            )}
          </button>
          <button
            onClick={onDelete}
            onMouseEnter={() => setDelHov(true)}
            onMouseLeave={() => setDelHov(false)}
            title="Remove staff member"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: `1px solid ${delHov ? "rgba(192,57,43,0.2)" : "transparent"}`,
              background: delHov ? "rgba(192,57,43,0.06)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            <Trash2 size={13} color={delHov ? "#C0392B" : INK_40} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── STAFF CARD (mobile alternative to table row) ──────────────────────────────
// Shown below 420px via CSS display switching — simple card layout
function StaffCard({
  s,
  isEditing,
  onEditToggle,
  onDelete,
}: {
  s: StaffMember;
  isEditing: boolean;
  onEditToggle: () => void;
  onDelete: () => void;
}) {
  return null; // We handle this purely via table column hiding + overflow scroll
}

// ── ADD MODAL ─────────────────────────────────────────────────────────────────
function AddModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (s: {
    name: string;
    role: string;
    email: string;
    dept: string;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState({ name: "", role: "", email: "", dept: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const valid =
    form.name.trim() &&
    form.role.trim() &&
    form.email.trim() &&
    form.dept.trim();

  const handleAdd = async () => {
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await onAdd(form);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardModal title="Add staff member" onClose={onClose}>
      <div
        className="fade-in"
        style={{
          background: WHITE,
          borderRadius: 18,
          padding: 28,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 64px rgba(67,14,22,0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase" as const,
                color: GOLD,
                marginBottom: 4,
              }}
            >
              Staff Directory
            </p>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: INK,
                letterSpacing: "-0.02em",
              }}
            >
              Add staff member
            </h2>
          </div>
          <button
            aria-label="Close add staff"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              border: `1.5px solid ${INK_10}`,
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all .15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = CREAM;
              (e.currentTarget as HTMLButtonElement).style.borderColor = INK_20;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = INK_10;
            }}
          >
            <X size={15} color={INK_40} />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <FieldInput
            label="Full name"
            placeholder="Amara Okafor"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <FieldInput
            label="Role"
            placeholder="Marketing Manager"
            value={form.role}
            onChange={(v) => setForm((f) => ({ ...f, role: v }))}
          />
          <FieldInput
            label="Email address"
            placeholder="amara@company.com"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            type="email"
          />
          <FieldInput
            label="Department"
            placeholder="Marketing"
            value={form.dept}
            onChange={(v) => setForm((f) => ({ ...f, dept: v }))}
          />
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "11px 14px",
              background: "rgba(192,57,43,0.07)",
              border: "1.5px solid rgba(192,57,43,0.2)",
              borderRadius: 10,
              marginBottom: 18,
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, color: "#C0392B" }}>
              {error}
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <BtnGhost onClick={onClose} disabled={loading}>
            Cancel
          </BtnGhost>
          <div style={{ flex: 1 }}>
            <BtnInk onClick={handleAdd} disabled={!valid || loading}>
              {loading ? (
                "Adding..."
              ) : (
                <>
                  <CheckCircle size={13} /> Add staff member
                </>
              )}
            </BtnInk>
          </div>
        </div>
      </div>
    </DashboardModal>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [unrecognised, setUnrecognised] = useState<
    { email: string; received: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tableHov, setTableHov] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const fetchUnrecognised = async () => {
      try {
        const unrecRes = await getUnrecognizedSenders(1, 7);
        if (unrecRes?.data?.senders) {
          setUnrecognised(
            unrecRes.data.senders.map((item: any) => ({
              email:
                item.emailAddress ||
                item.email ||
                (typeof item === "string" ? item : "Unknown Sender"),
              received: item.createdAt || item.received || "Recently",
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch unrecognized:", err);
      }
    };
    fetchUnrecognised();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const staffRes = await getStaffDirectory(page);

        // Deleted since unrecRes logic moved
        if (staffRes?.data?.staff) {
          setStaff(
            staffRes.data.staff.map((s: any) => ({
              id: s.id,
              name: s.name,
              role: s.role,
              dept: s.department || "",
              email: s.email,
              status:
                s.status?.toLowerCase() === "active" ? "active" : "inactive",
              timer: typeof s.timer === "number" ? `${s.timer} min` : s.timer,
            })),
          );
          setMeta(staffRes.data.meta);
        }
      } catch (err) {
        console.error("Failed to fetch staff data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [page]);

  const filtered = staff
    .filter((s) => department === "All departments" || s.dept === department)
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase()) ||
        s.dept.toLowerCase().includes(search.toLowerCase()),
    );

  const addStaff = async (form: {
    name: string;
    role: string;
    email: string;
    dept: string;
  }) => {
    await addStaffApi({
      fullName: form.name,
      role: form.role,
      email: form.email,
      department: form.dept,
    });
    setStaff((prev) => [
      ...prev,
      { id: Date.now(), ...form, status: "active", timer: "10 min" },
    ]);
  };

  const saveStaff = (updated: StaffMember) => {
    setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingId(null);
    setSavedId(updated.id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const deleteStaff = (id: number) => {
    if (editingId === id) setEditingId(null);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const dismissUnrecognised = (email: string) =>
    setUnrecognised((prev) => prev.filter((u) => u.email !== email));

  const promoteUnrecognised = (u: (typeof UNRECOGNISED_INIT)[0]) => {
    setShowAdd(true);
    dismissUnrecognised(u.email);
  };

  const downloadCSV = () => {
    const cols = ["Name", "Role", "Department", "Email", "Status", "Timer"];
    const rows = staff.map((s) => [
      s.name,
      s.role,
      s.dept,
      s.email,
      s.status,
      s.timer,
    ]);
    const csv = [
      cols.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "haelo_staff_directory.csv";
    a.click();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} onAdd={addStaff} />
      )}

      <main className="page-main staff-page">
        {/* HEADER */}
        <div className="page-header fade-up">
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
              Staff Directory
            </p>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: INK,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              Your team.
            </h1>
            <p style={{ fontSize: 13, color: INK_60, fontWeight: 500 }}>
              Every person Haelo recognises.{" "}
              <strong style={{ color: INK }}>{staff.length} members</strong> in
              your directory.
            </p>
          </div>
          <div className="header-actions">
            <BtnGhost onClick={downloadCSV} className="btn-export">
              <Download size={13} /> Export CSV
            </BtnGhost>

            <BtnInk onClick={() => setShowAdd(true)}>
              <Plus size={13} /> Add staff
            </BtnInk>
          </div>
        </div>

        {/* SAVED TOAST */}
        {savedId !== null && (
          <div
            className="fade-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "11px 16px",
              background: GREEN_BG,
              border: `1.5px solid rgba(46,125,82,0.2)`,
              borderRadius: 11,
              marginBottom: 16,
            }}
          >
            <CheckCircle size={14} color={GREEN} />
            <p style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>
              Changes saved — {staff.find((s) => s.id === savedId)?.name}
            </p>
          </div>
        )}

        {/* UNRECOGNISED ALERT */}
        {unrecognised.length > 0 && (
          <div className="fade-up" style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 18px",
                background: "transparent",
                border: `1.5px solid ${AMBER_BORDER}`,
                borderRadius: 14,
                marginBottom: 12,
              }}
            >
              <AlertCircle
                size={16}
                color={AMBER}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: INK,
                    marginBottom: 2,
                  }}
                >
                  {unrecognised.length} unrecognised sender
                  {unrecognised.length > 1 ? "s" : ""}
                </p>
                <p style={{ fontSize: 12, color: INK_60, lineHeight: 1.5 }}>
                  Haelo received emails from these addresses but doesn&apos;t
                  recognise them. Add them to the directory so future emails are
                  handled correctly.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {unrecognised.map((u) => (
                <UnrecognisedRow
                  key={u.email}
                  u={u}
                  onAdd={() => promoteUnrecognised(u)}
                  onDismiss={() => dismissUnrecognised(u.email)}
                />
              ))}
            </div>
          </div>
        )}

        <section className="directory-summary" aria-label="Directory summary">
          <div>
            <span className="workspace-eyebrow">People & context</span>
            <h2>A familiar face behind every email.</h2>
            <p>
              Keep roles and responsibilities clear so Haelo knows who’s who.
            </p>
          </div>
          <div>
            <strong>{staff.length}</strong>
            <span>people in this view</span>
          </div>
          <div>
            <strong>
              {new Set(staff.map((s) => s.dept).filter(Boolean)).size}
            </strong>
            <span>departments</span>
          </div>
        </section>
        <div
          className="department-navigation"
          aria-label="Filter staff by department"
        >
          {[
            "All departments",
            ...Array.from(new Set(staff.map((s) => s.dept).filter(Boolean))),
          ].map((d) => (
            <button
              key={d}
              aria-pressed={department === d}
              onClick={() => setDepartment(d)}
            >
              {d}
            </button>
          ))}
        </div>
        {/* SEARCH */}
        <div style={{ marginBottom: 16 }}>
          <SearchInput value={search} onChange={setSearch} />
        </div>

        {/* TABLE */}
        <div
          onMouseEnter={() => setTableHov(true)}
          onMouseLeave={() => setTableHov(false)}
          style={{
            background: WHITE,
            border: `1.5px solid ${tableHov ? INK_20 : INK_10}`,
            borderRadius: 16,
            overflow: "hidden",
            transition: "all .22s cubic-bezier(.4,0,.2,1)",
            boxShadow: tableHov ? "0 8px 32px rgba(44,32,35,0.09)" : "none",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              className="people-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 360,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: CREAM,
                    borderBottom: `1px solid ${INK_10}`,
                  }}
                >
                  <th
                    style={{
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: INK_40,
                      padding: "11px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: INK_40,
                      padding: "11px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Role
                  </th>
                  <th
                    className="col-dept"
                    style={{
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: INK_40,
                      padding: "11px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Department
                  </th>
                  <th
                    className="col-timer"
                    style={{
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: INK_40,
                      padding: "11px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Timer
                  </th>
                  <th
                    className="col-status"
                    style={{
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: INK_40,
                      padding: "11px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Status
                  </th>
                  <th style={{ padding: "11px 16px" }} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ padding: "48px 20px", textAlign: "center" }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: INK_40,
                          marginBottom: 4,
                        }}
                      >
                        No staff found
                      </p>
                      <p style={{ fontSize: 12, color: INK_20 }}>
                        Try adjusting your search.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered
                    .filter(
                      (s) =>
                        department === "All departments" ||
                        s.dept === department,
                    )
                    .map((s) => (
                      <>
                        <StaffRow
                          key={s.id}
                          s={s}
                          isEditing={editingId === s.id}
                          onEditToggle={() =>
                            setEditingId(editingId === s.id ? null : s.id)
                          }
                          onDelete={() => deleteStaff(s.id)}
                        />
                        {editingId === s.id && (
                          <EditPanel
                            key={`edit-${s.id}`}
                            staff={s}
                            onSave={saveStaff}
                            onCancel={() => setEditingId(null)}
                          />
                        )}
                      </>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="table-footer">
            <p style={{ fontSize: 11, color: INK_40, fontWeight: 500 }}>
              Showing{" "}
              <strong style={{ color: INK, fontWeight: 700 }}>
                {filtered.length}
              </strong>{" "}
              of{" "}
              <strong style={{ color: INK, fontWeight: 700 }}>
                {staff.length}
              </strong>{" "}
              staff members
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 11, color: INK_40 }}>
                <span style={{ fontWeight: 700, color: GREEN }}>
                  {staff.filter((s) => s.status === "active").length}
                </span>{" "}
                active ·{" "}
                <span style={{ fontWeight: 700, color: INK_40 }}>
                  {staff.filter((s) => s.status === "inactive").length}
                </span>{" "}
                inactive
              </span>
              <button
                onClick={downloadCSV}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  color: GREEN,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--dashboard-font), sans-serif",
                  whiteSpace: "nowrap" as const,
                }}
              >
                <Download size={11} /> Download CSV
              </button>
            </div>
          </div>

          {/* Pagination Controls */}
          {meta && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginTop: 24,
                paddingBottom: 24,
              }}
            >
              {meta.previousPage && (
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    border: `1.5px solid ${INK_20}`,
                    color: INK,
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "var(--dashboard-font), sans-serif",
                  }}
                >
                  Previous Page
                </button>
              )}
              {meta.nextPage && (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    padding: "8px 16px",
                    background: BRAND,
                    border: `1.5px solid ${INK}`,
                    color: WHITE,
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "var(--dashboard-font), sans-serif",
                  }}
                >
                  Next Page
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
