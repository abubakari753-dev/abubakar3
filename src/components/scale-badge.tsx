import { Badge } from "./ui/badge";
import { SLIDING_SCALE_META, type SlidingScale, type MembershipStatus } from "@/lib/cbhi/constants";
import { formatBirr } from "@/lib/utils";

export function ScaleBadge({ scale }: { scale: SlidingScale }) {
  const variant = scale === "Lower" ? "lower" : scale === "Higher" ? "higher" : "ok";
  return (
    <Badge variant={variant}>
      {scale} · {formatBirr(SLIDING_SCALE_META[scale].amount)}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: MembershipStatus }) {
  return <Badge variant={status === "Renewed" ? "ok" : "warn"}>{status}</Badge>;
}
