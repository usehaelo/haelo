"use client";

import { dashboardTheme } from "@/components/dashboard/theme";
const {
  BRAND,
  INK,
  NAVY,
  CREAM,
  WHITE,
  GOLD,
  GOLD_LIGHT,
  GOLD_BG,
  GREEN,
  GREEN_BG,
  INK_10,
  INK_20,
  INK_40,
  INK_60,
  INK_06,
  RED,
  RED_BG,
  RED_BORDER,
} = dashboardTheme;

import { PRICING_PLANS, type PricingPlan } from "@/lib/pricing";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Download,
  CreditCard,
  ArrowRight,
  AlertCircle,
  Zap,
  Users,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { getAccounts, type OrgAccount } from "@/lib/api/accounts";
import { getBillingHistory } from "@/lib/api/billing";

// ── TOKENS ────────────────────────────────────────────────────────────────────

// ── GLOBAL CSS ────────────────────────────────────────────────────────────────

const GLOBAL_CSS = `



@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-up {
  animation: fadeUp .38s cubic-bezier(.4,0,.2,1) both;
}

.stagger-1 {
  animation-delay: .04s;
}

.stagger-2 {
  animation-delay: .08s;
}

.stagger-3 {
  animation-delay: .12s;
}

.stagger-4 {
  animation-delay: .16s;
}

.stagger-5 {
  animation-delay: .20s;
}

.pricing-plan {
  transition:
    transform .2s ease,
    border-color .2s ease,
    box-shadow .2s ease;
}

.pricing-plan:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(44,32,35,0.08);
}

.pricing-plan-current:hover {
  box-shadow: 0 10px 30px rgba(67,14,22,0.18);
}

.pricing-button {
  transition:
    transform .18s ease,
    box-shadow .18s ease,
    background .18s ease;
}

.pricing-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(44,32,35,0.16);
}

.current-plan-status {
  cursor: default;
  user-select: none;
}

@media(max-width:768px) {
  .billing-grid {
    grid-template-columns: 1fr !important;
  }

  .plan-header {
    flex-direction: column !important;
    gap: 16px !important;
  }

  .plan-meta-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  .features-grid {
    grid-template-columns: 1fr !important;
  }

  .main-pad {
    padding: 24px 20px 48px !important;
  }

  .pricing-plan-header {
    flex-direction: column !important;
  }

  .pricing-plan-price {
    text-align: left !important;
  }

  .pricing-plan-footer {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .pricing-button {
    width: 100% !important;
  }
}
`;

// ── PRICING MODEL ────────────────────────────────────────────────────────────

// ── HELPERS ───────────────────────────────────────────────────────────────────

function formatNaira(n: number): string {
  return `₦${n.toLocaleString("en-NG")}`;
}

/*
 * Temporary Paystack placeholder.
 *
 * Replace these URLs with your actual Paystack payment links
 * when they are ready.
 */
function getPaystackUrl(plan: PricingPlan): string {
  return `https://paystack.com/pay/haelo-${plan.id}`;
}

// For the UI prototype, the current plan is inferred from
// the number of team accounts.
//
// Later this should come from the actual subscription returned
// by your backend/payment system.
function getPlanForUsers(users: number): PricingPlan {
  const matchingPlan = PRICING_PLANS.find(
    (plan) => users >= plan.minUsers && users <= plan.maxUsers,
  );

  return matchingPlan || PRICING_PLANS[0];
}

// ── SHARED CARD ───────────────────────────────────────────────────────────────

function Card({
  children,
  hov,
  onEnter,
  onLeave,
  style: extra,
}: {
  children: React.ReactNode;
  hov?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background: WHITE,
        border: `1.5px solid ${hov ? INK_20 : INK_10}`,
        borderRadius: 16,
        padding: 28,
        transition: "all .22s cubic-bezier(.4,0,.2,1)",
        boxShadow: hov ? "0 8px 32px rgba(44,32,35,0.09)" : "none",
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

// ── SECTION TITLE ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: INK,
        letterSpacing: "-.015em",
        marginBottom: 18,
      }}
    >
      {children}
    </p>
  );
}

