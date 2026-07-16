module.exports = {
  root: true,
  extends: [require.resolve("eslint-config/index.js")],
  settings: {
    next: {
      rootDir: ["apps/*/", "packages/*/"],
    },
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/"
  ]
};
