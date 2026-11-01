"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="setup-field">
      <label htmlFor={id}>{label}</label>
      <div className="setup-input-wrap">
        {Children.map(children, (child) =>
          isValidElement(child) &&
          ["input", "select", "textarea"].includes(String(child.type))
            ? cloneElement(
                child as React.ReactElement<{
                  id?: string;
                  "aria-describedby"?: string;
                }>,
                { id, "aria-describedby": hint ? `${id}-hint` : undefined },
              )
            : child,
        )}
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Actions({
  onBack,
  children = "Continue",
  busy = false,
  disabled = false,
  onClick,
  type = "submit",
}: {
  onBack?: () => void;
  children?: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <div className="setup-actions">
      {onBack && (
        <button
          className="setup-back"
          type="button"
          onClick={onBack}
          disabled={busy}
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      )}
      <button
        className="setup-primary"
        type={type}
        disabled={disabled || busy}
        onClick={onClick}
      >
        {busy ? (
          <>
            <Loader2 size={16} className="setup-spinner" />
            Please wait…
          </>
        ) : (
          <>
            {children}
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}
export function CodeInput({
  value,
  onChange,
  disabled = false,
  label = "Verification code",
  numeric = true,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  numeric?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <div className="setup-code" role="group" aria-label={label}>
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          aria-label={`${label} digit ${index + 1}`}
          type="text"
          inputMode={numeric ? "numeric" : "text"}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={value[index]?.trim() || ""}
          disabled={disabled}
          maxLength={6}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => {
            const digits = event.target.value.replace(
              numeric ? /\D/g : /[^a-zA-Z0-9]/g,
              "",
            );
            const next = value.padEnd(6, " ").split("");
            if (!digits) next[index] = " ";
            Array.from(digits.slice(0, 6 - index)).forEach((digit, offset) => {
              next[index + offset] = digit;
            });
            onChange(next.join("").trimEnd());
            if (digits)
              refs.current[Math.min(index + digits.length, 5)]?.focus();
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Backspace" &&
              !value[index]?.trim() &&
              index > 0
            ) {
              event.preventDefault();
              const next = value.padEnd(6, " ").split("");
              next[index - 1] = " ";
              onChange(next.join("").trimEnd());
              refs.current[index - 1]?.focus();
            }
            if (event.key === "ArrowLeft")
              refs.current[Math.max(0, index - 1)]?.focus();
            if (event.key === "ArrowRight")
              refs.current[Math.min(5, index + 1)]?.focus();
          }}
          onPaste={(event) => {
            const digits = event.clipboardData
              .getData("text")
              .replace(numeric ? /\D/g : /[^a-zA-Z0-9]/g, "")
              .slice(0, 6);
            if (digits) {
              event.preventDefault();
              onChange(digits);
              refs.current[Math.min(digits.length, 5)]?.focus();
            }
          }}
        />
      ))}
    </div>
  );
}
export function AccountProviders({ stacked = false }: { stacked?: boolean }) {
  return (
    <div className={`account-providers${stacked ? " providers-stacked" : ""}`}>
      <div>
        {[
          ["G", "Google"],
          ["M", "Microsoft"],
          ["Z", "Zoho"],
        ].map(([letter, name]) => (
          <button
            key={name}
            type="button"
            disabled
            title="Provider account sign-in is unavailable"
            aria-describedby="provider-availability"
          >
            <span>{letter}</span>
            {stacked ? "Continue with " : ""}
            {name}
          </button>
        ))}
      </div>
      <p id="provider-availability">
        Provider account sign-in is unavailable. Continue with your work email.
      </p>
    </div>
  );
}
