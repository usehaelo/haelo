"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { Check, ChevronDown, Download, Loader2, X } from "lucide-react";
export function Overlay({
  title,
  subtitle,
  children,
  footer,
  onClose,
  drawer = false,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  drawer?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current;
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`ws-overlay${drawer ? " ws-drawer" : ""}${wide ? " ws-overlay-wide" : ""}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ws-overlay-frame">
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="ws-icon"
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </header>
        <div className="ws-overlay-body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </dialog>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="ws-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Segments({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  disabled?: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string; count?: number }[];
}) {
  return (
    <div className="ws-segments" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {option.count !== undefined ? ` · ${option.count}` : ""}
        </button>
      ))}
    </div>
  );
}
export function Choice({
  title,
  description,
  selected,
  onClick,
  disabled = false,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`ws-choice${selected ? " selected" : ""}`}
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
    >
      <i />
      <span>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
    </button>
  );
}
export function Toggle({
  title,
  description,
  value,
  onChange,
  disabled = false,
}: {
  title: string;
  description?: string;
  value: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="ws-toggle-row">
      <div>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </div>
      <button
        type="button"
        role="switch"
        aria-label={title}
        aria-checked={value}
        className="ws-switch"
        disabled={disabled}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}
export function PreviewNotice({
  active,
  onToggle,
  text = "Some actions require additional service support. Explore them in a sample preview.",
}: {
  active: boolean;
  onToggle: () => void;
  text?: string;
}) {
  return (
    <div className={`ws-preview-notice${active ? " is-demo" : ""}`}>
      <span>
        {active
          ? "Sample preview · Changes here do not affect your workspace."
          : text}
      </span>
      <button type="button" onClick={onToggle}>
        {active ? "Exit sample preview" : "Try sample preview"}
      </button>
    </div>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  return (
    <span className={`ws-badge ws-badge-${tone}`}>
      <i />
      {children}
    </span>
  );
}
export function BusyButton({
  busy,
  children,
  onClick,
  disabled = false,
  type = "button",
}: {
  busy: boolean;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className="ws-button ws-dark"
      disabled={busy || disabled}
      onClick={onClick}
    >
      {busy ? <Loader2 size={14} className="ws-spin" /> : <Check size={14} />}{" "}
      {busy ? "Saving…" : children}
    </button>
  );
}
export function downloadText(
  filename: string,
  content: string,
  type = "text/plain",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCSV(filename: string, rows: (string | number)[][]) {
  const safe = (value: string | number) => {
    let text = String(value ?? "");
    if (/^[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  downloadText(
    filename,
    "\uFEFF" + rows.map((row) => row.map(safe).join(",")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
}
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="ws-section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}
