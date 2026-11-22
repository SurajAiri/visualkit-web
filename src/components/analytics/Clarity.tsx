import Script from "next/script";
import { CLARITY_ID } from "@/lib/site";

/**
 * Microsoft Clarity (heatmaps, session recordings, visitor counts).
 * - Production builds only, so local dev and `next start` on localhost never pollute the data.
 * - `afterInteractive`: loads once the page is usable, so it cannot slow the first paint.
 * - Clarity follows client-side navigation on its own, so /, /docs and /docs/<page> each show up as separate pages.
 * - Events recorded with track() (lib/analytics.ts) use the `clarity` function this snippet defines.
 */
export default function Clarity() {
  if (process.env.NODE_ENV !== "production" || !CLARITY_ID) return null;
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script",${JSON.stringify(CLARITY_ID)});`}
    </Script>
  );
}
