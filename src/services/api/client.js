const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export async function apiClient(endpoint, options = {}) {
  const url = `${BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = localStorage.getItem("pulsepoll_token");
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch {
    throw new Error("Unable to reach server. Please check your network connection.");
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("pulsepoll_token");
      localStorage.removeItem("pulsepoll_user");
    }

    const errorMessage =
      data?.error ||
      data?.message ||
      (response.status === 401
        ? "Please sign in to continue."
        : response.status === 403
        ? "You do not have permission to perform this action."
        : response.status === 404
        ? "The requested resource was not found."
        : "An unexpected error occurred.");

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const client = {
  get(endpoint, options) {
    return apiClient(endpoint, { ...options, method: "GET" });
  },
  post(endpoint, body, options) {
    return apiClient(endpoint, { ...options, method: "POST", body });
  },
  patch(endpoint, body, options) {
    return apiClient(endpoint, { ...options, method: "PATCH", body });
  },
  put(endpoint, body, options) {
    return apiClient(endpoint, { ...options, method: "PUT", body });
  },
  delete(endpoint, options) {
    return apiClient(endpoint, { ...options, method: "DELETE" });
  },
};
