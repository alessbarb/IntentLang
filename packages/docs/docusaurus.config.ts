import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "IntentLang Docs",
  url: "https://your-domain",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  i18n: { defaultLocale: "en", locales: ["en", "es"] },
  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "/docs",
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: "Intent Lang",
      items: [
        {
          to: "/docs/handbook/from-scratch",
          label: "From Scratch",
          position: "left",
        },
        {
          to: "/docs/reference/compiler-options",
          label: "Compiler Options",
          position: "left",
        },
        {
          label: "Examples",
          position: "left",
          items: [
            { to: "/docs/examples/il-ts-browser", label: "IL ⇄ TS/PY Browser" },
            { to: "/docs/examples/golden-diffs", label: "Golden Diffs" },
          ],
        },
        {
          label: "Reference",
          position: "left",
          items: [
            { to: "/docs/reference/cli-playground", label: "CLI Playground" },
            {
              to: "/docs/reference/compiler-options/",
              label: "Compiler Options",
            },
            { to: "/docs/reference/grammar", label: "Grammar (EBNF)" },
          ],
        },
      ],
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  },
};
export default config;
