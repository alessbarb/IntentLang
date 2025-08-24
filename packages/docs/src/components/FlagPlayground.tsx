import React from "react";

// Si prefieres pasar SPEC desde el MDX, deja la import comentada y usa <FlagPlayground spec={SPEC}/>
// import { SPEC as IL_SPEC } from "@site/../../packages/cli/src/options";

type Opt = {
  name: string; // "--strict"
  kind: "boolean" | "string" | "number" | "enum";
  enumValues?: string[];
  aliases?: string[];
  description: string;
  default?: any;
};
type Group = { id: string; title: string; options: Opt[] };
type Spec = { tool: "ilc"; groups: Group[] };

type Props = {
  /** SPEC opcional inyectado desde MDX */
  spec?: Spec;
};

function flatten(spec: Spec) {
  const byId = new Map(spec.groups.map((g) => [g.id, g]));
  const all = spec.groups.flatMap((g) =>
    g.options.map((o) => ({ ...o, group: g.id })),
  );
  return { byId, all };
}

const COMMANDS = [
  { id: "check", label: "intent check" },
  { id: "build", label: "intent build" },
  { id: "test", label: "intent test" },
  { id: "init", label: "intent init" },
];

export default function FlagPlayground({ spec }: Props) {
  // @ts-ignore: allow optional runtime import if present
  const runtimeSpec: Spec | undefined = spec ?? (globalThis as any)?.IL_SPEC;
  if (!runtimeSpec) {
    return (
      <div className="alert alert--warning" role="alert">
        No se pudo cargar SPEC. Importa desde MDX:
        <pre>
          {`import { SPEC } from "@site/../../packages/cli/src/options";
import FlagPlayground from "@site/src/components/FlagPlayground";
<FlagPlayground spec={SPEC} />`}
        </pre>
      </div>
    );
  }

  const { all } = flatten(runtimeSpec);
  const [cmd, setCmd] = React.useState("check");
  const [query, setQuery] = React.useState("");
  const [vals, setVals] = React.useState<Record<string, any>>({});

  const relevant = all.filter(
    (o) =>
      o.group === "global" ||
      (cmd === "build" && o.group === "build") ||
      (cmd === "test" && o.group === "test") ||
      (cmd === "init" && o.group === "init") ||
      (cmd === "check" && o.group === "check"),
  );

  const filtered = relevant.filter((o) => {
    const q = query.toLowerCase();
    return (
      !q ||
      o.name.toLowerCase().includes(q) ||
      (o.aliases ?? []).some((a) => a.toLowerCase().includes(q)) ||
      (o.description ?? "").toLowerCase().includes(q)
    );
  });

  const toggle = (opt: Opt, v: any) =>
    setVals((s) => ({
      ...s,
      [opt.name]: v,
    }));

  const buildCmd = () => {
    const parts = ["intent", cmd];
    for (const o of relevant) {
      const v = vals[o.name];
      if (v === undefined || v === "" || v === false) continue;
      if (o.kind === "boolean") {
        parts.push(o.name);
      } else {
        parts.push(`${o.name}`, String(v));
      }
    }
    return parts.join(" ");
  };

  return (
    <div
      style={{
        border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
        borderRadius: 12,
        padding: 16,
        margin: "16px 0",
      }}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <select
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          aria-label="Comando"
          style={{ padding: "6px 10px", borderRadius: 8 }}
        >
          {COMMANDS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Buscar flag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: "1 1 240px",
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
          }}
        />
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        {filtered.map((o) => (
          <div
            key={o.name}
            style={{
              border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
              borderRadius: 10,
              padding: 10,
            }}
          >
            <div style={{ fontWeight: 600 }}>
              <code>{o.name}</code>{" "}
              {o.aliases?.length ? (
                <span style={{ color: "var(--ifm-color-emphasis-600)" }}>
                  (alias: {o.aliases.join(", ")})
                </span>
              ) : null}
            </div>
            <div style={{ color: "var(--ifm-color-emphasis-700)" }}>
              {o.description}
            </div>
            <div style={{ marginTop: 8 }}>
              {o.kind === "boolean" ? (
                <label style={{ display: "inline-flex", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!vals[o.name]}
                    onChange={(e) => toggle(o, e.target.checked)}
                  />
                  activar
                </label>
              ) : o.kind === "enum" ? (
                <select
                  value={vals[o.name] ?? ""}
                  onChange={(e) => toggle(o, e.target.value)}
                >
                  <option value="">(sin valor)</option>
                  {o.enumValues?.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={o.kind === "number" ? "number" : "text"}
                  value={vals[o.name] ?? ""}
                  onChange={(e) => toggle(o, e.target.value)}
                />
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="alert alert--info">No hay flags para mostrar.</div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Comando</div>
        <pre
          style={{
            background: "var(--ifm-pre-background)",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          <code>{buildCmd()}</code>
        </pre>
      </div>
    </div>
  );
}
