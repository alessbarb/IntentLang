import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "IntentLang Docs",
  url: "https://your-domain",
  baseUrl: "/",
  favicon: "icon/favicon.ico",
  i18n: { defaultLocale: "en", locales: ["en", "es"] },
  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "static/icon/favicon-96x96.png",
        sizes: "96x96",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/svg+xml",
        href: "static/icon/favicon.svg",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "shortcut icon",
        href: "static/icon/favicon.ico",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "static/icon/apple-touch-icon.png",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "manifest",
        href: "site.webmanifest",
      },
    },
  ],

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
        theme: { customCss: "./src/css/custom.css" },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: "IntentLang",
      items: [
        {
          type: "doc",
          docId: "handbook/what-is-intentlang",
          position: "left",
          label: "¿Qué es IntentLang?",
        },
        {
          to: "/docs/handbook/why-il",
          label: "¿Por qué IntentLang?",
          position: "left",
        },
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
            { to: "/docs/examples/il-ts-browser", label: "IL ⇄ TS Browser" },
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
