const http = require("http");

console.log("🔍 Checking Database Health via API...");

http.get("http://localhost:4000/health", (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      if (json.data && json.data.database && json.data.database.status === "OK") {
        console.log("✅ Database is healthy:", json.data.database);
        process.exit(0);
      } else {
        console.error("❌ Database is unhealthy:", json.data?.database || json);
        process.exit(1);
      }
    } catch (e) {
      console.error("❌ Failed to parse health response:", e.message);
      process.exit(1);
    }
  });
}).on("error", (e) => {
  console.error("❌ API not reachable:", e.message);
  process.exit(1);
});
