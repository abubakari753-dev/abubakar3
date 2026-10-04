import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as Button } from "./input-CxFfOybE.mjs";
import { f as Monitor, s as Smartphone, v as Check } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as useInstallUi } from "./router-DBRPYkns.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-BAQwLtcV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/install-DOG_yr4j.js
var import_jsx_runtime = require_jsx_runtime();
var ANDROID_STEPS = [
	{
		title: "Open in Chrome",
		body: "On the Android phone, open this same Shinile CBHI page in Google Chrome. Do not use Facebook, Telegram or the in-app browser — those cannot install apps."
	},
	{
		title: "Publish first if you are still in preview",
		body: "If you are reading this inside Grok preview, publish the app, then open the published Shinile CBHI link in Chrome on the phone."
	},
	{
		title: "Tap Chrome’s menu",
		body: "Tap the three dots in the top-right corner of Chrome."
	},
	{
		title: "Install app / Add to Home screen",
		body: "Choose Install app or Add to Home screen. Confirm Install. A Shinile CBHI icon appears on the home screen."
	},
	{
		title: "Open from the icon",
		body: "Launch Shinile CBHI from the home-screen icon. It opens full-screen, stores the register on this phone, and keeps working without internet."
	}
];
var WINDOWS_STEPS = [
	{
		title: "Use Microsoft Edge or Google Chrome",
		body: "Open Shinile CBHI in Edge or Chrome on the Windows computer."
	},
	{
		title: "Install from the address bar",
		body: "Click the install icon on the right of the address bar, or open the browser menu and choose Install Shinile CBHI."
	},
	{
		title: "Pin it like a desktop program",
		body: "Windows adds it to the Start menu. You can pin it to the taskbar. Households, photos and Excel files stay in this computer’s storage."
	}
];
function InstallPage() {
	const { standalone, canPrompt, platform, prompt } = useInstallUi();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cbhi-enter mx-auto flex max-w-2xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-primary uppercase",
					children: "Phone & computer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold tracking-tight",
					children: "Install Shinile CBHI"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "This is a full registrar that lives on the device. After install it works offline — no Play Store package is required."
				})
			] }),
			standalone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-primary/30 bg-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-start gap-3 pt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Installed on this device"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "You are running the home-screen app. Households, members and photos stay in this device’s storage."
					})] })]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-primary/25 bg-primary text-primary-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-primary-foreground",
					children: platform === "android" ? "Install on this Android phone" : "Install on this device"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "text-primary-foreground/75",
					children: canPrompt ? "Chrome is ready to add Shinile CBHI to the home screen." : "Follow the steps below. After you publish, Chrome on Android shows an Install button."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: canPrompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					className: "w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90",
					onClick: async () => {
						const result = await prompt();
						if (result === "accepted") toast.success("Shinile CBHI is on this device");
						if (result === "dismissed") toast.message("Install cancelled");
						if (result === "unavailable") toast.message("Use the steps below to add it to the home screen");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), "Install now"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-primary-foreground/85",
					children: "If the Install button is missing, use the numbered steps. Chrome only offers install from a real published page, not from an in-app preview."
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), "Android phone"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Works on Chrome for Android. Samsung Internet also supports Add to Home screen." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "flex flex-col gap-3",
				children: ANDROID_STEPS.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground",
						children: i + 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: step.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: step.body
						})]
					})]
				}, step.title))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground",
				children: "After install, exports land in the phone’s Downloads / Files app. Photos stay inside the registrar. The register can hold 15,000+ households on the phone."
			})] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "size-4" }), "Windows computer"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "The same registrar installs as a desktop app in Edge or Chrome. Data is stored on that computer." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "flex flex-col gap-3",
				children: WINDOWS_STEPS.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold",
						children: i + 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: step.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: step.body
						})]
					})]
				}, step.title))
			}) })] })
		]
	});
}
//#endregion
export { InstallPage as component };
