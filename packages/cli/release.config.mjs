export default {
  branches: ["main"],
  tagFormat: "@intentlang/cli-v${version}",
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
    [
      "@semantic-release/release-notes-generator",
      { preset: "conventionalcommits" },
    ],
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: false, pkgRoot: "." }],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message:
          "chore(@intentlang/clilang/cli): release ${nextRelease.version}\n\n${nextRelease.notes}",
      },
    ],
    ["@semantic-release/github", { assets: [] }],
  ],
};
