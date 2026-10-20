"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { getProfile } from "@/lib/api/auth";
import { getSubscription } from "@/lib/api/billing";
const navigation = [
  { label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  {
    label: "Business Bible",
    href: "/dashboard/business-bible",
    icon: BookOpen,
  },
  { label: "Staff Directory", href: "/dashboard/staff", icon: Users },
  { label: "Activity Log", href: "/dashboard/activity", icon: Activity },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    adminOnly: true,
  },
];
export default function DashboardSidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    userType: string;
  } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [sub, setSub] = useState<{
    seatCount: number;
    isActive: boolean;
  } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const current =
    navigation.find((item) => item.href === path)?.label || "Workspace";
  useEffect(() => {
    let active = true;
    setRole(localStorage.getItem("userType"));
    getProfile()
      .then((res) => {
        if (active && res?.data) {
          setProfile(res.data);
          setRole(res.data.userType);
          if (res.data.userType)
            localStorage.setItem("userType", res.data.userType);
        }
      })
      .catch(console.error);
    getSubscription()
      .then((res) => {
        if (active && res?.data) setSub(res.data);
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    const screen = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (screen.matches) setOpen(false);
    };
    screen.addEventListener("change", closeOnDesktop);
    return () => screen.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!open) {
      dialog.current?.close();
      return;
    }
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  const sidebar = (mobile = false) => (
    <div className="dashboard-sidebar-inner">
      <div className="dashboard-brand">
        <Link href="/" aria-label="HAELO home" onClick={() => setOpen(false)}>
          <Logo variant="white-on-navy" size="md" />
        </Link>
        {mobile && (
          <button
            className="dashboard-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        )}
      </div>
      <div className="dashboard-workspace">
        <span className="dashboard-workspace-avatar">
          {profile?.name
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "H"}
        </span>
        <div>
          <strong>{profile?.name || "Your workspace"}</strong>
          <span>{profile?.email || "Loading account…"}</span>
        </div>
      </div>
      <div className="dashboard-nav-label">YOUR WORKSPACE</div>
      <nav
        aria-label={
          mobile ? "Mobile dashboard navigation" : "Dashboard navigation"
        }
      >
        {navigation
          .filter((item) => !item.adminOnly || role === "admin")
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`dashboard-nav-link ${path === item.href ? "selected" : ""}`}
              aria-current={path === item.href ? "page" : undefined}
            >
              <item.icon size={17} strokeWidth={1.7} />
              <span>{item.label}</span>
              {path === item.href && <ChevronRight size={13} />}
            </Link>
          ))}
      </nav>
      <div className="dashboard-sidebar-bottom">
        {sub && (
          <div className="dashboard-plan">
            <div>
              <span>YOUR PLAN</span>
              <strong>
                {sub.seatCount === 1
                  ? "Individual"
                  : sub.seatCount <= 5
                    ? "Team"
                    : "Business"}
                <span>{sub.isActive ? "Active" : "Inactive"}</span>
              </strong>
            </div>
            <p>
              {sub.seatCount} {sub.seatCount === 1 ? "seat" : "seats"} in your
              workspace
            </p>
            {role === "admin" && (
              <Link href="/dashboard/billing" onClick={() => setOpen(false)}>
                Manage subscription <ArrowRight size={13} />
              </Link>
            )}
          </div>
        )}
        <a
          href="https://wa.me/2347048048164"
          target="_blank"
          rel="noopener noreferrer"
          className="dashboard-sidebar-action"
        >
          <LifeBuoy size={16} />
          Help &amp; support
          <ExternalLink size={12} />
        </a>
        <Link
          href="/auth/login"
          className="dashboard-sidebar-action"
          onClick={() => {
            localStorage.clear();
            setOpen(false);
          }}
        >
          <LogOut size={16} />
          Sign out
        </Link>
        <p className="dashboard-sidebar-signature">
          Intelligence. Clarity. Control.
        </p>
      </div>
    </div>
  );
  return (
    <>
      <aside className="dashboard-sidebar">{sidebar()}</aside>
      <div className="dashboard-topbar">
        <div>
          <button
            className="dashboard-menu"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="dashboard-mobile-navigation"
          >
            <Menu size={20} />
          </button>
          <span className="dashboard-breadcrumb">
            Workspace <ChevronRight size={12} />
            <strong>{current}</strong>
          </span>
        </div>
        <div>
          <Link href="/" className="dashboard-website">
            View website <ExternalLink size={12} />
          </Link>
          <Link
            href="/dashboard/settings"
            className="dashboard-account"
            aria-label="Account settings"
          >
            {profile?.name?.charAt(0).toUpperCase() || "H"}
          </Link>
        </div>
      </div>
      <dialog
        ref={dialog}
        id="dashboard-mobile-navigation"
        className="dashboard-mobile-dialog"
        aria-label="Dashboard navigation"
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        {open && sidebar(true)}
      </dialog>
    </>
  );
}
