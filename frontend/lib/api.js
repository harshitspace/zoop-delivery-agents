// Central API client for the backend. Keeping all HTTP here means components
// never hardcode URLs or repeat fetch/error-handling logic.

// NEXT_PUBLIC_ vars are inlined into the browser bundle at build time, so this
// base URL is available on the client. It points at our Express backend.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// Verbose route names to match the backend exactly.
const ROUTES = {
  list: "/api/agents/getAgents",
  create: "/api/agents/createAgent",
  getOne: (id) => `/api/agents/getAgent/${id}`,
  update: (id) => `/api/agents/updateAgent/${id}`,
  remove: (id) => `/api/agents/deleteAgent/${id}`,
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  me: "/api/auth/me",
};

// A single fetch wrapper that:
//  - sends/receives JSON
//  - parses the backend's { statusCode, data, message, success } envelope
//  - throws a useful Error (with the backend's message + validation details)
//    so callers can show it to the user.
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    ...options,
  });

  // 204 No Content (or empty body) -> nothing to parse.
  if (res.status === 204) return null;

  let body = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON or empty body
  }

  if (!res.ok) {
    const message = body?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.details = body?.details || [];
    throw error;
  }

  // Our success envelope puts the payload under `data`.
  return body?.data ?? body;
}

export const agentsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) qs.append(k, v);
    });
    const query = qs.toString();
    return request(query ? `${ROUTES.list}?${query}` : ROUTES.list);
  },
  get: (id) => request(ROUTES.getOne(id)),
  create: (payload) =>
    request(ROUTES.create, { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(ROUTES.update(id), { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => request(ROUTES.remove(id), { method: "DELETE" }),
};

export const authApi = {
  login: (username, password) =>
    request(ROUTES.login, { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => request(ROUTES.logout, { method: "POST" }),
  me: () => request(ROUTES.me),
};
