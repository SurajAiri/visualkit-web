import { ArrowRight } from "lucide-react";
import "./backends.css";
import BackendHub from "./BackendHub";
import Reveal from "@/components/ui/Reveal";

export default function BackendsSection() {
  return (
    <section className="backend-section" id="backends">
      <Reveal className="backend-copy">
        <span className="section-kicker">05 / RENDERER INDEPENDENCE</span>
        <h2>
          Write the edit once.<br />
          <span>Render it anywhere.</span>
        </h2>
        <p>
          The project is backend-neutral, so the same script renders in FFmpeg, DaVinci Resolve or OpenTimelineIO. Need
          another renderer? Add an adapter once. Nothing in your project changes.
        </p>
        <a href="#how-it-works" className="button-text">See how it fits together <ArrowRight size={16} aria-hidden /></a>
      </Reveal>
      <BackendHub />
    </section>
  );
}
