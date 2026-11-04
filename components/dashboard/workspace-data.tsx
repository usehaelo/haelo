"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getActivityLogs } from "@/lib/api/activity";
import { getProfile } from "@/lib/api/auth";
import { getWhatsappNumber } from "@/lib/api/onboard";
import { getOverviewMetric } from "@/lib/api/overview";
import { getUnrecognizedSendersCount } from "@/lib/api/staff";
export type Draft = {
  id: string;
  name: string;
  role: string;
  email: string;
  subject: string;
  original: string;
  summary?: string;
  reply: string;
  status: string;
  time: string;
  deadline?: string;
};
type Workspace = {
  drafts: Draft[];
  name: string;
  email: string;
  company: string;
  userType: string;
  phone: string;
  connected: boolean;
  metrics: Record<string, string>;
  unknown: number | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
};
const Context = createContext<Workspace | null>(null);
export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<Workspace, "reload">>({
    drafts: [],
    name: "",
    email: "",
    company: "",
    userType: "",
    phone: "",
    connected: false,
    metrics: {},
    unknown: null,
    loading: true,
    error: false,
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState((p) => ({ ...p, loading: true, error: false }));
    const metricNames = [
      "emails-handled",
      "avg-response-time",
      "approval-rate",
      "staff-recognised",
    ] as const;
    Promise.allSettled([
      getProfile(),
      getActivityLogs(1, 100),
      getWhatsappNumber(),
      getUnrecognizedSendersCount(),
      ...metricNames.map(getOverviewMetric),
    ]).then((results) => {
      if (!active) return;
      const value = (i: number) =>
        results[i].status === "fulfilled"
          ? (results[i] as PromiseFulfilledResult<any>).value?.data
          : null;
      const profile = value(0) || {};
      const activity = value(1);
      const wa = value(2) || {};
      const metrics: Record<string, string> = {};
      metricNames.forEach((key, i) => {
        if (value(i + 4)?.value != null)
          metrics[key] = String(value(i + 4).value);
      });
      setState({
        name: profile.name || "",
        email: profile.email || "",
        company: profile.companyName || "",
        userType: profile.userType || "",
        phone: wa.phone || "",
        connected: wa.phoneVerified === true,
        unknown: value(3)?.count ?? null,
        metrics,
        loading: false,
        error: results.some((r) => r.status === "rejected"),
        drafts: (activity?.logs || []).map((item: any, index: number) => ({
          id: String(item.id || item.uid || `activity-${index}`),
          name: item.staff?.name || item.senderEmail || "Unknown sender",
          role: item.staff?.role || "",
          email: item.senderEmail || item.staff?.email || "",
          subject:
            item.subject ||
            item.originalMessage?.split("\n")[0]?.slice(0, 95) ||
            "Internal email",
          original: item.originalMessage || "",
          summary: item.summary || item.aiSummary || "",
          reply: item.responseSent || item.aiSuggested || "",
          status: String(
            item.sentType || (item.responseSent ? "sent" : "pending"),
          ).toLowerCase(),
          time: item.sentAt || item.createdAt || item.timestamp || "",
          deadline: item.autoSendAt,
        })),
      });
    });
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <Context.Provider
      value={{ ...state, reload: () => setAttempt((p) => p + 1) }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("Workspace provider is missing");
  return value;
}
export function timeLabel(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
