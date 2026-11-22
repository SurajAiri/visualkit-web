import type { Metadata } from "next";
import Logo from "@/components/layout/Logo";
import Footer from "@/components/layout/Footer";
import CookieSettingsButton from "@/components/analytics/CookieSettingsButton";
import { CONSENT_BANNER, CONTACT_EMAIL } from "@/lib/site";
import "./privacy.css";

export const metadata: Metadata = {
  title: "Privacy & cookies · VisualKit",
  description: "What the VisualKit website collects, which cookies it sets, and how to change your choice.",
};

const UPDATED = "22 November 2026";

export default function PrivacyPage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="legal-head">
        <Logo href="/" label="VisualKit home" />
      </header>
      <main id="main" tabIndex={-1} className="legal">
        <span className="section-kicker">Privacy</span>
        <h1>Privacy &amp; cookies</h1>
        <p className="legal-meta">Last updated {UPDATED}</p>

        <p>
          This page covers the VisualKit website (the landing page and the docs). It does not cover the VisualKit library
          itself, which runs on your own machine.
        </p>

        <h2>The short version</h2>
        <ul>
          <li>You don’t need an account, and the site has no forms. We never ask you for personal details.</li>
          <li>We use Microsoft Clarity, an analytics tool, to see how the site is used so we can improve it.</li>
          <li>Clarity sets its cookies only if you accept. You can decline, and change your mind at any time.</li>
          <li>We run no advertising and we don’t sell data.</li>
        </ul>

        <h2>What Microsoft Clarity collects</h2>
        <p>
          Clarity records how visitors use the pages: which pages are opened, clicks and taps, scrolling, mouse
          movement, and anonymised session replays that show how a page was used. It also records technical details such
          as device type, browser, operating system, screen size, language, the page you came from, and an approximate
          location (country or city) derived from your IP address. Clarity hides sensitive text by default, and we hide
          the docs search box from replays on top of that.
        </p>
        <p>
          Microsoft processes this data under the{" "}
          <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noreferrer">Microsoft Privacy Statement</a>.
        </p>

        <h2>Cookies and storage</h2>
        <div className="legal-table" role="region" aria-label="Cookies and storage" tabIndex={0}>
          <table>
            <thead>
              <tr><th>Name</th><th>Set by</th><th>Purpose</th><th>When</th></tr>
            </thead>
            <tbody>
              <tr><td><code>_clck</code></td><td>Microsoft Clarity</td><td>Remembers a random visitor ID and your Clarity settings</td><td>Only if you accept</td></tr>
              <tr><td><code>_clsk</code></td><td>Microsoft Clarity</td><td>Connects the page views of one visit into a single session</td><td>Only if you accept</td></tr>
              <tr><td><code>vk-consent-v1</code></td><td>This site (local storage)</td><td>Remembers whether you accepted or declined, for about six months. It stays on your device.</td><td>When you make a choice</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The site itself sets no other cookies. We tell Clarity that advertising storage is always denied, so no
          advertising cookies are used.
        </p>

        <h2>If you decline</h2>
        <p>
          Clarity then sets no cookies. It may still receive limited, cookieless usage data for the page you are on, with
          a fresh random ID on every page view, so separate visits can’t be linked to each other.
        </p>

        <h2>Your choice</h2>
        <p>
          {CONSENT_BANNER ? (
            <>
              You can change your mind at any time:{" "}
              <CookieSettingsButton className="legal-inline-btn" />. Withdrawing consent makes Clarity stop using its
              cookies for you.
            </>
          ) : (
            <>You can also block or delete cookies in your browser settings.</>
          )}{" "}
          Where the law requires it (for example in the EU, the UK and Switzerland), we rely on your consent for analytics
          cookies.
        </p>

        <h2>Other services that see your visit</h2>
        <ul>
          <li>
            <strong>Cloudinary</strong> delivers the demo video and its preview image. When they load, Cloudinary
            receives your IP address and browser details, as any file host would.
          </li>
          <li>
            <strong>Our hosting provider</strong> keeps standard server logs (IP address, requested page, browser) to
            run and secure the site.
          </li>
          <li>Fonts are served from this site, not from a third-party font service.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have the right to ask what data we hold about you, to have it corrected or
          deleted, and to object to its use.{" "}
          {CONTACT_EMAIL ? (
            <>Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we’ll help.</>
          ) : (
            <>Contact us through the project and we’ll help.</>
          )}
        </p>

        <h2>Changes</h2>
        <p>If we change how the site handles data, we’ll update this page and its date. Material changes will ask for your choice again.</p>
      </main>
      <Footer home />
    </>
  );
}
