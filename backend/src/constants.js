export const AGENT_STATUS = Object.freeze({
    ACTIVE: "active",
    INACTIVE: "inactive",
});

export const AGENT_STATUS_VALUES = Object.values(AGENT_STATUS);

export const CACHE_KEYS = Object.freeze({
    AGENTS_DEFAULT: "agents:default",
    agentById: (id) => `agents:${id}`,
});