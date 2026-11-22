"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { Timer } from "lucide-react";
import { formatShort, useSecondsLeft } from "./useLaunchCountdown";
import "./countdown.css";

/** Banner text until LAUNCH_AT (with a short live countdown that links to the section); `children` afterwards. */
export default function LaunchBanner({ children }: { children: ReactNode }) {
  const left = useSecondsLeft();
  if (left === 0) return <>{children}</>;
  return (
    <>
      <span className="top-banner-text">
        <strong>Almost done,</strong> docs added (might have minor cosmetic changes). Library coming soon.
      </span>
      <Link href="/#start" className="top-banner-timer" aria-label="Library release countdown, jump to the countdown">
        <Timer size={12} aria-hidden />
        <span>{left === null ? "--:--:--" : formatShort(left)}</span>
      </Link>
    </>
  );
}
