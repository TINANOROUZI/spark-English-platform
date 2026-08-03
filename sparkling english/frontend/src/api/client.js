// Point this at your running Spring Boot backend (see ../backend).
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.messages?.[0] || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const authApi = {
  register: (name, email, password) => request("/auth/register", { method: "POST", body: { name, email, password } }),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/auth/me", { token }),
};

export const trialRequestApi = {
  submit: (payload, token) => request("/trial-requests", { method: "POST", body: payload, token }),
  listAll: (token) => request("/trial-requests", { token }),
  listMine: (token) => request("/trial-requests/me", { token }),
};

export const contactMessageApi = {
  submit: (payload, token) => request("/messages", { method: "POST", body: payload, token }),
  listAll: (token) => request("/messages", { token }),
};
