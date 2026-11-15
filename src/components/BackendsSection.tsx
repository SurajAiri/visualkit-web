import { ArrowRight } from "lucide-react";
import BackendHub from "./BackendHub";
import Reveal from "./Reveal";

export default function BackendsSection() {
  return (
    <section className="backend-section" id="backends">
      <Reveal className="backend-copy">
        <span className="section-kicker">06 / YOUR TOOLCHAIN, YOUR CALL</span>
        <h2>
          One project.<br />
          <span>Room to render.</span>
        </h2>
        <p>
          VisualKit keeps the edit backend-neutral. Add an adapter when you’re ready to render, finish, or bring a new
          tool into the workflow.
        </p>
        <a href="#architecture" className="button-text">See the architecture <ArrowRight size={16} aria-hidden /></a>
      </Reveal>
      <BackendHub />
    </section>
  );
}
