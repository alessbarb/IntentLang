import type { Diagnostic } from "@intentlang/core";

type AnyDiag = Diagnostic & { level?: string; severity?: string };

export function severityOf(d: AnyDiag): "error" | "warning" | "info" {
  const v = (d.level ?? d.severity)?.toLowerCase();
  if (v === "error") return "error";
  if (v === "warning") return "warning";
  return "info";
}

export function summarize(diags: Diagnostic[]) {
  let errors = 0,
    warnings = 0;
  for (const d of diags as AnyDiag[]) {
    const sev = severityOf(d);
    if (sev === "error") errors++;
    else if (sev === "warning") warnings++;
  }
  return { errors, warnings };
}

export function exitCodeFrom(diags: Diagnostic[], opts: { strict?: boolean }) {
  const { errors, warnings } = summarize(diags);
  if (errors > 0) return 1;
  if (opts.strict && warnings > 0) return 1;
  return 0;
}
