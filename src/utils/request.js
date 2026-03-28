import axios from 'axios';

// 优先读取 Vercel 的环境变量，如果没有则回退到本地地址
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

const request = axios.create({
  baseURL,
  timeout: 30000, // 30秒超时
});

// --- 请求拦截器：自动注入 Token ---
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('butler_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 响应拦截器：全局错误处理与数据剥离 ---
request.interceptors.response.use(
  (response) => {
    // 直接返回 data，前端调用时少写一层 .data
    return response.data;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // 如果是 401 或 403，触发自定义全局事件，由 App.jsx 捕获并退出登录
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    return Promise.reject(error);
  }
);

export default request;