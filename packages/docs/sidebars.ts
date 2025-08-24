import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  handbook: ["handbook/what-is-intentlang", "handbook/from-scratch"],
  examples: ["examples/il-ts-browser"],
  reference: [
    "reference/cli-playground",
    "reference/compiler-options/index",
    "reference/grammar",
  ],
};

export default sidebars;
