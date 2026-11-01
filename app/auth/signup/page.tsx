"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, LockKeyhole } from "lucide-react";
import SetupShell, { SetupStages } from "@/components/setup/SetupShell";
import {
  Actions,
  AccountProviders,
  CodeInput,
  Field,
} from "@/components/setup/Controls";
import { register, verifyOtp, checkEmail } from "@/lib/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    companyName: "",
    password: "",
  });
  const [verification, setVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (verification) {
        const token = localStorage.getItem("registrationToken");
        if (!token)
          throw new Error(
            "Please create your account again to request a new code.",
          );
        const response = await verifyOtp(token, otp);
        if (!response.data?.token)
          throw new Error(
            "Verification did not return a session. Please try again.",
          );
        localStorage.setItem("token", response.data.token);
        localStorage.removeItem("registrationToken");
        router.push("/onboarding");
      } else {
        if (!form.name.trim() || !form.companyName.trim())
          throw new Error("Enter your full name and company name.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
          throw new Error("Enter a valid work email address.");
        await checkEmail(form.email.trim());
        const response = await register({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          companyName: form.companyName.trim(),
        });
        if (!response.data?.token)
          throw new Error(
            "Account creation did not return a verification token.",
          );
        localStorage.setItem("registrationToken", response.data.token);
        localStorage.setItem(
          "haelo-setup-identity",
          JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            companyName: form.companyName.trim(),
          }),
        );
        setVerification(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <SetupShell
      className="setup-signup"
      badge={verification ? "One quick check" : "Takes about 3 minutes"}
      title={verification ? "One quick check" : "Your first draft, on WhatsApp"}
      description={
        verification
          ? "We only use this to confirm your work email."
          : "Haelo reads internal emails, writes the reply in your voice, and waits for your YES."
      }
      headerAction={
        <Link href="/auth/login">Already have an account? Sign in</Link>
      }
    >
      <SetupStages active={0} />
      <h1>{verification ? "Check your email" : "Create your Haelo account"}</h1>
      <p className="setup-intro">
        {verification
          ? `We sent a 6-digit code to ${form.email}.`
          : "Start your 30-day pilot. No card needed."}
      </p>
      <form onSubmit={submit} className="setup-form">
        {verification ? (
          <>
            <CodeInput value={otp} onChange={setOtp} disabled={busy} />
            <p className="setup-note">Use the code sent to your work email.</p>
          </>
        ) : (
          <>
            <span className="setup-label">Sign up with</span>
            <AccountProviders />
            <div className="setup-divider">or</div>
            <div className="setup-field-pair">
              <Field label="Full name">
                <input
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                />
              </Field>
              <Field label="Company name">
                <input
                  autoComplete="organization"
                  required
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  placeholder="Your company"
                />
              </Field>
            </div>
            <Field label="Work email">
              <Mail size={16} />
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
              />
            </Field>
            <Field
              label="Create a password"
              hint="At least 8 characters, with a letter and a number."
            >
              <LockKeyhole size={16} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="setup-icon-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>
            <label className="setup-checkbox">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree to the Terms and Privacy Policy
            </label>
          </>
        )}
        {error && (
          <p className="setup-error" role="alert">
            {error}
          </p>
        )}
        <Actions
          onBack={
            verification
              ? () => {
                  setVerification(false);
                  setOtp("");
                  setError("");
                }
              : undefined
          }
          busy={busy}
          disabled={verification ? !/^\d{6}$/.test(otp) : !agreed}
        >
          {verification ? "Verify email" : "Create account"}
        </Actions>
        {verification && (
          <button
            type="button"
            className="setup-text-button"
            onClick={() => {
              setVerification(false);
              setOtp("");
              setError("");
            }}
          >
            Wrong email? Change it
          </button>
        )}
      </form>
    </SetupShell>
  );
}
