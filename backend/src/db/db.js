import mysql from "mysql2/promise";
import { buildSslConfig } from "./ssl.js";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // Managed MySQL (e.g. Aiven) requires SSL; local MySQL does not.
    ssl: buildSslConfig(),
});

export const query = async (sql, params = []) => {
    const [rows] = await pool.query(sql, params);
    return rows;
};

export const getPool = () => pool;

export const verifyDbConnection = async () => {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("MySQL connected successfully.");
}

export default pool;