const puppeteer = require('puppeteer');

async function runFrontendAudit() {
  console.log("Starting Frontend Audit with Puppeteer...");
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let hasErrors = false;
  let networkErrors = [];

  // Phase 9: Console & Runtime
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
      hasErrors = true;
    }
  });

  page.on('pageerror', error => {
    console.log(`PAGE UNCAUGHT ERROR: ${error.message}`);
    hasErrors = true;
  });

  // Phase 8: Network Forensics
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes('health') && !url.includes('api-audit')) {
      networkErrors.push({ url, status });
    }
  });

  try {
    const routes = ['/', '/login', '/register'];
    
    for (const route of routes) {
      try {
        console.log(`Visiting http://127.0.0.1:3000${route}`);
        await page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: 'domcontentloaded' });
        // wait a bit for Next.js to hydrate
        await new Promise(r => setTimeout(r, 1000));
        const title = await page.title();
        console.log(`Page Title for ${route}: ${title}`);
        
        const hasNextJsError = await page.evaluate(() => {
          return !!document.querySelector('nextjs-portal');
        });
        
        if (hasNextJsError) {
          console.error(`Next.js Error Overlay detected on ${route}!`);
          hasErrors = true;
        }
      } catch (err) {
        console.log(`Navigation error on ${route}: ${err.message}`);
      }
    }
    
    // Performance metrics
    const metrics = await page.metrics();
    console.log("Performance Metrics:", JSON.stringify(metrics, null, 2));

    console.log("Network Errors Detected:", networkErrors.length);
    networkErrors.forEach(e => console.log(`- ${e.status} : ${e.url}`));
    
    if (hasErrors || networkErrors.length > 0) {
      console.log("Frontend Audit found issues.");
    } else {
      console.log("Frontend Audit PASSED.");
    }
  } catch (error) {
    console.error("Failed to load frontend:", error);
  } finally {
    await browser.close();
  }
}

runFrontendAudit();
