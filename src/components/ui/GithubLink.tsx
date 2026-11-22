"use client";
import { useId, useRef, type ReactNode } from "react";
import { GitBranch } from "lucide-react";
import { GITHUB_URL } from "@/lib/site";
import "./github-link.css";

/**
 * A link into the GitHub repo. `path` is appended to GITHUB_URL ("/tree/main/skills/x").
 * With a URL set it is a normal external link. While GITHUB_URL is null it is a button that opens a
 * "coming soon" dialog, so every GitHub link on the site flips together from one constant in lib/site.ts.
 */
export default function GithubLink({
  path = "",
  className,
  children,
}: {
  path?: string;
  className?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();

  if (GITHUB_URL) {
    return (
      <a className={className} href={`${GITHUB_URL}${path}`} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  // Plain divs inside the dialog (not h2/p) so nothing inherits the docs prose styles it may be rendered inside.
  return (
    <>
      <button type="button" className={`gh-trigger ${className ?? ""}`} onClick={() => dialog.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={dialog}
        className="gh-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-body`}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close(); // click on the backdrop
        }}
      >
        <div className="gh-card">
          <span className="gh-icon" aria-hidden="true"><GitBranch size={20} /></span>
          <div className="gh-kicker">OPEN SOURCE</div>
          <div className="gh-title" id={`${id}-title`} role="heading" aria-level={2}>
            We’re open-sourcing VisualKit soon
          </div>
          <div className="gh-body" id={`${id}-body`}>
            The codebase isn’t public just yet. Once it is, this link will take you straight to the repository.
          </div>
          <button type="button" className="gh-close" autoFocus onClick={() => dialog.current?.close()}>
            Got it
          </button>
        </div>
      </dialog>
    </>
  );
}
