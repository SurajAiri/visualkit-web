import { wave } from "@/lib/wave";

export default function Wave({ count, seed = 1, className = "" }: { count: number; seed?: number; className?: string }) {
  return (
    <span className={"waveform " + className} aria-hidden="true">
      {wave(count, seed).map((h, i) => (
        <b key={i} style={{ height: h + "%" }} />
      ))}
    </span>
  );
}
