// src/pages/homepageData.ts

export interface FeatureItem {
  title: string;
  description: string;
  to: string;
  icon?: React.ReactNode;
}

export interface PrincipleItem {
  title: string;
  details?: string;
}

export const featureList: FeatureItem[] = [
  {
    title: "From Scratch",
    description: "Instalación, primer proyecto, tests y build — sin perderte.",
    to: "/docs/handbook/from-scratch",
  },
  {
    title: "IL ⇄ TS Browser",
    description: "Mira ejemplos reales junto a su salida generada.",
    to: "/docs/examples/il-ts-browser",
  },
  {
    title: "CLI Playground",
    description: "Construye comandos a partir del SPEC. Aprende haciendo.",
    to: "/docs/reference/cli-playground",
  },
  {
    title: "Lenguaje",
    description: "Sintaxis, semántica, patrones y mejores prácticas.",
    to: "/docs/handbook/language/overview",
  },
  {
    title: "Determinismo",
    description: "RNG/Clock con seed reproducible — CI/Testing feliz.",
    to: "/docs/handbook/determinism",
  },
  {
    title: "Ecosistema",
    description: "Integración con Node.js y toolchain moderna.",
    to: "/docs/handbook/ecosystem",
  },
];

export const principles: PrincipleItem[] = [
  { title: "Determinismo", details: "--seed-rng, --seed-clock" },
  { title: "Match exhaustivo" },
  { title: "Option/Result", details: "sin null/undefined" },
  { title: "Brands", details: "tipos refutables seguros" },
  { title: "Func vs Effect", details: "pureza y uses separados" },
  { title: "Explícito > Implícito", details: "zero magic defaults" },
];
