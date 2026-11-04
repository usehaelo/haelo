"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Mail, Plus } from "lucide-react";
import {
  getAccounts,
  inviteAccount,
  removeAccount,
  resendInvite,
  type OrgAccount,
  type AccountRole,
} from "@/lib/api/accounts";
import {
  Badge,
  BusyButton,
  Field,
  Overlay,
  SectionHeader,
} from "./WorkspaceUI";
export default function TeamAccess() {
  const [accounts, setAccounts] = useState<OrgAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AccountRole>("member");
  const [busy, setBusy] = useState(false);
  const [remove, setRemove] = useState<OrgAccount | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getAccounts()
      .then((response) => {
        if (active) setAccounts(response.data || []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load account access.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await inviteAccount({ email: email.trim(), role });
      setInvite(false);
      setEmail("");
      setAttempt((v) => v + 1);
      setNotice("Invitation sent.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not invite this account.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ws-card">
      <SectionHeader
        title="Team access"
        description="People who can sign in to your Haelo workspace"
        action={
          <button
            className="ws-button ws-dark"
            onClick={() => {
              setInvite(true);
              setError("");
            }}
          >
            <Plus size={14} />
            Invite account
          </button>
        }
      />
      {error && !invite && (
        <p className="ws-alert" role="alert">
          {error}{" "}
          <button onClick={() => setAttempt((v) => v + 1)}>Retry</button>
        </p>
      )}
      {notice && (
        <p className="ws-success-note" role="status">
          {notice}
        </p>
      )}
      <div className="ws-account-list">
        {accounts.map((account) => (
          <article key={account.id}>
            <span className="ws-round-icon">
              <Mail size={16} />
            </span>
            <div>
              <strong>{account.name || account.email}</strong>
              <small>
                {account.role} · {account.email}
              </small>
            </div>
            <Badge tone={account.status === "active" ? "green" : "neutral"}>
              {account.status}
            </Badge>
            {account.status === "invited" && (
              <button
                className="ws-button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await resendInvite(account.email);
                    setNotice("Invitation resent.");
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Could not resend invitation.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Resend
              </button>
            )}
            <button
              className="ws-button"
              disabled={busy || account.role === "owner"}
              onClick={() => setRemove(account)}
            >
              Revoke access
            </button>
          </article>
        ))}
        {!accounts.length && (
          <p className="ws-help">
            {loading
              ? "Loading account access…"
              : "No invited accounts are listed."}
          </p>
        )}
      </div>
      {invite && (
        <Overlay
          title="Invite an account"
          onClose={() => {
            if (!busy) setInvite(false);
          }}
          footer={
            <>
              <button
                className="ws-button"
                disabled={busy}
                onClick={() => setInvite(false)}
              >
                Cancel
              </button>
              <BusyButton
                busy={busy}
                onClick={() =>
                  (
                    document.getElementById("ws-invite-form") as HTMLFormElement
                  )?.requestSubmit()
                }
              >
                Send invitation
              </BusyButton>
            </>
          }
        >
          <form id="ws-invite-form" className="ws-form" onSubmit={submit}>
            <Field label="Email address">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Account role">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AccountRole)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            {error && (
              <p className="ws-alert" role="alert">
                {error}
              </p>
            )}
          </form>
        </Overlay>
      )}
      {remove && (
        <Overlay
          title="Revoke account access?"
          onClose={() => setRemove(null)}
          footer={
            <>
              <button
                className="ws-button"
                disabled={busy}
                onClick={() => setRemove(null)}
              >
                Cancel
              </button>
              <button
                className="ws-button ws-danger"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await removeAccount(remove.email);
                    setRemove(null);
                    setAttempt((v) => v + 1);
                    setNotice("Account access revoked.");
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Could not revoke access.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Revoking…" : "Revoke access"}
              </button>
            </>
          }
        >
          <p className="ws-help">
            {remove.email} will lose access to this workspace.
          </p>
          {error && (
            <p className="ws-alert" role="alert">
              {error}
            </p>
          )}
        </Overlay>
      )}
    </section>
  );
}
