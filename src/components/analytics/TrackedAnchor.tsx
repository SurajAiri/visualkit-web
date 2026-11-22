"use client";
import type { AnchorHTMLAttributes } from "react";
import { track } from "@/lib/analytics";

/** A plain <a> that also records a Clarity event on click. For links rendered from server components. */
export default function TrackedAnchor({
  event,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { event: string }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    />
  );
}
