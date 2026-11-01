"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, LockKeyhole } from "lucide-react";
import SetupShell from "@/components/setup/SetupShell";
import { Actions, AccountProviders, Field } from "@/components/setup/Controls";
import { login } from "@/lib/api/auth";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStep, setPasswordStep] = useState(false);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!passwordStep) {
      setPasswordStep(true);
      return;
    }
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await login(email.trim(), password);
      if (!response.data?.token)
        throw new Error("Sign-in did not return a session. Please try again.");
      localStorage.setItem("token", response.data.token);
      if (response.data.userType)
        localStorage.setItem("userType", response.data.userType);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <SetupShell
      login
      badge="Your AI Chief of Staff on WhatsApp"
      title="Your inbox, handled. While you lead."
      description="Every internal email read, summarised and answered on WhatsApp."
    >
      <h1>Welcome back</h1>
      <p className="setup-intro">
        Sign in with the work email Haelo reads for you.
      </p>
      <AccountProviders stacked />
      <div className="setup-divider">or</div>
      <form onSubmit={submit} className="setup-form">
        <Field label="Work email">
          <Mail size={16} />
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </Field>
        {passwordStep && (
          <Field label="Password">
            <LockKeyhole size={16} />
            <input
              autoFocus
              type={visible ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="setup-icon-button"
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </Field>
        )}
        {error && (
          <p role="alert" className="setup-error">
            {error}
          </p>
        )}
        <Actions busy={busy}>
          {passwordStep ? "Sign in" : "Continue with email"}
        </Actions>
      </form>
      <p className="setup-note">
        New to Haelo? <Link href="/auth/signup">Start a 30-day pilot</Link>
      </p>
    </SetupShell>
  );
}
