export default function TopBanner() {
  return (
    <div className="top-banner" role="region" aria-label="Announcement">
      <div className="top-banner-inner">
        <span className="top-banner-dot" aria-hidden="true" />
        <span className="top-banner-text">
          <strong>Docs and library</strong> currently point to the old version — new ones will be live in 2–3 days
        </span>
      </div>
    </div>
  );
}
