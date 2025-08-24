// packages/cli/src/options.ts
export type Example = { cli?: string; config?: string };
export type Option = {
  name: string; // "--strict"
  kind: "boolean" | "string" | "number" | "enum";
  default?: string | number | boolean | null;
  since?: string;
  deprecated?: string | boolean;
  description: string;
  notes?: string[];
  enumValues?: string[];
  examples?: Example[];
  aliases?: string[];
  relatesTo?: string[];
};

export type Group = {
  id:
    | "global"
    | "check"
    | "build"
    | "test"
    | "init"
    | "fmt"
    | "inspect"
    | "goldens"
    | "doctor";
  title: string;
  description?: string;
  options: Option[];
};

export type Spec = { tool: "ilc"; groups: Group[] };

// ⚠️ Mantén orden alfabético por `name` dentro de cada grupo.
export const SPEC: Spec = {
  tool: "ilc",
  groups: [
    {
      id: "global",
      title: "Global Flags",
      options: [
        {
          name: "--json",
          kind: "boolean",
          default: false,
          since: "0.2",
          description: "Salida JSON estable para máquinas.",
          notes: [
            "Exit codes: 0 ok, 1 lógicos/diags, 2 uso/flags/config (ILC040x).",
          ],
          examples: [{ cli: "intent check packages/examples --json" }],
        },
        {
          name: "--max-errors",
          kind: "number",
          default: undefined,
          since: "0.2",
          description: "Máximo de errores a imprimir en salida humana.",
          notes: ["No afecta salida JSON."],
          examples: [{ cli: "intent check src/**/*.il --max-errors 5" }],
        },
        {
          name: "--no-color",
          kind: "boolean",
          default: false,
          since: "0.2",
          description: "Desactiva colores ANSI en la salida.",
        },
        {
          name: "--seed-clock",
          kind: "string",
          default: "fixed:1970-01-01T00:00:00Z",
          since: "0.2",
          description: "Fija el reloj para builds/tests deterministas.",
          examples: [
            {
              cli: "intent build packages/examples --seed-clock fixed:2024-01-01T00:00:00Z",
            },
          ],
        },
        {
          name: "--seed-rng",
          kind: "string",
          default: "0",
          since: "0.2",
          description: "Semilla RNG para test/build deterministas.",
          examples: [{ cli: "intent test --seed-rng 1234" }],
        },
        {
          name: "--strict",
          kind: "boolean",
          default: false,
          since: "0.2",
          description: "Trata warnings como errores (falla con diagnósticos).",
          examples: [
            { cli: "intent check packages/examples/**/*.il --strict" },
          ],
        },
        {
          name: "--watch",
          kind: "boolean",
          default: false,
          since: "0.2",
          description: "Re‑ejecuta al cambiar archivos.",
          examples: [{ cli: "intent build --watch" }],
        },
      ],
    },
    {
      id: "build",
      title: "Build Options",
      description: "Opciones específicas para `intent build`.",
      options: [
        {
          name: "--out",
          aliases: ["--outDir"],
          kind: "string",
          default: "dist",
          since: "0.2",
          description: "Directorio de salida para archivos emitidos.",
          examples: [{ cli: "intent build src --out dist" }],
          notes: ["Alias soportado: --outDir."],
          relatesTo: ["--target", "--sourcemap"],
        },
        {
          name: "--sourcemap",
          kind: "boolean",
          default: false,
          since: "0.2",
          description: "Emite sourcemaps (sólo cuando --target js).",
          examples: [{ cli: "intent build src -t js --sourcemap" }],
          relatesTo: ["--target"],
        },
        {
          name: "--target",
          kind: "enum",
          enumValues: ["ts", "js"],
          default: "ts",
          since: "0.2",
          description: "Formato de salida.",
          examples: [
            { cli: "intent build src -t ts" },
            { cli: "intent build src -t js --sourcemap" },
          ],
        },
      ],
    },
    {
      id: "check",
      title: "Check Options",
      description:
        "Opciones específicas para `intent check` (además de las globales).",
      options: [
        // Actualmente no hay flags propias de `check`. Se listan aquí para paridad con TS.
      ],
    },
    {
      id: "test",
      title: "Test Options",
      description: "Opciones específicas para `intent test`.",
      options: [
        {
          name: "--bail",
          kind: "boolean",
          default: false,
          since: "0.2",
          description: "Detiene la ejecución en el primer test fallido.",
        },
        {
          name: "--only",
          kind: "string",
          default: undefined,
          since: "0.2",
          description:
            "Ejecuta sólo tests cuyo nombre hace match con el patrón.",
          examples: [{ cli: "intent test src --only greet" }],
        },
        {
          name: "--reporter",
          kind: "enum",
          enumValues: ["human", "json"],
          default: "human",
          since: "0.2",
          description: "Formato de salida del runner.",
          notes: [
            "Cuando se usa `--reporter json`, es equivalente a `--json` en cuanto a forma de salida.",
          ],
        },
      ],
    },
    {
      id: "init",
      title: "Init Options",
      description: "Opciones específicas para `intent init`.",
      options: [
        {
          name: "--template",
          kind: "enum",
          enumValues: ["minimal", "tests"],
          default: "minimal",
          since: "0.2",
          description: "Plantilla de proyecto inicial.",
          examples: [{ cli: "intent init --template tests" }],
        },
        {
          name: "--yes",
          aliases: ["-y"],
          kind: "boolean",
          default: false,
          since: "0.2",
          description: "Sobrescribe archivos existentes sin preguntar.",
        },
      ],
    },
  ],
};