// ── INVOICE ROW ───────────────────────────────────────────────────────────────

function InvoiceRow({
  inv,
  last,
}: {
  inv: {
    id: string;
    date: string;
    amount: string;
    status: string;
  };
  last: boolean;
}) {
  const [hov, setHov] = useState(false);
  const [dlHov, setDlHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 20px",
        background: hov ? CREAM : "transparent",
        borderBottom: last ? "none" : `1px solid ${INK_06}`,
        transition: "background .16s",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: hov ? INK : INK_06,
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all .18s",
        }}
      >
        <CreditCard size={15} color={hov ? "#fff" : INK_40} />
      </div>

      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: INK,
            marginBottom: 1,
          }}
        >
          {inv.id}
        </p>

        <p
          style={{
            fontSize: 11,
            color: INK_40,
          }}
        >
          {inv.date}
        </p>
      </div>

      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: INK,
        }}
      >
        {inv.amount}
      </p>

      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: "3px 9px",
          borderRadius: 20,
          background: GREEN_BG,
          color: GREEN,
          flexShrink: 0,
        }}
      >
        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
      </span>

      <button
        aria-label={`Download invoice ${inv.id} (unavailable)`}
        disabled
        title="Invoice downloads are not available yet"
        onMouseEnter={() => setDlHov(true)}
        onMouseLeave={() => setDlHov(false)}
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          border: `1px solid ${dlHov ? INK_20 : "transparent"}`,
          background: WHITE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all .15s",
          flexShrink: 0,
        }}
      >
        <Download size={13} color={dlHov ? INK : INK_40} />
      </button>
    </div>
  );
}

// ── FEATURE ITEM ──────────────────────────────────────────────────────────────

function FeatureItem({ f }: { f: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
      }}
    >
      <CheckCircle
        size={14}
        color={GREEN}
        style={{
          flexShrink: 0,
          marginTop: 1,
        }}
      />

      <span
        style={{
          fontSize: 12,
          color: INK_60,
          lineHeight: 1.5,
        }}
      >
        {f}
      </span>
    </div>
  );
}

// ── MEMBER ROW ────────────────────────────────────────────────────────────────

type BillingAccountPreview = {
  id: number;
  name: string | null;
  email: string;
  status: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MemberRow({ m }: { m: BillingAccountPreview }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "9px 0",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: BRAND,
          color: CREAM,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {m.name ? initials(m.name) : m.email.slice(0, 2).toUpperCase()}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <p
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: INK,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {m.name || m.email}
        </p>

        <p
          style={{
            fontSize: 11,
            color: INK_40,
          }}
        >
          {m.name
            ? m.email
            : m.status === "active"
              ? "Workspace account"
              : "Invitation pending"}
        </p>
      </div>

      <span
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          padding: "3px 8px",
          borderRadius: 20,
          flexShrink: 0,
          background: m.status === "active" ? GREEN_BG : "rgba(180,83,9,0.08)",
          color: m.status === "active" ? GREEN : "#B45309",
        }}
      >
        {m.status === "active" ? "Active" : "Invited"}
      </span>
    </div>
  );
}

// ── PRICING PLAN CARD ─────────────────────────────────────────────────────────

