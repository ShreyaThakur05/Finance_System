import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("access_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

let refreshing = false;
let queue = [];

const drain = (err, token) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config;
    if (err.response?.status !== 401 || orig._retry) return Promise.reject(err);
    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        orig.headers.Authorization = `Bearer ${token}`;
        return api(orig);
      });
    }
    orig._retry = true;
    refreshing = true;
    try {
      const rt = localStorage.getItem("refresh_token");
      if (!rt) throw new Error("no refresh token");
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/auth/refresh`,
        { refresh_token: rt }
      );
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      drain(null, data.access_token);
      orig.headers.Authorization = `Bearer ${data.access_token}`;
      return api(orig);
    } catch (e) {
      drain(e, null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // dispatch event so AuthContext can react without hard reload
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  }
);

export default api;
