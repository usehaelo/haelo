"use client";

import Logo from "@/components/ui/Logo";
import Link from "next/link";
import {
  Mail,
  Building2,
  MessageCircle,
  BookOpen,
  SlidersHorizontal,
  Clock3,
  Check,
  ArrowUpRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { dashboardTheme } from "@/components/dashboard/theme";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import {
  connectEmail,
  getProviders,
  saveDomain,
  addWhatsappNumber,
  verifyWhatsappNumber,
  uploadBibleFiles,
  saveHaeloTone,
  saveTimerConfig,
} from "@/lib/api/onboard";

type TimerMode = "auto-send" | "remind" | "hybrid";
type ToneId =
  "direct" | "warm" | "formal" | "collaborative" | "brief" | "custom";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  processing: boolean;
  file?: File;
}

const {
  BRAND: INK,
  CREAM,
  WHITE,
  NAVY,
  GOLD,
  GOLD_LIGHT,
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
const GOLD_BG = "rgba(242,176,175,0.12)";

// ── PRIMITIVES ───────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div
      style={{
        width: 15,
        height: 15,
        border: `2px solid ${INK_10}`,
        borderTopColor: INK,
        borderRadius: "50%",
        animation: "spin .65s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

function ArrowRight({
  color = "currentColor",
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ArrowLeft({
  color = "currentColor",
  size = 13,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

// ── BUTTONS ──────────────────────────────────────────────────────────────────

function BtnInk({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      className="onboarding-primary"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: disabled ? INK_20 : hov ? "#430E16" : INK,
        color: disabled ? INK_40 : "#fff",
        fontFamily: "var(--onboarding-font),sans-serif",
        fontSize: 13,
        fontWeight: 600,
        padding: "12px 20px",
        borderRadius: 10,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transform: hov && !disabled ? "translateY(-1px)" : "none",
        boxShadow: hov && !disabled ? "0 6px 20px rgba(17,39,11,0.22)" : "none",
        transition: "all .2s cubic-bezier(.4,0,.2,1)",
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </button>
  );
}

function BtnGreen({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      className="onboarding-primary"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: disabled ? INK_20 : hov ? "#430E16" : INK,
        color: disabled ? INK_40 : "#fff",
        fontFamily: "var(--onboarding-font),sans-serif",
        fontSize: 13,
        fontWeight: 600,
        padding: "12px 20px",
        borderRadius: 10,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transform: hov && !disabled ? "translateY(-1px)" : "none",
        boxShadow: hov && !disabled ? "0 6px 18px rgba(46,125,82,0.3)" : "none",
        transition: "all .2s cubic-bezier(.4,0,.2,1)",
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </button>
  );
}

function BtnGhost({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--onboarding-font),sans-serif",
        fontSize: 12,
        fontWeight: 600,
        color: disabled ? INK_20 : hov ? INK : INK_40,
        padding: 0,
        transition: "color .15s",
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </button>
  );
}

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
          fontFamily: "var(--onboarding-font),sans-serif",
          background: foc ? WHITE : CREAM,
          border: `1.5px solid ${foc ? INK : INK_10}`,
          borderRadius: 10,
          padding: "11px 38px 11px 14px",
          fontSize: 13,
          fontWeight: 600,
          color: INK,
          outline: "none",
          cursor: "pointer",
          boxShadow: foc ? `0 0 0 3px ${INK_06}` : "none",
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

// ── SHARED UI ────────────────────────────────────────────────────────────────

function Eyebrow({ n, total = 6 }: { n: number; total?: number }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        color: GOLD,
        marginBottom: 8,
      }}
    >
      Step {n} of {total}
    </p>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      tabIndex={-1}
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: INK,
        lineHeight: 1.15,
        letterSpacing: "-.025em",
        marginBottom: 6,
      }}
    >
      {children}
    </h2>
  );
}

function StepSub({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{ fontSize: 13, color: INK_60, lineHeight: 1.6, marginBottom: 24 }}
    >
      {children}
    </p>
  );
}

function InfoBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: INK_03,
        border: `1px solid ${INK_10}`,
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <p style={{ fontSize: 12, color: INK_60, lineHeight: 1.55, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

function FieldInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  prefix,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  prefix?: string;
}) {
  const [foc, setFoc] = useState(false);
  const inputId = useId();
  return (
    <div>
      <label
        htmlFor={inputId}
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
      <div style={{ display: "flex", gap: 0 }}>
        {prefix && (
          <div
            style={{
              background: CREAM,
              border: `1.5px solid ${foc ? INK : INK_10}`,
              borderRight: "none",
              borderRadius: "10px 0 0 10px",
              padding: "11px 12px",
              fontSize: 13,
              color: INK_60,
              fontWeight: 600,
              whiteSpace: "nowrap" as const,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFoc(true)}
          onBlur={() => setFoc(false)}
          style={{
            flex: 1,
            fontFamily: "var(--onboarding-font),sans-serif",
            background: foc ? WHITE : CREAM,
            border: `1.5px solid ${foc ? INK : INK_10}`,
            borderRadius: prefix ? "0 10px 10px 0" : 10,
            padding: "11px 14px",
            fontSize: 13,
            color: INK,
            outline: "none",
            boxShadow: foc ? `0 0 0 3px ${INK_06}` : "none",
            transition: "all .18s",
            minWidth: 0,
          }}
        />
      </div>
    </div>
  );
}

function SuccessState({
  emoji,
  eyebrow,
  title,
  sub,
  cta,
  onCta,
  green,
}: {
  emoji: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  onCta: () => void;
  green?: boolean;
}) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div
        style={{
          position: "relative",
          width: 76,
          height: 76,
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            border: "1px solid rgba(46,125,82,0.2)",
            animation: "ringPulse 2.4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            width: 76,
            height: 76,
            background: GREEN_BG,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          {emoji}
        </div>
      </div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: GREEN,
          marginBottom: 6,
        }}
      >
        {eyebrow}
      </p>
      <h3
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: INK,
          letterSpacing: "-.02em",
          marginBottom: 5,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 13, color: INK_60, marginBottom: 24 }}>{sub}</p>
      {green ? (
        <BtnGreen onClick={onCta}>
          {cta} <ArrowRight color="#fff" />
        </BtnGreen>
      ) : (
        <BtnInk onClick={onCta}>
          {cta} <ArrowRight color="#fff" />
        </BtnInk>
      )}
    </div>
  );
}

// ── STEP 0: EMAIL ─────────────────────────────────────────────────────────────

interface ProviderBtnProps {
  id: string;
  name: string;
  sub: string;
  bg: string;
  letter: string;
  connecting: string | null;
  onConnect: (id: string) => void;
}

