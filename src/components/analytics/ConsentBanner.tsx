"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CLARITY_ID, CONSENT_BANNER, PRIVACY_URL } from "@/lib/site";
import { OPEN_SETTINGS, readConsent, saveConsent, subscribeConsent } from "@/lib/consent";
import { setClarityConsent } from "@/lib/analytics";
import "./consent.css";

/**
 * Cookie banner for Microsoft Clarity. Accept and Decline are equally easy and equally prominent; the choice is
 * remembered, passed to Clarity, and can be changed any time from "Cookie settings" in the footer.
 */
export default function ConsentBanner() {
  // "unknown" on the server and during hydration, so nothing flashes and nothing mismatches.
  const choice = useSyncExternalStore(subscribeConsent, readConsent, () => "unknown" as const);
  const [reopened, setReopened] = useState(false);
  const accept = useRef<HTMLButtonElement>(null);

  // Tell Clarity whenever the choice is known (returning visitor, or a fresh click).
  useEffect(() => {
    if (choice === "granted" || choice === "denied") setClarityConsent(choice);
  }, [choice]);

  // "Cookie settings" links elsewhere on the site ask for the banner to come back.
  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_SETTINGS, open);
    return () => window.removeEventListener(OPEN_SETTINGS, open);
  }, []);

  const visible = reopened || choice === null;
  useEffect(() => {
    if (reopened) accept.current?.focus(); // moved here by the visitor's own click, so focusing is expected
  }, [reopened]);

  if (!CONSENT_BANNER || !CLARITY_ID || choice === "unknown" || !visible) return null;

  const decide = (c: "granted" | "denied") => {
    saveConsent(c);
    setReopened(false);
  };

  return (
    <section className="consent" role="region" aria-label="Cookie preferences">
      <p className="consent-title">Cookies &amp; analytics</p>
      <p className="consent-text">
        We use Microsoft Clarity to see which pages get read and where people get stuck. It sets analytics cookies
        only if you accept. No ads, no selling data.{" "}
        <Link href={PRIVACY_URL}>Privacy policy</Link>
      </p>
      <div className="consent-actions">
        <button type="button" className="consent-btn" onClick={() => decide("denied")}>
          Decline
        </button>
        <button type="button" className="consent-btn is-accept" ref={accept} onClick={() => decide("granted")}>
          Accept
        </button>
      </div>
    </section>
  );
}
