import { Router } from "express";
import { createSuccessResponse } from "utils";
import { checkDatabaseHealth } from "database";

const router: Router = Router();

// /live -> Liveness probe (is the process running?)
router.get("/live", (req, res) => {
  res.json(createSuccessResponse({ data: { status: "UP" } }));
});

// /ready -> Readiness probe (is it ready to receive traffic? DB connected?)
router.get("/ready", async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const isReady = dbHealth.status === "OK";
  
  res.status(isReady ? 200 : 503).json(createSuccessResponse({ 
    data: { 
      status: isReady ? "READY" : "NOT_READY",
      database: dbHealth 
    } 
  }));
});

// /health -> General health check
router.get("/", async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  
  res.json(
    createSuccessResponse({
      data: {
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbHealth,
      },
    })
  );
});

export const healthRoutes = router;
