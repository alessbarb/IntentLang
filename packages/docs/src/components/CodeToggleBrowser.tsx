import React from "react";
import CodeToggle from "./CodeToggle";

type Props = {
  /** Filtra por nombre de fichero .il (basename.il) */
  include?: RegExp;                // p.ej. /^(operators|fixed2|for-loop)\.il$/
  exclude?: RegExp;
  /** Selección inicial (basename, sin .il) */
  initial?: string;
  /** Mostrar selector arriba (true) o a la izquierda (false) en pantallas anchas */
  horizontal?: boolean;
};

type Entry = { id: string; title: string; ilRaw: string; tsRaw?: string; pyRaw?: string };

/** Carga require.context(raw) => {"file.ext": "contenido"} */
function loadContext(ctx: any): Record<string, string> {
  const out: Record<string, string> = {};
  ctx.keys().forEach((k: string) => {
    const mod = ctx(k);
    const text = typeof mod === "string" ? mod : String(mod?.default ?? "");
    out[k.replace(/^\.\//, "")] = text;
  });
  return out;
}

function useExamples(include?: RegExp, exclude?: RegExp): Entry[] {
  // Webpack-only (Docusaurus usa Webpack)
  // @ts-ignore
  const ilCtx = (require as any).context(
    "!!raw-loader!@site/../../packages/examples/intentlang",
    false,
    /\.il$/
  );
  // @ts-ignore
  const tsCtx = (require as any).context(
    "!!raw-loader!@site/../../packages/examples/goldens/ts",
    false,
    /\.ts$/
  );
  const pyCtx = (require as any).context(
    "!!raw-loader!@site/../../packages/examples/goldens/py",
    false,
    /\.py$/
  );
  const ils = loadContext(ilCtx);  // {"operators.il": "...", ...}
  const tss = loadContext(tsCtx);  // {"operators.ts": "...", ...}
  const pys = loadContext(pyCtx);  // {"operators.py": "...", ...}

  let files = Object.keys(ils);
  if (include) files = files.filter((f) => include.test(f));
  if (exclude) files = files.filter((f) => !exclude.test(f));
  files.sort((a, b) => a.localeCompare(b));

  return files.map((ilFile) => {
    const base = ilFile.replace(/\.il$/, "");
    const basePy = base.replace(/-/g, "_");
    return {
      id: base,
      title: base,
      ilRaw: ils[ilFile],
      tsRaw: tss[`${base}.ts`], // puede no existir
      pyRaw: pys[`${basePy}.py`], // puede no existir
    };
  });
}

export default function CodeToggleBrowser({
  include,
  exclude,
  initial,
  horizontal = true,
}: Props) {
  const all = useExamples(include, exclude);
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? all.filter((e) => e.title.toLowerCase().includes(q)) : all;
  }, [all, query]);

  // selección inicial: hash (#example-<id>) > prop initial > 1º de la lista
  const initialFromHash =
    typeof window !== "undefined" &&
      window.location.hash?.startsWith("#example-")
      ? window.location.hash.slice("#example-".length + 1)
      : undefined;

  const [currentId, setCurrentId] = React.useState<string>(
    initialFromHash || initial || (filtered[0]?.id ?? "")
  );

  React.useEffect(() => {
    // si el filtro deja fuera la actual, selecciona la primera disponible
    if (!filtered.some((e) => e.id === currentId) && filtered[0]) {
      setCurrentId(filtered[0].id);
    }
  }, [filtered, currentId]);

  const current = filtered.find((e) => e.id === currentId);

  const onSelect = (id: string) => {
    setCurrentId(id);
    if (typeof window !== "undefined") {
      window.location.hash = `#example-${id}`;
    }
  };

  const layout: React.CSSProperties = horizontal
    ? { display: "block" }
    : {
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      gap: 16,
    };

  return (
    <div style={{ margin: "16px 0" }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <input
          type="search"
          placeholder="Buscar ejemplo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="searchBox_node_modules-@docusaurus-theme-classic-lib-theme-DocSidebar-Desktop-Search-styles-module"
          style={{
            flex: "1 1 240px",
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
          }}
          aria-label="Buscar ejemplo"
        />
        <select
          value={currentId}
          onChange={(e) => onSelect(e.target.value)}
          style={{
            flex: "0 0 260px",
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
            background: "var(--ifm-background-surface-color)",
          }}
          aria-label="Seleccionar ejemplo"
        >
          {filtered.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      <div style={layout}>
        {!horizontal && (
          <div
            style={{
              border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
              borderRadius: 12,
              padding: 8,
              maxHeight: 420,
              overflow: "auto",
            }}
          >
            {filtered.map((e) => (
              <button
                key={e.id}
                onClick={() => onSelect(e.id)}
                className={
                  "button button--sm " +
                  (e.id === currentId ? "button--primary" : "button--secondary")
                }
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  marginBottom: 6,
                }}
              >
                {e.title}
              </button>
            ))}
          </div>
        )}
        <div>
          {current ? (
            <CodeToggle
              title={current.title}
              ilRaw={current.ilRaw}
              tsRaw={current.tsRaw}
              pyRaw={current.pyRaw}
            />
          ) : (
            <div
              className="alert alert--warning"
              role="alert"
              style={{ borderRadius: 12 }}
            >
              No hay resultados para “{query}”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
