/**
 * Flags that are shared across all CLI subcommands.
 */
export type GlobalFlags = {
  json?: boolean;
  watch?: boolean;
  strict?: boolean;
  seedRng?: string;
  seedClock?: string;
  maxErrors?: number;
  noColor?: boolean;
};

import { SPEC, type Option } from "./options.js";
const GLOBAL_SPEC = SPEC.groups.find((g) => g.id === "global")!;
// mapa rápido de alias → nombre canónico
const aliasMap: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const o of GLOBAL_SPEC.options) {
    const names = [o.name, ...(o.aliases ?? [])];
    for (const n of names) m[n] = o.name;
  }
  return m;
})();
const globalByName = new Map(
  GLOBAL_SPEC.options.map((o) => [o.name, o] as const),
);

/**
 * Parse global flags from the given argument vector, returning unconsumed args.
 */
export function parseGlobalFlags(argv: string[]): {
  rest: string[];
  flags: GlobalFlags;
} {
  const flags: GlobalFlags = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith("-")) {
      rest.push(raw);
      continue;
    }
    const name = aliasMap[raw] ?? raw; // normaliza por alias
    const spec = globalByName.get(name);
    if (!spec) {
      rest.push(raw);
      continue;
    }
    switch (spec.kind) {
      case "boolean": {
        // booleanos no consumen valor; set true
        (flags as any)[nameToProp(name)] = true;
        break;
      }
      case "number": {
        const v = Number(argv[++i]);
        if (Number.isFinite(v)) (flags as any)[nameToProp(name)] = v;
        else rest.push(raw);
        break;
      }
      case "string":
      case "enum": {
        const v = argv[++i];
        if (typeof v === "string") (flags as any)[nameToProp(name)] = v;
        else rest.push(raw);
        break;
      }
    }
  }
  return { rest, flags };
}

function nameToProp(longName: string): keyof GlobalFlags {
  // "--seed-rng" -> "seedRng"
  const s = longName.replace(/^--/, "");
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as any;
}

/**
 * Help text describing available global flags.
 */
export const GLOBAL_FLAGS_HELP = (() => {
  // Render ordenado por nombre, con pistas de tipo para los que llevan valor.
  const rows = [...GLOBAL_SPEC.options]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((o) => {
      const names = [o.name, ...(o.aliases ?? [])].join(", ");
      const hint =
        o.kind === "boolean"
          ? ""
          : o.kind === "number"
            ? " N"
            : o.kind === "enum"
              ? ` <${(o.enumValues ?? []).join("|")}>`
              : " <value>";
      return `  ${names}${hint.padEnd(16 - Math.min(16, names.length))} ${o.description}`;
    });
  return rows.join("\n");
})();
