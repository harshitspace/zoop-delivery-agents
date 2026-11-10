import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import agentRoutes from "./routes/agent.routes.js";
import authRoutes from "./routes/auth.routes.js";
import ApiResponse from "./utils/ApiResponse.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "16kb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb"
    })
);

app.use(cookieParser());

// Health Check Route
app.get("/health", (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, { status: "ok" }, "Server Healthy")
        );
});

// Router
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;