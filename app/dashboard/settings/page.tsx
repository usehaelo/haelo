"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Check,
  CreditCard,
  FileText,
  GitBranch,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import {
  addWhatsappNumber,
  connectEmail,
  getDomain,
  getHaeloTone,
  getNotificationSettings,
  getProviders,
  getWhatsappNumber,
  revokeEmailAccess,
  saveDomain,
  saveHaeloTone,
  saveNotificationSettings,
  saveTimerConfig,
  verifyWhatsappNumber,
} from "@/lib/api/onboard";
import { getBillingHistory, getSubscription } from "@/lib/api/billing";
import {
  Badge,
  BusyButton,
  Choice,
  exportCSV,
  Field,
  Overlay,
  PreviewNotice,
  SectionHeader,
  Segments,
  Toggle,
} from "@/components/dashboard/WorkspaceUI";
import { CodeInput } from "@/components/setup/Controls";
import { useWorkspace } from "@/components/dashboard/workspace-data";
import TeamAccess from "@/components/dashboard/TeamAccess";
type TimerConfig = { timer: string; minutes: string; reminder: string };
type Notifications = {
  unrecognizedSenderAlerts: boolean;
  dailyActivitySummary: boolean;
  weeklyPerformanceReport: boolean;
  errorAndConnectionAlerts: boolean;
};
type Tone = {
  greeting: string;
  signoff: string;
  avoid: string[];
  emoji: boolean;
  instructions: string;
};
const initialTimer: TimerConfig = {
  timer: "hybrid",
  minutes: "10",
  reminder: "5",
};
const initialNotifs: Notifications = {
  unrecognizedSenderAlerts: true,
  dailyActivitySummary: true,
  weeklyPerformanceReport: false,
  errorAndConnectionAlerts: true,
};
const initialTone: Tone = {
  greeting: "Hi {first name},",
  signoff: "Thanks,",
  avoid: [],
  emoji: false,
  instructions: "",
};
const sections = [
  { id: "timer", title: "Timer & replies", icon: Timer },
  { id: "email", title: "Email accounts", icon: Mail },
  { id: "whatsapp", title: "WhatsApp", icon: MessageCircle },
  { id: "tone", title: "Tone of voice", icon: Sparkles },
  { id: "notifications", title: "Notifications", icon: Bell },
  { id: "billing", title: "Plan & billing", icon: FileText },
];
function parseTone(value: string): Tone {
  if (!value.includes("Greeting: "))
    return { ...initialTone, instructions: value };
  const field = (name: string) =>
    value
      .split("\n")
      .find((line) => line.startsWith(`${name}: `))
      ?.slice(name.length + 2) || "";
  return {
    greeting: field("Greeting"),
    signoff: field("Sign-off"),
    avoid: field("Words to avoid").split(" | ").filter(Boolean),
    emoji: field("Emoji with juniors") === "yes",
    instructions: value.split("Additional instructions: ")[1] || "",
  };
}
export default function SettingsPage() {
  const w = useWorkspace();
  const [section, setSection] = useState("timer");
  const [timer, setTimer] = useState(initialTimer);
  const [notifs, setNotifs] = useState(initialNotifs);
  const [tone, setTone] = useState(initialTone);
  const [domain, setDomain] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [wa, setWa] = useState<{ phone: string; phoneVerified: boolean }>({
    phone: "",
    phoneVerified: false,
  });
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicePage, setInvoicePage] = useState(1);
  const [moreInvoices, setMoreInvoices] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [demo, setDemo] = useState(false);
  const [quiet, setQuiet] = useState(true);
  const [includeCC, setIncludeCC] = useState(false);
  const [newDrafts, setNewDrafts] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [levelRules, setLevelRules] = useState<Record<string, string>>({
    Juniors: "auto",
    Managers: "auto",
    Directors: "wait",
    "HR and Finance": "wait",
  });
  const [word, setWord] = useState("");
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState(false);
  const [providerPending, setProviderPending] = useState<string | null>(null);
  const [disconnect, setDisconnect] = useState<any>(null);
  const baseline = useRef({
    timer: initialTimer,
    notifs: initialNotifs,
    tone: initialTone,
    domain: "",
  });
  const loaded = useRef({
    timer: false,
    tone: false,
    notifications: false,
    domain: false,
  });
  const popup = useRef<Window | null>(null);
  useEffect(() => {
    const sync = () => {
      const hash = location.hash.slice(1);
      const aliases: Record<string, string> = {
        workflow: "timer",
        connections: "email",
      };
      const next = aliases[hash] || hash;
      if ([...sections.map((s) => s.id), "team"].includes(next))
        setSection(next);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      popup.current?.close();
    };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.allSettled([
      getHaeloTone(),
      getProviders(),
      getWhatsappNumber(),
      getDomain(),
      getNotificationSettings(),
      getSubscription(),
      getBillingHistory(1, 5),
    ]).then((results) => {
      if (!active) return;
      const value = (index: number) =>
        results[index].status === "fulfilled"
          ? (results[index] as PromiseFulfilledResult<any>).value.data
          : null;
      const config = value(0);
      const nextTimer = {
        timer: config?.timer || initialTimer.timer,
        minutes: String(config?.timerConfig?.sendAfter ?? 10),
        reminder: String(config?.timerConfig?.remindAfter ?? 5),
      };
      const nextTone = parseTone(config?.tone || "");
      const n = value(4)?.settings || value(4) || {};
      const nextNotifs = {
        unrecognizedSenderAlerts: n.unrecognizedSenderAlerts ?? true,
        dailyActivitySummary: n.dailyActivitySummary ?? true,
        weeklyPerformanceReport: n.weeklyPerformanceReport ?? false,
        errorAndConnectionAlerts: n.errorAndConnectionAlerts ?? true,
      };
      const nextDomain = value(3)?.domain || "";
      setTimer(nextTimer);
      setTone(nextTone);
      setNotifs(nextNotifs);
      setDomain(nextDomain);
      baseline.current = {
        timer: nextTimer,
        tone: nextTone,
        notifs: nextNotifs,
        domain: nextDomain,
      };
      loaded.current = {
        timer: results[0].status === "fulfilled",
        tone: results[0].status === "fulfilled",
        notifications: results[4].status === "fulfilled",
        domain: results[3].status === "fulfilled",
      };
      setProviders(value(1)?.providers || []);
      setWa({
        phone: value(2)?.phone || "",
        phoneVerified: value(2)?.phoneVerified === true,
      });
      setSubscription(value(5) || null);
      setInvoices(value(6)?.transactions || []);
      setMoreInvoices(Boolean(value(6)?.meta?.nextPage));
      if (results.slice(0, 5).some((r) => r.status === "rejected"))
        setError(
          "Some settings couldn’t load. Retry before changing unavailable settings.",
        );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [attempt]);
  const dirty =
    JSON.stringify({ timer, tone, notifs, domain }) !==
    JSON.stringify(baseline.current);
  function changeSection(id: string) {
    setSection(id);
    window.location.hash = id;
    setNotice("");
  }
  function discard() {
    const original = baseline.current;
    setTimer({ ...original.timer });
    setNotifs({ ...original.notifs });
    setTone({ ...original.tone, avoid: [...original.tone.avoid] });
    setDomain(original.domain);
    setNotice("Changes discarded.");
    setError("");
  }
  function preview() {
    if (demo) {
      discard();
      setQuiet(true);
      setIncludeCC(false);
      setNewDrafts(true);
      setReminders(true);
      setLevelRules({
        Juniors: "auto",
        Managers: "auto",
        Directors: "wait",
        "HR and Finance": "wait",
      });
      setAttempt((value) => value + 1);
    }
    setDemo(!demo);
    setNotice("");
    setError("");
    setPhoneOpen(false);
  }
  async function save() {
    if (busy || loading) return;
    if (demo) {
      setNotice("Sample preferences updated. Your workspace is unchanged.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (JSON.stringify(timer) !== JSON.stringify(baseline.current.timer)) {
        if (!loaded.current.timer)
          throw new Error("Reload timer settings before saving.");
        await saveTimerConfig({
          timer: timer.timer,
          timerConfig: {
            sendAfter: Number(timer.minutes),
            remindAfter: Number(timer.reminder),
          },
        });
        baseline.current = { ...baseline.current, timer: { ...timer } };
      }
      if (JSON.stringify(notifs) !== JSON.stringify(baseline.current.notifs)) {
        if (!loaded.current.notifications)
          throw new Error("Reload notification settings before saving.");
        await saveNotificationSettings(notifs);
        baseline.current = { ...baseline.current, notifs: { ...notifs } };
      }
      if (JSON.stringify(tone) !== JSON.stringify(baseline.current.tone)) {
        if (!loaded.current.tone)
          throw new Error("Reload your tone settings before saving.");
        const text = `Juniors: warm and friendly. Managers: brief and direct. Directors: formal and complete.\nGreeting: ${tone.greeting}\nSign-off: ${tone.signoff}\nWords to avoid: ${tone.avoid.join(" | ")}\nEmoji with juniors: ${tone.emoji ? "yes" : "no"}\nAdditional instructions: ${tone.instructions}`;
        await saveHaeloTone(text);
        baseline.current = {
          ...baseline.current,
          tone: { ...tone, avoid: [...tone.avoid] },
        };
      }
      if (domain !== baseline.current.domain) {
        if (!loaded.current.domain)
          throw new Error("Reload your domain settings before saving.");
        if (
          !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(
            domain.trim(),
          )
        )
          throw new Error("Enter a valid company domain.");
        await saveDomain(domain.trim());
        baseline.current = { ...baseline.current, domain: domain.trim() };
        setDomain(domain.trim());
      }
      setNotice("Changes saved.");
      w.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save changes. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function connect(provider: "gmail.com" | "zoho.com") {
    const windowRef = window.open(
      "about:blank",
      "HaeloProvider",
      "width=520,height=700,scrollbars=yes,resizable=yes",
    );
    if (!windowRef) {
      setError("Allow pop-ups for this site, then try again.");
      return;
    }
    popup.current = windowRef;
    setBusy(true);
    setError("");
    try {
      const response = await connectEmail(provider);
      const url = new URL(response.data?.authUrl);
      if (url.protocol !== "https:" && url.hostname !== "localhost")
        throw new Error("Invalid provider sign-in URL.");
      windowRef.location.href = url.href;
      setProviderPending(provider);
    } catch (err) {
      windowRef.close();
      setError(err instanceof Error ? err.message : "Could not connect email.");
    } finally {
      setBusy(false);
    }
  }
  async function checkProvider() {
    setBusy(true);
    setError("");
    try {
      const response = await getProviders();
      const next = response.data?.providers || [];
      setProviders(next);
      if (!next.some((p: any) => p.provider === providerPending))
        throw new Error(
          "Finish sign-in in the provider window, then check again.",
        );
      setProviderPending(null);
      popup.current?.close();
      setNotice("Inbox connection confirmed.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not confirm inbox connection.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function verifyPhone() {
    if (busy) return;
    const raw = phone.replace(/\D/g, "");
    const normalized = raw.startsWith("0")
      ? `234${raw.slice(1)}`
      : raw.length === 10
        ? `234${raw}`
        : raw;
    if (!/^\d{10,15}$/.test(normalized)) {
      setError("Enter a valid number including country code.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (!sentCode) {
        if (!demo) await addWhatsappNumber(normalized);
        setSentCode(true);
        setWa({ phone: normalized, phoneVerified: false });
        if (!demo) w.reload();
      } else {
        if (!/^[a-zA-Z0-9]{6}$/.test(code))
          throw new Error("Enter the six-character verification code.");
        if (!demo) await verifyWhatsappNumber(normalized, code);
        setWa({ phone: normalized, phoneVerified: true });
        setPhoneOpen(false);
        setNotice(
          demo
            ? "Number verified in sample preview."
            : "WhatsApp number verified.",
        );
        if (!demo) w.reload();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify this number.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function loadInvoices() {
    setLoadingInvoices(true);
    try {
      const response = await getBillingHistory(invoicePage + 1, 5);
      setInvoices((items) => [
        ...items,
        ...(response.data?.transactions || []),
      ]);
      setInvoicePage((value) => value + 1);
      setMoreInvoices(Boolean(response.data?.meta?.nextPage));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load more invoices.",
      );
    } finally {
      setLoadingInvoices(false);
    }
  }
  const planName =
    subscription?.plan?.name ||
    subscription?.planName ||
    (subscription?.seatCount
      ? subscription.seatCount === 1
        ? "Individual"
        : subscription.seatCount <= 5
          ? "Team"
          : "Business"
      : "No active plan");
  return (
    <main className="ws-page ws-settings">
      <header className="ws-page-heading">
        <div>
          <h1>Settings</h1>
          <p>Change how Haelo works for you.</p>
        </div>
        {section !== "team" && section !== "billing" && (
          <div className="ws-page-tools">
            <button
              className="ws-text-link"
              disabled={busy || loading}
              onClick={discard}
            >
              Discard
            </button>
            <BusyButton
              busy={busy}
              disabled={loading || (!dirty && !demo)}
              onClick={save}
            >
              Save changes
            </BusyButton>
          </div>
        )}
      </header>
      {loading && (
        <p className="ws-help" role="status">
          Loading your settings…
        </p>
      )}
      {error && !phoneOpen && !disconnect && (
        <p className="ws-alert" role="alert">
          {error}{" "}
          <button onClick={() => setAttempt((value) => value + 1)}>
            Retry loading
          </button>
        </p>
      )}
      {notice && (
        <p className="ws-success-note" role="status">
          {notice}
        </p>
      )}
      <div className="ws-settings-layout">
        <nav className="ws-settings-nav" aria-label="Settings sections">
          {[
            ...sections,
            ...(w.userType === "admin"
              ? [{ id: "team", title: "Team access", icon: Users }]
              : []),
          ].map((item) => (
            <button
              key={item.id}
              aria-pressed={section === item.id}
              onClick={() => changeSection(item.id)}
            >
              <item.icon size={16} />
              {item.title}
            </button>
          ))}
        </nav>
        <div className="ws-settings-pane">
          {(demo ||
            !["team", "billing", "notifications"].includes(section)) && (
            <PreviewNotice
              active={demo}
              onToggle={preview}
              text="Additional controls such as quiet hours and per-level rules can be explored in sample preview."
            />
          )}
          {section === "timer" && (
            <>
              <section className="ws-card">
                <SectionHeader
                  title="When you don’t reply"
                  description="Choose what Haelo does when the timer runs out"
                />
                <div className="ws-timer-cards">
                  {[
                    [
                      "auto-send",
                      "Auto-send",
                      "Haelo sends the draft. Nothing piles up.",
                      Send,
                    ],
                    [
                      "hybrid",
                      "Mix by level",
                      "Auto-send for juniors. Wait for seniors, HR and Finance.",
                      GitBranch,
                    ],
                    [
                      "remind",
                      "Remind & wait",
                      "Nudges you on WhatsApp. Never sends alone.",
                      Bell,
                    ],
                  ].map(([id, title, description, Icon]) => {
                    const ModeIcon = Icon as typeof Send;
                    return (
                      <button
                        type="button"
                        disabled={loading}
                        className={`ws-timer-card${timer.timer === id ? " selected" : ""}`}
                        aria-pressed={timer.timer === id}
                        key={id as string}
                        onClick={() =>
                          setTimer({ ...timer, timer: id as string })
                        }
                      >
                        <span className="ws-round-icon">
                          <ModeIcon size={18} />
                        </span>
                        {id === "hybrid" && (
                          <span className="ws-lime-tag">Recommended</span>
                        )}
                        <strong>{title as string}</strong>
                        <p>{description as string}</p>
                        <i />
                      </button>
                    );
                  })}
                </div>
              </section>
              <section className="ws-card ws-horizontal-setting">
                <SectionHeader
                  title="How long to wait"
                  description="Before Haelo sends or reminds you"
                />
                <Segments
                  label="Wait duration"
                  value={timer.minutes}
                  onChange={(value) => setTimer({ ...timer, minutes: value })}
                  options={["5", "10", "15", "30"].map((value) => ({
                    id: value,
                    label: `${value} min`,
                  }))}
                />
              </section>
              {timer.timer !== "auto-send" && (
                <section className="ws-card ws-horizontal-setting">
                  <SectionHeader
                    title="Reminder interval"
                    description="How often to nudge you while waiting"
                  />
                  <Segments
                    label="Reminder interval"
                    value={timer.reminder}
                    onChange={(value) =>
                      setTimer({ ...timer, reminder: value })
                    }
                    options={["5", "10", "15", "30"].map((value) => ({
                      id: value,
                      label: `${value} min`,
                    }))}
                  />
                </section>
              )}
              {timer.timer === "hybrid" && (
                <section className="ws-card">
                  <SectionHeader
                    title="Rules by level"
                    description={
                      demo
                        ? "Sample rules for Mix by level"
                        : "Default hybrid behavior. Custom per-level rules are not supported yet."
                    }
                  />
                  <div className="ws-level-rules">
                    {Object.entries(levelRules).map(([label, value]) => (
                      <label key={label}>
                        <strong>{label}</strong>
                        <select
                          aria-label={`${label} timer rule`}
                          disabled={!demo}
                          value={value}
                          onChange={(e) =>
                            setLevelRules((previous) => ({
                              ...previous,
                              [label]: e.target.value,
                            }))
                          }
                        >
                          <option value="auto">
                            Auto-send after {timer.minutes} min
                          </option>
                          <option value="wait">Wait for your YES</option>
                          <option value="remind">Remind and wait</option>
                        </select>
                      </label>
                    ))}
                  </div>
                </section>
              )}
              <Toggle
                title="Quiet hours"
                description="Never auto-send between 8:00 PM and 7:00 AM. Sample control until scheduling is supported."
                value={quiet}
                disabled={!demo}
                onChange={() => setQuiet(!quiet)}
              />
            </>
          )}
          {section === "email" && (
            <>
              <section className="ws-card">
                <SectionHeader
                  title="Connected inbox"
                  description="Haelo reads new emails here and replies from this address"
                />
                {providers.length ? (
                  providers.map((provider: any, index: number) => (
                    <div
                      key={provider.uid || provider.id || index}
                      className="ws-provider-row"
                    >
                      <span className="ws-round-icon">
                        <Mail size={18} />
                      </span>
                      <div>
                        <strong>
                          {provider.provider?.includes("zoho")
                            ? "Zoho Mail"
                            : provider.provider?.includes("gmail")
                              ? "Gmail · Google Workspace"
                              : provider.provider || "Email provider"}
                        </strong>
                        <small>{provider.email || w.email}</small>
                      </div>
                      <Badge tone="green">Connected</Badge>
                      <button
                        className="ws-button"
                        disabled={
                          demo || !(provider.uid || provider.id) || busy
                        }
                        onClick={() => setDisconnect(provider)}
                      >
                        Disconnect
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="ws-help">No inbox connection is confirmed.</p>
                )}
              </section>
              <section className="ws-card">
                <SectionHeader
                  title="Use a different provider"
                  description="Sign in securely to connect an inbox"
                />
                {[
                  ["gmail.com", "Google Workspace or Gmail"],
                  ["microsoft", "Outlook / Microsoft 365"],
                  ["zoho.com", "Zoho Mail"],
                ]
                  .filter(([id]) => !providers.some((p) => p.provider === id))
                  .map(([id, title]) => (
                    <div key={id} className="ws-provider-row ws-soft">
                      <span className="ws-round-icon">
                        <Mail size={17} />
                      </span>
                      <div>
                        <strong>{title}</strong>
                        <small>
                          {id === "microsoft"
                            ? "Not available yet"
                            : "Secure provider sign-in"}
                        </small>
                      </div>
                      <button
                        className="ws-button"
                        disabled={demo || id === "microsoft" || busy}
                        onClick={() => connect(id as "gmail.com" | "zoho.com")}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                {providerPending && (
                  <div className="ws-provider-check">
                    <p>
                      Finish sign-in in the provider window, then confirm here.
                    </p>
                    <button
                      className="ws-button ws-dark"
                      disabled={busy}
                      onClick={checkProvider}
                    >
                      Check connection
                    </button>
                  </div>
                )}
              </section>
              <section className="ws-card">
                <SectionHeader title="Which emails Haelo reads" />
                <Field label="Company email domain">
                  <input
                    value={domain}
                    disabled={loading}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="company.com"
                  />
                </Field>
                <p className="ws-info-strip">
                  <ShieldCheck size={15} />
                  Only emails from people at @{domain || "your company domain"}
                </p>
                <Toggle
                  title="Include emails where I’m in CC"
                  description="Not supported by the current service. Off by default."
                  value={includeCC}
                  disabled={!demo}
                  onChange={() => setIncludeCC(!includeCC)}
                />
              </section>
            </>
          )}
          {section === "whatsapp" && (
            <>
              <section className="ws-card">
                <SectionHeader
                  title="Your WhatsApp number"
                  description="Drafts and reminders arrive here"
                />
                <div className="ws-provider-row">
                  <span className="ws-round-icon">
                    <Smartphone size={19} />
                  </span>
                  <div>
                    <strong>
                      {wa.phone ? `+${wa.phone}` : "No number connected"}
                    </strong>
                    <small>
                      {wa.phoneVerified
                        ? "Number verified"
                        : "Verification required"}
                    </small>
                  </div>
                  <Badge tone={wa.phoneVerified ? "green" : "neutral"}>
                    {wa.phoneVerified ? "Connected" : "Not verified"}
                  </Badge>
                  <button
                    className="ws-button"
                    disabled={!demo}
                    onClick={() =>
                      setNotice(
                        "Sample test-message preview. No WhatsApp message was sent.",
                      )
                    }
                  >
                    Send a test
                  </button>
                  <button
                    className="ws-button"
                    onClick={() => {
                      setPhone(wa.phone);
                      setCode("");
                      setSentCode(false);
                      setPhoneOpen(true);
                      setError("");
                    }}
                  >
                    Change number
                  </button>
                </div>
              </section>
              <section className="ws-card">
                <SectionHeader title="What Haelo sends you" />
                <Toggle
                  title="New drafts"
                  description="Requires additional service support to customise"
                  value={newDrafts}
                  disabled={!demo}
                  onChange={() => setNewDrafts(!newDrafts)}
                />
                <Toggle
                  title="Reminders"
                  description="Requires additional service support to customise"
                  value={reminders}
                  disabled={!demo}
                  onChange={() => setReminders(!reminders)}
                />
                <Toggle
                  title="Daily activity summary"
                  description="A summary of what came in and what was sent"
                  value={notifs.dailyActivitySummary}
                  onChange={() =>
                    setNotifs({
                      ...notifs,
                      dailyActivitySummary: !notifs.dailyActivitySummary,
                    })
                  }
                />
                <Toggle
                  title="Weekly performance report"
                  description="Your weekly activity report"
                  value={notifs.weeklyPerformanceReport}
                  onChange={() =>
                    setNotifs({
                      ...notifs,
                      weeklyPerformanceReport: !notifs.weeklyPerformanceReport,
                    })
                  }
                />
              </section>
              <section className="ws-card">
                <SectionHeader
                  title="Words you can reply with"
                  description="Use the supported reply words to respond to drafts"
                />
                <div className="ws-reply-words">
                  <div>
                    <span className="ws-lime-tag">YES</span>Send the draft
                  </div>
                  <div>
                    <span className="ws-level-pill dark">NO</span>Change it.
                    Type what to change.
                  </div>
                </div>
                <p className="ws-help">
                  Additional reply words depend on the connected WhatsApp
                  service.
                </p>
              </section>
            </>
          )}
          {section === "tone" && (
            <>
              <section className="ws-card">
                <SectionHeader
                  title="How you sound to each level"
                  description="Illustrative replies update as you change the settings below"
                />
                <div className="ws-tone-examples">
                  {[
                    [
                      "Juniors",
                      "Warm and friendly",
                      "Chidi",
                      "That’s fine, go ahead and swap with Femi. Thanks for sorting it out!",
                    ],
                    [
                      "Managers",
                      "Brief and direct",
                      "Tosin",
                      "Approved. Log the order and send the receipt to accounts today.",
                    ],
                    [
                      "Directors",
                      "Formal and complete",
                      "Kemi",
                      "Thank you for the request. Your leave from 12 to 16 November is approved. Please share the handover plan before you go.",
                    ],
                  ].map(([label, style, name, body]) => (
                    <article key={label}>
                      <header>
                        <strong>{label}</strong>
                        <span>{style}</span>
                      </header>
                      <p>{tone.greeting.replace(/\{first name\}/g, name)}</p>
                      <p>
                        {tone.avoid.reduce(
                          (value, avoid) =>
                            avoid ? value.replaceAll(avoid, "") : value,
                          body,
                        )}
                        {tone.emoji && label === "Juniors" ? " 👍" : ""}
                      </p>
                      <p>{tone.signoff}</p>
                    </article>
                  ))}
                </div>
              </section>
              <section className="ws-card">
                <div className="ws-form-pair">
                  <Field label="Greeting">
                    <input
                      value={tone.greeting}
                      onChange={(e) =>
                        setTone({ ...tone, greeting: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Sign-off">
                    <input
                      value={tone.signoff}
                      onChange={(e) =>
                        setTone({ ...tone, signoff: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="ws-field">
                  <span>Words Haelo should never use</span>
                  <div className="ws-word-tags">
                    {tone.avoid.map((value) => (
                      <button
                        key={value}
                        onClick={() =>
                          setTone({
                            ...tone,
                            avoid: tone.avoid.filter((item) => item !== value),
                          })
                        }
                      >
                        {value} ×
                      </button>
                    ))}
                    <input
                      aria-label="Word to avoid"
                      placeholder="Add word"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (word.trim())
                            setTone({
                              ...tone,
                              avoid: Array.from(
                                new Set([...tone.avoid, word.trim()]),
                              ),
                            });
                          setWord("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (word.trim())
                          setTone({
                            ...tone,
                            avoid: Array.from(
                              new Set([...tone.avoid, word.trim()]),
                            ),
                          });
                        setWord("");
                      }}
                    >
                      + Add word
                    </button>
                  </div>
                </div>
                <Field label="Additional writing instructions">
                  <textarea
                    rows={3}
                    value={tone.instructions}
                    onChange={(e) =>
                      setTone({ ...tone, instructions: e.target.value })
                    }
                  />
                </Field>
              </section>
              <Toggle
                title="Use emojis with juniors"
                description="Only a simple thumbs-up where it fits"
                value={tone.emoji}
                onChange={() => setTone({ ...tone, emoji: !tone.emoji })}
              />
            </>
          )}
          {section === "notifications" && (
            <section className="ws-card">
              <SectionHeader
                title="Notifications"
                description="Choose which updates reach you"
              />
              {[
                [
                  "unrecognizedSenderAlerts",
                  "Unrecognised sender alerts",
                  "When a sender isn’t on your staff list",
                ],
                [
                  "dailyActivitySummary",
                  "Daily activity summary",
                  "A summary of your daily activity",
                ],
                [
                  "weeklyPerformanceReport",
                  "Weekly performance report",
                  "How Haelo is working for you",
                ],
                [
                  "errorAndConnectionAlerts",
                  "Error and connection alerts",
                  "When a connection needs your attention",
                ],
              ].map(([id, title, description]) => (
                <Toggle
                  key={id}
                  title={title}
                  description={description}
                  value={notifs[id as keyof Notifications]}
                  onChange={() =>
                    setNotifs({
                      ...notifs,
                      [id]: !notifs[id as keyof Notifications],
                    })
                  }
                />
              ))}
            </section>
          )}
          {section === "billing" && (
            <>
              <div className="ws-billing-summary">
                <section className="ws-card ws-plan-card">
                  <small>Current plan</small>
                  <h2>{planName}</h2>
                  <p>
                    {subscription?.isActive
                      ? "Active subscription"
                      : "No active subscription confirmed"}
                  </p>
                  {subscription?.seatCount && (
                    <p>
                      {subscription.seatCount}{" "}
                      {subscription.seatCount === 1 ? "seat" : "seats"}
                    </p>
                  )}
                  <Link className="ws-button" href="/dashboard/billing">
                    Manage plan <CreditCard size={14} />
                  </Link>
                </section>
                <section className="ws-card">
                  <SectionHeader title="Plan details" />
                  <p className="ws-help">
                    Available pricing, payment methods and plan changes are
                    shown in Billing. The service’s current plan data is used
                    here.
                  </p>
                  <Link className="ws-text-link" href="/dashboard/billing">
                    Open plan & billing <BookOpen size={14} />
                  </Link>
                </section>
              </div>
              <section className="ws-card">
                <SectionHeader
                  title="Invoices"
                  action={
                    <button
                      className="ws-text-link"
                      onClick={() =>
                        exportCSV("haelo_billing_history.csv", [
                          ["Date", "Reference", "Amount", "Status"],
                          ...invoices.map((row) => [
                            row.createdAt || "",
                            row.trxRef || row.id || "",
                            row.amount ?? "",
                            row.status || "",
                          ]),
                        ])
                      }
                    >
                      Export history
                    </button>
                  }
                />
                <div className="ws-invoice-list">
                  {invoices.map((invoice, index) => (
                    <div key={invoice.id || invoice.trxRef || index}>
                      <span>
                        {invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleDateString()
                          : "Date unavailable"}
                      </span>
                      <strong>
                        ₦{Number(invoice.amount || 0).toLocaleString()}
                      </strong>
                      <Badge
                        tone={
                          /success|paid/i.test(invoice.status || "")
                            ? "green"
                            : "neutral"
                        }
                      >
                        {invoice.status || "Unknown"}
                      </Badge>
                      {/^https:\/\//.test(invoice.invoiceUrl || "") && (
                        <a
                          className="ws-button"
                          href={invoice.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  ))}
                  {!invoices.length && (
                    <p className="ws-help">No invoices are available.</p>
                  )}
                  {moreInvoices && (
                    <button
                      className="ws-button"
                      disabled={loadingInvoices}
                      onClick={loadInvoices}
                    >
                      {loadingInvoices ? "Loading…" : "Load more invoices"}
                    </button>
                  )}
                </div>
              </section>
            </>
          )}
          {section === "team" &&
            w.userType === "admin" &&
            (demo ? (
              <p className="ws-help">
                Exit sample preview to manage real account access.{" "}
                <button className="ws-text-link" onClick={preview}>
                  Exit preview
                </button>
              </p>
            ) : (
              <TeamAccess />
            ))}
        </div>
      </div>
      {phoneOpen && (
        <Overlay
          title="Change WhatsApp number"
          onClose={() => {
            if (!busy) setPhoneOpen(false);
          }}
          footer={
            <>
              <button
                className="ws-button"
                disabled={busy}
                onClick={() => setPhoneOpen(false)}
              >
                Cancel
              </button>
              <BusyButton
                busy={busy}
                disabled={sentCode && !/^[a-zA-Z0-9]{6}$/.test(code)}
                onClick={verifyPhone}
              >
                {sentCode ? "Verify number" : "Send code"}
              </BusyButton>
            </>
          }
        >
          <div className="ws-form">
            <Field label="WhatsApp number">
              <input
                type="tel"
                value={phone}
                readOnly={sentCode}
                placeholder="+234 815 000 5234"
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            {sentCode && (
              <>
                <CodeInput
                  numeric={false}
                  label="WhatsApp verification code"
                  value={code}
                  onChange={setCode}
                />
                <button
                  className="ws-text-link"
                  onClick={() => {
                    setSentCode(false);
                    setCode("");
                  }}
                >
                  Change number
                </button>
              </>
            )}
            {error && (
              <p className="ws-alert" role="alert">
                {error}
              </p>
            )}
            {demo && (
              <p className="ws-help">
                Sample preview. No verification message will be sent.
              </p>
            )}
          </div>
        </Overlay>
      )}
      {disconnect && (
        <Overlay
          title="Disconnect this inbox?"
          onClose={() => setDisconnect(null)}
          footer={
            <>
              <button
                className="ws-button"
                disabled={busy}
                onClick={() => setDisconnect(null)}
              >
                Cancel
              </button>
              <button
                className="ws-button ws-danger"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await revokeEmailAccess(
                      String(disconnect.uid || disconnect.id),
                    );
                    setProviders((items) =>
                      items.filter((item) => item !== disconnect),
                    );
                    setDisconnect(null);
                    setNotice("Inbox disconnected.");
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Could not disconnect this inbox.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Disconnecting…" : "Disconnect"}
              </button>
            </>
          }
        >
          <p className="ws-help">
            Haelo will stop reading this inbox. You can reconnect it with
            provider sign-in.
          </p>
          {error && (
            <p className="ws-alert" role="alert">
              {error}
            </p>
          )}
        </Overlay>
      )}
    </main>
  );
}
