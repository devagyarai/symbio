const { execSync } = require("child_process");
const fs = require("fs");

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

console.log("🛠️  Bootstrapping Symbio Workspace...");
try {
  if (!fs.existsSync(".env")) {
    fs.copyFileSync(".env.example", ".env");
    console.log("✅ Created .env from .env.example");
  }
  run("pnpm install");
  console.log("✅ Bootstrap complete!");
} catch (e) {
  console.error("❌ Bootstrap failed", e.message);
  process.exit(1);
}
