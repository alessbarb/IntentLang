import React from "react";
import CodeToggle from "./CodeToggle";

type Props = {
  /** Filtra por nombre de fichero (aplica sobre 'basename.il') */
  include?: RegExp;              // p.ej. /^(operators|fixed2|for-loop)\.il$/
  exclude?: RegExp;
  order?: "asc" | "desc";
};

/** Carga un require.context de raw-loader y devuelve { "file.ext": "contenido" } */
function loadContext(ctx: any): Record<string, string> {
  const out: Record<string, string> = {};
  ctx.keys().forEach((k: string) => {
    const mod = ctx(k);
    const text = typeof mod === "string" ? mod : String(mod?.default ?? "");
    out[k.replace(/^\.\//, "")] = text;
  });
  return out;
}

export default function CodeToggleGallery({ include, exclude, order = "asc" }: Props) {
  // Directorios planos (sin subdirs) según tu repo actual
  const ilCtx = (require as any).context(
    "!!raw-loader!@site/../../packages/examples/intentlang",
    false,
    /\.il$/,
  );
  const tsCtx = (require as any).context(
    "!!raw-loader!@site/../../packages/examples/goldens/ts",
    false,
    /\.ts$/,
  );

  const ils = loadContext(ilCtx); // { "operators.il": "...", ... }
  const tss = loadContext(tsCtx); // { "operators.ts": "...", ... }

  let files = Object.keys(ils);
  if (include) files = files.filter((f) => include.test(f));
  if (exclude) files = files.filter((f) => !exclude.test(f));
  files.sort();
  if (order === "desc") files.reverse();

  return (
    <div>
      {files.map((ilFile) => {
        const base = ilFile.replace(/\.il$/, ""); // e.g. "operators"
        const tsFile = `${base}.ts`;
        const ilRaw = ils[ilFile];
        const tsRaw = tss[tsFile]; // puede faltar; CodeToggle mostrará fallback
        return (
          <CodeToggle
            key={ilFile}
            title={base}
            ilRaw={ilRaw}
            tsRaw={tsRaw}
          />
        );
      })}
    </div>
  );
}
