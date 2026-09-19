import { client } from "./client";

const TOKEN_KEY = "pulsepoll_token";
const USER_KEY = "pulsepoll_user";

export const authApi = {
  async register({ name, email, password }) {
    const data = await client.post("/auth/register", {
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  async login({ email, password }) {
    const data = await client.post("/auth/login", {
      email: email.trim(),
      password,
    });

    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  async getMe() {
    const data = await client.get("/auth/me");
    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data?.user;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};
