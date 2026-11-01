"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Check,
  Clock3,
  Download,
  FileText,
  GitBranch,
  Loader2,
  LockKeyhole,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import SetupShell, {
  SetupStages,
  setupImages,
} from "@/components/setup/SetupShell";
import { Actions, CodeInput, Field } from "@/components/setup/Controls";
import { BIBLE_DOCS } from "@/components/setup/bible-documents";
import { getProfile } from "@/lib/api/auth";
import {
  addWhatsappNumber,
  connectEmail,
  getBibleMetrics,
  getDomain,
  getHaeloTone,
  getProviders,
  getWhatsappNumber,
  saveDomain,
  saveHaeloTone,
  saveTimerConfig,
  uploadBibleFiles,
  verifyWhatsappNumber,
} from "@/lib/api/onboard";
import { getStaffDirectory } from "@/lib/api/staff";

type Draft = {
  step: number;
  name: string;
  email: string;
  companyName: string;
  job: string;
  signoff: string;
  style: string;
  domain: string;
  industry: string;
  size: string;
  plan: string;
  phone: string;
  timer: string;
  minutes: string;
  reminder: string;
};
type Staff = {
  id: string;
  name?: string;
  fullName?: string;
  role?: string;
  level?: string;
  department?: string;
};
type Metrics = {
  status?: string;
  staffCount?: number;
  documentUploadCount?: number;
  tasks?: Record<string, unknown>;
};
const initial: Draft = {
  step: 0,
  name: "",
  email: "",
  companyName: "",
  job: "",
  signoff: "",
  style: "Balanced",
  domain: "",
  industry: "",
  size: "11–50",
  plan: "Professional",
  phone: "",
  timer: "hybrid",
  minutes: "10",
  reminder: "5",
};
const visuals = [
  [
    "Sounds like you",
    "Sounds like you, not a robot",
    "You can fine-tune the tone for each staff level later.",
    setupImages.boardroom,
  ],
  [
    "Internal emails only",
    "Internal emails only",
    "Clients, vendors and partners are never read or answered.",
    setupImages.company,
  ],
  [
    "30 days free",
    "Try everything for 30 days",
    "Choose the plan that suits your business.",
    setupImages.executive,
  ],
  [
    "Secure sign-in",
    "Long emails become three lines",
    "Who sent it, their role, and exactly what they need from you.",
    setupImages.commute,
  ],
  [
    "Approve from anywhere",
    "Approve from anywhere",
    "In a meeting, in traffic or at the airport: one word from WhatsApp is enough.",
    setupImages.airport,
  ],
  [
    "The most important step",
    "Haelo learns your business",
    "It uses your documents to write informed replies.",
    setupImages.boardroom,
  ],
  [
    "Reading your documents",
    "Reading, not guessing",
    "Haelo uses your documents and your staff’s emails.",
    setupImages.boardroom,
  ],
  [
    "Levels set the tone",
    "Levels set the tone",
    "Your staff directory helps Haelo understand who’s who.",
    setupImages.site,
  ],
  [
    "You stay in control",
    "Nothing piles up, nothing risky goes out",
    "You can change this any time in Settings.",
    setupImages.company,
  ],
  [
    "Your workspace",
    "Your inbox, handled",
    "Keep your team moving, wherever the day takes you.",
    setupImages.clouds,
  ],
];
function downloadTemplate(id: string) {
  const doc = BIBLE_DOCS.find((item) => item.id === id)!;
  const cols = doc.templateCols || [
    "firstName",
    "lastName",
    "role",
    "email",
    "description",
  ];
  const rows = doc.templateRows || [["", "", "", "", ""]];
  const csv = [cols, ...rows]
    .map((row) =>
      row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = doc.templateFile;
  link.click();
  URL.revokeObjectURL(url);
}
function Segments({
  values,
  value,
  onChange,
  label,
}: {
  values: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="setup-segments" role="group" aria-label={label}>
      {values.map((item) => (
        <button
          type="button"
          key={item}
          aria-pressed={item === value}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
export default function OnboardingPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [emailConnected, setEmailConnected] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [bibleUploaded, setBibleUploaded] = useState(false);
  const [timerSaved, setTimerSaved] = useState(false);
  const [provider, setProvider] = useState<"gmail.com" | "zoho.com">(
    "gmail.com",
  );
  const [awaiting, setAwaiting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [category, setCategory] = useState("overview");
  const [dragging, setDragging] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewFailed, setReviewFailed] = useState(false);
  const [reviewAttempt, setReviewAttempt] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const draftKey = useRef("");
  const popupRef = useRef<Window | null>(null);
  const step = draft.step;
  const visual = visuals[step];
  function update(patch: Partial<Draft>) {
    setDraft((previous) => ({ ...previous, ...patch }));
  }
  function go(next: number) {
    setError("");
    setNotice("");
    update({ step: next });
  }
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
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
  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("token")) {
      router.replace("/auth/login");
      return;
    }
    async function load() {
      try {
        const response = await getProfile();
        if (!active) return;
        const profile =
          response.data?.user || response.data?.profile || response.data || {};
        let identity: Partial<Draft> = {};
        try {
          identity = JSON.parse(
            localStorage.getItem("haelo-setup-identity") || "{}",
          );
        } catch {
          /* Ignore invalid browser draft. */
        }
        if (profile.email && identity.email && profile.email !== identity.email)
          identity = {};
        const email = profile.email || identity.email || "";
        draftKey.current = `haelo-setup:${email || "account"}`;
        let saved: Partial<Draft> = {};
        try {
          saved = JSON.parse(localStorage.getItem(draftKey.current) || "{}");
        } catch {
          /* Start a fresh draft. */
        }
        const safeStep =
          typeof saved.step === "number" && saved.step >= 0 && saved.step <= 9
            ? saved.step
            : 0;
        setDraft({
          ...initial,
          ...identity,
          ...saved,
          email,
          name:
            saved.name ||
            profile.name ||
            profile.fullName ||
            identity.name ||
            "",
          companyName:
            profile.companyName ||
            identity.companyName ||
            saved.companyName ||
            "",
          domain: saved.domain || email.split("@")[1] || "",
          step: safeStep,
        });
        setHydrated(true);
        const results = await Promise.allSettled([
          getProviders(),
          getDomain(),
          getWhatsappNumber(),
          getBibleMetrics(),
          getHaeloTone(),
        ]);
        if (!active) return;
        const providers = results[0];
        if (providers.status === "fulfilled")
          setEmailConnected(Boolean(providers.value.data?.providers?.length));
        const domain = results[1];
        if (domain.status === "fulfilled" && domain.value.data?.domain)
          setDraft((previous) => ({
            ...previous,
            domain: domain.value.data.domain,
          }));
        const phone = results[2];
        if (phone.status === "fulfilled") {
          const data = phone.value.data || {};
          if (data.phone || data.number)
            setDraft((previous) => ({
              ...previous,
              phone: String(data.phone || data.number).replace(/^\+?234/, ""),
            }));
          setWhatsappConnected(
            data.phoneVerified === true ||
              data.verified === true ||
              data.isVerified === true,
          );
        }
        const bible = results[3];
        if (bible.status === "fulfilled") {
          setMetrics(bible.value.data || null);
          setBibleUploaded(
            Number(bible.value.data?.documentUploadCount || 0) > 0 ||
              bible.value.data?.status === "Complete",
          );
        }
        const tone = results[4];
        if (tone.status === "fulfilled" && tone.value.data?.timer) {
          setTimerSaved(true);
          setDraft((previous) => ({
            ...previous,
            timer: tone.value.data.timer,
            minutes: String(
              tone.value.data.timerConfig?.sendAfter || previous.minutes,
            ),
            reminder: String(
              tone.value.data.timerConfig?.remindAfter || previous.reminder,
            ),
          }));
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load your account.",
          );
          setHydrated(true);
        }
      }
    }
    void load();
    return () => {
      active = false;
      popupRef.current?.close();
    };
  }, [router]);
  useEffect(() => {
    if (hydrated && draftKey.current)
      localStorage.setItem(draftKey.current, JSON.stringify(draft));
  }, [draft, hydrated]);
  useEffect(() => {
    if (!cooldown) return;
    const id = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);
  useEffect(() => {
    if (step !== 6) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const response = await getBibleMetrics();
        if (!active) return;
        const data = response.data || {};
        setMetrics(data);
        if (data.status === "Complete") {
          setBibleUploaded(true);
          setDraft((previous) => ({ ...previous, step: 7 }));
          return;
        }
        setNotice(
          "Your documents are still processing. You can leave this page open or save and finish later.",
        );
      } catch (err) {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Could not check processing status.",
          );
      }
      if (active) timer = setTimeout(poll, 5000);
    }
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [step]);
  useEffect(() => {
    if (step !== 7) return;
    let active = true;
    setReviewLoading(true);
    setReviewFailed(false);
    setError("");
    void Promise.allSettled([getStaffDirectory(), getBibleMetrics()]).then(
      (results) => {
        if (!active) return;
        const directory = results[0];
        if (directory.status === "fulfilled")
          setStaff(directory.value.data?.staff || []);
        else {
          setReviewFailed(true);
          setError(
            "We couldn’t load the staff directory. Please retry before reviewing.",
          );
        }
        const bible = results[1];
        if (bible.status === "fulfilled") setMetrics(bible.value.data || null);
        setReviewLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [step, reviewAttempt]);
  const phone = `234${draft.phone.replace(/\D/g, "").replace(/^234/, "").replace(/^0/, "")}`;
  async function sendCode() {
    await run(async () => {
      if (!/^234\d{10}$/.test(phone))
        throw new Error("Enter a valid Nigerian WhatsApp number.");
      await addWhatsappNumber(phone);
      setCodeSent(true);
      setCooldown(30);
      setNotice("Code sent to your WhatsApp.");
    });
  }
  async function startEmail() {
    // Open synchronously so browsers allow the provider window.
    const popup = window.open(
      "about:blank",
      "HaeloProvider",
      "width=520,height=700,scrollbars=yes,resizable=yes",
    );
    if (!popup) {
      setError("Allow pop-ups for this site, then try connecting again.");
      return;
    }
    popupRef.current = popup;
    await run(async () => {
      try {
        const response = await connectEmail(provider);
        const url = response.data?.authUrl;
        if (!url)
          throw new Error("No sign-in link was returned. Please try again.");
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" && parsed.hostname !== "localhost")
          throw new Error("The sign-in link is invalid.");
        popup.location.href = parsed.href;
        setAwaiting(true);
      } catch (err) {
        popup.close();
        throw err;
      }
    });
  }
  async function checkConnection() {
    await run(async () => {
      const response = await getProviders();
      if (
        !(response.data?.providers || []).some(
          (item: { provider: string }) => item.provider === provider,
        )
      )
        throw new Error(
          "Finish signing in in the provider window, then check again.",
        );
      setEmailConnected(true);
      setAwaiting(false);
      popupRef.current?.close();
    });
  }
  function addFiles(incoming: File[]) {
    const invalid = incoming.some(
      (file) =>
        !/\.csv$/i.test(file.name) ||
        file.size > 25 * 1024 * 1024 ||
        file.size === 0,
    );
    if (invalid) {
      setError("Choose non-empty CSV files, up to 25 MB each.");
      return;
    }
    setError("");
    setFiles((previous) => ({
      ...previous,
      [category]: [...(previous[category] || []), ...incoming],
    }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (step === 3 && !emailConnected) {
      if (awaiting) await checkConnection();
      else await startEmail();
      return;
    }
    await run(async () => {
      if (step === 0) {
        await saveHaeloTone(
          `${draft.style} tone. My job title is ${draft.job}. Sign off emails with: ${draft.signoff || draft.name}.`,
        );
        go(1);
      } else if (step === 1) {
        const domain = draft.domain.trim().toLowerCase();
        if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain))
          throw new Error(
            "Enter your company email domain, such as company.com.",
          );
        await saveDomain(domain);
        update({ domain, step: 2 });
      } else if (step === 2) go(3);
      else if (step === 3) go(4);
      else if (step === 4) {
        if (whatsappConnected) {
          go(5);
          return;
        }
        if (!codeSent) {
          if (!/^234\d{10}$/.test(phone))
            throw new Error("Enter a valid Nigerian WhatsApp number.");
          await addWhatsappNumber(phone);
          setCodeSent(true);
          setCooldown(30);
          setNotice("Code sent to your WhatsApp.");
        } else {
          if (!/^[a-zA-Z0-9]{6}$/.test(otp))
            throw new Error("Enter the six-character code from WhatsApp.");
          await verifyWhatsappNumber(phone, otp);
          setWhatsappConnected(true);
          go(5);
        }
      } else if (step === 5) {
        if (
          bibleUploaded &&
          !Object.values(files).some((list) => list.length)
        ) {
          go(metrics?.status === "Complete" ? 7 : 6);
          return;
        }
        if (
          !BIBLE_DOCS.filter((doc) => doc.required).every(
            (doc) => files[doc.id]?.length,
          )
        )
          throw new Error(
            "Add the company overview, staff directory and org chart CSV files.",
          );
        const body = new FormData();
        BIBLE_DOCS.forEach((doc) =>
          (files[doc.id] || []).forEach((file) => body.append(doc.id, file)),
        );
        await uploadBibleFiles(body);
        setBibleUploaded(true);
        go(6);
      } else if (step === 7) {
        if (reviewFailed)
          throw new Error(
            "Retry loading your staff directory before continuing.",
          );
        go(8);
      } else if (step === 8) {
        await saveTimerConfig({
          timer: draft.timer,
          timerConfig: {
            sendAfter: Number(draft.minutes),
            remindAfter: Number(draft.reminder),
          },
        });
        setTimerSaved(true);
        go(9);
      } else if (step === 9) router.push("/dashboard");
    });
  }
  const stages = step < 3 ? 1 : step < 5 ? 2 : 3;
  const complete =
    emailConnected &&
    whatsappConnected &&
    metrics?.status === "Complete" &&
    timerSaved;
  const titles = [
    "Tell us about you",
    draft.companyName ? `About ${draft.companyName}` : "About your company",
    "Start your free pilot",
    "Connect your work email",
    "Connect your WhatsApp",
    "Upload your Business Bible",
    "Haelo is reading your Business Bible",
    "Here’s what Haelo learned",
    "What should happen when you’re busy?",
    complete
      ? `You’re live${draft.name ? `, ${draft.name.split(" ")[0]}` : ""}`
      : "Your setup progress",
  ];
  const intros = [
    "So Haelo can write replies that sound like you.",
    "Check your company details and internal email domain.",
    "Choose the plan you’re interested in after your pilot. You can change it later.",
    "Haelo reads emails from your staff and replies from this address.",
    "Every draft and reminder will arrive here.",
    `The documents that tell Haelo how ${draft.companyName || "your business"} works.`,
    "This usually takes under a minute. You can keep this page open.",
    "Check the people and information imported from your documents.",
    "If you don’t reply to a draft in time, Haelo will…",
    complete
      ? "Haelo is ready to handle your internal emails. Your drafts will arrive on WhatsApp."
      : "You can finish any remaining steps now or return from your dashboard.",
  ];
  if (!hydrated)
    return (
      <div className="setup-loading" role="status">
        <Loader2 className="setup-spinner" />
        Loading your workspace…
      </div>
    );
  return (
    <SetupShell
      image={visual[3]}
      badge={visual[0]}
      title={visual[1]}
      description={visual[2]}
      headerAction={
        <button
          type="button"
          className="setup-text-button"
          disabled={busy}
          onClick={() => router.push("/dashboard")}
        >
          Save and finish later
        </button>
      }
    >
      <SetupStages active={stages} complete={step === 9 && complete} />
      {step === 9 && complete && (
        <span className="setup-success-mark">
          <Check />
        </span>
      )}
      <h1>{titles[step]}</h1>
      <p className="setup-intro">{intros[step]}</p>
      <form className="setup-form" onSubmit={submit}>
        <fieldset disabled={busy} className="setup-fields">
          {step === 0 && (
            <>
              <Field label="Full name">
                <input
                  required
                  autoComplete="name"
                  value={draft.name}
                  onChange={(e) => update({ name: e.target.value })}
                />
              </Field>
              <Field label="Job title">
                <input
                  required
                  autoComplete="organization-title"
                  value={draft.job}
                  onChange={(e) => update({ job: e.target.value })}
                  placeholder="Chief Executive Officer"
                />
              </Field>
              <Field label="How you sign off emails">
                <input
                  value={draft.signoff}
                  onChange={(e) => update({ signoff: e.target.value })}
                  placeholder={
                    draft.name
                      ? `Thanks, ${draft.name.split(" ")[0]}`
                      : "Thanks, your name"
                  }
                />
              </Field>
              <div className="setup-field">
                <span>Your usual style</span>
                <Segments
                  label="Your usual style"
                  values={["Warm", "Balanced", "Formal"]}
                  value={draft.style}
                  onChange={(style) => update({ style })}
                />
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <Field
                label="Company name"
                hint="Saved with your account at signup."
              >
                <input value={draft.companyName} readOnly />
              </Field>
              <Field label="Company email domain">
                <LockKeyhole size={16} />
                <input
                  required
                  value={draft.domain}
                  onChange={(e) => update({ domain: e.target.value })}
                  placeholder="company.com"
                />
              </Field>
              <p className="setup-info">
                <ShieldCheck size={14} />
                Haelo only reads emails from people at this domain.
              </p>
              <Field label="Industry">
                <select
                  value={draft.industry}
                  onChange={(e) => update({ industry: e.target.value })}
                >
                  <option value="">Choose your industry</option>
                  {[
                    "Hospitality and food",
                    "Professional services",
                    "Construction and property",
                    "Technology",
                    "Retail and distribution",
                    "Other",
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <div className="setup-field">
                <span>How many staff email you?</span>
                <Segments
                  label="Staff size"
                  values={["1–10", "11–50", "51–200", "200+"]}
                  value={draft.size}
                  onChange={(size) => update({ size })}
                />
              </div>
              <p className="setup-note">
                Industry and team size are saved on this browser.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <div
                className="setup-options"
                role="group"
                aria-label="Preferred pilot plan"
              >
                {[
                  ["Starter", "₦150k a month · up to 3 email accounts"],
                  [
                    "Professional",
                    "₦300k a month · rules for each staff level",
                  ],
                  ["Executive", "₦500k a month · up to 3 executives"],
                ].map(([name, description]) => (
                  <button
                    key={name}
                    type="button"
                    className={`setup-option${draft.plan === name ? " selected" : ""}`}
                    aria-pressed={draft.plan === name}
                    onClick={() => update({ plan: name })}
                  >
                    <span>
                      <strong>{name}</strong>
                      <small>{description}</small>
                    </span>
                    {name === "Professional" && <em>Popular</em>}
                    <i />
                  </button>
                ))}
              </div>
              <p className="setup-info">
                <LockKeyhole size={14} />
                No card needed today.
              </p>
              <p className="setup-note">
                This saves your preference on this browser. Confirm available
                pricing and pilot terms in Billing before subscribing.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              {emailConnected ? (
                <p className="setup-info">
                  <Check size={16} />
                  Your work email is connected.
                </p>
              ) : (
                <div
                  className="setup-options"
                  role="group"
                  aria-label="Email provider"
                >
                  {[
                    [
                      "gmail.com",
                      "Google Workspace or Gmail",
                      "Sign in with Google",
                    ],
                    [
                      "microsoft",
                      "Microsoft 365 or Outlook",
                      "Not available yet",
                    ],
                    ["zoho.com", "Zoho Mail", "Sign in with Zoho"],
                  ].map(([id, name, description]) => (
                    <button
                      type="button"
                      key={id}
                      disabled={id === "microsoft" || awaiting}
                      aria-pressed={provider === id}
                      className={`setup-option${provider === id ? " selected" : ""}`}
                      onClick={() =>
                        setProvider(id as "gmail.com" | "zoho.com")
                      }
                    >
                      <span className="setup-option-icon">
                        <Mail size={18} />
                      </span>
                      <span>
                        <strong>{name}</strong>
                        <small>{description}</small>
                      </span>
                      <i />
                    </button>
                  ))}
                </div>
              )}
              <p className="setup-info">
                <LockKeyhole size={14} />
                Secure sign-in. Haelo never sees your password.
              </p>
              {awaiting && (
                <p className="setup-note">
                  Finish authorising in the provider window, then check your
                  connection here.{" "}
                  <button
                    type="button"
                    className="setup-text-button"
                    onClick={() => setAwaiting(false)}
                  >
                    Try another provider
                  </button>
                </p>
              )}
            </>
          )}
          {step === 4 && (
            <>
              {whatsappConnected ? (
                <p className="setup-info">
                  <Check size={16} />
                  WhatsApp number verified.
                </p>
              ) : (
                <>
                  <Field label="WhatsApp number">
                    <span className="setup-country">NG +234</span>
                    <input
                      type="tel"
                      autoComplete="tel-national"
                      required
                      value={draft.phone}
                      readOnly={codeSent}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="815 000 5234"
                    />
                  </Field>
                  {codeSent && (
                    <>
                      <span className="setup-label">
                        Enter the code we sent to WhatsApp
                      </span>
                      <CodeInput
                        value={otp}
                        onChange={setOtp}
                        label="WhatsApp code"
                        numeric={false}
                      />
                      <button
                        className="setup-text-button"
                        type="button"
                        disabled={cooldown > 0}
                        onClick={sendCode}
                      >
                        {cooldown
                          ? `Resend code in 0:${String(cooldown).padStart(2, "0")}`
                          : "Resend code"}
                      </button>
                      <button
                        type="button"
                        className="setup-text-button"
                        onClick={() => {
                          setCodeSent(false);
                          setOtp("");
                        }}
                      >
                        Change number
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          )}
          {step === 5 && (
            <>
              <div
                className="setup-document-tabs"
                role="group"
                aria-label="Document category"
              >
                {BIBLE_DOCS.map((doc) => (
                  <button
                    type="button"
                    key={doc.id}
                    aria-pressed={category === doc.id}
                    onClick={() => setCategory(doc.id)}
                  >
                    {doc.name}
                    {doc.required ? " *" : ""}
                    {files[doc.id]?.length ? <Check size={12} /> : null}
                  </button>
                ))}
              </div>
              <p className="setup-note">
                {BIBLE_DOCS.find((doc) => doc.id === category)?.hint}
              </p>
              <input
                key={category}
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(Array.from(e.target.files || []));
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className={`setup-dropzone${dragging ? " dragging" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addFiles(Array.from(e.dataTransfer.files));
                }}
              >
                <span>
                  <Upload size={22} />
                </span>
                <strong>Drop your CSV files here</strong>
                <small>or browse your files · up to 25 MB each</small>
              </button>
              {(files[category] || []).map((file, index) => (
                <div key={`${file.name}-${index}`} className="setup-file-row">
                  <FileText size={16} />
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="setup-icon-button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() =>
                      setFiles((previous) => ({
                        ...previous,
                        [category]: previous[category].filter(
                          (_, i) => i !== index,
                        ),
                      }))
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="setup-includes">
                <strong>What to include</strong>
                {[
                  "Who works here, their roles and departments",
                  "How things are done: leave, payments, orders",
                  "What you approve, decline or delegate",
                  "How you like to write",
                ].map((item) => (
                  <p key={item}>
                    <Check size={14} />
                    {item}
                  </p>
                ))}
              </div>
              <button
                type="button"
                className="setup-text-button"
                onClick={() => downloadTemplate(category)}
              >
                <Download size={14} />
                Download the{" "}
                {BIBLE_DOCS.find(
                  (doc) => doc.id === category,
                )?.name.toLowerCase()}{" "}
                template
              </button>
              <p className="setup-note">
                Add the three required categories (*). PDF and Word imports
                aren’t available yet.
              </p>
              {bibleUploaded && (
                <p className="setup-info">
                  <Check size={14} />
                  Previously uploaded documents are available.
                </p>
              )}
            </>
          )}
          {step === 6 && (
            <>
              <div className="setup-processing" role="status">
                <Loader2 className="setup-spinner" size={20} />
                <span>
                  <strong>Processing your Business Bible</strong>
                  <small>
                    {metrics?.status || "Checking processing status…"}
                  </small>
                </span>
              </div>
              <div className="setup-reading-list">
                {BIBLE_DOCS.map((doc) => {
                  const task = metrics?.tasks?.[doc.id];
                  const done =
                    task === true ||
                    task === "Complete" ||
                    task === "completed";
                  return (
                    <div key={doc.id}>
                      <span className={done ? "reading-done" : ""}>
                        {done ? <Check size={16} /> : <Clock3 size={16} />}
                      </span>
                      <span>
                        <strong>{doc.name}</strong>
                        <small>
                          {done
                            ? "Read"
                            : typeof task === "string"
                              ? task
                              : "Waiting for processing status"}
                        </small>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {step === 7 && (
            <>
              {reviewLoading ? (
                <p className="setup-info" role="status">
                  <Loader2 className="setup-spinner" size={16} />
                  Loading imported information…
                </p>
              ) : (
                <>
                  <div className="setup-stats">
                    <div>
                      <strong>{metrics?.staffCount ?? staff.length}</strong>
                      <small>staff</small>
                    </div>
                    <div>
                      <strong>
                        {staff.length
                          ? new Set(
                              staff
                                .map((person) => person.department)
                                .filter(Boolean),
                            ).size
                          : "—"}
                      </strong>
                      <small>departments shown</small>
                    </div>
                    <div>
                      <strong>{metrics?.documentUploadCount ?? "—"}</strong>
                      <small>documents</small>
                    </div>
                  </div>
                  <div className="setup-staff">
                    {staff.slice(0, 4).map((person) => (
                      <div key={person.id}>
                        <span className="setup-avatar">
                          {(person.name || person.fullName || "?")
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <span>
                          <strong>{person.name || person.fullName}</strong>
                          <small>{person.role || person.department}</small>
                        </span>
                        {person.level && (
                          <span className="setup-level">{person.level}</span>
                        )}
                      </div>
                    ))}
                    {!staff.length && (
                      <p>
                        No staff are available in the directory yet. You can add
                        them from your dashboard.
                      </p>
                    )}
                    <Link href="/dashboard/staff">View staff directory</Link>
                  </div>
                  <p className="setup-note">
                    Counts reflect imported data. Manage staff and their details
                    from your dashboard.
                  </p>
                </>
              )}
            </>
          )}
          {step === 8 && (
            <>
              <div
                className="setup-options"
                role="group"
                aria-label="When you are busy"
              >
                {[
                  [
                    "auto-send",
                    "Send it for me",
                    "Auto-send when the timer runs out",
                    Send,
                  ],
                  [
                    "hybrid",
                    "Mix by level",
                    "Auto-send for juniors, wait for seniors",
                    GitBranch,
                  ],
                  [
                    "remind",
                    "Remind me and wait",
                    "Never sends without your YES",
                    Bell,
                  ],
                ].map(([id, name, description, Icon]) => {
                  const OptionIcon = Icon as typeof Send;
                  return (
                    <button
                      key={id as string}
                      type="button"
                      className={`setup-option${draft.timer === id ? " selected" : ""}`}
                      aria-pressed={draft.timer === id}
                      onClick={() => update({ timer: id as string })}
                    >
                      <span className="setup-option-icon">
                        <OptionIcon size={18} />
                      </span>
                      <span>
                        <strong>{name as string}</strong>
                        <small>{description as string}</small>
                      </span>
                      {id === "hybrid" && <em>Best</em>}
                      <i />
                    </button>
                  );
                })}
              </div>
              <div className="setup-field">
                <span>Wait this long first</span>
                <Segments
                  label="Wait time in minutes"
                  values={["5", "10", "15", "30"]}
                  value={draft.minutes}
                  onChange={(minutes) => update({ minutes })}
                />
                <small>Minutes</small>
              </div>
              {draft.timer !== "auto-send" && (
                <Field label="Reminder interval">
                  <select
                    value={draft.reminder}
                    onChange={(e) => update({ reminder: e.target.value })}
                  >
                    {["5", "10", "15", "30"].map((item) => (
                      <option key={item} value={item}>
                        {item} minutes
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </>
          )}
          {step === 9 && (
            <div className="setup-summary">
              {[
                [
                  Mail,
                  `Email ${emailConnected ? "connected" : "not connected"}`,
                  emailConnected,
                  3,
                ],
                [
                  MessageCircle,
                  `WhatsApp ${whatsappConnected ? "verified" : "not verified"}`,
                  whatsappConnected,
                  4,
                ],
                [
                  BookOpen,
                  `Business Bible ${metrics?.status === "Complete" ? "read" : bibleUploaded ? "processing" : "not uploaded"}`,
                  metrics?.status === "Complete",
                  5,
                ],
                [
                  GitBranch,
                  `${draft.timer === "hybrid" ? "Mix by level" : draft.timer === "remind" ? "Remind and wait" : "Auto-send"} · ${draft.minutes} minute timer`,
                  timerSaved,
                  8,
                ],
              ].map(([Icon, label, done, target]) => {
                const SummaryIcon = Icon as typeof Mail;
                return (
                  <button
                    key={target as number}
                    type="button"
                    onClick={() => go(target as number)}
                  >
                    <span className="setup-option-icon">
                      <SummaryIcon size={16} />
                    </span>
                    <span>{label as string}</span>
                    {done ? (
                      <Check size={16} className="reading-done" />
                    ) : (
                      <span className="setup-level">Finish</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>
        {error && (
          <p className="setup-error" role="alert">
            {error}
          </p>
        )}
        {step === 7 && reviewFailed && (
          <button
            type="button"
            className="setup-text-button"
            onClick={() => setReviewAttempt((previous) => previous + 1)}
          >
            Retry loading staff
          </button>
        )}
        {notice && (
          <p className="setup-note" role="status">
            {notice}
          </p>
        )}
        {step !== 6 && (
          <Actions
            onBack={
              step > 0 && step < 9
                ? () => go(step === 7 ? 5 : step - 1)
                : undefined
            }
            busy={busy}
            disabled={step === 7 && (reviewLoading || reviewFailed)}
          >
            {step === 3
              ? emailConnected
                ? "Continue"
                : awaiting
                  ? "Check connection"
                  : `Continue with ${provider === "gmail.com" ? "Google" : "Zoho"}`
              : step === 4
                ? whatsappConnected
                  ? "Continue"
                  : codeSent
                    ? "Verify number"
                    : "Send verification code"
                : step === 7
                  ? "Looks right"
                  : step === 8
                    ? "Finish set-up"
                    : step === 9
                      ? "Go to my dashboard"
                      : "Continue"}
          </Actions>
        )}
        {step === 6 && (
          <button
            type="button"
            className="setup-text-button"
            onClick={() => go(5)}
          >
            Back to documents
          </button>
        )}
      </form>
    </SetupShell>
  );
}
