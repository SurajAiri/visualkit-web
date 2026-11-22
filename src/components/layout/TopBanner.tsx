import LaunchBanner from "@/components/countdown/LaunchBanner";

export default function TopBanner() {
  return (
    <div className="top-banner" role="region" aria-label="Announcement">
      <div className="top-banner-inner">
        <span className="top-banner-dot" aria-hidden="true" />
        {/* LaunchBanner shows the "almost done" message + countdown until LAUNCH_AT, then renders this span. */}
        <LaunchBanner>
          <span className="top-banner-text">
            <strong>Still in beta,</strong> so there might be some minor issues.
          </span>
        </LaunchBanner>
      </div>
    </div>
  );
}
