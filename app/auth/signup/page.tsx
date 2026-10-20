"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Building2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { register, verifyOtp, checkEmail } from "@/lib/api/auth";

const steps = [
  {
    number: "01",
    label: "Your details",
  },
  {
    number: "02",
    label: "Your company",
  },
  {
    number: "03",
    label: "Password",
  },
];

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    otp: "",
  });

  /* ============================================================
     EMAIL VALIDATION
  ============================================================ */

  useEffect(() => {
    if (step !== 1) return;

    if (!form.email) {
      setEmailAvailable(false);
      return;
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

    if (!validEmail) {
      setEmailAvailable(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setCheckingEmail(true);
      setError("");

      try {
        await checkEmail(form.email);
        setEmailAvailable(true);
      } catch (err: any) {
        setEmailAvailable(false);

        setError(err?.message || "This email address cannot be used.");
      } finally {
        setCheckingEmail(false);
      }
    }, 550);

    return () => window.clearTimeout(timer);
  }, [form.email, step]);

  /* ============================================================
     PASSWORD STRENGTH
  ============================================================ */

  const passwordChecks = useMemo(
    () => ({
      length: form.password.length >= 8,
      letter: /[A-Za-z]/.test(form.password),
      number: /\d/.test(form.password),
    }),
    [form.password],
  );

  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;

  /* ============================================================
     HELPERS
  ============================================================ */

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const nextStep = () => {
    setError("");
    setSuccess("");
    setStep((current) => current + 1);
  };

  const previousStep = () => {
    setError("");
    setSuccess("");
    setStep((current) => current - 1);
  };

  /* ============================================================
     FORM SUBMISSION
  ============================================================ */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    /* ---------------- STEP 1 ---------------- */

    if (step === 1) {
      if (!form.name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (!emailAvailable) {
        setError("Please enter a valid and available work email.");
        return;
      }

      nextStep();
      return;
    }

    /* ---------------- STEP 2 ---------------- */

    if (step === 2) {
      if (!form.company.trim()) {
        setError("Please enter your company name.");
        return;
      }

      nextStep();
      return;
    }

    /* ---------------- STEP 3 ---------------- */

    if (step === 3) {
      if (form.password.length < 8) {
        setError("Your password must be at least 8 characters.");
        return;
      }

      setLoading(true);

      try {
        const res = await register({
          name: form.name,
          email: form.email,
          companyName: form.company,
          password: form.password,
        });

        if (res.data?.token) {
          localStorage.setItem("registrationToken", res.data.token);
        }

        setStep(4);
      } catch (err: any) {
        setError(
          err?.message || "We could not create your account. Please try again.",
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    /* ---------------- STEP 4 ---------------- */

    if (step === 4) {
      if (!form.otp.trim()) {
        setError("Please enter the verification code.");
        return;
      }

      const registrationToken = localStorage.getItem("registrationToken");

      if (!registrationToken) {
        setError("Your registration session has expired. Please start again.");
        return;
      }

      setLoading(true);

      try {
        const res = await verifyOtp(registrationToken, form.otp);

        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);

          localStorage.removeItem("registrationToken");
        }

        setSuccess(res.message || "Your email has been verified successfully.");

        window.setTimeout(() => {
          router.push("/onboarding");
        }, 900);
      } catch (err: any) {
        setError(err?.message || "That verification code is not valid.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="signup">
        <header className="header">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            GET STARTED
          </div>

          <div className="title-row">
            <div>
              <h1 className="title">
                {step === 4 ? "Verify your email" : "Create your account"}
              </h1>

              {step !== 4 && (
                <p className="subtitle">
                  Get Haelo working for your team in just a few simple steps.
                </p>
              )}
            </div>

            {step !== 4 && (
              <div className="trial">
                <Sparkles size={11} />
                START FREE
              </div>
            )}
          </div>

          {step !== 4 && (
            <div className="progress">
              {steps.map((item) => {
                const itemNumber = Number(item.number);

                const isActive = itemNumber === step;

                const isDone = itemNumber < step;

                return (
                  <div
                    key={item.number}
                    aria-current={isActive ? "step" : undefined}
                    className={[
                      "progress-item",
                      isActive ? "active" : "",
                      isDone ? "done" : "",
                    ].join(" ")}
                  >
                    <span className="progress-number">
                      {isDone ? "✓" : item.number}
                    </span>

                    <span className="progress-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </header>

        <section className="card">
          {error && (
            <div className="message error" role="alert">
              <AlertCircle className="message-icon" size={16} />

              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="message success" role="status">
              <Check className="message-icon" size={16} />

              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="step-content" key={step}>
              {step === 1 && (
                <>
                  <div className="field">
                    <div className="label-row">
                      <label htmlFor="name" className="label">
                        FULL NAME
                      </label>
                    </div>

                    <div className="input-wrap">
                      <Sparkles className="icon" size={17} />

                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Adaeze Okonkwo"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="input input-icon"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="field">
                    <div className="label-row">
                      <label htmlFor="email" className="label">
                        WORK EMAIL
                      </label>

                      {checkingEmail && (
                        <span className="hint">Checking...</span>
                      )}

                      {!checkingEmail && emailAvailable && (
                        <span className="hint">Email available</span>
                      )}
                    </div>

                    <div className="input-wrap">
                      <Mail className="icon" size={17} />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="adaeze@company.com"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className={[
                          "input",
                          "input-icon",
                          emailAvailable ? "email-valid" : "",
                        ].join(" ")}
                        required
                      />

                      {checkingEmail && (
                        <Loader2
                          className="valid"
                          size={17}
                          style={{
                            animation: "spin 1s linear infinite",
                          }}
                        />
                      )}

                      {!checkingEmail && emailAvailable && (
                        <Check className="valid" size={18} />
                      )}
                    </div>
                  </div>

                  <div className="info">
                    <div className="info-icon">
                      <ShieldCheck size={17} />
                    </div>

                    <div>
                      <span className="info-title">
                        Your information is secure.
                      </span>

                      <p className="info-text">
                        We&apos;ll use your work email to create your account
                        and verify your identity.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="button primary"
                    disabled={
                      !form.name.trim() || !emailAvailable || checkingEmail
                    }
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="field">
                    <div className="label-row">
                      <label htmlFor="company" className="label">
                        COMPANY NAME
                      </label>
                    </div>

                    <div className="input-wrap">
                      <Building2 className="icon" size={17} />

                      <input
                        id="company"
                        name="company"
                        type="text"
                        autoComplete="organization"
                        placeholder="Acme Corporation"
                        value={form.company}
                        onChange={(e) => updateField("company", e.target.value)}
                        className="input input-icon"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="info">
                    <div className="info-icon">
                      <Building2 size={17} />
                    </div>

                    <div>
                      <span className="info-title">
                        Tell us where you work.
                      </span>

                      <p className="info-text">
                        Your company name helps Haelo personalise your
                        workspace. You&apos;ll connect your business tools
                        during onboarding.
                      </p>
                    </div>
                  </div>

                  <div className="actions">
                    <button
                      type="button"
                      className="button secondary back"
                      onClick={previousStep}
                    >
                      <ArrowLeft size={15} />
                      Back
                    </button>

                    <button type="submit" className="button primary">
                      Continue
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="field">
                    <div className="label-row">
                      <label htmlFor="password" className="label">
                        PASSWORD
                      </label>

                      <span className="hint">At least 8 characters</span>
                    </div>

                    <div className="input-wrap">
                      <LockKeyhole className="icon" size={17} />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Create a secure password"
                        value={form.password}
                        onChange={(e) =>
                          updateField("password", e.target.value)
                        }
                        className="input input-icon"
                        style={{
                          paddingRight: 52,
                        }}
                        required
                        minLength={8}
                        autoFocus
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <div className="meter">
                      <div className="meter-bars">
                        {[1, 2, 3].map((number) => (
                          <span
                            key={number}
                            className={[
                              "meter-bar",
                              passwordScore >= number ? "active" : "",
                            ].join(" ")}
                          />
                        ))}
                      </div>

                      <div className="meter-caption">
                        <span>
                          {passwordScore === 0
                            ? "Enter a password"
                            : passwordScore === 3
                              ? "Strong password"
                              : "Keep going"}
                        </span>

                        <span>{passwordScore}/3</span>
                      </div>
                    </div>

                    <div className="rules">
                      <span
                        className={[
                          "rule",
                          passwordChecks.length ? "valid-rule" : "",
                        ].join(" ")}
                      >
                        <Check size={11} />
                        8+ characters
                      </span>

                      <span
                        className={[
                          "rule",
                          passwordChecks.letter ? "valid-rule" : "",
                        ].join(" ")}
                      >
                        <Check size={11} />A letter
                      </span>

                      <span
                        className={[
                          "rule",
                          passwordChecks.number ? "valid-rule" : "",
                        ].join(" ")}
                      >
                        <Check size={11} />A number
                      </span>
                    </div>
                  </div>

                  <div className="info">
                    <div className="info-icon">
                      <ShieldCheck size={17} />
                    </div>

                    <div>
                      <span className="info-title">Almost there.</span>

                      <p className="info-text">
                        Create your password and we&apos;ll send a verification
                        code to your work email.
                      </p>
                    </div>
                  </div>

                  <div className="actions">
                    <button
                      type="button"
                      className="button secondary back"
                      onClick={previousStep}
                    >
                      <ArrowLeft size={15} />
                      Back
                    </button>

                    <button
                      type="submit"
                      className="button primary"
                      disabled={loading || passwordScore < 2}
                    >
                      {loading ? (
                        <>
                          <Loader2
                            size={16}
                            style={{
                              animation: "spin 1s linear infinite",
                            }}
                          />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create account
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="agreement">
                    By continuing, you agree to our{" "}
                    <Link href="/terms">Terms of Service</Link> and{" "}
                    <Link href="/privacy">Privacy Policy</Link>.
                  </p>
                </>
              )}

              {step === 4 && (
                <div className="otp">
                  <div className="otp-icon">
                    <Mail size={24} />
                  </div>

                  <h2 className="otp-title">Check your inbox</h2>

                  <p className="otp-text">
                    We sent a verification code to <strong>{form.email}</strong>
                    . Enter the code below to finish creating your account.
                  </p>

                  <input
                    aria-label="Verification code"
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    maxLength={8}
                    placeholder="000000"
                    value={form.otp}
                    onChange={(e) =>
                      updateField(
                        "otp",
                        e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                      )
                    }
                    className="input otp-input"
                    required
                    autoFocus
                  />

                  <button
                    type="submit"
                    className="button primary"
                    style={{
                      marginTop: 16,
                    }}
                    disabled={loading || form.otp.length < 4}
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={16}
                          style={{
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify email
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="button secondary"
                    style={{
                      marginTop: 10,
                    }}
                    onClick={() => {
                      localStorage.removeItem("registrationToken");

                      setForm((current) => ({
                        ...current,
                        otp: "",
                      }));

                      setError("");
                      setSuccess("");
                      setStep(1);
                    }}
                  >
                    Start again
                  </button>
                </div>
              )}
            </div>
          </form>
        </section>

        {step !== 4 && (
          <p className="bottom">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </p>
        )}

        <div className="secure">
          <ShieldCheck size={11} />
          Secure account creation
          <span>·</span>
          No credit card required
        </div>
      </div>
    </>
  );
}
