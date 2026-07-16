const { execSync } = require("child_process");

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

console.log("🔍 Verifying Symbio Workspace...");
try {
  run("pnpm run format");
  run("pnpm run lint");
  run("pnpm run typecheck");
  run("pnpm run build");
  console.log("✅ Verification successful! Ready for PR.");
} catch (e) {
  console.error("❌ Verification failed");
  process.exit(1);
}
