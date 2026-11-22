"use client";
import type { ReactNode } from "react";
import CountdownSection from "./CountdownSection";
import { useSecondsLeft } from "./useLaunchCountdown";

/** Shows the countdown until LAUNCH_AT, then the wrapped section (Get started). Wrap, don't edit, that section. */
export default function LaunchGate({ children }: { children: ReactNode }) {
  const left = useSecondsLeft();
  return left === 0 ? <>{children}</> : <CountdownSection left={left} />;
}
