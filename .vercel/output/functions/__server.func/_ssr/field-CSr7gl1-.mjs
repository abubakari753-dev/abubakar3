import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { m as cn } from "./input-CbEkyqtb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/field-CSr7gl1-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
	ref,
	className: cn("text-sm font-medium leading-none text-foreground", className),
	...props
}));
Label.displayName = "Label";
function Field({ label, hint, htmlFor, required, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-1.5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				htmlFor,
				children: [label, required ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-destructive",
					children: " *"
				}) : null]
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] leading-tight text-faint",
				children: hint
			}) : null,
			children
		]
	});
}
function NativeSelect({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn("flex h-11 w-full appearance-none rounded-md border border-input bg-card bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50 md:text-sm", "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22 stroke=%22%236f675c%22 stroke-width=%221.6%22><path d=%22M1 1.5 6 6.5 11 1.5%22/></svg>')]", className),
		...props,
		children
	});
}
//#endregion
export { NativeSelect as n, Field as t };
