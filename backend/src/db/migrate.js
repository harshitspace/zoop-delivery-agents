import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import { buildSslConfig } from "./ssl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true,
        ssl: buildSslConfig(),
    });

    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.query(`USE \`${process.env.DB_NAME}\`;`);

        const migrationsDir = path.join(__dirname, "migrations");
        const files = fs
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith(".sql"))
            .sort();
        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
            await connection.query(sql);
            console.log(`Executed migration: ${file}`);
        }

        console.log("All migrations executed successfully.");
    } finally {
        await connection.end();
    }
};

runMigrations().catch((err) => {
    console.error("Error running migrations:", err);
    process.exit(1);
});