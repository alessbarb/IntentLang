import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  handbook: ["handbook/from-scratch"],
  examples: ["examples/il-ts-browser", "examples/golden-diffs"],
  reference: [
    "reference/cli-playground",
    "reference/compiler-options/index",
    "reference/grammar",
  ],
};

export default sidebars;
