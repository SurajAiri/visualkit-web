import { FEATURES } from "@/lib/features";
import { statusOf } from "@/lib/registry";

export default function Chips({ ids }: { ids: string[] }) {
  return (
    <div className="chips">
      {ids.map((id) => {
        const s = statusOf(id);
        if (s === "hidden") return null;
        return (
          <span className="chip" key={id}>
            {FEATURES[id]}
            {s !== "live" && <i>{s === "upcoming" ? "soon" : s}</i>}
          </span>
        );
      })}
    </div>
  );
}
