import pino from "pino";
import pinoHttp from "pino-http";
import { config } from "config";

// Base Logger
export const logger = pino({
  level: config.logging.level,
  transport: config.logging.pretty
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

// HTTP Request Logger Middleware
export const requestLogger = pinoHttp({
  logger,
  customProps: (req, res) => {
    return {
      traceId: req.headers["x-trace-id"] || req.id,
    };
  },
});

export const DevelopmentLogger = logger.child({ env: "development" });
export const ProductionLogger = logger.child({ env: "production" });
export const ErrorLogger = logger.child({ type: "error" });
