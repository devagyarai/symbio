let sessionCookie = "";
let currentAccessToken = "";

async function request(path: string, method: string = "GET", body?: any, useAuth: boolean = false) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      ...(useAuth && currentAccessToken ? { Authorization: `Bearer ${currentAccessToken}` } : {})
    }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`http://localhost:4000${path}`, options);
  
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    sessionCookie = setCookie;
  }

  let data;
  try { data = await res.json(); } catch { data = null; }
  
  if (data?.accessToken) {
    currentAccessToken = data.accessToken;
  }

  return {
    status: res.status,
    data
  };
}

async function runAudit() {
  console.log("==========================================");
  console.log("PHASE 3, 4 & 8 — API, AUTH & ERROR AUDIT");
  console.log("==========================================");

  // 1. Health
  console.log("\n[1] Testing /health");
  let res = await request("/health");
  console.log(`Status: ${res.status} | Data:`, JSON.stringify(res.data));

  // 2. Auth - Missing Fields (400/422)
  console.log("\n[2] Testing Registration Validation Error");
  res = await request("/auth/register", "POST", { email: "bademail" });
  console.log(`Status: ${res.status} | Expected 400 or 422 | Data:`, JSON.stringify(res.data));

  const email = `audit_${Date.now()}@example.com`;
  const password = "Password123!";

  // 3. Auth - Register
  console.log(`\n[3] Testing Valid Registration (${email})`);
  const startTime = Date.now();
  res = await request("/auth/register", "POST", { email, name: "Audit User", password });
  console.log(`Status: ${res.status} | Expected 201 | Time: ${Date.now() - startTime}ms`);
  
  // 4. Auth - Duplicate Registration (409)
  console.log("\n[4] Testing Duplicate Registration");
  res = await request("/auth/register", "POST", { email, name: "Audit User 2", password });
  console.log(`Status: ${res.status} | Expected 409 | Data:`, JSON.stringify(res.data));

  // 5. Auth - Login Weak Password
  console.log("\n[5] Testing Login - Wrong Password");
  res = await request("/auth/login", "POST", { email, password: "WrongPassword" });
  console.log(`Status: ${res.status} | Expected 401 | Data:`, JSON.stringify(res.data));

  // 6. Auth - Valid Login
  console.log("\n[6] Testing Valid Login");
  res = await request("/auth/login", "POST", { email, password });
  console.log(`Status: ${res.status} | Expected 200`);

  // 7. Test Protected Route (Requires Cookie)
  console.log("\n[7] Testing Protected Route (/organizations)");
  res = await request("/organizations", "GET", undefined, true);
  console.log(`Status: ${res.status} | Expected 200 | Data:`, JSON.stringify(res.data));

  // 8. Test Refresh Token
  console.log("\n[8] Testing Refresh Token");
  res = await request("/auth/refresh", "POST");
  console.log(`Status: ${res.status} | Expected 200`);

  // 9. Logout
  console.log("\n[9] Testing Logout");
  res = await request("/auth/logout", "POST");
  console.log(`Status: ${res.status} | Expected 200`);
  
  // 10. Test Protected Route After Logout (401)
  console.log("\n[10] Testing Protected Route after Logout");
  res = await request("/organizations", "GET", undefined, true);
  console.log(`Status: ${res.status} | Expected 401 | Data:`, JSON.stringify(res.data));

  console.log("\n--- AUDIT COMPLETE ---");
}

runAudit().catch(console.error);
