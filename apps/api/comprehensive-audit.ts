import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const results = {
  consoleErrors: [] as string[],
  networkErrors: [] as any[],
  accessibility: [] as any[],
  performance: [] as any[],
  apiTrace: [] as any[],
  testFailures: [] as string[],
};

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001/api';

async function log(msg: string) {
  console.log(`[AUDIT] ${msg}`);
}

async function safeGoto(page: puppeteer.Page, url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      return;
    } catch (e: any) {
      if (e.message.includes('ERR_ABORTED') || e.message.includes('net::ERR')) {
        log(`Caught ${e.message} on ${url}. Retrying (${i + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, 1000));
      } else {
        throw e;
      }
    }
  }
  throw new Error(`Failed to navigate to ${url} after ${retries} retries`);
}

async function runAudit() {
  log('STARTING FINAL BREAKPOINT HUNT & ZERO-BROKEN-CONNECTION AUDIT');
  
  // Clean up previous test users to ensure clean state
  await prisma.user.deleteMany({ where: { email: { contains: 'audit' } } });
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // PHASE 8 & 9: Console & Network Forensics Setup
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    // Ignore expected 4xx/5xx from API tests, track only UI static assets or unexpected API errors if possible
    // For now, record all >= 400
    if (status >= 400 && status !== 401 && status !== 422 && !url.includes('trpc')) {
      // trpc might return 401/400 during tests naturally
      results.networkErrors.push({ url, status });
    }
  });

  page.on('pageerror', err => {
    results.consoleErrors.push(err.toString());
  });

  const runAxe = async (pageName: string) => {
    log(`Running accessibility check on ${pageName}...`);
    try {
      await new Promise(r => setTimeout(r, 1000)); // wait for hydration
      const axeResults = await new AxePuppeteer(page).analyze();
      if (axeResults.violations.length > 0) {
        results.accessibility.push({ page: pageName, violations: axeResults.violations });
      }
    } catch (e: any) {
      log(`Axe failed on ${pageName}: ${e.message}`);
    }
  };

  const getMetrics = async (pageName: string) => {
    const perf = await page.metrics();
    results.performance.push({ page: pageName, data: perf });
  };

  try {
    // PHASE 1 & 2: Architecture & Connectivity (via API)
    log('PHASE 1 & 2: Verifying API Connectivity...');
    try {
      const res = await fetch(`${API_URL}/health`);
      if (!res.ok) throw new Error('Health returned ' + res.status);
      results.apiTrace.push('Health endpoint OK');
    } catch (e) {
      results.testFailures.push('Health endpoint failed');
    }

    // PHASE 3: Authentication Journey
    log('PHASE 3: Authentication Journey...');
    const testEmail = `audit-${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    
    await safeGoto(page, `${BASE_URL}/register`);
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.type('input[name="name"]', 'Audit User');
    await page.type('input[name="email"]', testEmail);
    await page.type('input[name="password"]', testPassword);
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    ]);
    
    // Check if it hit the 'verify email' message or bypassed
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { email: testEmail },
      orderBy: { expiresAt: 'desc' }
    });
    
    if (verificationToken) {
      log(`Verifying Email with token: ${verificationToken.token}`);
      await safeGoto(page, `${BASE_URL}/verify-email?token=${verificationToken.token}`);
    } else {
      log('No verification token found, assuming email already verified or bypassed.');
    }
    
    await safeGoto(page, `${BASE_URL}/login`);
    await page.type('input[name="email"]', testEmail);
    await page.type('input[name="password"]', testPassword);
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    ]);
    
    if (page.url() !== `${BASE_URL}/dashboard`) {
      throw new Error(`Login failed. Current URL: ${page.url()}`);
    }
    
    await runAxe('Dashboard');
    await getMetrics('Dashboard');

    // PHASE 4: Organization Journey
    log('PHASE 4: Organization Journey...');
    await safeGoto(page, `${BASE_URL}/organizations`);
    await runAxe('Organizations');
    
    // Create Organization
    const created = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && (b.textContent.includes('New Organization') || b.textContent.includes('Create Organization')));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (created) {
      await page.waitForSelector('input[name="name"]');
      await page.type('input[name="name"]', 'Audit Org');
      await page.type('input[name="slug"]', `audit-org-${Date.now()}`);
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent === 'Create');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 2000));
    } else {
      results.testFailures.push('Could not find Create Organization button');
    }

    // PHASE 5: Upload Journey
    log('PHASE 5: Upload Journey...');
    await safeGoto(page, `${BASE_URL}/storage`);
    await runAxe('Storage');
    // We would simulate an upload here, but puppeteer file input requires input[type=file].
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
       // Just testing UI presence
       log('File input found on storage page.');
    }

    // PHASE 6: Dashboard Spidering
    log('PHASE 6: Dashboard Spidering...');
    const links = await page.$$eval('a', as => as.map(a => a.href));
    for (const link of new Set(links)) {
      if (link.startsWith(BASE_URL) && !link.includes('logout')) {
        log(`Visiting ${link}`);
        await safeGoto(page, link);
        await runAxe(link);
      }
    }
    
    // PHASE 7: API Stress Test
    log('PHASE 7: API Stress Test...');
    // We'll hit health endpoint 50 times concurrently
    await Promise.all(
      Array(50).fill(0).map(() => fetch(`${API_URL}/health`).catch(() => {}))
    );
    
  } catch (error: any) {
    log(`FATAL SCRIPT ERROR: ${error.message} at ${page.url()}`);
    await page.screenshot({ path: 'error-screenshot.png' });
    fs.writeFileSync('error-page.html', await page.content());
    results.testFailures.push(error.message);
  } finally {
    await browser.close();
    await prisma.$disconnect();
    
    fs.writeFileSync('final-audit-metrics.json', JSON.stringify(results, null, 2));
    log('Audit complete. Results written to final-audit-metrics.json');
  }
}

runAudit().catch(console.error);
