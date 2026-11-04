"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Pause, Play } from "lucide-react";

const MotionContext = createContext({ enabled: false });

/** One motion policy for the page: visible tab, user preference, and a pause control. */
export default function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    const visibility = () => setVisible(!document.hidden);
    update();
    visibility();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    const elements = root.current?.querySelectorAll(
      ".landing-heading, .moment-card, .security-grid article, .pricing-card, .bible-document",
    );
    if (!elements) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "true");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    elements.forEach((element, index) => {
      element.setAttribute("data-reveal", "true");
      (element as HTMLElement).style.setProperty(
        "--reveal-delay",
        `${(index % 4) * 75}ms`,
      );
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.removeAttribute("data-reveal"));
    };
  }, []);
  const enabled = !paused && !reduced && visible;
  return (
    <MotionContext.Provider value={{ enabled }}>
      <div
        ref={root}
        className="landing-motion"
        data-motion={enabled ? "running" : "paused"}
      >
        {children}
        {!reduced && (
          <button
            type="button"
            className="motion-control"
            onClick={() => setPaused(!paused)}
            aria-label={
              paused ? "Resume page animations" : "Pause page animations"
            }
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            <span>{paused ? "Resume motion" : "Pause motion"}</span>
          </button>
        )}
      </div>
    </MotionContext.Provider>
  );
}

/** Timelines only run on screen. Hover, keyboard focus and manual actions take priority. */
export function useDemoTimeline<T extends HTMLElement>(
  ref: RefObject<T>,
  count: number,
  milliseconds = 1100,
  autoPlay = true,
) {
  const { enabled } = useContext(MotionContext);
  const [inView, setInView] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [step, setStep] = useState(0);
  const manualUntil = useRef(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    const enter = () => setEngaged(true);
    const pointerEnter = () => {
      if (element.tagName !== "SECTION") enter();
    };
    const leave = () => setEngaged(element.contains(document.activeElement));
    const blur = () =>
      setEngaged(element.tagName !== "SECTION" && element.matches(":hover"));
    observer.observe(element);
    element.addEventListener("pointerenter", pointerEnter);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("focusin", enter);
    element.addEventListener("focusout", blur);
    return () => {
      observer.disconnect();
      element.removeEventListener("pointerenter", pointerEnter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("focusin", enter);
      element.removeEventListener("focusout", blur);
    };
  }, [ref]);
  const running = autoPlay && enabled && inView && !engaged;
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= manualUntil.current)
        setStep((current) => (current + 1) % count);
    }, milliseconds);
    return () => window.clearInterval(timer);
  }, [running, count, milliseconds]);
  return {
    step,
    running,
    resume: () => {
      manualUntil.current = 0;
      setEngaged(false);
    },
    interact: () => {
      manualUntil.current = Date.now() + 12000;
    },
  };
}
