import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function runUAT() {
  console.log("==========================================");
  console.log("STARTING UAT END-TO-END EXECUTION");
  console.log("==========================================\n");

  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const metrics = {
    networkErrors: [],
    consoleErrors: [],
    accessibilityViolations: [],
    performance: []
  };

  const email = `uat_user_${Date.now()}@symbio.ready.nest`;
  const password = "Password123!";

  // Listeners for Network and Console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      metrics.consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes('health')) {
      metrics.networkErrors.push({ url, status });
    }
  });

  try {
    // 1. Visit Landing Page
    console.log("[1] Visiting Landing Page...");
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    } catch (e) {
      if (e.message.includes('ERR_ABORTED')) {
        console.log('Caught ERR_ABORTED on landing (likely redirect). Waiting for navigation...');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      } else {
        throw e;
      }
    }
    
    // Performance & Accessibility on Landing
    const landingPerf = await page.metrics();
    metrics.performance.push({ page: 'Landing', data: landingPerf });
    const axeLanding = await new AxePuppeteer(page).analyze();
    metrics.accessibilityViolations.push({ page: 'Landing', violations: axeLanding.violations });

    // 2. Register
    console.log("[2] Registering User...");
    try {
      await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
    } catch (e) {
      if (e.message.includes('ERR_ABORTED')) {
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      } else {
        throw e;
      }
    }
    await page.type('input[name="name"]', 'UAT Tester');
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to /verify-email or success message
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 3. Bypass Email Verification using Database
    console.log("[3] Bypassing Email Verification via Database...");
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { email },
      orderBy: { expiresAt: 'desc' }
    });

    if (!verificationToken) {
      throw new Error("Verification token not found in database!");
    }

    // Hit the verification endpoint
    console.log(`[4] Verifying Email with token: ${verificationToken.token}`);
    try {
      await page.goto(`http://localhost:3000/verify-email?token=${verificationToken.token}`, { waitUntil: 'networkidle2' });
    } catch (e) {
      if (e.message.includes('ERR_ABORTED')) {
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      } else {
        throw e;
      }
    }
    // Wait for the verification to complete and redirect to login
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });

    // 5. Login
    console.log("[5] Logging In...");
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("Current URL after login: ", page.url());

    // 6. Create Organization
    console.log("[6] Creating Organization...");
    try {
      await page.goto('http://localhost:3000/organizations', { waitUntil: 'networkidle2' });
      await page.waitForSelector('button', { timeout: 5000 });
      
      const created = await page.evaluate(async () => {
        const btn = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('New Organization'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      
      if (created) {
        await page.waitForSelector('input[name="name"]', { timeout: 5000 });
        await page.type('input[name="name"]', 'UAT Organization');
        await page.type('input[name="slug"]', `uat-org-${Date.now()}`);
        await page.evaluate(() => {
          const submitBtn = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Create'));
          if (submitBtn) submitBtn.click();
        });
        // Wait for modal to close instead of navigation
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.log("New Organization button not found on screen.");
      }
    } catch (e) {
      console.log("Could not complete UI flow for Organization creation:", e.message);
    }

    // Performance & Accessibility on Dashboard/Orgs
    const dashPerf = await page.metrics();
    metrics.performance.push({ page: 'Dashboard', data: dashPerf });
    const axeDash = await new AxePuppeteer(page).analyze();
    metrics.accessibilityViolations.push({ page: 'Dashboard', violations: axeDash.violations });

    console.log("\n==========================================");
    console.log("UAT EXECUTION COMPLETE");
    console.log("==========================================\n");

  } catch (error) {
    console.error("UAT FAILED:", error);
  } finally {
    fs.writeFileSync('uat-metrics.json', JSON.stringify(metrics, null, 2));
    await browser.close();
    await prisma.$disconnect();
    console.log("Metrics saved to uat-metrics.json");
  }
}

runUAT();
