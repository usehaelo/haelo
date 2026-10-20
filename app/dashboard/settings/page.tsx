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
  GOLD_LIGHT,
  GOLD_BG,
  GREEN,
  GREEN_BG,
  INK_10,
  INK_20,
  INK_40,
  INK_60,
  INK_06,
  RED,
  RED_BG,
} = dashboardTheme;

import { useState, useEffect, useRef } from "react";
import {
  Save,
  CheckCircle,
  AlertCircle,
  Zap,
  Bell,
  Layers,
  Shield,
  Mail,
  Smartphone,
  Plus,
  Users,
  UserPlus,
  MoreVertical,
  X,
} from "lucide-react";
import {
  saveTimerConfig,
  getHaeloTone,
  getProviders,
  connectEmail,
  getNotificationSettings,
  saveNotificationSettings,
  addWhatsappNumber,
  verifyWhatsappNumber,
  getWhatsappNumber,
  getDomain,
  saveDomain,
  revokeEmailAccess,
} from "@/lib/api/onboard";
import {
  getAccounts,
  inviteAccount,
  resendInvite,
  removeAccount,
  type OrgAccount,
  type AccountRole,
} from "@/lib/api/accounts";

// ── TOKENS ───────────────────────────────────────────────────────────────────

const GLOBAL_CSS = `


@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideRight{from{transform:translateX(-2px)}to{transform:translateX(2px)}}
.fade-up{animation:fadeUp .38s cubic-bezier(.4,0,.2,1) both}
.fade-in{animation:fadeIn .3s ease both}

/* Responsive helpers */
@media(max-width:768px){
  .settings-grid{grid-template-columns:1fr!important}
  .two-col{grid-template-columns:1fr!important}
  .hide-mobile{display:none!important}
  .main-pad{padding:24px 20px 48px!important}
}
`;

// ── SECTION CARD ─────────────────────────────────────────────────────────────
function SectionCard({
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
        padding: "28px",
        transition: "all .22s cubic-bezier(.4,0,.2,1)",
        boxShadow: hov ? "0 8px 32px rgba(44,32,35,0.09)" : "none",
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 22,
        paddingBottom: 18,
        borderBottom: `1px solid ${INK_06}`,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          background: INK_06,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ color: INK_40, display: "flex" }}>{icon}</span>
      </div>
      <div>
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: INK,
            letterSpacing: "-.015em",
            marginBottom: 2,
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: 12, color: INK_60, lineHeight: 1.55 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── FIELD LABEL ───────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".07em",
        textTransform: "uppercase" as const,
        color: INK_40,
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

// ── SELECT INPUT ─────────────────────────────────────────────────────────────
function SelectInput({
  value,
  onChange,
  children,
  label,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        style={{
          width: "100%",
          appearance: "none",
          WebkitAppearance: "none",
          fontFamily: "var(--dashboard-font), sans-serif",
          background: foc ? WHITE : CREAM,
          border: `1.5px solid ${foc ? INK : INK_10}`,
          borderRadius: 10,
          padding: "11px 38px 11px 14px",
          fontSize: 13,
          fontWeight: 600,
          color: INK,
          outline: "none",
          cursor: "pointer",
          boxShadow: foc ? `0 0 0 3px rgba(44,32,35,0.06)` : "none",
          transition: "all .18s",
        }}
      >
        {children}
      </select>
      <svg
        style={{
          position: "absolute",
          right: 13,
          top: "50%",
          transform: `translateY(-50%) rotate(${foc ? "-180" : "0"}deg)`,
          pointerEvents: "none",
          transition: "transform .2s",
        }}
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke={INK_40}
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

// ── TEXT INPUT ────────────────────────────────────────────────────────────────
function TextInput({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  label,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <input
      aria-label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
      style={{
        width: "100%",
        fontFamily: "var(--dashboard-font), sans-serif",
        background: disabled ? CREAM : foc ? WHITE : CREAM,
        border: `1.5px solid ${disabled ? INK_10 : foc ? INK : INK_10}`,
        borderRadius: 10,
        padding: "11px 14px",
        fontSize: 13,
        color: disabled ? INK_60 : INK,
        outline: "none",
        boxShadow: foc && !disabled ? "0 0 0 3px rgba(44,32,35,0.06)" : "none",
        transition: "all .18s",
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? "not-allowed" : "text",
      }}
    />
  );
}

// ── TIMER MODE OPTION ────────────────────────────────────────────────────────
function TimerModeOpt({
  id,
  label,
  tagline,
  desc,
  icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  tagline: string;
  desc: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "16px 18px",
        background: active ? WHITE : hov ? CREAM : "transparent",
        border: `1.5px solid ${active ? INK : hov ? INK_20 : INK_10}`,
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        fontFamily: "var(--dashboard-font), sans-serif",
        transform: hov && !active ? "translateX(2px)" : "none",
        transition: "all .2s cubic-bezier(.4,0,.2,1)",
        position: "relative",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: BRAND,
            borderRadius: "2px 0 0 2px",
          }}
        />
      )}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: active ? INK_06 : INK_06,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <span
          style={{
            color: active ? INK : INK_40,
            display: "flex",
            transition: "color .18s",
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>
            {label}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: active ? GOLD : INK_40,
              letterSpacing: ".04em",
            }}
          >
            {tagline}
          </span>
        </div>
        <p style={{ fontSize: 12, color: INK_60, lineHeight: 1.55 }}>{desc}</p>
      </div>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `1.5px solid ${active ? INK : INK_20}`,
          flexShrink: 0,
          marginTop: 3,
          background: active ? BRAND : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .18s",
        }}
      >
        {active && (
          <div
            style={{
              width: 6,
              height: 6,
              background: "#fff",
              borderRadius: "50%",
            }}
          />
        )}
      </div>
    </button>
  );
}

