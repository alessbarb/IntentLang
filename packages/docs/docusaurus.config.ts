import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "Intent Lang Docs",
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
          to: "/docs/reference/compiler-options",
          label: "Compiler Options",
          position: "left",
        },
      ],
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  },
};
export default config;
