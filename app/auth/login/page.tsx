"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Mail,
  Clock3,
  Loader2,
} from "lucide-react";

import { login as loginApi } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const canSubmit = email.includes("@") && password.length > 0;

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit || loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await loginApi(email, password);

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      if (res.data?.userType) {
        localStorage.setItem("userType", res.data.userType);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.message ||
          "We could not sign you in. Please check your details and try again.",
      );

      setLoading(false);
    }
  };

  return (
    <>
      <div className="haelo-login">
        <div className="haelo-login-header">
          <div className="haelo-login-eyebrow">Welcome back</div>

          <h1 className="haelo-login-title">Sign in to Haelo</h1>

          <p className="haelo-login-subtitle">
            Your AI Chief of Staff is ready.
          </p>
        </div>

        {error && (
          <div className="haelo-login-error" role="alert">
            <ShieldCheck className="haelo-login-error-icon" size={16} />

            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="haelo-login-form">
          <div className="haelo-login-field">
            <div className="haelo-login-field-header">
              <label htmlFor="email" className="haelo-login-label">
                Email address
              </label>
            </div>

            <div className="haelo-login-input-wrap">
              <Mail className="haelo-login-input-icon" size={17} />

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                placeholder="adaeze@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="haelo-login-input"
              />
            </div>
          </div>

          <div className="haelo-login-field">
            <div className="haelo-login-field-header">
              <label htmlFor="password" className="haelo-login-label">
                Password
              </label>

              <Link
                href="https://wa.me/2347048048164"
                className="haelo-login-forgot"
              >
                Need help signing in?
              </Link>
            </div>

            <div className="haelo-login-input-wrap">
              <ShieldCheck className="haelo-login-input-icon" size={17} />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="haelo-login-input"
                style={{
                  paddingRight: 54,
                }}
              />

              <button
                type="button"
                className="haelo-login-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="haelo-login-submit"
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  style={{
                    animation: "spin .7s linear infinite",
                  }}
                />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="haelo-login-signup">
          No account yet? <Link href="/auth/signup">Start free trial</Link>
        </p>

        <div className="haelo-login-security">
          <ShieldCheck size={11} />
          Secure sign in
          <span>·</span>
          <Clock3 size={10} />
          Takes less than a minute
        </div>
      </div>
    </>
  );
}
