import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { C as cn, T as formatBirr, p as SLIDING_SCALE_META } from "./input-CxFfOybE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scale-badge-DNUZxFvg.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums", {
	variants: { variant: {
		default: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		outline: "border border-border text-foreground",
		ok: "bg-accent text-accent-foreground",
		warn: "bg-[#f4e6c3] text-warn",
		lower: "bg-[#e8eef6] text-[#1e3a5f]",
		higher: "bg-[#efe4d4] text-[#5c3d16]",
		muted: "bg-muted text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function ScaleBadge({ scale }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: scale === "Lower" ? "lower" : scale === "Higher" ? "higher" : "ok",
		children: [
			scale,
			" · ",
			formatBirr(SLIDING_SCALE_META[scale].amount)
		]
	});
}
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: status === "Renewed" ? "ok" : "warn",
		children: status
	});
}
//#endregion
export { StatusBadge as n, ScaleBadge as t };