function ProviderBtn({
  id,
  name,
  sub,
  bg,
  letter,
  connecting,
  onConnect,
}: ProviderBtnProps) {
  const [hov, setHov] = useState(false);
  const isMe = connecting === id;
  return (
    <button
      onClick={() => onConnect(id)}
      disabled={!!connecting || id === "outlook"}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        background: isMe || hov ? WHITE : CREAM,
        border: `1.5px solid ${isMe ? INK : hov ? INK_20 : INK_10}`,
        borderRadius: 12,
        cursor: connecting ? "default" : "pointer",
        width: "100%",
        fontFamily: "var(--onboarding-font),sans-serif",
        marginBottom: 8,
        transform: hov && !connecting ? "translateY(-1px)" : "none",
        boxShadow: hov && !connecting ? `0 2px 12px ${INK_06}` : "none",
        transition: "all .2s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 9,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 800,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {letter}
      </div>
      <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>
          {name}
          {id === "outlook" && (
            <span className="provider-soon">Coming soon</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: INK_40, marginTop: 1 }}>{sub}</div>
      </div>
      {isMe ? (
        <Spinner />
      ) : (
        <svg
          style={{
            marginLeft: "auto",
            color: hov ? INK : INK_20,
            transition: "all .2s",
            transform: hov ? "translateX(3px)" : "none",
            flexShrink: 0,
          }}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );
}

function StepEmail({ onNext }: { onNext: () => void }) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);
  const [awaiting, setAwaiting] = useState<string | null>(null);
  const checkConnection = async (id: string) => {
    setConnecting(id);
    setError("");
    try {
      const res = await getProviders();
      const providers = res?.data?.providers || [];
      if (
        providers.some(
          (p: any) => p.provider === (id === "zoho" ? "zoho.com" : "gmail.com"),
        )
      ) {
        setConnected(id);
        setAwaiting(null);
      } else
        setError(
          "Authorisation is not complete yet. Finish in the provider window, then check again.",
        );
    } catch (err: any) {
      setError(err.message || "Could not confirm your connection.");
    } finally {
      setConnecting(null);
    }
  };

  const [error, setError] = useState("");

  const providers = [
    {
      id: "gmail",
      name: "Gmail",
      sub: "Google OAuth 2.0 · Gmail API",
      bg: "#EA4335",
      letter: "G",
    },
    {
      id: "outlook",
      name: "Outlook / Microsoft 365",
      sub: "Microsoft Graph API · OAuth 2.0",
      bg: "#0078D4",
      letter: "O",
    },
    {
      id: "zoho",
      name: "Zoho Mail",
      sub: "Zoho OAuth · Zoho Mail API",
      bg: "#E4261C",
      letter: "Z",
    },
  ];

  const connect = async (id: string) => {
    if (connecting) return;
    setError("");
    setConnecting(id);
    try {
      const providerStr =
        id === "zoho" ? "zoho.com" : id === "gmail" ? "gmail.com" : null;
      if (!providerStr) {
        setError("Provider not supported yet");
        setConnecting(null);
        return;
      }

      const res = await connectEmail(providerStr as any);

      if (res.data?.authUrl) {
        const width = 500;
        const height = 650;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.screen.availHeight / 2 - height / 2;

        const popup = window.open(
          res.data.authUrl,
          "OAuthPopup",
          `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
        );
        if (!popup)
          throw new Error(
            "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.",
          );
        setAwaiting(id);
      } else
        throw new Error(
          "The provider did not return a sign-in link. Please try again.",
        );
    } catch (err: any) {
      setError(err.message || "Failed to connect email");
    } finally {
      setConnecting(null);
    }
  };

  if (connected) {
    const name = providers.find((p) => p.id === connected)?.name;
    return (
      <SuccessState
        emoji="✅"
        eyebrow="Connected"
        title={`${name} is connected.`}
        sub="Your inbox connection is confirmed. Next, choose the company domain Haelo should use."
        cta="Continue to Domain Setup"
        onCta={onNext}
        green
      />
    );
  }

  return (
    <div>
      <Eyebrow n={1} />
      <StepTitle>Connect your inbox.</StepTitle>
      <StepSub>
        Haelo monitors your company email in real time. OAuth only — your
        password is never stored or seen.
      </StepSub>

      {error && (
        <div
          role="alert"
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

      {awaiting && (
        <div className="connection-pending" role="status">
          <ShieldCheck size={22} />
          <h3>Finish connecting your inbox.</h3>
          <p>
            Complete authorisation in the provider window, then confirm your
            connection here.
          </p>
          <BtnInk
            onClick={() => checkConnection(awaiting)}
            disabled={!!connecting}
          >
            {connecting ? "Checking connection…" : "Check connection"}
          </BtnInk>
        </div>
      )}
      {providers.map((p) => (
        <ProviderBtn
          key={p.id}
          {...p}
          connecting={connecting}
          onConnect={connect}
        />
      ))}
      <InfoBar>
        🔒 Haelo only reads emails from your company domain. External emails are
        never touched. Access can be revoked instantly from Settings.
      </InfoBar>
    </div>
  );
}

// ── STEP 1: DOMAIN ────────────────────────────────────────────────────────────

function StepDomain({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const valid = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(
    domain.trim(),
  );

  const handleNext = async () => {
    if (!valid) return;
    setSaving(true);
    setError("");
    try {
      await saveDomain(domain.trim().toLowerCase());
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to save domain");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Eyebrow n={2} />
      <StepTitle>Your company domain.</StepTitle>
      <StepSub>
        Haelo will only read and respond to emails from this domain. Everything
        else — clients, vendors, personal mail — is permanently ignored.
      </StepSub>

      {error && (
        <div
          role="alert"
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

      <div style={{ marginBottom: 20 }}>
        <FieldInput
          label="Company email domain"
          placeholder="company.com"
          value={domain}
          onChange={setDomain}
          prefix="@"
        />
        {domain && !valid && (
          <p style={{ fontSize: 11, color: "#C0392B", marginTop: 6 }}>
            Enter a valid domain, e.g. company.com
          </p>
        )}
        {valid && (
          <p
            style={{
              fontSize: 11,
              color: GREEN,
              marginTop: 6,
              fontWeight: 600,
            }}
          >
            ✓ Haelo will only process emails from @{domain}
          </p>
        )}
      </div>

      {/* Preview */}
      <div
        style={{
          background: NAVY,
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".09em",
            textTransform: "uppercase" as const,
            color: GOLD_LIGHT,
            marginBottom: 12,
          }}
        >
          How it works
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              icon: "✅",
              label: `tosin@${domain || "yourcompany.com"}`,
              desc: "Included",
              color: "#A1DCB5",
            },
            {
              icon: "✅",
              label: `funke@${domain || "yourcompany.com"}`,
              desc: "Included",
              color: "#A1DCB5",
            },
            {
              icon: "🚫",
              label: "client@gmail.com",
              desc: "External",
              color: "#D6B5BD",
            },
            {
              icon: "🚫",
              label: "vendor@outlook.com",
              desc: "External",
              color: "#D6B5BD",
            },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ fontSize: 13, flexShrink: 0 }}>{row.icon}</span>
              <span
                style={{
                  fontSize: 12,
                  color: "#D6B5BD",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: row.color,
                  flexShrink: 0,
                }}
              >
                {row.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      <InfoBar>
        🔒 Your domain setting can be updated any time from Settings.{" "}
      </InfoBar>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 20,
          flexWrap: "wrap" as const,
        }}
      >
        <BtnGhost onClick={onBack} disabled={saving}>
          <ArrowLeft /> Back
        </BtnGhost>
        <BtnInk onClick={handleNext} disabled={!valid || saving}>
          {saving
            ? "Saving..."
            : valid
              ? "Continue to WhatsApp"
              : "Enter your domain first"}
          {!saving && <ArrowRight color={!valid ? INK_40 : "#fff"} />}
        </BtnInk>
      </div>
    </div>
  );
}

// ── STEP 2: WHATSAPP ──────────────────────────────────────────────────────────

function StepWhatsApp({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [phoneFoc, setPhoneFoc] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSend = async () => {
    if (phone.length < 8) return;
    setLoading(true);
    setError("");
    try {
      await addWhatsappNumber(`234${phone.replace(/^0/, "")}`);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to add WhatsApp number");
    } finally {
      setLoading(false);
    }
  };

  const triggerVerify = async (otpCode: string[]) => {
    if (verifying || verified) return;
    setVerifying(true);
    setError("");
    try {
      await verifyWhatsappNumber(
        `234${phone.replace(/^0/, "")}`,
        otpCode.join(""),
      );
      setVerified(true);
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleCode = (i: number, val: string) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9]/g, "");

    if (cleanVal.length > 1) {
      const next = [...code];
      for (let j = 0; j < cleanVal.length && i + j < 6; j++) {
        next[i + j] = cleanVal[j];
      }
      setCode(next);
      if (i + cleanVal.length < 6) refs.current[i + cleanVal.length]?.focus();
      else refs.current[5]?.focus();

      if (next.every((c) => c !== "")) triggerVerify(next);
      return;
    }

    if (val !== "" && cleanVal === "") return;

    const v = cleanVal.slice(-1);
    const next = [...code];
    next[i] = v;
    setCode(next);

    if (v && i < 5) refs.current[i + 1]?.focus();

    if (next.every((c) => c !== "")) {
      triggerVerify(next);
    }
  };

  if (verified) {
    return (
      <SuccessState
        emoji="💬"
        eyebrow="Verified"
        title="WhatsApp connected."
        sub={`+234 ${phone} is your daily action layer.`}
        cta="Build your Business Bible"
        onCta={onNext}
      />
    );
  }

  if (sent) {
    return (
      <div>
        <Eyebrow n={3} />
        <StepTitle>Enter your code.</StepTitle>
        <StepSub>Sent to +234 {phone} via WhatsApp.</StepSub>

        {error && (
          <div
            role="alert"
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

        {/* OTP GRID — uses CSS grid so boxes never overflow */}
        <div className="otp-grid">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              aria-label={`Verification code character ${i + 1}`}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              disabled={verifying}
              type="text"
              inputMode="text"
              value={digit}
              onChange={(e) => handleCode(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !code[i] && i > 0) {
                  refs.current[i - 1]?.focus();
                  const next = [...code];
                  next[i - 1] = "";
                  setCode(next);
                }
              }}
              className="otp-input"
              style={{
                background: digit ? WHITE : CREAM,
                border: `1.5px solid ${digit ? INK_40 : INK_10}`,
                color: INK,
                textAlign: "center",
              }}
            />
          ))}
        </div>
        {verifying && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: INK_40,
              marginBottom: 16,
            }}
          >
            <Spinner /> Verifying…
          </div>
        )}
        <BtnGhost
          onClick={() => {
            setSent(false);
            setCode(["", "", "", "", "", ""]);
          }}
        >
          <ArrowLeft size={11} /> Change number or resend
        </BtnGhost>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow n={3} />
      <StepTitle>Your WhatsApp number.</StepTitle>
      <StepSub>
        This is where every email notification lands — fast, familiar, and
        frictionless.
      </StepSub>

      {error && (
        <div
          role="alert"
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

      <div style={{ marginBottom: 20 }}>
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
          WhatsApp number
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              background: CREAM,
              border: `1.5px solid ${INK_10}`,
              borderRadius: 10,
              padding: "11px 14px",
              fontSize: 13,
              fontWeight: 700,
              color: INK,
              whiteSpace: "nowrap" as const,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🇳🇬 +234
          </div>
          <input
            aria-label="WhatsApp number"
            autoComplete="tel-national"
            type="tel"
            placeholder="801 234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            onFocus={() => setPhoneFoc(true)}
            onBlur={() => setPhoneFoc(false)}
            style={{
              flex: 1,
              fontFamily: "var(--onboarding-font),sans-serif",
              background: phoneFoc ? WHITE : CREAM,
              border: `1.5px solid ${phoneFoc ? INK : INK_10}`,
              borderRadius: 10,
              padding: "11px 14px",
              fontSize: 13,
              color: INK,
              outline: "none",
              boxShadow: phoneFoc ? `0 0 0 3px ${INK_06}` : "none",
              transition: "all .18s",
              minWidth: 0,
            }}
          />
        </div>
      </div>

      {/* WhatsApp preview */}
      <div
        style={{
          background: NAVY,
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".09em",
            textTransform: "uppercase" as const,
            color: GOLD_LIGHT,
            marginBottom: 12,
          }}
        >
          What you’ll receive
        </p>
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 12,
            padding: 14,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase" as const,
              color: "#4ABA7A",
              marginBottom: 8,
            }}
          >
            New Internal Email
          </p>
          <p style={{ fontSize: 11, color: "#D6B5BD", marginBottom: 2 }}>
            <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
              From:
            </strong>{" "}
            Tosin Adeyemi · Operations Manager
          </p>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
              margin: "8px 0 12px",
              lineHeight: 1.5,
            }}
          >
            Requesting approval to reorder 50kg of rice before Friday’s service.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(74,186,122,0.18)",
                color: "#4ABA7A",
              }}
            >
              Reply YES to send
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.07)",
                color: "#D6B5BD",
              }}
            >
              Reply NO to edit
            </span>
            <span style={{ fontSize: 10, color: "#D6B5BD", padding: "4px 0" }}>
              Example · timing follows your settings
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap" as const,
        }}
      >
        <BtnGhost onClick={onBack} disabled={loading}>
          <ArrowLeft /> Back
        </BtnGhost>
        <BtnInk onClick={handleSend} disabled={phone.length < 8 || loading}>
          {loading ? "Sending..." : "Send verification code"}{" "}
          {!loading && (
            <ArrowRight color={phone.length < 8 ? INK_40 : "#fff"} />
          )}
        </BtnInk>
      </div>
    </div>
  );
}

// ── STEP 3: BUSINESS BIBLE ────────────────────────────────────────────────────

const BIBLE_DOCS = [
  {
    id: "overview",
    icon: "🏢",
    name: "Company Overview",
    required: true,
    isStaff: false,
    hint: "The foundation of every Haelo response. Describe your company — what it does, who it serves, core values, and how it operates.",
    accept: ".csv",
    templateCols: ["section", "content"] as string[],
    templateRows: [
      ["Company name & industry", "e.g. Acme Corp — FMCG distribution"],
      ["What we do", "Products / services description"],
      ["Who we serve", "Target clients and markets"],
      ["Company values", "Core principles and culture"],
      ["Key facts", "Founded, headcount, revenue range"],
    ] as string[][],
    templateFile: "haelo_company_overview_template.csv",
    aiPrompt:
      "Fill this template for my company. We are called [name] and we do [description]. Format it as Section | Content.",
  },
  {
    id: "directory",
    icon: "👥",
    name: "Staff Directory",
    required: true,
    isStaff: true,
    hint: "Every person Haelo will recognise. Each row must include first name, last name, role, email, and a one-sentence description.",
    accept: ".csv",
    templateFile: "haelo_staff_directory_template.csv",
    aiPrompt:
      "Fill this staff directory CSV for my team. My staff: [list names, roles]. Add a one-sentence description per person. Use columns: First Name, Last Name, Role, Email, Description.",
    templateCols: undefined as string[] | undefined,
    templateRows: undefined as string[][] | undefined,
  },
  {
    id: "chart",
    icon: "🏗️",
    name: "Org Chart",
    required: true,
    isStaff: false,
    hint: "Your hierarchy and reporting lines. Haelo uses this to understand seniority and route responses correctly.",
    accept: ".csv",
    templateCols: ["name", "reportsTo", "department", "level"] as string[],
    templateRows: [
      ["John Adeyemi", "CEO", "Executive", "Director"],
      ["Grace Obi", "John Adeyemi", "Operations", "Manager"],
      ["Finance Team", "Grace Obi", "Finance", "Team Lead"],
    ] as string[][],
    templateFile: "haelo_org_structure_template.csv",
    aiPrompt:
      "Create an org chart CSV for my company. Hierarchy: [describe]. Columns: Name, Reports To, Department, Level.",
  },
  {
    id: "sop",
    icon: "📋",
    name: "SOPs & Policies",
    required: false,
    isStaff: false,
    hint: "Approval thresholds, leave policies, procurement rules, escalation paths.",
    accept: ".csv",
    templateCols: ["situation", "action", "whoApproves"] as string[],
    templateRows: [
      ["Leave request", "Approve if 5 days notice and cover confirmed", "CEO"],
      [
        "Purchase above ₦500k",
        "Requires Finance + CEO sign-off",
        "CEO + Finance",
      ],
      [
        "Client complaint",
        "Acknowledge 2hrs, resolve 24hrs",
        "Operations Manager",
      ],
    ] as string[][],
    templateFile: "haelo_sops_template.csv",
    aiPrompt:
      "Create a SOPs document for my business. Key processes: [describe]. Format: Situation | Standard Action | Who Approves.",
  },
  {
    id: "comms",
    icon: "💬",
    name: "Comms Style",
    required: false,
    isStaff: false,
    hint: "How you communicate with your team. Formal or direct? Long or brief? Haelo mirrors this in every draft.",
    accept: ".csv",
    templateCols: ["aspect", "preference"] as string[],
    templateRows: [
      ["Tone", "e.g. Direct and brief"],
      ["With senior staff", "e.g. Peer-to-peer, no formality"],
      ["With junior staff", "e.g. Warm but firm, action-oriented"],
      ["Phrases to avoid", 'e.g. filler words, "I will try"'],
      ["Format", "e.g. One idea per message"],
    ] as string[][],
    templateFile: "haelo_comms_style_template.csv",
    aiPrompt:
      "Write a communication style guide for my AI assistant. My preferences: [describe]. Format: Aspect | Your Preference.",
  },
];

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
    'firstName,lastName,role,email,description\nTosin,Adeyemi,Operations Manager,tosin@example.com,"Manages day-to-day operations and procurement approvals"\nFunke,Balogun,HR Manager,funke@example.com,"Handles leave requests, recruitment, and staff welfare"\n';
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "haelo_staff_directory_template.csv";
  a.click();
}

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
        background: CREAM,
        border: `1.5px solid ${file.processing ? INK_20 : INK_10}`,
        borderRadius: 10,
      }}
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
        {file.processing ? "Uploading…" : "Ready to upload"}
      </span>
      {!file.processing && (
        <button
          aria-label={`Remove ${file.name}`}
          onClick={() => onRemove(file.id)}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
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
      aria-pressed={active}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 11px",
        borderRadius: 20,
        border: `1.5px solid ${active ? INK : hasFiles ? GREEN : hov ? INK_20 : INK_10}`,
        background: active ? INK : "transparent",
        color: active ? "#fff" : hasFiles ? GREEN : hov ? INK : INK_40,
        cursor: "pointer",
        fontFamily: "var(--onboarding-font),sans-serif",
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

function StepBible({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [uploads, setUploads] = useState<Record<string, UploadedFile[]>>({});
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const doc = BIBLE_DOCS.find((d) => d.id === activeTab)!;
  const currentFiles = uploads[activeTab] || [];
  const doneCount = BIBLE_DOCS.filter(
    (d) => (uploads[d.id] || []).length > 0,
  ).length;
  const allRequired = BIBLE_DOCS.filter((d) => d.required).every(
    (d) => (uploads[d.id] || []).length > 0,
  );

  const handleSubmit = async () => {
    if (!allRequired) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      // Append files for each category
      BIBLE_DOCS.forEach((docType) => {
        const categoryFiles = uploads[docType.id] || [];
        categoryFiles.forEach((fileObj) => {
          if (fileObj.file) {
            formData.append(docType.id, fileObj.file);
          }
        });
      });

      await uploadBibleFiles(formData);
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to upload files");
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((f) =>
        f.name.toLowerCase().endsWith(".csv"),
      );
      if (validFiles.length === 0 && files.length > 0) {
        setError("Only CSV files are accepted.");
        return;
      }
      setError("");

      const newFiles: UploadedFile[] = validFiles.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        size:
          f.size > 1048576
            ? `${(f.size / 1048576).toFixed(1)} MB`
            : `${Math.round(f.size / 1024)} KB`,
        processing: false,
        file: f,
      }));
      setUploads((prev) => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), ...newFiles],
      }));
    },
    [activeTab],
  );

  const removeFile = (id: string) =>
    setUploads((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).filter((f) => f.id !== id),
    }));

  return (
    <div>
      <Eyebrow n={4} />
      <StepTitle>Business Bible.</StepTitle>
      <StepSub>
        Upload the documents that teach Haelo your business. Each category has a
        downloadable template — use AI to fill it, then upload the result.
      </StepSub>

      {/* Mini progress */}
      <div
        style={{
          height: 2,
          background: INK_10,
          borderRadius: 2,
          marginBottom: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: INK,
            borderRadius: 2,
            width: `${Math.max(4, (doneCount / BIBLE_DOCS.length) * 100)}%`,
            transition: "width .55s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>

      {/* Category tabs */}
      <div
        style={{
          display: "flex",
          gap: 5,
          flexWrap: "wrap" as const,
          marginBottom: 20,
        }}
      >
        {BIBLE_DOCS.map((d) => (
          <BibleTabBtn
            key={d.id}
            doc={d}
            active={d.id === activeTab}
            hasFiles={(uploads[d.id] || []).length > 0}
            onClick={() => setActiveTab(d.id)}
          />
        ))}
      </div>

      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            background: INK,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {doc.icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: INK,
              letterSpacing: "-.015em",
              marginBottom: 2,
            }}
          >
            {doc.name}
            {doc.required && (
              <span style={{ color: GOLD, marginLeft: 3, fontSize: 14 }}>
                *
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: INK_60, lineHeight: 1.55 }}>
            {doc.hint}
          </div>
        </div>
      </div>

      <details className="setup-template-details">
        <summary>
          View CSV template &amp; formatting guide <span>↓</span>
        </summary>
        {/* Staff template */}
        {doc.isStaff && (
          <div
            style={{
              background: NAVY,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 12,
                flexWrap: "wrap" as const,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".07em",
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
                  color: GOLD_LIGHT,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "5px 10px",
                  borderRadius: 7,
                  border: `1px solid ${GOLD_BORDER}`,
                  cursor: "pointer",
                  fontFamily: "var(--onboarding-font),sans-serif",
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
                marginBottom: 10,
              }}
            >
              <div
                className="staff-tmpl-grid"
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
                    className={`staff-tmpl-col-${idx + 1}`}
                    style={{
                      padding: "7px 8px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase" as const,
                      color: "#D6B5BD",
                      borderRight: "1px solid rgba(255,255,255,0.07)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {col}
                    <span style={{ color: GOLD_LIGHT, marginLeft: 2 }}>*</span>
                  </div>
                ))}
              </div>
              <div
                className="staff-tmpl-grid"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                {[
                  "Tosin",
                  "Adeyemi",
                  "Ops Manager",
                  "tosin@co.com",
                  "Manages daily ops…",
                ].map((cell, i) => (
                  <div
                    key={i}
                    className={`staff-tmpl-col-${i + 1}`}
                    style={{
                      padding: "7px 8px",
                      fontSize: 11,
                      color: "#D6B5BD",
                      fontStyle: "italic",
                      borderRight: "1px solid rgba(255,255,255,0.05)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
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
                background: GOLD_BG,
                border: `1px solid ${GOLD_BORDER}`,
                borderRadius: 9,
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>✨</span>
              <p
                style={{
                  fontSize: 11,
                  color: "#D6B5BD",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                <strong style={{ color: GOLD_LIGHT }}>
                  Build this fast with AI.
                </strong>{" "}
                Download the template, then tell Claude or ChatGPT:{" "}
                <em style={{ color: "#D6B5BD" }}>
                  &quot;Fill this CSV with my team. Staff: [list names and
                  roles]. Add a one-sentence description per person.&quot;
                </em>
              </p>
            </div>
          </div>
        )}

        {/* Generic template */}
        {!doc.isStaff && doc.templateCols && (
          <div
            style={{
              background: NAVY,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 12,
                flexWrap: "wrap" as const,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".07em",
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
                  color: GOLD_LIGHT,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "5px 10px",
                  borderRadius: 7,
                  border: `1px solid ${GOLD_BORDER}`,
                  cursor: "pointer",
                  fontFamily: "var(--onboarding-font),sans-serif",
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
                marginBottom: 10,
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
                  minWidth: 220,
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
                      color: "#D6B5BD",
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
                    minWidth: 220,
                  }}
                >
                  {row.map((cell, ci) => (
                    <span
                      key={ci}
                      style={{
                        fontSize: 11,
                        color: "#D6B5BD",
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
                background: GOLD_BG,
                border: `1px solid ${GOLD_BORDER}`,
                borderRadius: 9,
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>✨</span>
              <p
                style={{
                  fontSize: 11,
                  color: "#D6B5BD",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                <strong style={{ color: GOLD_LIGHT }}>
                  Build this fast with AI.
                </strong>{" "}
                Download the template, then prompt:{" "}
                <em style={{ color: "#D6B5BD" }}>&quot;{doc.aiPrompt}&quot;</em>
              </p>
            </div>
          </div>
        )}
      </details>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${doc.name} CSV files`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
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
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? INK : INK_20}`,
          borderRadius: 12,
          padding: "28px 20px",
          textAlign: "center" as const,
          cursor: "pointer",
          background: dragOver ? INK_03 : "transparent",
          transition: "all .2s",
          marginBottom: 12,
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
          style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 3 }}
        >
          Drop files here or click to browse
        </div>
        <div style={{ fontSize: 11, color: INK_40 }}>
          Only CSV files accepted
        </div>
      </div>

      {currentFiles.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            marginBottom: 12,
          }}
        >
          {currentFiles.map((f) => (
            <FileRow key={f.id} file={f} onRemove={removeFile} />
          ))}
        </div>
      )}

      {!doc.required && (
        <p style={{ fontSize: 11, color: INK_40, marginBottom: 14 }}>
          Optional — you can add this document later from the Business Bible
          page.
        </p>
      )}

      <details className="setup-help-details">
        <summary>Need help preparing your documents?</summary>
        {/* ── PROFESSIONAL HELP CTA ── */}
        <div
          style={{
            background: NAVY,
            borderRadius: 14,
            padding: 18,
            marginBottom: 16,
            marginTop: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: GOLD_BG,
                border: `1px solid ${GOLD_BORDER}`,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🤝
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: GOLD_LIGHT,
                  marginBottom: 3,
                }}
              >
                Need help building your Business Bible?
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#D6B5BD",
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                Get help preparing your company overview, staff directory, org
                chart, policies and communication guide.
              </p>
              <a
                href="https://wa.me/2347048048164?text=Hi%2C%20I%20need%20help%20building%20my%20Business%20Bible%20for%20Haelo.%20Can%20you%20help%3F"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: "rgba(74,186,122,0.15)",
                  color: "#4ABA7A",
                  fontFamily: "var(--onboarding-font),sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "10px 16px",
                  borderRadius: 9,
                  border: "1px solid rgba(74,186,122,0.2)",
                  textDecoration: "none",
                  transition: "all .18s",
                  letterSpacing: ".01em",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contact the HAELO team
              </a>
            </div>
          </div>
        </div>
      </details>
      {error && (
        <div
          role="alert"
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 4,
          flexWrap: "wrap" as const,
        }}
      >
        <BtnGhost onClick={onBack} disabled={loading}>
          <ArrowLeft /> Back
        </BtnGhost>
        <BtnInk onClick={handleSubmit} disabled={!allRequired || loading}>
          {loading
            ? "Uploading..."
            : allRequired
              ? "Continue to Tone"
              : "Upload required files first"}
          {!loading && <ArrowRight color={!allRequired ? INK_40 : "#fff"} />}
        </BtnInk>
      </div>
      {!allRequired && (
        <p style={{ fontSize: 10.5, color: INK_40, marginTop: 8 }}>
          Required: Company Overview ✱ Staff Directory ✱ Org Chart ✱
        </p>
      )}
    </div>
  );
}

// ── STEP 4: TONE ──────────────────────────────────────────────────────────────

const TONES: { id: ToneId; name: string; desc: string; example: string }[] = [
  {
    id: "direct",
    name: "Direct & Concise",
    desc: "Short, clear, action-oriented.",
    example: '"Approved. Submit the receipt to accounts today."',
  },
  {
    id: "warm",
    name: "Warm & Professional",
    desc: "Cordial, constructive, human.",
    example: '"Thanks for flagging this. Approved — please log in the system."',
  },
  {
    id: "formal",
    name: "Formal & Authoritative",
    desc: "Structured, measured, institutional.",
    example:
      '"This is approved. Kindly ensure all documentation is filed accordingly."',
  },
  {
    id: "collaborative",
    name: "Collaborative",
    desc: "Inclusive, consultative, team-first.",
    example:
      '"Good thinking. Let\'s proceed — co-ordinate with Finance and keep me posted."',
  },
  {
    id: "brief",
    name: "Ultra Brief",
    desc: "Minimal words. Maximum speed.",
    example: '"Approved."',
  },
  {
    id: "custom",
    name: "Custom",
    desc: "Write your own tone instruction.",
    example: 'e.g. "Warm but brief. Never start with I. Avoid filler words."',
  },
];

function ToneCard({
  tone,
  active,
  onClick,
}: {
  tone: (typeof TONES)[0];
  active: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      aria-pressed={active}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "13px 15px",
        background: active || hov ? WHITE : CREAM,
        border: `1.5px solid ${active ? INK : hov ? INK_20 : INK_10}`,
        borderRadius: 11,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "var(--onboarding-font),sans-serif",
        position: "relative",
        overflow: "hidden",
        transition: "all .18s",
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
            background: INK,
            borderRadius: "2px 0 0 2px",
          }}
        />
      )}
      <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>
        {tone.name}
      </div>
      <div style={{ fontSize: 11, color: INK_60, lineHeight: 1.4 }}>
        {tone.desc}
      </div>
    </button>
  );
}

function StepTone({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<ToneId>("direct");
  const [customText, setCustomText] = useState("");
  const [textFoc, setTextFoc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    setLoading(true);
    setError("");
    try {
      const toneValue = selected === "custom" ? customText : selected;
      if (selected === "custom" && !customText.trim()) {
        throw new Error("Please describe your custom tone.");
      }
      await saveHaeloTone(toneValue);
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to save tone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Eyebrow n={5} />
      <StepTitle>How should Haelo sound?</StepTitle>
      <StepSub>
        Select your default response tone. Every AI draft will follow this
        voice. You can override it per email directly from WhatsApp.
      </StepSub>

      <div className="tone-live-preview" aria-live="polite">
        <span>YOUR RESPONSE, REIMAGINED</span>
        <p>
          {selected === "custom"
            ? customText || "Describe your style below to guide Haelo’s drafts."
            : TONES.find((t) => t.id === selected)?.example}
        </p>
        <small>Style preview · sample approval response</small>
      </div>
      <div className="tone-grid">
        {TONES.map((t) => (
          <ToneCard
            key={t.id}
            tone={t}
            active={selected === t.id}
            onClick={() => setSelected(t.id)}
          />
        ))}
      </div>

      {selected === "custom" && (
        <div style={{ marginBottom: 18 }}>
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
            Describe your tone
          </label>
          <textarea
            aria-label="Custom tone instructions"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onFocus={() => setTextFoc(true)}
            onBlur={() => setTextFoc(false)}
            placeholder='e.g. Warm but brief. Always acknowledge before directing. Never start a reply with "I". Avoid corporate language.'
            rows={3}
            style={{
              width: "100%",
              background: textFoc ? WHITE : CREAM,
              border: `1.5px solid ${textFoc ? INK : INK_10}`,
              borderRadius: 10,
              padding: "11px 14px",
              fontSize: 13,
              fontFamily: "var(--onboarding-font),sans-serif",
              color: INK,
              outline: "none",
              resize: "none",
              lineHeight: 1.6,
              boxShadow: textFoc ? `0 0 0 3px ${INK_06}` : "none",
              transition: "all .18s",
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: 22 }}>
        <InfoBar>
          💡 Your tone setting shapes every AI-drafted response. You can still
          edit any response on WhatsApp before it sends.
        </InfoBar>
      </div>

      {error && (
        <div
          role="alert"
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap" as const,
        }}
      >
        <BtnGhost onClick={onBack} disabled={loading}>
          <ArrowLeft /> Back
        </BtnGhost>
        <BtnInk onClick={handleNext} disabled={loading}>
          {loading ? "Saving..." : "Continue to Timer"}{" "}
          {!loading && <ArrowRight color="#fff" />}
        </BtnInk>
      </div>
    </div>
  );
}

// ── STEP 5: TIMER ─────────────────────────────────────────────────────────────

const TIMER_OPTS: {
  id: TimerMode;
  icon: string;
  iconBg: string;
  name: string;
  tag?: string;
  desc: string;
}[] = [
  {
    id: "auto-send",
    icon: "⚡",
    iconBg: "rgba(46,125,82,0.1)",
    name: "Auto-Send",
    desc: "After the timer expires, Haelo sends the AI-drafted response automatically. Zero inbox backlog.",
  },
  {
    id: "remind",
    icon: "🔔",
    iconBg: "rgba(10,22,40,0.07)",
    name: "Remind & Wait",
    desc: "Haelo sends a WhatsApp reminder every few minutes until you respond. Nothing sends without your explicit approval.",
  },
  {
    id: "hybrid",
    icon: "⚖️",
    iconBg: GOLD_BG,
    name: "Hybrid",
    tag: "Recommended",
    desc: "Auto-send for routine and junior-staff emails. Remind and wait for senior staff, HR, Finance, or flagged senders.",
  },
];

function TimerOpt({
  opt,
  active,
  onClick,
}: {
  opt: (typeof TIMER_OPTS)[0];
  active: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      aria-pressed={active}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "15px 16px",
        background: active || hov ? WHITE : CREAM,
        border: `1.5px solid ${active ? INK : hov ? INK_20 : INK_10}`,
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        fontFamily: "var(--onboarding-font),sans-serif",
        transform: hov && !active ? "translateX(2px)" : "none",
        transition: "all .2s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: opt.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {opt.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 2,
            flexWrap: "wrap" as const,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>
            {opt.name}
          </span>
          {opt.tag && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 8,
                background: GOLD_BG,
                color: GOLD,
                border: `1px solid ${GOLD_BORDER}`,
              }}
            >
              {opt.tag}
            </span>
          )}
        </div>
        <p
          style={{ fontSize: 11.5, color: INK_60, lineHeight: 1.5, margin: 0 }}
        >
          {opt.desc}
        </p>
      </div>
      <div
        style={{
          width: 17,
          height: 17,
          borderRadius: "50%",
          border: `1.5px solid ${active ? INK : INK_20}`,
          flexShrink: 0,
          marginTop: 4,
          background: active ? INK : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .18s",
        }}
      >
        {active && (
          <div
            style={{
              width: 7,
              height: 7,
              background: "#fff",
              borderRadius: "50%",
            }}
          />
        )}
      </div>
    </button>
  );
}

function StepTimer({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<TimerMode>("hybrid");
  const [duration, setDuration] = useState("10");
  const [reminderFreq, setReminderFreq] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    setLoading(true);
    setError("");
    try {
      await saveTimerConfig({
        timer: mode,
        timerConfig: {
          sendAfter: parseInt(duration) || 0,
          remindAfter: mode !== "auto-send" ? parseInt(reminderFreq) || 0 : 0,
        },
      });
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to save timer config");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Eyebrow n={6} />
      <StepTitle>Your response window.</StepTitle>
      <StepSub>
        How long does Haelo wait before acting on your behalf? You can change
        this any time from Settings.
      </StepSub>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          marginBottom: 18,
        }}
      >
        {TIMER_OPTS.map((o) => (
          <TimerOpt
            key={o.id}
            opt={o}
            active={mode === o.id}
            onClick={() => setMode(o.id)}
          />
        ))}
      </div>

      <div
        className={`timer-selects ${mode !== "auto-send" ? "timer-selects-2" : "timer-selects-1"}`}
      >
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
            Response window
          </label>
          <SelectInput
            label="Response delay"
            value={duration}
            onChange={setDuration}
          >
            {["5", "10", "15", "20", "30", "60"].map((v) => (
              <option key={v} value={v}>
                {v} minutes
              </option>
            ))}
          </SelectInput>
        </div>
        {mode !== "auto-send" && (
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
              Reminder every
            </label>
            <SelectInput
              label="Reminder interval"
              value={reminderFreq}
              onChange={setReminderFreq}
            >
              {["3", "5", "10", "15"].map((v) => (
                <option key={v} value={v}>
                  {v} minutes
                </option>
              ))}
            </SelectInput>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap" as const,
        }}
      >
        <BtnGhost onClick={onBack} disabled={loading}>
          <ArrowLeft /> Back
        </BtnGhost>
        <BtnGreen onClick={handleNext} disabled={loading}>
          {loading ? "Activating..." : "Activate Haelo"}{" "}
          {!loading && <ArrowRight color="#fff" />}
        </BtnGreen>
      </div>
    </div>
  );
}

// ── STEP 6: READY ─────────────────────────────────────────────────────────────

function StepReady() {
  const checks = [
    "Email connection confirmed",
    "Company domain saved",
    "WhatsApp verified",
    "Business context uploaded",
    "Response tone saved",
    "Timer preferences saved",
  ];

  return (
    <div style={{ textAlign: "center", padding: "28px 0" }}>
      <div
        style={{
          position: "relative",
          width: 110,
          height: 110,
          margin: "0 auto 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -14,
            borderRadius: "50%",
            border: "1px solid rgba(46,125,82,0.15)",
            animation: "ringPulse 2.6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: -7,
            borderRadius: "50%",
            border: "1px solid rgba(46,125,82,0.2)",
            animation: "ringPulse 2.6s ease-in-out infinite",
            animationDelay: ".4s",
          }}
        />
        <div
          style={{
            width: 110,
            height: 110,
            background: INK,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Logo showWordmark={false} size="xl" />
        </div>
      </div>

      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: GREEN,
          marginBottom: 10,
        }}
      >
        Setup complete
      </p>
      <h2
        tabIndex={-1}
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: INK,
          lineHeight: 1.1,
          letterSpacing: "-.03em",
          marginBottom: 10,
        }}
      >
        Your workspace.
        <br />
        Ready for a lighter day.
      </h2>
      <p
        style={{
          fontSize: 13,
          color: INK_60,
          maxWidth: 380,
          margin: "0 auto 28px",
          lineHeight: 1.65,
        }}
      >
        Your connections and preferences are saved. Head to your dashboard to
        review activity, manage your people and keep your business context up to
        date.
      </p>

      <div
        style={{
          background: CREAM,
          border: `1px solid ${INK_10}`,
          borderRadius: 14,
          overflow: "hidden",
          maxWidth: 300,
          margin: "0 auto 24px",
        }}
      >
        {checks.map((item, i) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 18px",
              borderBottom:
                i < checks.length - 1 ? `1px solid ${INK_10}` : "none",
              fontSize: 12.5,
              fontWeight: 500,
              color: INK,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                background: GREEN,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: "#fff",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            {item}
          </div>
        ))}
      </div>

      <a
        href="/dashboard/overview"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: INK,
          color: "#fff",
          fontFamily: "var(--onboarding-font),sans-serif",
          fontSize: 13,
          fontWeight: 600,
          padding: "12px 22px",
          borderRadius: 10,
          textDecoration: "none",
          marginBottom: 10,
        }}
      >
        Open your dashboard <ArrowRight color="#fff" />
      </a>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────

const SETUP_STEPS = [
  {
    label: "Connect your inbox",
    short: "Email",
    hint: "Bring your communication together",
    icon: Mail,
  },
  {
    label: "Define your company",
    short: "Domain",
    hint: "Keep the right conversations in focus",
    icon: Building2,
  },
  {
    label: "Connect WhatsApp",
    short: "WhatsApp",
    hint: "Your decisions, wherever you are",
    icon: MessageCircle,
  },
  {
    label: "Add business context",
    short: "Context",
    hint: "Help Haelo understand your world",
    icon: BookOpen,
  },
  {
    label: "Find your voice",
    short: "Voice",
    hint: "Make every draft feel like you",
    icon: SlidersHorizontal,
  },
  {
    label: "Set your response rhythm",
    short: "Timing",
    hint: "Choose how and when Haelo acts",
    icon: Clock3,
  },
];
const STEP_NOTES = [
  {
    title: "Your inbox. Your control.",
    text: "Connect Gmail or Zoho through your provider’s authorisation screen. You can revoke access from Settings.",
    detail:
      "Once connected, you’ll choose the company domain Haelo should focus on.",
  },
  {
    title: "Focus starts with boundaries.",
    text: "Your company domain tells Haelo which internal conversations belong in your workspace.",
    detail:
      "Use the part after @ in your work email, such as company.com. You can edit this in Settings.",
  },
  {
    title: "Decisions that travel with you.",
    text: "Verify the WhatsApp number where you want to receive notifications and respond to your team.",
    detail:
      "Have your phone nearby. We’ll send a verification code before you continue.",
  },
  {
    title: "A little context. Better responses.",
    text: "Start with your company overview, staff directory and organisational chart. Templates give you a useful starting point.",
    detail:
      "CSV files are supported. Policies and communication guidelines are optional and can be added later.",
  },
  {
    title: "Sound like yourself.",
    text: "Choose a communication style and see an example before you save. Prefer something specific? Write your own instructions.",
    detail:
      "This is a style example, not a message being sent. You can refine your preferences later.",
  },
  {
    title: "Choose your comfort level.",
    text: "Auto-send acts after your timer. Remind & Wait asks for your approval. Hybrid combines automatic handling with review.",
    detail:
      "Review the mode description carefully. You can adjust your response settings from the dashboard.",
  },
];
export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const next = () => {
    const n = Math.min(step + 1, 6);
    setStep(n);
    setVisited((v) => Math.max(v, n));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));
  useEffect(() => {
    if (step > 0) {
      mainRef.current
        ?.querySelector<HTMLElement>('[data-active="true"] h2')
        ?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [step]);
  const panels = [
    <StepEmail key="email" onNext={next} />,
    <StepDomain key="domain" onNext={next} onBack={back} />,
    <StepWhatsApp key="whatsapp" onNext={next} onBack={back} />,
    <StepBible key="bible" onNext={next} onBack={back} />,
    <StepTone key="tone" onNext={next} onBack={back} />,
    <StepTimer key="timer" onNext={next} onBack={back} />,
  ];
  const note = STEP_NOTES[Math.min(step, 5)];
  return (
    <div className="onboarding-experience">
      <a className="onboarding-skip" href="#setup-content">
        Skip to current step
      </a>
      <aside className="setup-journey" aria-label="Setup journey">
        <Link href="/" aria-label="HAELO home" className="setup-brand">
          <Logo variant="white-on-navy" size="lg" />
        </Link>
        <div className="journey-intro">
          <p className="setup-eyebrow">A little setup. A lot more headspace.</p>
          <h1>
            Make Haelo
            <br />
            <span>your own.</span>
          </h1>
          <p>Six thoughtful steps to a more considered working day.</p>
        </div>
        <nav aria-label="Onboarding steps">
          <ol>
            {SETUP_STEPS.map((item, i) => (
              <li
                key={item.short}
                className={`${i === step ? "is-current" : ""} ${i < visited ? "is-complete" : ""}`}
              >
                <button
                  disabled={i > visited || step === 6}
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => setStep(i)}
                >
                  <span className="journey-step-icon">
                    {i < visited ? (
                      <Check size={17} />
                    ) : (
                      <item.icon size={17} />
                    )}
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{i < visited ? "Completed" : item.hint}</small>
                  </span>
                  <span className="journey-step-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="journey-bottom">
          <span>Prepared by HAELO. Decided by you.</span>
          <Link
            href="https://wa.me/2347048048164"
            target="_blank"
            rel="noopener noreferrer"
          >
            Need a hand? <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>
      <div className="setup-canvas">
        <header className="setup-topbar">
          <Link href="/" className="setup-mobile-logo" aria-label="HAELO home">
            <Logo size="sm" />
          </Link>
          <span className="setup-topbar-caption">
            <span /> YOUR WORKSPACE, TAKING SHAPE
          </span>
          <Link href="/dashboard/overview">
            Finish later <ArrowUpRight size={14} />
          </Link>
        </header>
        <div
          className="setup-mobile-progress"
          aria-label={`Step ${Math.min(step + 1, 6)} of 6`}
        >
          <div>
            <strong>
              {step === 6 ? "Setup complete" : SETUP_STEPS[step].label}
            </strong>
            <span>{Math.min(step + 1, 6)} / 6</span>
          </div>
          <div className="setup-progress-segments">
            {SETUP_STEPS.map((item, i) => (
              <span key={item.short} className={i <= step ? "filled" : ""} />
            ))}
          </div>
        </div>
        <main
          ref={mainRef}
          id="setup-content"
          className={`setup-content ${step === 6 ? "setup-finished" : ""}`}
        >
          <div className="setup-form-column">
            <div className="setup-section-caption">
              <span>
                {step === 6
                  ? "WELCOME TO YOUR WORKSPACE"
                  : "PERSONALISED FOR THE WAY YOU WORK"}
              </span>
              <span>
                {step === 6
                  ? "ALL SET"
                  : String(step + 1).padStart(2, "0") + " / 06"}
              </span>
            </div>
            {panels.map(
              (panel, i) =>
                i <= visited && (
                  <section
                    key={i}
                    className="setup-step-panel"
                    hidden={step !== i}
                    data-active={step === i}
                  >
                    {panel}
                  </section>
                ),
            )}
            {step === 6 && (
              <section className="setup-step-panel" data-active="true">
                <StepReady />
              </section>
            )}
            <footer className="setup-form-footer">
              <ShieldCheck size={15} />
              <span>Connected on your terms. Adjustable in Settings.</span>
            </footer>
          </div>
          {step < 6 && (
            <aside className="setup-context" aria-label="About this step">
              <div className="setup-context-orbit" aria-hidden="true">
                <Logo showWordmark={false} size="lg" />
              </div>
              <span className="setup-eyebrow">The thought behind the step</span>
              <h2>{note.title}</h2>
              <p>{note.text}</p>
              <div className="setup-context-tip">
                <HelpCircle size={16} />
                <p>{note.detail}</p>
              </div>
              <a
                href="https://wa.me/2347048048164"
                target="_blank"
                rel="noopener noreferrer"
              >
                Talk to the HAELO team <ArrowUpRight size={14} />
              </a>
            </aside>
          )}
        </main>
        <footer className="setup-canvas-footer">
          <span>© {new Date().getFullYear()} HAELO</span>
          <span>Intelligence. Clarity. Control.</span>
        </footer>
      </div>
    </div>
  );
}
