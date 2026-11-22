import Reveal from "@/components/ui/Reveal";
import GetStarted from "./GetStarted";
import { INSTALL, REQUIREMENTS } from "@/lib/site";
import "./closing.css";

export default function Closing() {
  return (
    <section className="closing-section" id="start">
      <div className="closing-grid" aria-hidden="true" />
      <Reveal className="closing-content">
        <span className="section-kicker">A LIBRARY FOR WHAT’S NEXT</span>
        <h2>
          Let the agents<br />
          <span>focus on the edit.</span>
        </h2>
        <p>One install and one project file. Hand the edit to an agent, or drive it from code. Every change is checked, recorded, and easy to undo.</p>
        <GetStarted />
        <small className="closing-req">
          {REQUIREMENTS} Agents drive the same library, so install it either way: <code>{INSTALL.uv}</code> or <code>{INSTALL.pip}</code>.
        </small>
      </Reveal>
    </section>
  );
}
