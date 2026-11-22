/* Thin wrapper over Clarity's custom events. Safe to call anywhere on the client: it does nothing when Clarity is not
   loaded (dev, blocked by an ad-blocker, switched off). Event names show up under Clarity -> Filters -> Custom events,
   so keep them stable and lower_snake_case. */
type ClarityFn = (command: "event" | "set", ...args: string[]) => void;

export function track(event: string): void {
  if (typeof window === "undefined") return;
  (window as unknown as { clarity?: ClarityFn }).clarity?.("event", event);
}

/** "Copy install commands" -> "copy_install_commands" */
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

type ClarityStub = ClarityFn & { q?: IArguments[] };

/** Tells Clarity what the visitor chose. Advertising storage is always denied: this site runs no ads.
 *  Safe to call before the Clarity script has loaded: it uses the same queue stub as the snippet in Clarity.tsx. */
export function setClarityConsent(choice: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { clarity?: ClarityStub };
  if (!w.clarity) {
    const stub: ClarityStub = function () {
      // eslint-disable-next-line prefer-rest-params -- Clarity's queue expects the Arguments object, same as its snippet
      (stub.q = stub.q || []).push(arguments);
    };
    w.clarity = stub;
  }
  (w.clarity as unknown as (c: string, v: { ad_Storage: string; analytics_Storage: string }) => void)("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: choice,
  });
}
