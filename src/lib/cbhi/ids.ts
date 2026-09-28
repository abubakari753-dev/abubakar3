import { SLIDING_SCALE_META, type SlidingScale, type PaymentPrefix } from "./constants";
import type { GeoSettings } from "./types";
import { padCode } from "../utils";

export function formatHouseholdCode(
  prefix: PaymentPrefix,
  geo: GeoSettings,
  kebeleCode: string,
  sequence: number,
): string {
  const seq = String(sequence).padStart(4, "0");
  return `${prefix}/${geo.regionCode}/${geo.zoneCode}/${geo.woredaCode}/${padCode(kebeleCode)}/${seq}`;
}

export function parseHouseholdCode(code: string): {
  prefix: string;
  regionCode: string;
  zoneCode: string;
  woredaCode: string;
  kebeleCode: string;
  sequence: number;
} | null {
  const parts = code.trim().replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length < 6) return null;
  const sequence = Number(parts[5]);
  if (!Number.isFinite(sequence)) return null;
  return {
    prefix: parts[0].toUpperCase(),
    regionCode: padCode(parts[1]),
    zoneCode: padCode(parts[2]),
    woredaCode: padCode(parts[3]),
    kebeleCode: padCode(parts[4]),
    sequence,
  };
}

export function prefixForScale(scale: SlidingScale): PaymentPrefix {
  return SLIDING_SCALE_META[scale].prefix;
}

export function nextBeneficiaryCode(existing: string[]): string {
  const used = new Set(existing.map((c) => padCode(c.replace(/\.0$/, ""))));
  for (let i = 0; i < 100; i++) {
    const code = padCode(i);
    if (!used.has(code)) return code;
  }
  return padCode(existing.length);
}

export function isHeadCode(code: string): boolean {
  return padCode(code.replace(/\.0$/, "")) === "00";
}
