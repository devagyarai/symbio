import fs from "fs";

try {
  const envFile = fs.readFileSync(".env", "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length) {
        process.env[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, '');
      }
    }
  }
} catch (e) {}

const envs = [
  "DATABASE_URL",
  "DIRECT_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_API_URL",
  "FRONTEND_URL",
  "NODE_ENV",
  "PORT",
  "CORS_ORIGIN"
];

console.log("==========================================");
console.log("PHASE 2 — ENVIRONMENT VALIDATION");
console.log("==========================================");

for (const key of envs) {
  const val = process.env[key];
  if (val) {
    if (key.includes("SECRET") || key.includes("KEY") || key.includes("URL")) {
      console.log(`[OK] ${key} is SET (value hidden/truncated: ${val.substring(0, 15)}...)`);
    } else {
      console.log(`[OK] ${key} = ${val}`);
    }
  } else {
    console.log(`[WARN] ${key} is NOT SET`);
  }
}

// Next check config files for CORS, Cookies, etc.
console.log("\n--- Checking Express Config (apps/api/src/index.ts) ---");
const apiIndex = fs.readFileSync("./apps/api/src/index.ts", "utf-8");
console.log("CORS Configuration found:");
const corsMatch = apiIndex.match(/cors\(\{([\s\S]*?)\}\)/);
if (corsMatch) console.log(corsMatch[0]);

console.log("\n--- Checking Next Config (apps/web/next.config.mjs) ---");
const nextConfig = fs.readFileSync("./apps/web/next.config.mjs", "utf-8");
console.log(nextConfig);

console.log("\n--- Checking JWT Cookie Settings (apps/api/src/utils/cookies.ts) ---");
try {
  const cookieUtils = fs.readFileSync("./apps/api/src/utils/cookies.ts", "utf-8");
  const cookieMatch = cookieUtils.match(/cookieOptions:.*\{([\s\S]*?)\}/) || cookieUtils.match(/httpOnly/g);
  console.log("Cookie options:", cookieMatch ? "Found secure cookie flags" : "Missing/Manual inspection required");
} catch(e) {
  console.log("Could not find cookies.ts. Will check manual routes.");
}
