import type { ReactNode } from "react";

export default function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={className}>
      <span>{label}</span>
      {children}
      {error && <small className="field-error" role="alert">{error}</small>}
    </label>
  );
}
