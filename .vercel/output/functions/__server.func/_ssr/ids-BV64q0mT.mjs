import { k as padCode, p as SLIDING_SCALE_META } from "./input-CxFfOybE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ids-BV64q0mT.js
function formatHouseholdCode(prefix, geo, kebeleCode, sequence) {
	const seq = String(sequence).padStart(4, "0");
	return `${prefix}/${geo.regionCode}/${geo.zoneCode}/${geo.woredaCode}/${padCode(kebeleCode)}/${seq}`;
}
function parseHouseholdCode(code) {
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
		sequence
	};
}
function prefixForScale(scale) {
	return SLIDING_SCALE_META[scale].prefix;
}
function nextBeneficiaryCode(existing) {
	const used = new Set(existing.map((c) => padCode(c.replace(/\.0$/, ""))));
	for (let i = 0; i < 100; i++) {
		const code = padCode(i);
		if (!used.has(code)) return code;
	}
	return padCode(existing.length);
}
//#endregion
export { prefixForScale as i, nextBeneficiaryCode as n, parseHouseholdCode as r, formatHouseholdCode as t };
