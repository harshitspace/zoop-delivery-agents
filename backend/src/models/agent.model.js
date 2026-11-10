import { query } from '../db/db.js';

export const insertAgent = async ({ full_name, phone, email, service_area, status}) => {
    const result = await query(
        `INSERT INTO agents (full_name, phone, email, service_area, status)
        VALUES (?, ?, ?, ?, ?)`,
        [full_name, phone, email, service_area, status]
    );
    return result.insertId;
};

const buildFilters = ({ search, status }) => {
    const clauses = [];
    const params = [];

    if (search) {
        clauses.push(`(full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR service_area LIKE ?)`);
        const like = `%${search}%`;
        params.push(like, like, like, like);
    }

    if (status) {
        clauses.push(`status = ?`);
        params.push(status);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return { where, params };
};

export const selectAgents = async ({ search, status, limit, offset }) => {
    const { where, params } = buildFilters({ search, status });
    return await query(
        `SELECT * FROM agents ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );
};

export const countAgents = async ({ search, status }) => {
    const { where, params } = buildFilters({ search, status });
    const result = await query(`SELECT COUNT(*) AS total FROM agents ${where}`, params);
    return result[0].total;
};

export const selectAgentById = async (id) => {
    const result = await query(`SELECT * FROM agents WHERE id = ?`, [id]);
    return result[0];
};

export const updateAgentById = async (id, { full_name, phone, email, service_area, status }) => {
    const result = await query(
        `UPDATE agents SET full_name = ?, phone = ?, email = ?, service_area = ?, status = ? WHERE id = ?`,
        [full_name, phone, email, service_area, status, id]
    );
    return result.affectedRows;
};

export const deleteAgentById = async (id) => {
    const result = await query(`DELETE FROM agents WHERE id = ?`, [id]);
    return result.affectedRows;
};