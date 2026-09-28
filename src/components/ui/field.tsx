import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

interface FieldProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Field({ label, hint, htmlFor, required, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {hint ? <p className="text-[11px] leading-tight text-faint">{hint}</p> : null}
      {children}
    </div>
  );
}

export function NativeSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full appearance-none rounded-md border border-input bg-card bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50 md:text-sm",
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22 stroke=%22%236f675c%22 stroke-width=%221.6%22><path d=%22M1 1.5 6 6.5 11 1.5%22/></svg>')]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
