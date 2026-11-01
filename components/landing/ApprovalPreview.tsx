"use client";
import { useEffect, useId, useRef, useState } from "react";
import AnimatedCursor from "./AnimatedCursor";
import { useDemoTimeline } from "./Motion";
import { assets } from "./assets";
import { Vector } from "./Primitives";

/** An interactive product preview. Actions only update this sample conversation. */
export default function ApprovalPreview({
  compact = false,
  phone = false,
  autoPlay = false,
  demoPhase,
}: {
  compact?: boolean;
  phone?: boolean;
  autoPlay?: boolean;
  demoPhase?: number;
}) {
  const replyId = useId();
  const root = useRef<HTMLDivElement>(null);
  const { step, running, interact } = useDemoTimeline(root, 6, 1300, autoPlay);
  const resetTimer = useRef<number>();
  const takeControl = () => {
    window.clearTimeout(resetTimer.current);
    interact();
  };
  const [status, setStatus] = useState<"draft" | "edit" | "sent">("draft");
  const [reply, setReply] = useState(
    compact
      ? "Approved. Log the order and send the receipt to accounts."
      : "Approved. Log the order and send the receipt to accounts today.",
  );
  useEffect(() => {
    if (!autoPlay) return;
    if (step === 2) setStatus("sent");
    if (step === 5) {
      resetTimer.current = window.setTimeout(() => setStatus("draft"), 450);
      return () => window.clearTimeout(resetTimer.current);
    }
  }, [autoPlay, step]);
  useEffect(() => {
    if (demoPhase === 3) setStatus("sent");
    if (demoPhase === 0) setStatus("draft");
  }, [demoPhase]);
  return (
    <div
      ref={root}
      data-status={status}
      data-demo-phase={autoPlay ? step : demoPhase}
      data-demo-running={running}
      className={`approval-preview${compact ? " approval-compact" : ""}${phone ? " approval-phone" : ""}`}
    >
      {compact && (
        <div className="approval-header">
          <Vector asset={assets.features.logo} width={22.88} />
          <div>
            <strong>Haelo</strong>
            <span>From Tosin · Operations</span>
          </div>
          <time>9:42</time>
        </div>
      )}
      <div className="approval-message">
        {!compact && (
          <>
            <span className="approval-label">
              <Vector
                asset={assets.workflow.iconMail}
                width={phone ? 11.2 : 14}
              />{" "}
              New internal email
            </span>
            <strong>Tosin Adeyemi</strong>
            <span className="approval-role">Operations Manager</span>
          </>
        )}
        <p>
          Wants approval to reorder 50kg of rice{" "}
          {compact ? "before Friday." : "before Friday’s service."}
        </p>
        <div className="approval-draft">
          <span>SUGGESTED REPLY</span>
          {status === "edit" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                takeControl();
                setStatus("draft");
              }}
            >
              <label className="sr-only" htmlFor={replyId}>
                Edit suggested reply
              </label>
              <textarea
                id={replyId}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                required
              />
              <button className="approval-save" type="submit">
                Save draft
              </button>
            </form>
          ) : (
            <p>“{reply}”</p>
          )}
        </div>
        {!compact && (
          <>
            <small>YES to send · NO to edit · Auto-sends in 10 min</small>
            <time>9:42 AM</time>
          </>
        )}
      </div>
      <div className="approval-actions">
        <button
          type="button"
          onClick={() => {
            takeControl();
            setStatus("sent");
          }}
          disabled={status === "sent"}
        >
          {!compact && (
            <Vector
              asset={assets.workflow.iconReply}
              width={phone ? 12.8 : 16}
            />
          )}
          YES — send it
        </button>
        {(phone || compact) && (
          <button
            type="button"
            onClick={() => {
              takeControl();
              setStatus("edit");
            }}
            disabled={status === "sent"}
          >
            {!compact && (
              <Vector
                asset={assets.workflow.iconReply}
                width={phone ? 12.8 : 16}
              />
            )}
            NO — {compact ? "edit" : "let me edit"}
          </button>
        )}
      </div>
      <div
        className="approval-feedback"
        role="status"
        aria-live={
          (autoPlay && running) || demoPhase !== undefined ? "off" : "polite"
        }
      >
        {status === "sent" && (
          <>
            {phone && (
              <div className="phone-outgoing">
                YES
                <span>
                  9:43 <Vector asset={assets.hero.read} />
                </span>
              </div>
            )}
            <div className={phone ? "phone-confirmation" : undefined}>
              Sent ✓ Tosin has your reply.
              {phone && " 3 more drafts are waiting."}{" "}
              <button
                onClick={() => {
                  takeControl();
                  setStatus("draft");
                }}
                type="button"
              >
                Replay
              </button>
              {phone && <time>9:43</time>}
            </div>
          </>
        )}
      </div>
      {autoPlay && (
        <AnimatedCursor
          scope={root}
          target={
            step >= 3
              ? ".approval-feedback button"
              : ".approval-actions button:first-child"
          }
          clicking={step === 2 || step === 5}
          running={running}
          name="Stephen"
        />
      )}
    </div>
  );
}