// ── EMAIL PROVIDER OPTION ─────────────────────────────────────────────────────
function EmailProviderOpt({
  id,
  label,
  sub,
  color,
  letter,
  active,
  connecting,
  onClick,
  onRevoke,
  revoking,
}: {
  id: string;
  label: string;
  sub: string;
  color: string;
  letter: string;
  active: boolean;
  connecting?: boolean;
  onClick: () => void;
  onRevoke?: () => void;
  revoking?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="email-provider-option"
      role={onRevoke ? undefined : "button"}
      tabIndex={onRevoke ? undefined : 0}
      aria-disabled={connecting || undefined}
      onClick={onRevoke || connecting ? undefined : onClick}
      onKeyDown={(e) => {
        if (!onRevoke && !connecting && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        background: active ? WHITE : hov ? CREAM : "transparent",
        border: `1.5px solid ${active ? INK : hov ? INK_20 : INK_10}`,
        borderRadius: 12,
        cursor: connecting ? "not-allowed" : "pointer",
        textAlign: "left",
        width: "100%",
        fontFamily: "var(--dashboard-font), sans-serif",
        transition: "all .18s",
        opacity: connecting ? 0.7 : 1,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 800,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {letter}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: INK }}>{label}</p>
        <p style={{ fontSize: 11, color: INK_40 }}>{sub}</p>
      </div>
      {active && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 20,
            background: GREEN_BG,
            color: GREEN,
            flexShrink: 0,
          }}
        >
          Connected
        </span>
      )}
      {connecting && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 20,
            background: INK_06,
            color: INK_60,
            flexShrink: 0,
          }}
        >
          Connecting...
        </span>
      )}
      {!connecting && !onRevoke && (
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: `1.5px solid ${active ? INK : INK_20}`,
            flexShrink: 0,
            background: active ? BRAND : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .18s",
          }}
        >
          {active && (
            <div
              style={{
                width: 6,
                height: 6,
                background: "#fff",
                borderRadius: "50%",
              }}
            />
          )}
        </div>
      )}
      {onRevoke && (
        <DangerBtn
          label={revoking ? "Revoking..." : "Revoke access"}
          onClick={onRevoke}
          disabled={revoking}
        />
      )}
    </div>
  );
}

// ── TOGGLE SWITCH ─────────────────────────────────────────────────────────────
function Toggle({
  on,
  onChange,
  label,
}: {
  label: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      style={{
        position: "relative",
        width: 44,
        height: 24,
        borderRadius: 12,
        background: on ? BRAND : INK_20,
        border: "none",
        cursor: "pointer",
        transition: "background .22s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          width: 18,
          height: 18,
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          transition: "left .22s cubic-bezier(.4,0,.2,1)",
          left: on ? 23 : 3,
        }}
      />
    </button>
  );
}

// ── SAVE BUTTON ───────────────────────────────────────────────────────────────
// function SaveBtn({ onClick, saved }: { onClick: () => void; saved: boolean }) {
//   const [hov, setHov] = useState(false)
//   return (
//     <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
//       style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: hov ? '#8D2433' : BRAND, color: '#fff', fontFamily: 'var(--dashboard-font), sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 11, border: 'none', cursor: 'pointer', transition: 'all .2s', transform: hov ? 'translateY(-1px)' : 'none', boxShadow: hov ? '0 6px 20px rgba(44,32,35,0.22)' : 'none' }}>
//       <Save size={14} />
//       {saved ? 'Saved' : 'Save settings'}
//     </button>
//   )
// }

// ── ACCOUNT INITIALS ──────────────────────────────────────────────────────────
function accountInitials(name: string | null, email: string) {
  if (name)
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

// ── ROLE BADGE ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: AccountRole }) {
  const label =
    role === "owner" ? "Owner" : role === "admin" ? "Admin" : "Member";
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 20,
        background: role === "owner" ? GOLD_BG : INK_06,
        color: role === "owner" ? GOLD : INK_60,
      }}
    >
      {label}
    </span>
  );
}

