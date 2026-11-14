// A timecode ruler used as a section edge. It is the page's one recurring motif.
export default function TickRule({ className = "" }: { className?: string }) {
  return <div className={"tick-rule " + className} aria-hidden="true" />;
}
