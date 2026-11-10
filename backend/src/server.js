import "dotenv/config";
import app from "./app.js";
import { connectRedis } from "./db/redis.js";
import redisClient from "./db/redis.js";
import { getPool, verifyDbConnection } from "./db/db.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        // Verify Database Connection
        await verifyDbConnection();

        // Connect to Redis
        await connectRedis();

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        const shutdown = async (signal) => {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            try {
            await getPool().end();
            await redisClient.quit();
            console.log("Closed DB and Redis connections. Bye.");
            process.exit(0);
            } catch (err) {
            console.error("Error during shutdown:", err);
            process.exit(1);
            }
        });
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
};

startServer();