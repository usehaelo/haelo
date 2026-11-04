"use client";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Download,
  Hourglass,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Timer,
  UserRoundX,
} from "lucide-react";
import {
  addStaff as createStaff,
  getStaffDirectory,
  getUnrecognizedSenders,
} from "@/lib/api/staff";
import {
  Badge,
  BusyButton,
  Choice,
  exportCSV,
  Field,
  Overlay,
  PreviewNotice,
  Segments,
} from "@/components/dashboard/WorkspaceUI";
import { initials, useWorkspace } from "@/components/dashboard/workspace-data";
type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  level: string;
  timer: string;
  status: string;
  new?: boolean;
};
type Sender = { email: string; subject?: string; message?: string };
const levels = ["Junior", "Manager", "Director"];
const samplePeople: Person[] = [
  ["Kemi Eze", "Head of HR", "People", "Director", "wait"],
  ["Ibrahim Bello", "Finance Lead", "Finance", "Manager", "wait"],
  ["Tosin Adeyemi", "Operations Manager", "Operations", "Manager", "auto"],
  ["Amaka Okonkwo", "Finance Officer", "Finance", "Junior", "auto"],
  ["Chidi Okafor", "Shift Supervisor", "Operations", "Junior", "auto"],
  ["Bola Ogun", "HR Officer", "People", "Junior", "auto"],
  ["Femi Adebayo", "Kitchen Lead", "Operations", "Junior", "auto"],
].map(([name, role, department, level, timer], i) => ({
  id: `sample-${i}`,
  name,
  role,
  department,
  level,
  timer,
  email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  status: "active",
  new: i === 5,
}));
const blank = {
  name: "",
  email: "",
  role: "",
  department: "",
  level: "Junior",
};
function StaffContent() {
  const params = useSearchParams();
  const w = useWorkspace();
  const [people, setPeople] = useState<Person[]>([]);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [sample, setSample] = useState(samplePeople);
  const [demo, setDemo] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Everyone");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [identify, setIdentify] = useState<Sender | null>(null);
  const [decision, setDecision] = useState("add");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(blank);
  const [selected, setSelected] = useState<Person | null>(null);
  const [level, setLevel] = useState("");
  const [timer, setTimer] = useState("auto");
  const [removing, setRemoving] = useState<Person | null>(null);
  const [removeBible, setRemoveBible] = useState(false);
  useEffect(() => setQuery(params.get("search") || ""), [params]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.allSettled([
      getStaffDirectory(page),
      getUnrecognizedSenders(1, 7),
    ]).then((results) => {
      if (!active) return;
      const directory = results[0];
      if (directory.status === "fulfilled") {
        setPeople(
          (directory.value.data?.staff || []).map((p: any) => ({
            id: String(p.id || p.email),
            name: p.name || p.fullName || "Unknown",
            email: p.email || "",
            role: p.role || "",
            department: p.department || "",
            level: p.level || "",
            timer:
              typeof p.timer === "number"
                ? `Auto-send after ${p.timer} min`
                : p.timer || "",
            status: p.status || "",
          })),
        );
        setMeta(directory.value.data?.meta || null);
      } else setError(directory.reason.message || "Could not load staff.");
      const unknown = results[1];
      if (unknown.status === "fulfilled")
        setSenders(
          (unknown.value.data?.senders || [])
            .map((sender: any) => ({
              email:
                typeof sender === "string"
                  ? sender
                  : sender.emailAddress || sender.email,
              subject: sender.subject,
              message: sender.originalMessage || sender.message,
            }))
            .filter((sender: Sender) => sender.email),
        );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [page, attempt]);
  const source = demo ? sample : people;
  const list = source.filter(
    (person) =>
      (filter === "Everyone" || person.level === filter) &&
      `${person.name} ${person.email} ${person.role} ${person.department}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const unknown = demo
    ? hidden
      ? null
      : {
          email: "david@example.com",
          subject: "Quote for the new cold room",
          message:
            "Following our call, please review the revised quote for the cold room installation.",
        }
    : senders[0];
  function switchPreview() {
    setDemo(!demo);
    setSample(samplePeople);
    setHidden(false);
    setFilter("Everyone");
    setSelected(null);
    setAdding(false);
    setIdentify(null);
    setError("");
    setNotice("");
  }
  function open(person: Person) {
    setSelected(person);
    setLevel(person.level || "Junior");
    setTimer(
      person.timer === "wait"
        ? "wait"
        : person.timer === "remind"
          ? "remind"
          : "auto",
    );
    setError("");
    setNotice("");
  }
  async function add(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!form.name.trim() || !form.role.trim() || !form.department.trim()) {
      setError("Complete the name, role and department.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (demo) {
        setSample((items) => [
          ...items,
          {
            ...form,
            id: `sample-${Date.now()}`,
            timer: form.level === "Director" ? "wait" : "auto",
            status: "active",
            new: true,
          },
        ]);
        setHidden(true);
      } else {
        await createStaff({
          fullName: form.name.trim(),
          email: form.email.trim(),
          role: form.role.trim(),
          department: form.department.trim(),
        });
        setAttempt((value) => value + 1);
        w.reload();
      }
      setAdding(false);
      setForm(blank);
      setNotice(
        demo ? "Staff member added in sample preview." : "Staff member added.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add this staff member.",
      );
    } finally {
      setBusy(false);
    }
  }
  const policy = (p: Person) =>
    p.timer === "wait"
      ? "Waits for your YES"
      : p.timer === "auto"
        ? "Auto-sends after 10 min"
        : p.timer === "remind"
          ? "Reminds every 10 min"
          : p.timer || "Not configured";
  return (
    <main className="ws-page ws-staff">
      <header className="ws-page-heading">
        <div>
          <h1>Staff</h1>
          <p>
            {demo ? sample.length : (meta?.total ?? people.length)} people Haelo
            knows. Their level sets the tone and the timer.
          </p>
        </div>
        <div className="ws-page-tools">
          <label className="ws-local-search">
            <Search size={15} />
            <input
              aria-label="Search staff"
              placeholder="Search staff"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            className="ws-icon"
            aria-label="Export staff CSV"
            onClick={() =>
              exportCSV("haelo_staff_directory.csv", [
                [
                  "Name",
                  "Email",
                  "Role",
                  "Department",
                  "Level",
                  "Timer",
                  "Status",
                ],
                ...list.map((p) => [
                  p.name,
                  p.email,
                  p.role,
                  p.department,
                  p.level,
                  p.timer,
                  p.status,
                ]),
              ])
            }
          >
            <Download size={15} />
          </button>
          <button
            className="ws-button ws-dark"
            onClick={() => {
              setForm(blank);
              setAdding(true);
              setError("");
            }}
          >
            <Plus size={14} />
            Add staff
          </button>
        </div>
      </header>
      <PreviewNotice
        active={demo}
        onToggle={switchPreview}
        text="Add staff directly. Level changes, removal and ignore rules can be explored in sample preview."
      />
      {unknown && (
        <div className="ws-unknown-banner">
          <span className="ws-round-icon">
            <UserRoundX size={17} />
          </span>
          <p>
            <strong>{unknown.email}</strong> emailed you but isn’t on your staff
            list.
          </p>
          <button
            className="ws-button"
            disabled={!demo}
            title={
              !demo ? "Sender-ignore rules are not available yet" : undefined
            }
            onClick={() => setHidden(true)}
          >
            Ignore
          </button>
          <button
            className="ws-button ws-dark"
            onClick={() => {
              setIdentify(unknown);
              setDecision("add");
            }}
          >
            Who is this?
          </button>
        </div>
      )}
      <Segments
        label="Staff levels"
        value={filter}
        onChange={setFilter}
        options={[
          { id: "Everyone", label: "Everyone", count: source.length },
          ...levels
            .slice()
            .reverse()
            .map((value) => ({
              id: value,
              label: `${value}s`,
              count: source.filter((p) => p.level === value).length,
            })),
        ]}
      />
      {error && !adding && !selected && (
        <p className="ws-alert" role="alert">
          {error}{" "}
          <button onClick={() => setAttempt((value) => value + 1)}>
            Retry
          </button>
        </p>
      )}
      {notice && (
        <p className="ws-success-note" role="status">
          {notice}
        </p>
      )}
      <div className="ws-data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Level</th>
              <th>When you don’t reply</th>
              <th>
                <span className="ws-sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((person) => (
              <tr key={person.id} onClick={() => open(person)}>
                <td>
                  <div className="ws-table-person">
                    <span className="ws-avatar">{initials(person.name)}</span>
                    <div>
                      <button
                        className="ws-table-open"
                        aria-label={`View staff details: ${person.name}`}
                      >
                        {person.name}
                        {person.new && <span className="ws-lime-tag">New</span>}
                      </button>
                      <small>{person.email}</small>
                    </div>
                  </div>
                </td>
                <td>{person.role || "—"}</td>
                <td>{person.department || "—"}</td>
                <td>
                  {person.level ? (
                    <span
                      className={`ws-level-pill${person.level === "Director" ? " dark" : ""}`}
                    >
                      {person.level}
                    </span>
                  ) : (
                    "Not set"
                  )}
                </td>
                <td>
                  <span className="ws-policy">
                    {person.timer === "wait" ? (
                      <Hourglass size={14} />
                    ) : (
                      <Timer size={14} />
                    )}{" "}
                    {policy(person)}
                  </span>
                </td>
                <td>
                  <button
                    className="ws-icon"
                    aria-label={`Options for ${person.name}`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && (
          <p className="ws-empty" role="status">
            {loading && !demo ? "Loading staff…" : "No staff match this view."}
          </p>
        )}
        <footer>
          <span>
            {demo
              ? "Sample staff directory"
              : "Level counts and filters apply to the loaded page."}
          </span>
          <div>
            {!demo && (
              <>
                <button
                  className="ws-button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </button>
                <button
                  className="ws-button"
                  disabled={!meta?.nextPage || loading}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next <ArrowRight size={13} />
                </button>
              </>
            )}
            <Link href="/dashboard/business-bible" className="ws-button">
              <BookOpen size={14} />
              Import from Business Bible
            </Link>
          </div>
        </footer>
      </div>
      {identify && (
        <Overlay
          title={`Who is ${identify.email}?`}
          onClose={() => setIdentify(null)}
          footer={
            <>
              <button className="ws-button" onClick={() => setIdentify(null)}>
                Cancel
              </button>
              <button
                className="ws-button ws-dark"
                disabled={!demo && decision !== "add"}
                onClick={() => {
                  if (decision === "add") {
                    setForm({ ...blank, email: identify.email });
                    setAdding(true);
                    setIdentify(null);
                  } else {
                    setHidden(true);
                    setIdentify(null);
                    setNotice("Sender ignored in sample preview.");
                  }
                }}
              >
                Continue <ArrowRight size={14} />
              </button>
            </>
          }
        >
          <p className="ws-help">
            This sender isn’t in your staff directory. Choose how to handle
            their emails.
          </p>
          {identify.subject && (
            <section className="ws-detail-box ws-soft">
              <strong>{identify.subject}</strong>
              <p>{identify.message || "Email content isn’t provided."}</p>
            </section>
          )}
          <div className="ws-choices">
            {[
              [
                "add",
                "Add to my team",
                "Haelo will recognise this sender as staff",
              ],
              ["once", "Not staff, just ignore", "Ask again if they email"],
              [
                "always",
                "Always ignore this sender",
                "Never draft replies to this sender",
              ],
            ].map(([id, title, description]) => (
              <Choice
                key={id}
                title={title}
                description={description}
                selected={decision === id}
                onClick={() => setDecision(id)}
              />
            ))}
          </div>
          {!demo && decision !== "add" && (
            <p className="ws-help">
              Ignore rules are available in sample preview only.
            </p>
          )}
        </Overlay>
      )}
      {adding && (
        <Overlay
          title="Add a staff member"
          subtitle="Haelo will recognise their emails and reply in the right tone."
          onClose={() => {
            if (!busy) setAdding(false);
          }}
          footer={
            <>
              <button
                className="ws-button"
                disabled={busy}
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
              <BusyButton
                busy={busy}
                onClick={() =>
                  (
                    document.getElementById(
                      "ws-add-staff-form",
                    ) as HTMLFormElement
                  )?.requestSubmit()
                }
              >
                Add staff
              </BusyButton>
            </>
          }
        >
          <form id="ws-add-staff-form" className="ws-form" onSubmit={add}>
            <Field label="Full name">
              <input
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Work email">
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <div className="ws-form-pair">
              <Field label="Role">
                <input
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </Field>
              <Field label="Department">
                <input
                  required
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="ws-field">
              <span>Level</span>
              <Segments
                disabled={!demo}
                label="New staff level"
                value={form.level}
                onChange={(value) => {
                  if (demo) setForm({ ...form, level: value });
                }}
                options={levels.map((value) => ({ id: value, label: value }))}
              />
            </div>
            <p className="ws-info-strip">
              <Sparkles size={14} />
              {demo
                ? `${form.level} tone and timing will apply in this sample.`
                : "The staff API saves name, email, role and department. Level configuration is not available yet."}
            </p>
            {error && (
              <p className="ws-alert" role="alert">
                {error}
              </p>
            )}
          </form>
        </Overlay>
      )}
      {selected && (
        <Overlay
          drawer
          title="Staff details"
          subtitle={selected.name}
          onClose={() => setSelected(null)}
          footer={
            <>
              <button className="ws-button" onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button
                className="ws-button ws-dark"
                disabled={!demo}
                onClick={() => {
                  setSample((items) =>
                    items.map((person) =>
                      person.id === selected.id
                        ? { ...person, level, timer }
                        : person,
                    ),
                  );
                  setSelected(null);
                  setNotice("Staff preferences updated in sample preview.");
                }}
              >
                Save changes
              </button>
            </>
          }
        >
          <div className="ws-detail-person">
            <span className="ws-avatar">{initials(selected.name)}</span>
            <div>
              <h3>{selected.name}</h3>
              <p>
                {selected.role} · {selected.email}
              </p>
            </div>
          </div>
          <div className="ws-detail-box">
            <small>Department</small>
            <strong>{selected.department || "Not provided"}</strong>
          </div>
          <section className="ws-field">
            <span>Level and tone</span>
            <Segments
              disabled={!demo}
              label="Staff level and tone"
              value={level}
              onChange={(value) => {
                if (demo) setLevel(value);
              }}
              options={levels.map((value) => ({ id: value, label: value }))}
            />
            <small>
              {level === "Junior"
                ? "Warm and friendly."
                : level === "Manager"
                  ? "Brief and direct."
                  : "Formal and complete."}
            </small>
          </section>
          <section className="ws-field">
            <span>When you don’t reply</span>
            <div className="ws-choices">
              {[
                [
                  "auto",
                  "Auto-send after 10 minutes",
                  "Haelo sends the draft when the timer runs out",
                ],
                [
                  "wait",
                  "Wait for my YES",
                  "Nothing is sent until you approve",
                ],
                [
                  "remind",
                  "Remind me every 10 minutes",
                  "Nudges on WhatsApp, never sends",
                ],
              ].map(([id, title, description]) => (
                <Choice
                  key={id}
                  title={title}
                  description={description}
                  selected={timer === id}
                  disabled={!demo}
                  onClick={() => setTimer(id)}
                />
              ))}
            </div>
          </section>
          {!demo && (
            <p className="ws-help">
              Per-person level, timing and removal require additional service
              support. Try sample preview to explore these controls.
            </p>
          )}
          <button
            className="ws-danger-link"
            onClick={() => setRemoving(selected)}
          >
            Remove from staff
          </button>
        </Overlay>
      )}
      {removing && (
        <Overlay
          title={`Remove ${removing.name}?`}
          onClose={() => setRemoving(null)}
          footer={
            <>
              <button className="ws-button" onClick={() => setRemoving(null)}>
                Cancel
              </button>
              <button
                className="ws-button ws-danger"
                disabled={!demo}
                onClick={() => {
                  setSample((items) =>
                    items.filter((p) => p.id !== removing.id),
                  );
                  setRemoving(null);
                  setSelected(null);
                  setNotice("Staff member removed in sample preview.");
                }}
              >
                Remove
              </button>
            </>
          }
        >
          <span className="ws-warning-icon">
            <AlertTriangle size={21} />
          </span>
          <p className="ws-help">
            Haelo will stop drafting replies to this person’s emails. You can
            add them back later.
          </p>
          <label className="ws-check-row">
            <input
              type="checkbox"
              checked={removeBible}
              disabled={!demo}
              onChange={(e) => setRemoveBible(e.target.checked)}
            />
            Also remove them from the Business Bible directory
          </label>
          {!demo && (
            <p className="ws-help">
              Removal is unavailable for live staff until the service supports
              it.
            </p>
          )}
        </Overlay>
      )}
    </main>
  );
}
export default function StaffPage() {
  return (
    <Suspense fallback={<p className="ws-empty">Loading staff…</p>}>
      <StaffContent />
    </Suspense>
  );
}
