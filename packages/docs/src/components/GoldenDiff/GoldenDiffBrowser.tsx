/// <reference types="webpack-env" />
import React, { useMemo, useState } from "react";
import GoldenDiff from "./GoldenDiff";
import {
  normalizeLineIL,
  normalizeLineTS,
} from "@site/../../packages/core/src/transpilers/compare-normalize";

// 1) Carga todos los IL/TS (recursivo)
const ilCtx: __WebpackModuleApi.RequireContext = require.context(
  "!!raw-loader!@site/../../packages/examples/intentlang",
  true,
  /\.il$/,
);
const tsCtx: __WebpackModuleApi.RequireContext = require.context(
  "!!raw-loader!@site/../../packages/examples/goldens/ts",
  true,
  /\.ts$/,
);

// 2) Empareja por basename
type Pair = {
  key: string;
  ilKey?: string;
  tsKey?: string;
  ilPath?: string;
  tsPath?: string;
};

function buildPairs(): Pair[] {
  const byBase = new Map<string, Pair>();
  const grab = (full: string) => {
    const path = full.replace(/^\.\//, "");
    const base = path
      .split("/")
      .pop()!
      .replace(/\.(il|ts)$/, "");
    return { base, path };
  };

  ilCtx.keys().forEach((k) => {
    const { base, path } = grab(k);
    const p = byBase.get(base) ?? { key: base };
    p.ilKey = k;
    p.ilPath = path;
    byBase.set(base, p);
  });

  tsCtx.keys().forEach((k) => {
    const { base, path } = grab(k);
    const p = byBase.get(base) ?? { key: base };
    p.tsKey = k;
    p.tsPath = path;
    byBase.set(base, p);
  });

  const all = Array.from(byBase.values());
  all.sort((a, b) => {
    const aw = a.ilKey && a.tsKey ? 0 : 1;
    const bw = b.ilKey && b.tsKey ? 0 : 1;
    return aw - bw || a.key.localeCompare(b.key);
  });
  return all;
}

const ALL_PAIRS = buildPairs();

export default function GoldenDiffBrowser() {
  const [query, setQuery] = useState("");
  const pairs = useMemo(() => {
    if (!query) return ALL_PAIRS;
    const q = query.toLowerCase();
    return ALL_PAIRS.filter(
      (p) =>
        p.key.toLowerCase().includes(q) ||
        p.ilPath?.toLowerCase().includes(q) ||
        p.tsPath?.toLowerCase().includes(q),
    );
  }, [query]);

  const [sel, setSel] = useState(0);
  const current = pairs[sel] ?? pairs[0];

  const ilRaw = current?.ilKey ? (ilCtx(current.ilKey).default as string) : "";
  const tsRaw = current?.tsKey ? (tsCtx(current.tsKey).default as string) : "";

  return (
    <div
      style={{
        border: "1px solid var(--ifm-toc-border-color,#e6e6e6)",
        borderRadius: 12,
      }}
    >
      {/* Controles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 12,
          padding: 12,
          alignItems: "center",
          background: "var(--ifm-background-surface-color)",
        }}
      >
        <div style={{ fontWeight: 600 }}>
          Golden Diffs — {pairs.length} ejemplo{pairs.length === 1 ? "" : "s"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Buscar (nombre o ruta)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSel(0);
            }}
            style={{
              flex: 1,
              padding: "6px 10px",
              border: "1px solid var(--ifm-toc-border-color,#e6e6e6)",
              borderRadius: 8,
              fontFamily: "inherit",
            }}
          />
          <select
            value={sel}
            onChange={(e) => setSel(parseInt(e.target.value, 10))}
            style={{ padding: "6px 10px", borderRadius: 8 }}
            aria-label="Elegir fichero"
          >
            {pairs.map((p, i) => (
              <option key={p.key + "#" + i} value={i}>
                {p.key}
                {!(p.ilKey && p.tsKey) ? " (incompleto)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info selección */}
      <div
        style={{
          padding: "6px 12px",
          fontSize: 12,
          color: "var(--ifm-color-emphasis-700)",
        }}
      >
        <div>IL: {current?.ilPath ?? "— no encontrado —"}</div>
        <div>TS: {current?.tsPath ?? "— no encontrado —"}</div>
      </div>

      {/* Viewer (delegado al componente GoldenDiff) */}
      <div style={{ padding: "8px 12px" }}>
        <GoldenDiff
          title={current?.key}
          ilRaw={ilRaw}
          tsRaw={tsRaw}
          target="ts"
          stripPrologue
          leftEquivalences={[normalizeLineIL]}
          rightEquivalences={[normalizeLineTS]}
          viewerHeight={480} // <- puedes exponer esta prop en GoldenDiff
        />
      </div>
    </div>
  );
}
