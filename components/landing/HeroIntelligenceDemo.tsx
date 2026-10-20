"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { demoEmails, demoStages, DemoStage, stageDurations } from "./demo-data";
import "./hero-conversation.css";

type State = {
  stage: DemoStage;
  scenario: number;
  editing: boolean;
  response: string;
  manual: boolean;
};
type Action =
  | { type: "advance" | "edit" | "save" | "replay" | "resume" | "reduce" }
  | { type: "approve"; reduced: boolean }
  | { type: "change"; value: string };
const initial: State = {
  stage: "typing-summary",
  scenario: 0,
  editing: false,
  response: demoEmails[0].response,
  manual: false,
};
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "replay":
      return initial;
    case "reduce":
      return demoStages.indexOf(state.stage) < 3
        ? { ...state, stage: "proposal" }
        : state;
    case "resume":
      return { ...state, manual: false };
    case "edit":
      return { ...state, editing: true, stage: "proposal" };
    case "save":
      return { ...state, editing: false };
    case "change":
      return { ...state, response: action.value };
    case "approve":
      return {
        ...state,
        editing: false,
        manual: true,
        stage: action.reduced ? "confirmed" : "sending",
      };
    case "advance": {
      if (state.stage === "exit") {
        const scenario = (state.scenario + 1) % demoEmails.length;
        return {
          ...initial,
          scenario,
          response: demoEmails[scenario].response,
        };
      }
      return {
        ...state,
        stage: demoStages[demoStages.indexOf(state.stage) + 1],
      };
    }
  }
}
function Sender({ executive = false }: { executive?: boolean }) {
  return (
    <span className="bubble-sender">
      {!executive && (
        <Image src="/images/logo/halo-icon.png" alt="" width={18} height={18} />
      )}
      <span>{executive ? "You" : "HAELO"}</span>
    </span>
  );
}
function MessageMeta({
  time,
  executive = false,
}: {
  time: string;
  executive?: boolean;
}) {
  return (
    <span className={`bubble-meta ${executive ? "executive-meta" : ""}`}>
      <time>{time}</time>
      <CheckCheck size={12} aria-hidden="true" />
    </span>
  );
}
function TypingIndicator({ sending = false }: { sending?: boolean }) {
  return (
    <div
      className="floating-bubble typing-bubble"
      role="status"
      aria-label={
        sending
          ? "Simulating sending your approved response"
          : "HAELO is typing"
      }
    >
      <Image src="/images/logo/halo-icon.png" alt="" width={18} height={18} />
      <span className="typing-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {sending && <span className="typing-caption">Sending…</span>}
    </div>
  );
}
export default function HeroIntelligenceDemo() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const approveButton = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(media.matches);
      if (media.matches) dispatch({ type: "reduce" });
    };
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    if (root.current) observer.observe(root.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  useEffect(() => {
    if (state.editing) input.current?.focus();
    else if (wasEditing.current) approveButton.current?.focus();
    wasEditing.current = state.editing;
  }, [state.editing]);
  const held = state.manual && state.stage === "confirmed";
  const stopped = paused || held;
  useEffect(() => {
    if (stopped || reduced || !visible || !pageVisible || state.editing) return;
    const timer = window.setTimeout(
      () => dispatch({ type: "advance" }),
      stageDurations[state.stage],
    );
    return () => window.clearTimeout(timer);
  }, [
    state.stage,
    state.scenario,
    state.editing,
    stopped,
    reduced,
    visible,
    pageVisible,
  ]);
  const email = demoEmails[state.scenario];
  const index = demoStages.indexOf(state.stage);
  const showProposal = index >= 3;
  const showExecutive = index >= 4;
  const summaryRetired = showExecutive;
  const approve = () => {
    setPaused(false);
    dispatch({ type: "approve", reduced });
  };
  return (
    <div
      className="floating-demo"
      ref={root}
      role="region"
      aria-label="Simulated HAELO approval conversation"
      data-stage={state.stage}
      data-playing={!stopped && !reduced && visible && pageVisible}
    >
      <div
        className={`floating-conversation ${state.stage === "exit" ? "conversation-exit" : ""}`}
        key={state.scenario}
      >
        {index >= 1 && (
          <div
            className={`summary-slot ${summaryRetired ? "summary-retired" : ""}`}
            aria-hidden={summaryRetired}
          >
            <div>
              <article className="floating-bubble summary-bubble">
                <Sender />
                <p>{email.summary}</p>
                <MessageMeta time={email.time} />
              </article>
            </div>
          </div>
        )}
        {showProposal && (
          <article className="floating-bubble proposal-bubble">
            <Sender />
            <p>{email.introduction}</p>
            {state.editing ? (
              <div className="bubble-editor">
                <label className="sr-only" htmlFor="demo-response">
                  Edit simulated response
                </label>
                <textarea
                  id="demo-response"
                  ref={input}
                  value={state.response}
                  onChange={(e) =>
                    dispatch({ type: "change", value: e.target.value })
                  }
                />
                <button
                  onClick={() => dispatch({ type: "save" })}
                  disabled={!state.response.trim()}
                >
                  Save response <Check size={12} />
                </button>
              </div>
            ) : (
              <blockquote>{state.response}</blockquote>
            )}
            <p>{email.question}</p>
            <MessageMeta time={email.time} />
            {!state.editing && !showExecutive && (
              <div className="bubble-quick-replies">
                <button
                  ref={approveButton}
                  onFocus={() => setPaused(true)}
                  onClick={approve}
                >
                  Approve &amp; Send <Check size={13} />
                </button>
                <button
                  onFocus={() => setPaused(true)}
                  onClick={() => {
                    setPaused(true);
                    dispatch({ type: "edit" });
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </article>
        )}
        {showExecutive && (
          <article className="floating-bubble executive-bubble">
            <Sender executive />
            <p>{email.reply}</p>
            <MessageMeta time={email.time} executive />
          </article>
        )}
        {(state.stage === "confirmed" || state.stage === "exit") && (
          <article
            className="floating-bubble confirmation-bubble"
            role="status"
            aria-live={state.manual ? "polite" : "off"}
          >
            <Sender />
            <p>
              <Check size={15} aria-hidden="true" />
              {email.confirmation}
            </p>
            <MessageMeta time={email.time} />
          </article>
        )}
        {(state.stage === "typing-summary" ||
          state.stage === "typing-response" ||
          state.stage === "sending") && (
          <TypingIndicator sending={state.stage === "sending"} />
        )}
      </div>
      <div className="floating-demo-footer">
        <span>
          Simulated conversation
          <span className="simulation-detail"> · No real messages sent</span>
        </span>
        <div>
          <button
            aria-label={
              stopped || reduced ? "Play demonstration" : "Pause demonstration"
            }
            disabled={reduced || state.editing}
            onClick={() => {
              if (held) {
                dispatch({ type: "resume" });
                setPaused(false);
              } else setPaused((value) => !value);
            }}
          >
            {stopped || reduced ? <Play size={13} /> : <Pause size={13} />}
          </button>
          <button
            aria-label="Replay demonstration"
            onClick={() => {
              setPaused(false);
              dispatch({ type: "replay" });
              if (reduced) dispatch({ type: "reduce" });
            }}
          >
            <RotateCcw size={13} />
          </button>
          <button
            aria-label="Next message"
            disabled={state.editing}
            onClick={() => {
              setPaused(true);
              dispatch({ type: "advance" });
              if (reduced && state.stage === "exit")
                dispatch({ type: "reduce" });
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
