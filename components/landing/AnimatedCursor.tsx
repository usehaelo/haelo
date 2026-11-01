"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Cursor } from "./Primitives";

/** Follow actual controls so pointer positions stay accurate after text edits and resizes. */
export default function AnimatedCursor({
  scope,
  target,
  clicking,
  running,
  name,
  timer = false,
  className = "",
}: {
  scope: RefObject<HTMLElement>;
  target: string;
  clicking: boolean;
  running: boolean;
  name?: string;
  timer?: boolean;
  className?: string;
}) {
  const cursor = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  useLayoutEffect(() => {
    const element = scope.current;
    if (!element) return;
    const update = () => {
      const control = element.querySelector(target);
      const parent = cursor.current?.offsetParent as HTMLElement | null;
      if (!control || !parent) return;
      const bounds = parent.getBoundingClientRect();
      const button = control.getBoundingClientRect();
      const scale = bounds.width / parent.offsetWidth || 1;
      setPosition({
        left: (button.left - bounds.left + button.width * 0.62) / scale,
        top: (button.top - bounds.top + button.height * 0.7) / scale,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [scope, target]);
  return (
    <span
      ref={cursor}
      style={position}
      className={`animated-cursor ${className}`}
      data-clicking={running && clicking}
      data-running={running}
      aria-hidden="true"
    >
      <Cursor name={name} timer={timer} />
      <span className="cursor-click-ring" />
    </span>
  );
}
