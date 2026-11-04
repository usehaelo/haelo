"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  BookOpen,
  Check,
  CircleHelp,
  CreditCard,
  Download,
  Inbox,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { initials, useWorkspace, WorkspaceProvider } from "./workspace-data";
const nav = [
  { name: "Overview", href: "/dashboard/overview", icon: LayoutGrid },
  { name: "Approvals", href: "/dashboard/approvals", icon: Inbox },
  { name: "Activity log", href: "/dashboard/activity", icon: Activity },
  { name: "Staff", href: "/dashboard/staff", icon: Users },
  { name: "Business Bible", href: "/dashboard/business-bible", icon: BookOpen },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];
function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const w = useWorkspace();
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = w.drafts.filter((d) => d.status === "pending");
  const current = nav.find((n) => n.href === path) || nav[0];
  useEffect(() => {
    setMobile(false);
    setNotifications(false);
    setSearch("");
  }, [path]);
  useEffect(() => {
    try {
      setRead(
        JSON.parse(localStorage.getItem(`haelo-read:${w.email}`) || "[]"),
      );
    } catch {
      setRead([]);
    }
  }, [w.email]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setNotifications(false);
        setFocused(false);
        searchRef.current?.blur();
      }
    }
    function outside(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        setNotifications(false);
    }
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  useEffect(() => {
    if (mobile) {
      const element = dialog.current;
      element?.showModal();
      const old = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = old;
        element?.close();
      };
    }
    dialog.current?.close();
  }, [mobile]);
  function mark(ids: string[]) {
    const next = Array.from(new Set([...read, ...ids]));
    setRead(next);
    localStorage.setItem(`haelo-read:${w.email}`, JSON.stringify(next));
  }
  const sidebar = (isMobile = false) => (
    <div className="ws-sidebar-inner">
      <header>
        <Link href="/" aria-label="Haelo home">
          <Image
            src="/images/landing/51-1628-49f59.svg"
            width={86}
            height={32}
            alt="Haelo"
          />
        </Link>
        <button
          className="ws-icon"
          aria-label={isMobile ? "Close navigation" : "Collapse navigation"}
          onClick={() =>
            isMobile ? setMobile(false) : setCollapsed(!collapsed)
          }
        >
          {isMobile ? <X size={18} /> : <Menu size={17} />}
        </button>
      </header>
      <nav
        aria-label={
          isMobile ? "Mobile workspace navigation" : "Workspace navigation"
        }
      >
        {nav
          .filter((n) => n.name !== "Billing" || w.userType === "admin")
          .map((n, i) => (
            <div key={n.href}>
              {i === 3 && <span className="ws-nav-label">Workspace</span>}
              <Link
                href={n.href}
                onClick={() => setMobile(false)}
                aria-current={path === n.href ? "page" : undefined}
              >
                <n.icon size={18} />
                <span>{n.name}</span>
                {n.name === "Approvals" && pending.length > 0 && (
                  <small>{pending.length}</small>
                )}
              </Link>
            </div>
          ))}
      </nav>
      <div className="ws-sidebar-bottom">
        <Link className="ws-connection" href="/dashboard/settings">
          <strong>
            <i className={w.connected ? "connected" : ""} />
            {w.connected ? "WhatsApp connected" : "Connect WhatsApp"}
          </strong>
          <small>
            {w.connected
              ? `Drafts reach ${w.phone.replace(/(\d{3})\d+(\d{4})$/, "$1 ••• $2")}`
              : "Finish setup to receive your drafts"}
          </small>
        </Link>
        <div className="ws-account">
          <span className="ws-avatar">{initials(w.name) || "H"}</span>
          <Link href="/dashboard/settings">
            <strong>{w.name || "Your workspace"}</strong>
            <small>{w.company || w.email}</small>
          </Link>
          <Link
            href="/auth/login"
            aria-label="Sign out"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userType");
            }}
          >
            <LogOut size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
  return (
    <div
      className={`dashboard-shell ws-shell${collapsed ? " ws-collapsed" : ""}`}
    >
      <a className="dashboard-skip" href="#dashboard-content">
        Skip to workspace
      </a>
      <aside className="ws-sidebar">{sidebar()}</aside>
      <header className="ws-topbar">
        <div>
          <button
            className="ws-icon ws-mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <Menu size={19} />
          </button>
          {collapsed && (
            <button
              className="ws-icon ws-expand"
              aria-label="Expand navigation"
              onClick={() => setCollapsed(false)}
            >
              <Menu size={18} />
            </button>
          )}
          <current.icon size={16} />
          <span>{current.name}</span>
        </div>
        <div className="ws-top-actions">
          <div className="ws-search">
            <Search size={14} />
            <input
              ref={searchRef}
              aria-label="Search emails and staff"
              placeholder="Search emails, staff…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
            />
            <kbd>⌘K</kbd>
            {focused && search && (
              <div className="ws-search-results">
                {w.drafts
                  .filter((d) =>
                    `${d.name} ${d.subject} ${d.original}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .slice(0, 6)
                  .map((d) => (
                    <Link
                      key={d.id}
                      href={`/dashboard/approvals?draft=${encodeURIComponent(d.id)}`}
                    >
                      <strong>{d.name}</strong>
                      <small>{d.subject}</small>
                    </Link>
                  ))}
                <Link
                  href={`/dashboard/staff?search=${encodeURIComponent(search)}`}
                >
                  Search staff for “{search}”
                </Link>
              </div>
            )}
          </div>
          <div ref={panelRef} className="ws-notification-anchor">
            <button
              className={`ws-icon${notifications ? " active" : ""}`}
              aria-label="Notifications"
              aria-expanded={notifications}
              aria-controls="ws-notifications"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={16} />
              {w.drafts.some((d) => !read.includes(d.id)) && (
                <i className="ws-unread-dot" />
              )}
            </button>
            {notifications && (
              <section
                id="ws-notifications"
                className="ws-notifications"
                aria-label="Notifications"
              >
                <header>
                  <h2>Notifications</h2>
                  <button onClick={() => mark(w.drafts.map((d) => d.id))}>
                    Mark all as read
                  </button>
                </header>
                <div className="ws-segments">
                  <button
                    aria-pressed={!unreadOnly}
                    onClick={() => setUnreadOnly(false)}
                  >
                    All
                  </button>
                  <button
                    aria-pressed={unreadOnly}
                    onClick={() => setUnreadOnly(true)}
                  >
                    Unread ·{" "}
                    {w.drafts.filter((d) => !read.includes(d.id)).length}
                  </button>
                </div>
                <p className="ws-overline">Recent activity</p>
                <div className="ws-notification-list">
                  {w.drafts
                    .filter((d) => !unreadOnly || !read.includes(d.id))
                    .slice(0, 12)
                    .map((d) => (
                      <article key={d.id}>
                        <span className="ws-avatar">{initials(d.name)}</span>
                        <div>
                          <p>
                            <strong>{d.name}</strong>{" "}
                            {d.status === "pending"
                              ? "emailed you. Your draft reply is ready."
                              : "has a response in your activity log."}
                          </p>
                          <Link
                            href={`/dashboard/approvals?draft=${encodeURIComponent(d.id)}`}
                            onClick={() => mark([d.id])}
                          >
                            Review <Inbox size={12} />
                          </Link>
                          {!read.includes(d.id) && (
                            <button
                              aria-label={`Mark ${d.name} notification as read`}
                              onClick={() => mark([d.id])}
                            >
                              <Check size={12} />
                              Read
                            </button>
                          )}
                        </div>
                        {!read.includes(d.id) && (
                          <i className="ws-unread-dot" />
                        )}
                      </article>
                    ))}
                  {!w.drafts.filter((d) => !unreadOnly || !read.includes(d.id))
                    .length && (
                    <p className="ws-empty">You’re all caught up.</p>
                  )}
                </div>
                <footer>
                  <Link href="/dashboard/settings">
                    <Settings size={14} />
                    Notification settings
                  </Link>
                  <small>Read status is saved on this device.</small>
                </footer>
              </section>
            )}
          </div>
          <a
            className="ws-icon"
            href="https://wa.me/2347048048164"
            aria-label="Help and support"
          >
            <CircleHelp size={17} />
          </a>
          {path === "/dashboard/activity" ? (
            <button
              className="ws-button ws-review-button"
              onClick={() =>
                window.dispatchEvent(new Event("haelo:download-activity"))
              }
            >
              <Download size={14} />
              Download report
            </button>
          ) : path === "/dashboard/staff" ? (
            <Link
              className="ws-button ws-review-button"
              href="/dashboard/business-bible"
            >
              <BookOpen size={14} />
              Import from Business Bible
            </Link>
          ) : path === "/dashboard/business-bible" ? (
            <button
              className="ws-button ws-review-button"
              onClick={() =>
                window.dispatchEvent(new Event("haelo:download-template"))
              }
            >
              <Download size={14} />
              Download template
            </button>
          ) : (
            path !== "/dashboard/settings" && (
              <Link
                className="ws-button ws-dark ws-review-button"
                href={
                  path === "/dashboard/approvals"
                    ? "/dashboard/settings#timer"
                    : "/dashboard/approvals"
                }
              >
                {path === "/dashboard/approvals" ? (
                  <>
                    <Settings size={14} />
                    Timer rules
                  </>
                ) : (
                  <>
                    <Inbox size={14} />
                    Review {pending.length || ""} drafts
                  </>
                )}
              </Link>
            )
          )}
        </div>
      </header>
      <div id="dashboard-content" className="dashboard-content ws-content">
        {children}
      </div>
      <dialog
        ref={dialog}
        className="ws-mobile-dialog"
        aria-label="Navigation"
        onCancel={() => setMobile(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMobile(false);
        }}
      >
        {mobile && sidebar(true)}
      </dialog>
    </div>
  );
}
export default function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <Shell>{children}</Shell>
    </WorkspaceProvider>
  );
}
