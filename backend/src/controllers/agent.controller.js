import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { insertAgent, selectAgents, countAgents, selectAgentById, updateAgentById, deleteAgentById } from '../models/agent.model.js';
import { getOrSetCache, cacheDel } from '../utils/cache.js';
import { CACHE_KEYS } from '../constants.js';


// POST /api/agents
export const createAgent = asyncHandler(async (req, res) => {
    const { full_name, phone, email, service_area, status } = req.body;

    const newId = await insertAgent({ full_name, phone, email, service_area, status });
    const agent = await selectAgentById(newId);

    await cacheDel(CACHE_KEYS.AGENTS_DEFAULT);

    return res
        .status(201)
        .json(
            new ApiResponse(201, agent, "Agent created successfully")
        );
});


// GET /api/agents 
export const getAgents = asyncHandler(async (req, res) => {
    const { search, status, page, limit } = req.validatedQuery;
    const offset = (page - 1) * limit;

    const DEFAULT_LIMIT = 10;
    const isDefaultView = !search && !status && page === 1 && limit === DEFAULT_LIMIT;

    const fetchPage = async () => {
        const [agents, total] = await Promise.all([
            selectAgents({ search, status, limit, offset }),
            countAgents({ search, status }),
        ]);
        return { agents, total };
    };

    let result;
    let fromCache = false;

    if (isDefaultView) {
        const cached = await getOrSetCache(CACHE_KEYS.AGENTS_DEFAULT, fetchPage);
        result = cached.data;
        fromCache = cached.fromCache;
    } else {
        result = await fetchPage();
    }

    const { agents, total } = result;
    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json(
        new ApiResponse(
            200,
            { agents, pagination: { page, limit, total, totalPages } },
            `Agents fetched successfully${fromCache ? " (cache)" : ""}`
        )
    );
});


// GET /api/agents/:id
export const getAgentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, fromCache } = await getOrSetCache(
        CACHE_KEYS.agentById(id),
        () => selectAgentById(id)
    );

    // getOrSetCache returns null data for a missing agent (and didn't cache it).
    if (!data) {
        throw new ApiError(404, "Agent not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, data, `Agent fetched successfully${fromCache ? " (cache)" : ""}`)
        );
});


// PUT /api/agents/:id
export const updateAgent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { full_name, phone, email, service_area, status } = req.body;

    const affectedRows = await updateAgentById(id, { full_name, phone, email, service_area, status });
    if (affectedRows === 0) {
        throw new ApiError(404, "Agent not found");
    }

    const updatedAgent = await selectAgentById(id);

    await cacheDel([CACHE_KEYS.agentById(id), CACHE_KEYS.AGENTS_DEFAULT]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedAgent, "Agent updated successfully")
        );
});


// DELETE /api/agents/:id
export const deleteAgent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const affectedRows = await deleteAgentById(id);
    if (affectedRows === 0) {
        throw new ApiError(404, "Agent not found");
    }

    // Invalidate the single-item key and the default list.
    await cacheDel([CACHE_KEYS.agentById(id), CACHE_KEYS.AGENTS_DEFAULT]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Agent deleted successfully")
        );
});