// ── ACCOUNT ROW ────────────────────────────────────────────────────────────────
function AccountRow({
  account,
  onResend,
  onRemove,
  resending,
}: {
  account: OrgAccount;
  onResend: () => void;
  onRemove: () => void;
  resending: boolean;
}) {
  const [hov, setHov] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false);
        setMenuOpen(false);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 10,
        background: hov ? CREAM : "transparent",
        transition: "background .16s",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: account.status === "invited" ? INK_10 : BRAND,
          color: account.status === "invited" ? INK_40 : CREAM,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {accountInitials(account.name, account.email)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: INK,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {account.name || account.email}
        </p>
        <p style={{ fontSize: 11, color: INK_40 }}>
          {account.name ? account.email : "Invited · not yet joined"}
        </p>
      </div>
      <RoleBadge role={account.role} />
      <span
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          padding: "3px 8px",
          borderRadius: 20,
          background:
            account.status === "active" ? GREEN_BG : "rgba(180,83,9,0.08)",
          color: account.status === "active" ? GREEN : "#B45309",
          flexShrink: 0,
        }}
      >
        {account.status === "active" ? "Active" : "Invited"}
      </span>

      {account.role !== "owner" && (
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            aria-label={`Manage account ${account.email}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((m) => !m)}
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              border: "none",
              background: WHITE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <MoreVertical size={14} color={INK_40} />
          </button>
          {menuOpen && (
            <div
              className="fade-in"
              style={{
                position: "absolute",
                right: 0,
                top: 30,
                background: WHITE,
                border: `1px solid ${INK_10}`,
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(44,32,35,0.12)",
                zIndex: 10,
                minWidth: 160,
                overflow: "hidden",
              }}
            >
              {account.status === "invited" && (
                <button
                  onClick={() => {
                    onResend();
                    setMenuOpen(false);
                  }}
                  disabled={resending}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: INK,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--dashboard-font), sans-serif",
                  }}
                >
                  {resending ? "Resending…" : "Resend invite"}
                </button>
              )}
              <button
                onClick={() => {
                  onRemove();
                  setMenuOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: RED,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--dashboard-font), sans-serif",
                  borderTop:
                    account.status === "invited"
                      ? `1px solid ${INK_06}`
                      : "none",
                }}
              >
                {account.status === "invited"
                  ? "Revoke invite"
                  : "Remove account"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── INVITE MODAL ───────────────────────────────────────────────────────────────
function InviteModal({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (email: string, role: AccountRole) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AccountRole>("member");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!isValidEmail) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSending(true);
    try {
      await onInvite(email, role);
      onClose();
    } catch (err) {
      setError("Failed to send invite. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardModal title="Invite a team member" onClose={onClose}>
      <div
        className="fade-in"
        style={{
          background: WHITE,
          borderRadius: 18,
          padding: 28,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(67,14,22,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 800, color: INK }}>
            Invite a team member
          </p>
          <button
            aria-label="Close invitation"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "none",
              background: CREAM,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={14} color={INK_60} />
          </button>
        </div>

        <p
          style={{
            fontSize: 12,
            color: INK_60,
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          They&apos;ll get an email invite to join your Haelo account. They set their
          own password and go through their own onboarding — same company, their
          own dashboard.
        </p>

        <div style={{ marginBottom: 16 }}>
          <FieldLabel>Email address</FieldLabel>
          <TextInput
            label="Account email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={setEmail}
          />
        </div>

        <div style={{ marginBottom: error ? 10 : 22 }}>
          <FieldLabel>Role</FieldLabel>
          <SelectInput
            label="Account role"
            value={role}
            onChange={(v) => setRole(v as AccountRole)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </SelectInput>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={13} color={RED} />
            <p style={{ fontSize: 11.5, color: RED, fontWeight: 600 }}>
              {error}
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={sending || !email}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: BRAND,
            color: "#fff",
            fontFamily: "var(--dashboard-font), sans-serif",
            fontSize: 13,
            fontWeight: 700,
            padding: "13px",
            borderRadius: 11,
            border: "none",
            cursor: sending || !email ? "not-allowed" : "pointer",
            opacity: sending || !email ? 0.6 : 1,
            transition: "all .18s",
          }}
        >
          <UserPlus size={14} /> {sending ? "Sending invite…" : "Send invite"}
        </button>
      </div>
    </DashboardModal>
  );
}

// ── DANGER BUTTON ──────────────────────────────────────────────────────────────
function DangerBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontSize: 12,
        fontWeight: 600,
        color: hov ? RED : INK_40,
        background: hov ? RED_BG : "transparent",
        border: `1px solid ${hov ? "rgba(192,57,43,0.2)" : "transparent"}`,
        padding: "7px 12px",
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--dashboard-font), sans-serif",
        transition: "all .18s",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [timerMode, setTimerMode] = useState<string>("");
  const [timer, setTimer] = useState("");
  const [remindFreq, setRemindFreq] = useState("");
  const [emailProvider, setEmailProvider] = useState("gmail");
  const [waNum, setWaNum] = useState("+234 801 234 5678");

  const [waSent, setWaSent] = useState(false);
  const [waCode, setWaCode] = useState(["", "", "", "", "", ""]);
  const [waVerifying, setWaVerifying] = useState(false);
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fetchWaDetails = async () => {
    try {
      const res = await getWhatsappNumber();
      if (res?.data) {
        setWaNum(res.data.phone || "");
        setWaVerified(res.data.phoneVerified || false);
      }
    } catch (err) {
      console.error("Failed to fetch whatsapp details:", err);
    }
  };

  useEffect(() => {
    fetchWaDetails();
  }, []);

  const handleWaSend = async () => {
    const rawPhone = waNum.replace(/\D/g, "");
    if (rawPhone.length < 10) {
      setWaError("Please enter a valid phone number.");
      return;
    }
    setWaLoading(true);
    setWaError("");
    try {
      await addWhatsappNumber(rawPhone);
      setWaSent(true);
    } catch (err: any) {
      setWaError(err.message || "Failed to send OTP");
    } finally {
      setWaLoading(false);
    }
  };

  const triggerWaVerify = async (otpCode: string[]) => {
    setWaVerifying(true);
    setWaError("");
    try {
      const rawPhone = waNum.replace(/\D/g, "");
      await verifyWhatsappNumber(rawPhone, otpCode.join(""));
      setWaVerified(true);
      setWaSent(false);
      setWaCode(["", "", "", "", "", ""]);
      fetchWaDetails();
    } catch (err: any) {
      setWaError(err.message || "OTP verification failed");
    } finally {
      setWaVerifying(false);
    }
  };

  const handleWaCode = (i: number, val: string) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9]/g, "");

    if (cleanVal.length > 1) {
      const next = [...waCode];
      for (let j = 0; j < cleanVal.length && i + j < 6; j++) {
        next[i + j] = cleanVal[j];
      }
      setWaCode(next);
      if (i + cleanVal.length < 6)
        otpRefs.current[i + cleanVal.length]?.focus();
      else otpRefs.current[5]?.focus();
      return;
    }

    if (val !== "" && cleanVal === "") return;

    const v = cleanVal.slice(-1);
    const next = [...waCode];
    next[i] = v;
    setWaCode(next);

    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const [waVerified, setWaVerified] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<any[]>([]);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [revokingProvider, setRevokingProvider] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null,
  );

  const [userType, setUserType] = useState<string | null>(null);

  const [domain, setDomain] = useState<string>("");
  const [editingDomain, setEditingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserType(localStorage.getItem("userType"));
    }
  }, []);

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        const res = await getDomain();
        if (res?.data?.domain) {
          setDomain(res.data.domain);
          setDomainInput(res.data.domain);
        }
      } catch (err) {
        console.error("Failed to fetch domain:", err);
      }
    };
    fetchDomain();
  }, []);

  const handleSaveDomain = async () => {
    if (!domainInput.trim()) return;
    setDomainLoading(true);
    setDomainError("");
    try {
      await saveDomain(domainInput.trim());
      setDomain(domainInput.trim());
      setEditingDomain(false);
    } catch (err: any) {
      setDomainError(err.message || "Failed to save domain");
    } finally {
      setDomainLoading(false);
    }
  };

  const loadedConfigStr = useRef<string | null>(null);
  const loadedNotifsStr = useRef<string | null>(null);

  const [notifs, setNotifs] = useState({
    unrecognised: true,
    dailySummary: true,
    weeklyReport: false,
    errors: true,
  });

  // Team Accounts — real org-level logins, separate from Staff Directory.
  const [accounts, setAccounts] = useState<OrgAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsHov, setAccountsHov] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [inviteToast, setInviteToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setAccountsLoading(true);
      try {
        const res = await getAccounts();
        if (res?.data) setAccounts(res.data);
      } catch (err) {
        console.error("Failed to fetch org accounts:", err);
      } finally {
        setAccountsLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleInvite = async (email: string, role: AccountRole) => {
    await inviteAccount({ email, role });
    setAccounts((prev) => [
      ...prev,
      { id: Date.now(), name: null, email, role, status: "invited" },
    ]);
    setInviteToast(`Invite sent to ${email}`);
    setTimeout(() => setInviteToast(null), 3000);
  };

  const handleResend = async (email: string) => {
    setResendingEmail(email);
    try {
      await resendInvite(email);
      setInviteToast("Invite resent");
      setTimeout(() => setInviteToast(null), 3000);
    } catch (err) {
      console.error("Failed to resend invite:", err);
    } finally {
      setResendingEmail(null);
    }
  };

  const handleRemove = async (email: string) => {
    try {
      await removeAccount(email);
      setAccounts((prev) => prev.filter((a) => a.email !== email));
    } catch (err) {
      console.error("Failed to remove account:", err);
    }
  };

  // Timer load effect
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await getHaeloTone();
        if (res?.data) {
          if (res.data.timer) {
            setTimerMode(res.data.timer);
          }
          if (res.data.timerConfig) {
            setTimer(String(res.data.timerConfig.sendAfter));
            setRemindFreq(String(res.data.timerConfig.remindAfter));
          }
          loadedConfigStr.current = JSON.stringify({
            timer: res.data.timer || "",
            sendAfter: String(res.data.timerConfig?.sendAfter || "0"),
            remindAfter: String(res.data.timerConfig?.remindAfter || "0"),
          });
        } else {
          // If data is null, none of it be clicked and times set to 0
          setTimerMode("");
          setTimer("0");
          setRemindFreq("0");
          loadedConfigStr.current = JSON.stringify({
            timer: "",
            sendAfter: "0",
            remindAfter: "0",
          });
        }
      } catch (err) {
        console.error("Failed to load haelo tone config:", err);
      }
    };
    const loadProviders = async () => {
      try {
        const res = await getProviders();
        if (res?.data?.providers) {
          setConnectedProviders(res.data.providers);
          if (res.data.providers.length > 0) {
            const first = res.data.providers[0];
            if (first.provider.toLowerCase().includes("gmail"))
              setEmailProvider("gmail");
            else if (
              first.provider.toLowerCase().includes("outlook") ||
              first.provider.toLowerCase().includes("microsoft")
            )
              setEmailProvider("outlook");
            else if (first.provider.toLowerCase().includes("zoho"))
              setEmailProvider("zoho");
          }
        }
      } catch (err) {
        console.error("Failed to fetch providers:", err);
      }
    };
    const loadNotifications = async () => {
      try {
        const res = await getNotificationSettings();
        if (res?.data?.settings) {
          const s = res.data.settings;
          setNotifs({
            unrecognised: s.unrecognizedSenderAlerts ?? true,
            dailySummary: s.dailyActivitySummary ?? true,
            weeklyReport: s.weeklyPerformanceReport ?? false,
            errors: s.errorAndConnectionAlerts ?? true,
          });
          loadedNotifsStr.current = JSON.stringify({
            unrecognised: s.unrecognizedSenderAlerts ?? true,
            dailySummary: s.dailyActivitySummary ?? true,
            weeklyReport: s.weeklyPerformanceReport ?? false,
            errors: s.errorAndConnectionAlerts ?? true,
          });
        }
      } catch (err) {
        console.error("Failed to fetch notification settings:", err);
      }
    };

    loadConfig();
    loadProviders();
    loadNotifications();
  }, []);

  // Timer auto-save effect
  useEffect(() => {
    if (loadedConfigStr.current === null) return; // still loading

    const currentConfigStr = JSON.stringify({
      timer: timerMode,
      sendAfter: timer,
      remindAfter: remindFreq,
    });
    if (currentConfigStr === loadedConfigStr.current) return; // No real change

    const saveTimer = async () => {
      try {
        const payload: any = {
          timerConfig: {
            sendAfter: Number(timer),
            remindAfter: Number(remindFreq),
          },
        };
        if (timerMode) {
          payload.timer = timerMode;
        }
        await saveTimerConfig(payload);
      } catch (err) {
        console.error("Failed to save timer config:", err);
      }
    };
    saveTimer();
  }, [timerMode, timer, remindFreq]);

  // Notifications auto-save effect
  useEffect(() => {
    if (loadedNotifsStr.current === null) return; // still loading

    const currentNotifsStr = JSON.stringify(notifs);
    if (currentNotifsStr === loadedNotifsStr.current) return; // No real change

    const saveNotifs = async () => {
      try {
        await saveNotificationSettings({
          unrecognizedSenderAlerts: notifs.unrecognised,
          dailyActivitySummary: notifs.dailySummary,
          weeklyPerformanceReport: notifs.weeklyReport,
          errorAndConnectionAlerts: notifs.errors,
        });
        loadedNotifsStr.current = currentNotifsStr;
      } catch (err) {
        console.error("Failed to save notification settings:", err);
      }
    };
    saveNotifs();
  }, [notifs]);

  // Card hover states
  const [timerHov, setTimerHov] = useState(false);
  const [emailHov, setEmailHov] = useState(false);
  const [waHov, setWaHov] = useState(false);
  const [domainHov, setDomainHov] = useState(false);
  const [notifHov, setNotifHov] = useState(false);

  const handleSave = () => {
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2800);
  };

  const timerModes = [
    {
      id: "auto-send" as const,
      label: "Auto-Send",
      tagline: "Zero backlog.",
      desc: "After the timer expires, Haelo sends the AI-drafted response automatically. Your team never waits.",
      icon: <Zap size={16} />,
    },
    {
      id: "remind" as const,
      label: "Remind & Wait",
      tagline: "Full control.",
      desc: "Haelo sends a WhatsApp reminder every few minutes until you respond. Nothing sends without your approval.",
      icon: <Bell size={16} />,
    },
    {
      id: "hybrid" as const,
      label: "Hybrid",
      tagline: "Recommended.",
      desc: "Auto-send for junior staff and routine emails. Remind and wait for senior staff, HR, Finance, or flagged senders.",
      icon: <Layers size={16} />,
    },
  ];

  const emailProviders = [
    {
      id: "gmail",
      label: "Gmail",
      sub: "Google OAuth 2.0 · Gmail API",
      color: "#EA4335",
      letter: "G",
    },
    {
      id: "outlook",
      label: "Outlook / Microsoft 365",
      sub: "Microsoft Graph API · OAuth 2.0",
      color: "#0078D4",
      letter: "O",
    },
    {
      id: "zoho",
      label: "Zoho Mail",
      sub: "Zoho OAuth · Zoho Mail API",
      color: "#E4261C",
      letter: "Z",
    },
  ];

  const notifLabels: Record<keyof typeof notifs, string> = {
    unrecognised: "Unrecognised sender alerts",
    dailySummary: "Daily activity summary",
    weeklyReport: "Weekly performance report",
    errors: "Error and connection alerts",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <main
        className="main-pad settings-page"
        style={{
          flex: 1,
          padding: "40px 40px 60px",
          overflowY: "auto",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* HEADER */}
        <div className="fade-up" style={{ marginBottom: 36 }}>
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
            Settings
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            Configure Haelo.
          </h1>
          <p style={{ fontSize: 13, color: INK_60, fontWeight: 500 }}>
            Timer behaviour, email connection, WhatsApp, and notification
            preferences.
          </p>
        </div>

        {/* SAVE FLASH */}
        {saveFlash && (
          <div
            className="fade-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "11px 16px",
              background: GREEN_BG,
              border: "1.5px solid rgba(46,125,82,0.2)",
              borderRadius: 11,
              marginBottom: 20,
            }}
          >
            <CheckCircle size={14} color={GREEN} />
            <p style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>
              Settings saved successfully.
            </p>
          </div>
        )}

        {/* INVITE TOAST */}
        {inviteToast && (
          <div
            className="fade-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "11px 16px",
              background: GREEN_BG,
              border: "1.5px solid rgba(46,125,82,0.2)",
              borderRadius: 11,
              marginBottom: 20,
            }}
          >
            <CheckCircle size={14} color={GREEN} />
            <p style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>
              {inviteToast}
            </p>
          </div>
        )}

        {showInvite && (
          <InviteModal
            onClose={() => setShowInvite(false)}
            onInvite={handleInvite}
          />
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxWidth: 720,
          }}
        >
          {/* ── 0. TEAM ACCOUNTS ── */}
          {userType === "admin" && (
            <SectionCard
              hov={accountsHov}
              onEnter={() => setAccountsHov(true)}
              onLeave={() => setAccountsHov(false)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 22,
                  paddingBottom: 18,
                  borderBottom: `1px solid ${INK_06}`,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      background: INK_06,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Users size={17} color={INK_40} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: INK,
                        letterSpacing: "-.015em",
                        marginBottom: 2,
                      }}
                    >
                      Team accounts
                    </p>
                    <p
                      style={{ fontSize: 12, color: INK_60, lineHeight: 1.55 }}
                    >
                      Everyone with their own login under this company. Invite
                      by email — they set their own password and onboard
                      themselves.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInvite(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: BRAND,
                    color: "#fff",
                    fontFamily: "var(--dashboard-font), sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "9px 14px",
                    borderRadius: 9,
                    border: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  <UserPlus size={13} /> Invite
                </button>
              </div>

              {accountsLoading ? (
                <p style={{ fontSize: 12, color: INK_40, padding: "8px 0" }}>
                  Loading team accounts…
                </p>
              ) : accounts.length === 0 ? (
                <p style={{ fontSize: 12, color: INK_40, padding: "8px 0" }}>
                  Just you so far — invite your team to bring them onto this
                  company&apos;s Haelo account.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {accounts.map((a) => (
                    <AccountRow
                      key={a.id}
                      account={a}
                      resending={resendingEmail === a.email}
                      onResend={() => handleResend(a.email)}
                      onRemove={() => handleRemove(a.email)}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {/* ── 1. TIMER ── */}
          <SectionCard
            hov={timerHov}
            onEnter={() => setTimerHov(true)}
            onLeave={() => setTimerHov(false)}
          >
            <SectionHeader
              icon={<Zap size={17} />}
              title="Timer behaviour"
              desc="Controls how Haelo handles emails when you don't respond on WhatsApp."
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {timerModes.map((m) => (
                <TimerModeOpt
                  key={m.id}
                  {...m}
                  active={timerMode === m.id}
                  onClick={() => setTimerMode(m.id)}
                />
              ))}
            </div>

            <div
              className="two-col"
              style={{
                display: "grid",
                gridTemplateColumns:
                  timerMode !== "auto-send" ? "1fr 1fr" : "1fr",
                gap: 14,
              }}
            >
              <div>
                <FieldLabel>Auto-send after</FieldLabel>
                <SelectInput
                  label="Response delay"
                  value={timer || "10"}
                  onChange={setTimer}
                >
                  {(timer === "0"
                    ? ["0", "5", "10", "15", "20", "30", "60"]
                    : ["5", "10", "15", "20", "30", "60"]
                  ).map((v) => (
                    <option key={v} value={v}>
                      {v === "0" ? "None" : `${v} minutes`}
                    </option>
                  ))}
                </SelectInput>
              </div>
              {timerMode !== "auto-send" && (
                <div>
                  <FieldLabel>Reminder every</FieldLabel>
                  <SelectInput
                    label="Reminder interval"
                    value={remindFreq || "5"}
                    onChange={setRemindFreq}
                  >
                    {(remindFreq === "0"
                      ? ["0", "3", "5", "10", "15"]
                      : ["3", "5", "10", "15"]
                    ).map((v) => (
                      <option key={v} value={v}>
                        {v === "0" ? "None" : `${v} minutes`}
                      </option>
                    ))}
                  </SelectInput>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── 2. EMAIL ── */}
          <SectionCard
            hov={emailHov}
            onEnter={() => setEmailHov(true)}
            onLeave={() => setEmailHov(false)}
          >
            <SectionHeader
              icon={<Mail size={17} />}
              title="Email connection"
              desc="The inbox Haelo monitors. OAuth only — your password is never stored or seen."
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {connectedProviders.map((cp) => {
                const isGmail = cp.provider.toLowerCase().includes("gmail");
                const isOutlook =
                  cp.provider.toLowerCase().includes("outlook") ||
                  cp.provider.toLowerCase().includes("microsoft");
                const isZoho = cp.provider.toLowerCase().includes("zoho");
                const matchedId = isGmail
                  ? "gmail"
                  : isOutlook
                    ? "outlook"
                    : isZoho
                      ? "zoho"
                      : "gmail";
                const pInfo = emailProviders.find((ep) => ep.id === matchedId)!;

                return (
                  <EmailProviderOpt
                    key={cp.id}
                    {...pInfo}
                    sub={cp.email || pInfo.sub}
                    active={emailProvider === pInfo.id}
                    onClick={() => setEmailProvider(pInfo.id)}
                    onRevoke={async () => {
                      setRevokingProvider(cp.id);
                      try {
                        await revokeEmailAccess(cp.uid || cp.id);
                        setConnectedProviders((prev) =>
                          prev.filter((p) => p.id !== cp.id),
                        );
                      } catch (err) {
                        console.error("Failed to revoke access", err);
                        alert("Failed to revoke access");
                      } finally {
                        setRevokingProvider(null);
                      }
                    }}
                    revoking={revokingProvider === cp.id}
                  />
                );
              })}

              {connectedProviders.length === 0 && (
                <div
                  style={{
                    padding: "14px 16px",
                    background: CREAM,
                    border: `1.5px dashed ${INK_20}`,
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: 13, color: INK_60 }}>
                    No email clients connected yet.
                  </p>
                </div>
              )}
            </div>

            {showAddProvider ? (
              <div
                className="fade-in"
                style={{
                  marginTop: 18,
                  paddingTop: 18,
                  borderTop: `1px solid ${INK_06}`,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: INK,
                    marginBottom: 12,
                  }}
                >
                  Select a provider to connect
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {emailProviders
                    .filter((ep) => {
                      // Filter out already connected providers
                      const isConnected = connectedProviders.some((cp) => {
                        const isGmail = cp.provider
                          .toLowerCase()
                          .includes("gmail");
                        const isOutlook =
                          cp.provider.toLowerCase().includes("outlook") ||
                          cp.provider.toLowerCase().includes("microsoft");
                        const isZoho = cp.provider
                          .toLowerCase()
                          .includes("zoho");
                        const matchedId = isGmail
                          ? "gmail"
                          : isOutlook
                            ? "outlook"
                            : isZoho
                              ? "zoho"
                              : "gmail";
                        return matchedId === ep.id;
                      });
                      return !isConnected;
                    })
                    .map((p) => (
                      <EmailProviderOpt
                        key={p.id}
                        {...p}
                        active={false}
                        connecting={connectingProvider === p.id}
                        onClick={async () => {
                          try {
                            const isGmail = p.id === "gmail";
                            const isZoho = p.id === "zoho";
                            const providerStr = isGmail
                              ? "gmail.com"
                              : isZoho
                                ? "zoho.com"
                                : "";

                            if (!providerStr) {
                              alert("Provider not supported yet");
                              return;
                            }

                            setConnectingProvider(p.id);
                            const res = await connectEmail(providerStr as any);

                            if (res.data?.authUrl) {
                              const width = 500;
                              const height = 650;
                              const left = window.innerWidth / 2 - width / 2;
                              const top =
                                window.screen.availHeight / 2 - height / 2;

                              window.open(
                                res.data.authUrl,
                                "OAuthPopup",
                                `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
                              );
                              setShowAddProvider(false);
                            }
                          } catch (err) {
                            console.error("Failed to connect email", err);
                            alert("Failed to connect email");
                          } finally {
                            setConnectingProvider(null);
                          }
                        }}
                      />
                    ))}
                  <button
                    onClick={() => setShowAddProvider(false)}
                    style={{
                      alignSelf: "flex-start",
                      background: "transparent",
                      border: "none",
                      color: INK_60,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "4px 0",
                      marginTop: 4,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setShowAddProvider(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "transparent",
                    border: `1.5px solid ${INK_20}`,
                    color: INK,
                    padding: "7px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .18s",
                  }}
                >
                  <Plus size={14} /> Add email client
                </button>
              </div>
            )}
          </SectionCard>

          {/* ── 3. WHATSAPP ── */}
          <SectionCard
            hov={waHov}
            onEnter={() => setWaHov(true)}
            onLeave={() => setWaHov(false)}
          >
            <SectionHeader
              icon={<Smartphone size={17} />}
              title="WhatsApp"
              desc="The number where Haelo sends all your email notifications."
            />

            {/* Current number status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: waVerified ? GREEN_BG : "rgba(180,83,9,0.07)",
                border: `1.5px solid ${waVerified ? "rgba(46,125,82,0.2)" : "rgba(180,83,9,0.18)"}`,
                borderRadius: 12,
                marginBottom: 18,
              }}
            >
              {waVerified ? (
                <CheckCircle
                  size={16}
                  color={GREEN}
                  style={{ flexShrink: 0 }}
                />
              ) : (
                <AlertCircle
                  size={16}
                  color="#B45309"
                  style={{ flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: INK,
                    marginBottom: 1,
                  }}
                >
                  {waNum}
                </p>
                <p style={{ fontSize: 11, color: INK_40 }}>
                  {waVerified ? "Verified and active" : "Verification pending"}
                </p>
              </div>
              {waVerified && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill={GREEN}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              )}
            </div>

            {/* Update number */}
            <div>
              <FieldLabel>Update WhatsApp number</FieldLabel>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <TextInput
                    label="WhatsApp number"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={waNum}
                    onChange={setWaNum}
                    disabled={waSent}
                  />
                </div>
                <VerifyBtn
                  onClick={handleWaSend}
                  loading={waLoading}
                  sent={waSent}
                />
              </div>

              {waSent && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 16,
                    background: CREAM,
                    borderRadius: 12,
                    border: `1px solid ${INK_10}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: INK,
                      marginBottom: 8,
                    }}
                  >
                    Enter the code sent to {waNum}
                  </p>

                  {waError && (
                    <div
                      style={{
                        marginBottom: 12,
                        padding: 8,
                        background: "rgba(192,57,43,0.07)",
                        border: "1px solid rgba(192,57,43,0.2)",
                        borderRadius: 8,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#C0392B",
                        }}
                      >
                        {waError}
                      </p>
                    </div>
                  )}

                  <div
                    className="otp-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(6, 1fr)",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {waCode.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="text"
                        value={digit}
                        onChange={(e) => handleWaCode(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !waCode[i] && i > 0) {
                            otpRefs.current[i - 1]?.focus();
                            const next = [...waCode];
                            next[i - 1] = "";
                            setWaCode(next);
                          }
                        }}
                        style={{
                          height: 44,
                          borderRadius: 10,
                          background: digit ? WHITE : CREAM,
                          border: `1.5px solid ${digit ? INK_40 : INK_10}`,
                          color: INK,
                          textAlign: "center",
                          fontSize: 18,
                          fontWeight: 700,
                          outline: "none",
                          minWidth: 0,
                          width: "100%",
                        }}
                      />
                    ))}
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <button
                      onClick={() => triggerWaVerify(waCode)}
                      disabled={!waCode.every((c) => c !== "") || waVerifying}
                      style={{
                        background: waCode.every((c) => c !== "")
                          ? INK
                          : INK_20,
                        color: WHITE,
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 16px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor:
                          waCode.every((c) => c !== "") && !waVerifying
                            ? "pointer"
                            : "not-allowed",
                        transition: "background .2s",
                        fontFamily: "var(--dashboard-font), sans-serif",
                      }}
                    >
                      {waVerifying ? "Verifying..." : "Verify"}
                    </button>

                    <button
                      onClick={() => {
                        setWaSent(false);
                        setWaCode(["", "", "", "", "", ""]);
                        setWaError("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        color: INK_60,
                        padding: 0,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── 4. DOMAIN ── */}
          <SectionCard
            hov={domainHov}
            onEnter={() => setDomainHov(true)}
            onLeave={() => setDomainHov(false)}
          >
            <SectionHeader
              icon={<Shield size={17} />}
              title="Domain filter"
              desc="Haelo only processes emails from your company domain. This is a hard rule and cannot be changed."
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: CREAM,
                border: `1px solid ${INK_10}`,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: BRAND,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Shield size={15} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                {editingDomain ? (
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <div style={{ flex: 1 }}>
                      <TextInput
                        label="Company domain"
                        type="text"
                        placeholder="company.com"
                        value={domainInput}
                        onChange={setDomainInput}
                        disabled={domainLoading}
                      />
                    </div>
                    <button
                      onClick={handleSaveDomain}
                      disabled={domainLoading}
                      style={{
                        background: BRAND,
                        color: "#fff",
                        border: "none",
                        padding: "11px 16px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: domainLoading ? "not-allowed" : "pointer",
                        fontFamily: "var(--dashboard-font), sans-serif",
                      }}
                    >
                      {domainLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDomain(false);
                        setDomainInput(domain);
                        setDomainError("");
                      }}
                      disabled={domainLoading}
                      style={{
                        background: "transparent",
                        color: INK_60,
                        border: "none",
                        padding: "11px 16px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--dashboard-font), sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: INK,
                        marginBottom: 2,
                      }}
                    >
                      @{domain || "company.com"}
                    </p>
                    <p style={{ fontSize: 11, color: INK_40, lineHeight: 1.5 }}>
                      All external emails are permanently ignored. This cannot
                      be changed.
                    </p>
                  </>
                )}
              </div>
              {!editingDomain &&
                (userType === "admin" ? (
                  <button
                    onClick={() => setEditingDomain(true)}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "5px 12px",
                      borderRadius: 20,
                      background: INK_06,
                      color: INK,
                      flexShrink: 0,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--dashboard-font), sans-serif",
                    }}
                  >
                    Edit
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 20,
                      background: INK_06,
                      color: INK_40,
                      flexShrink: 0,
                    }}
                  >
                    Locked
                  </span>
                ))}
            </div>
            {domainError && (
              <p
                style={{
                  fontSize: 11,
                  color: "#C0392B",
                  marginTop: 8,
                  padding: "0 16px",
                }}
              >
                {domainError}
              </p>
            )}
          </SectionCard>

          {/* ── 5. NOTIFICATIONS ── */}
          <SectionCard
            hov={notifHov}
            onEnter={() => setNotifHov(true)}
            onLeave={() => setNotifHov(false)}
          >
            <SectionHeader
              icon={<Bell size={17} />}
              title="Notifications"
              desc="Control what Haelo sends to your WhatsApp beyond email responses."
            />

            <div style={{ display: "flex", flexDirection: "column" }}>
              {(Object.keys(notifs) as Array<keyof typeof notifs>).map(
                (key, i, arr) => (
                  <NotifRow
                    key={key}
                    label={notifLabels[key]}
                    on={notifs[key]}
                    onChange={() =>
                      setNotifs((n) => ({ ...n, [key]: !n[key] }))
                    }
                    last={i === arr.length - 1}
                  />
                ),
              )}
            </div>
          </SectionCard>

          {/* ── SAVE ROW ── */}
          {/* <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 4 }}>
            <SaveBtn onClick={handleSave} saved={saveFlash} />
            {saveFlash && (
              <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={14} color={GREEN} />
                <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>All changes saved</span>
              </div>
            )}
          </div> */}
        </div>
      </main>
    </>
  );
}

// ── NOTIF ROW (extracted — no hooks in map) ───────────────────────────────────
function NotifRow({
  label,
  on,
  onChange,
  last,
}: {
  label: string;
  on: boolean;
  onChange: () => void;
  last: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px 14px",
        borderRadius: 10,
        background: hov ? CREAM : "transparent",
        borderBottom: last ? "none" : `1px solid rgba(44,32,35,0.05)`,
        transition: "background .16s",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 500, color: INK }}>{label}</p>
      <Toggle label={label} on={on} onChange={onChange} />
    </div>
  );
}

// ── VERIFY BUTTON (extracted) ─────────────────────────────────────────────────
function VerifyBtn({
  onClick,
  loading,
  sent,
}: {
  onClick: () => void;
  loading?: boolean;
  sent?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={loading || sent}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: sent ? GREEN_BG : hov ? "#8D2433" : BRAND,
        color: sent ? GREEN : "#fff",
        fontFamily: "var(--dashboard-font), sans-serif",
        fontSize: 12,
        fontWeight: 700,
        padding: "11px 18px",
        borderRadius: 10,
        border: sent ? `1.5px solid rgba(46,125,82,0.3)` : "none",
        cursor: loading || sent ? "default" : "pointer",
        flexShrink: 0,
        transition: "all .2s",
        transform: hov && !sent && !loading ? "translateY(-1px)" : "none",
        boxShadow:
          hov && !sent && !loading ? "0 4px 14px rgba(44,32,35,0.2)" : "none",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        "Sending..."
      ) : sent ? (
        <>
          <CheckCircle size={13} /> Sent
        </>
      ) : (
        "Verify"
      )}
    </button>
  );
}
