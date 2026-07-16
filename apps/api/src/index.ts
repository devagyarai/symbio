import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { config } from "config";
import { logger, requestLogger } from "logger";
import { requestContextMiddleware } from "./middleware/context";
import { notFoundHandler, errorHandler } from "./middleware/error";
import { healthRoutes } from "./routes/health";
import authRoutes from "./auth/auth.routes";
import organizationRoutes from "./modules/organization/organization.routes";
import workspaceRoutes from "./modules/workspace/workspace.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import auditRoutes from "./modules/audit/audit.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import inviteRoutes from "./modules/workspace/invite.routes";
import { initSocketServer } from "./socket/socket.server";

const app = express();
app.set('trust proxy', 1); // Trust Render/Vercel reverse proxy for rate limiting and secure cookies
const port = config.server.port;

// Security and Performance Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: config.security.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Context & Logging
app.use(requestContextMiddleware);
app.use(requestLogger);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/organizations", organizationRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/upload", uploadRoutes);
app.use("/audit", auditRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/invites", inviteRoutes);

// Error Handling (Must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Create HTTP server so Express and Socket.IO share the same port
const server = http.createServer(app);

// Initialize Socket.IO on the shared HTTP server
initSocketServer(server);

server.listen(port, () => {
  logger.info(`Backend listening on port ${port} in ${config.env} mode`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});
