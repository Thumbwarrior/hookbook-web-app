const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("hookbook_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function buildQuery(params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const auth = {
  signup: (email, password) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
};

export const ideas = {
  list: () => request("/ideas"),
  get: (id) => request(`/ideas/${id}`),
  create: (data) => request("/ideas", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/ideas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/ideas/${id}`, { method: "DELETE" }),
  search: (filters) => request(`/ideas/search${buildQuery(filters)}`),
  random: () => request("/ideas/random"),
  dashboard: () => request("/ideas/dashboard"),
};