function PricingPlanCard({
  plan,
  isCurrent,
  subActive,
}: {
  plan: PricingPlan;
  isCurrent: boolean;
  subActive?: boolean | null;
}) {
  const paystackUrl = getPaystackUrl(plan);

  return (
    <div
      className={`pricing-plan ${isCurrent ? "pricing-plan-current" : ""}`}
      style={{
        background: isCurrent ? NAVY : WHITE,
        border: `1.5px solid ${isCurrent ? NAVY : INK_10}`,
        borderRadius: 16,
        padding: 22,
      }}
    >
      {/* PLAN HEADER */}

      <div
        className="pricing-plan-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 7,
            }}
          >
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: isCurrent ? "#fff" : INK,
                letterSpacing: "-.02em",
              }}
            >
              {plan.name}
            </h3>

            {isCurrent && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 20,
                    background: GREEN_BG,
                    color: GREEN,
                  }}
                >
                  CURRENT PLAN
                </span>
                {subActive !== undefined && subActive !== null && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 20,
                      background: subActive
                        ? "rgba(46,125,82,0.15)"
                        : "rgba(192,57,43,0.15)",
                      color: subActive
                        ? isCurrent
                          ? "#B9E4C8"
                          : GREEN
                        : isCurrent
                          ? "#F3BCC5"
                          : "#A92736",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {subActive ? "ACTIVE" : "EXPIRED"}
                  </span>
                )}
              </div>
            )}
          </div>

          <p
            style={{
              fontSize: 11.5,
              color: isCurrent ? "rgba(255,255,255,0.8)" : INK_60,
              lineHeight: 1.55,
              marginBottom: 12,
              maxWidth: 400,
            }}
          >
            {plan.description}
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10.5,
              fontWeight: 700,
              color: isCurrent ? GOLD_LIGHT : GREEN,
              background: isCurrent ? "rgba(94,26,38,0.1)" : GREEN_BG,
              padding: "5px 9px",
              borderRadius: 7,
            }}
          >
            <Users size={12} />
            {plan.priceLabel}
          </div>
        </div>

        {/* PRICE */}

        <div
          className="pricing-plan-price"
          style={{
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: isCurrent ? GOLD_LIGHT : INK,
              letterSpacing: "-.03em",
              lineHeight: 1,
            }}
          >
            {formatNaira(plan.price)}
          </p>

          <p
            style={{
              fontSize: 10,
              color: isCurrent ? "rgba(255,255,255,0.8)" : INK_40,
              marginTop: 5,
            }}
          >
            per month
          </p>
        </div>
      </div>

      {/* PLAN FOOTER */}

      <div
        className="pricing-plan-footer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 18,
          paddingTop: 16,
          borderTop: `1px solid ${
            isCurrent ? "rgba(255,255,255,0.08)" : INK_06
          }`,
        }}
      >
        {/* TRIAL */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Zap size={13} color={isCurrent ? GOLD_LIGHT : GREEN} />

          <span
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: isCurrent ? "rgba(255,255,255,0.8)" : INK_60,
            }}
          >
            7-day free trial
          </span>
        </div>

        {/* CURRENT PLAN = STATUS ONLY */}

        {isCurrent ? (
          <div
            className="current-plan-status"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              minWidth: 155,
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.8)",
              fontFamily: "var(--dashboard-font), sans-serif",
              fontSize: 11.5,
              fontWeight: 700,
              padding: "10px 15px",
              borderRadius: 9,
            }}
          >
            <CheckCircle size={13} />
            Current plan
          </div>
        ) : (
          /* OTHER PLANS = PAYSTACK CTA */

          <a
            className="pricing-button"
            href={paystackUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              minWidth: 155,
              background: BRAND,
              color: WHITE,
              fontFamily: "var(--dashboard-font), sans-serif",
              fontSize: 11.5,
              fontWeight: 700,
              padding: "10px 15px",
              borderRadius: 9,
              textDecoration: "none",
            }}
          >
            Subscribe now
            <ArrowRight size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [featHov, setFeatHov] = useState(false);

  const [invoiceHov, setInvoiceHov] = useState(false);

  const [cancelHov, setCancelHov] = useState(false);

  const [membersHov, setMembersHov] = useState(false);

  const [addMemberHov, setAddMemberHov] = useState(false);

  const [accountsPreview, setAccountsPreview] = useState<
    BillingAccountPreview[]
  >([]);

  const [totalStaffCount, setTotalStaffCount] = useState(0);

  const [staffLoading, setStaffLoading] = useState(true);

  const [subDetails, setSubDetails] = useState<{
    seatCount: number;
    isActive: boolean;
  } | null>(null);

  // ── FETCH TEAM ACCOUNTS ────────────────────────────────────────────────────

  useEffect(() => {
    const fetchAccounts = async () => {
      setStaffLoading(true);

      try {
        const res = await getAccounts();

        if (res?.data) {
          const accts: OrgAccount[] = Array.isArray(res.data)
            ? res.data
            : res.data.accounts || [];

          setAccountsPreview(
            accts.map((a) => ({
              id: a.id,
              name: a.name,
              email: a.email,
              status: a.status,
            })),
          );

          setTotalStaffCount(accts.length);
        }
      } catch (err) {
        console.error(
          "Failed to fetch team accounts for billing summary:",
          err,
        );
      } finally {
        setStaffLoading(false);
      }
    };

    fetchAccounts();

    import("@/lib/api/billing").then(({ getSubscription }) => {
      getSubscription()
        .then((res) => {
          if (res?.data) {
            setSubDetails(res.data);
          }
        })
        .catch((err) => console.error("Failed to fetch subscription:", err));
    });
  }, []);

  /*
   * For now, the current plan is inferred from
   * the number of people in the workspace.
   *
   * When Paystack subscription data is connected,
   * replace this with the actual subscription plan
   * returned by the backend.
   */
  const seats = subDetails?.seatCount || totalStaffCount || 1;

  const currentPlan = getPlanForUsers(seats);

  // ── INVOICES ───────────────────────────────────────────────────────────────

  const [invoices, setInvoices] = useState<
    {
      id: string;
      date: string;
      amount: string;
      status: string;
    }[]
  >([]);

  const [invoicesPage, setInvoicesPage] = useState(1);

  const [hasMoreInvoices, setHasMoreInvoices] = useState(false);

  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const loadInvoices = async (page: number) => {
    if (loadingInvoices) return;

    setLoadingInvoices(true);

    try {
      const res = await getBillingHistory(page, 5);

      if (res?.data) {
        const newInvoices = res.data.transactions.map((t: any) => ({
          id: String(t.trxRef || t.id),
          date: new Date(t.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          amount: `₦${Number(t.amount).toLocaleString("en-NG")}`,
          status: t.status?.toLowerCase() || "unknown",
        }));

        if (page === 1) {
          setInvoices(newInvoices);
        } else {
          setInvoices((prev) => [...prev, ...newInvoices]);
        }

        setHasMoreInvoices(res.data.meta.nextPage !== null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Capture the initial loader: pagination explicitly requests subsequent pages.
  const firstInvoiceLoad = useRef(loadInvoices);
  useEffect(() => {
    firstInvoiceLoad.current(1);
  }, []);

  const handleInvoiceScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - scrollTop - clientHeight < 20) {
      if (hasMoreInvoices && !loadingInvoices) {
        const next = invoicesPage + 1;

        setInvoicesPage(next);

        loadInvoices(next);
      }
    }
  };

  // ── FEATURES ───────────────────────────────────────────────────────────────

  const features = [
    "Add as many inboxes as you need",
    "All email providers",
    "Unlimited Business Bible size",
    "Custom timer per staff level",
    "Shared team dashboard",
    "Priority support",
    "Monthly performance report",
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <main
        className="main-pad billing-page"
        style={{
          flex: 1,
          padding: "40px 40px 60px",
          overflowY: "auto",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* HEADER */}

        <div
          className="fade-up"
          style={{
            marginBottom: 36,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: 6,
            }}
          >
            Billing
          </p>

          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            Plan & payments.
          </h1>

          <p
            style={{
              fontSize: 13,
              color: INK_60,
              fontWeight: 500,
            }}
          >
            Manage your subscription, payment method, and invoice history.
          </p>
        </div>

        <div
          className="billing-workspace"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxWidth: "100%",
          }}
        >
          {/* ── PLANS & PRICING ── */}

          <div className="fade-up stagger-1">
            <div
              style={{
                marginBottom: 18,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: GOLD,
                  marginBottom: 6,
                }}
              >
                Plans & pricing
              </p>

              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: INK,
                  letterSpacing: "-0.025em",
                  marginBottom: 5,
                }}
              >
                Choose the right plan for your team.
              </h2>

              <p
                style={{
                  fontSize: 12,
                  color: INK_60,
                }}
              >
                Upgrade your workspace with a 7-day free trial on every plan.
              </p>
            </div>

            <div
              className="billing-plans"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {PRICING_PLANS.map((plan) => (
                <PricingPlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={currentPlan.id === plan.id}
                  subActive={subDetails?.isActive}
                />
              ))}
            </div>
          </div>

          {/* ── TEAM ACCOUNTS ── */}

          <Card
            hov={membersHov}
            onEnter={() => setMembersHov(true)}
            onLeave={() => setMembersHov(false)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <SectionTitle>
                Team accounts
                {!staffLoading && (
                  <span
                    style={{
                      color: INK_40,
                      fontWeight: 500,
                    }}
                  >
                    {" "}
                    · {totalStaffCount}{" "}
                    {totalStaffCount === 1 ? "person" : "people"}
                  </span>
                )}
              </SectionTitle>

              <Link
                href="/dashboard/settings#team"
                onMouseEnter={() => setAddMemberHov(true)}
                onMouseLeave={() => setAddMemberHov(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: addMemberHov ? INK : GREEN,
                  background: addMemberHov ? CREAM : "transparent",
                  border: `1.5px solid ${
                    addMemberHov ? INK_20 : "rgba(46,125,82,0.25)"
                  }`,
                  borderRadius: 9,
                  padding: "7px 13px",
                  textDecoration: "none",
                  fontFamily: "var(--dashboard-font), sans-serif",
                  transition: "all .18s",
                  whiteSpace: "nowrap",
                }}
              >
                <UserPlus size={13} />
                Invite member
              </Link>
            </div>

            {staffLoading ? (
              <p
                style={{
                  fontSize: 12,
                  color: INK_40,
                  padding: "8px 0",
                }}
              >
                Loading team accounts…
              </p>
            ) : accountsPreview.length === 0 ? (
              <p
                style={{
                  fontSize: 12,
                  color: INK_40,
                  padding: "8px 0",
                }}
              >
                Just you so far — invite your team from Settings.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {accountsPreview.slice(0, 5).map((m, i) => (
                  <div
                    key={m.id}
                    style={{
                      borderBottom:
                        i < Math.min(accountsPreview.length, 5) - 1
                          ? `1px solid ${INK_06}`
                          : "none",
                    }}
                  >
                    <MemberRow m={m} />
                  </div>
                ))}
              </div>
            )}

            {totalStaffCount > 5 && (
              <Link
                href="/dashboard/settings#team"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: GREEN,
                  textDecoration: "none",
                  marginTop: 12,
                  fontFamily: "var(--dashboard-font), sans-serif",
                }}
              >
                View all {totalStaffCount} accounts
                <ChevronRight size={13} />
              </Link>
            )}

            <p
              style={{
                fontSize: 11,
                color: INK_40,
                marginTop: 14,
                lineHeight: 1.6,
              }}
            >
              Your plan is based on your team size. Add or remove team members
              from Settings to keep your workspace up to date.
            </p>
          </Card>

          {/* ── FEATURES INCLUDED ── */}

          <Card
            hov={featHov}
            onEnter={() => setFeatHov(true)}
            onLeave={() => setFeatHov(false)}
          >
            <SectionTitle>What&apos;s included</SectionTitle>

            <div
              className="features-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {features.map((f) => (
                <FeatureItem key={f} f={f} />
              ))}
            </div>
          </Card>

          {/* ── INVOICE HISTORY ── */}

          <div
            className="fade-up stagger-4"
            onMouseEnter={() => setInvoiceHov(true)}
            onMouseLeave={() => setInvoiceHov(false)}
            style={{
              background: WHITE,
              border: `1.5px solid ${invoiceHov ? INK_20 : INK_10}`,
              borderRadius: 16,
              overflow: "hidden",
              transition: "all .22s cubic-bezier(.4,0,.2,1)",
              boxShadow: invoiceHov ? "0 8px 32px rgba(44,32,35,0.09)" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                borderBottom: `1px solid ${INK_06}`,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: INK,
                  letterSpacing: "-.015em",
                }}
              >
                Invoice history
              </p>

              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  color: GREEN,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--dashboard-font), sans-serif",
                }}
              >
                <Download size={12} />
                Download all
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 0,
                padding: "8px 20px",
                background: CREAM,
                borderBottom: `1px solid ${INK_06}`,
              }}
            >
              {["Invoice", "Amount", "Status", ""].map((h, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: INK_40,
                    paddingRight: i < 3 ? 16 : 0,
                    textAlign: i === 3 ? "right" : "left",
                  }}
                >
                  {h}
                </p>
              ))}
            </div>

            <div
              onScroll={handleInvoiceScroll}
              style={{
                maxHeight: 250,
                overflowY: "auto",
              }}
            >
              {invoices.length > 0 ? (
                invoices.map((inv, i) => (
                  <InvoiceRow
                    key={inv.id}
                    inv={inv}
                    last={i === invoices.length - 1}
                  />
                ))
              ) : (
                <p
                  style={{
                    fontSize: 13,
                    color: INK_40,
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  No invoices found.
                </p>
              )}

              {loadingInvoices && (
                <p
                  style={{
                    fontSize: 11,
                    color: INK_40,
                    padding: "10px 20px",
                    textAlign: "center",
                  }}
                >
                  Loading...
                </p>
              )}
            </div>
          </div>

          {/* ── CANCEL ── */}

          <div
            className="fade-up stagger-5"
            onMouseEnter={() => setCancelHov(true)}
            onMouseLeave={() => setCancelHov(false)}
            style={{
              background: cancelHov ? "#FFF8F7" : "transparent",
              border: `1.5px solid ${
                cancelHov ? RED_BORDER : "rgba(192,57,43,0.12)"
              }`,
              borderRadius: 16,
              padding: 24,
              transition: "all .22s",
              boxShadow: cancelHov ? "0 6px 20px rgba(192,57,43,0.07)" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: RED_BG,
                  border: `1px solid ${RED_BORDER}`,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={15} color={RED} />
              </div>

              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: INK,
                    marginBottom: 5,
                  }}
                >
                  Cancel subscription
                </p>

                <p
                  style={{
                    fontSize: 12,
                    color: INK_60,
                    lineHeight: 1.65,
                    marginBottom: 14,
                    maxWidth: 480,
                  }}
                >
                  Cancelling stops Haelo from processing emails at the end of
                  your current billing period. Your data is retained for 30 days
                  after cancellation.
                </p>

                <CancelBtn />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// ── CANCEL BUTTON ─────────────────────────────────────────────────────────────

function CancelBtn() {
  const [hov, setHov] = useState(false);

  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: INK_60,
          }}
        >
          Are you sure? This cannot be undone.
        </p>

        <button
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(192,57,43,0.12)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = RED_BG)}
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: RED,
            background: RED_BG,
            border: `1px solid ${RED_BORDER}`,
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            fontFamily: "var(--dashboard-font), sans-serif",
            transition: "all .15s",
          }}
        >
          Yes, cancel
        </button>

        <button
          onClick={() => setConfirm(false)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: INK_40,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--dashboard-font), sans-serif",
          }}
        >
          Keep plan
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        color: hov ? RED : INK_40,
        background: hov ? RED_BG : "transparent",
        border: `1px solid ${hov ? RED_BORDER : "transparent"}`,
        borderRadius: 8,
        padding: "6px 12px",
        cursor: "pointer",
        fontFamily: "var(--dashboard-font), sans-serif",
        transition: "all .18s",
      }}
    >
      Cancel subscription
    </button>
  );
}
