import axios from "axios";
import { showToast } from "vant";

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // 关键：用小写 'authorization'，ThinkPHP/PHP才100%能收到
      config.headers['authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 约定：后端返回 { code, msg, data }
    const res = response.data;

    if (res.code !== 0) {
      showToast(res.msg || "请求错误");
      if (res.code === 401) {
        localStorage.removeItem("token");
        showToast("登录失效，请重新登录");
        // 不跳转
      }
      return Promise.reject(res);
    }
    // 返回 data 部分
    return res.data;
  },
  (error) => {
    console.error("网络错误:", error);
    showToast("网络错误，请稍后再试");
    return Promise.reject(error);
  }
);

export default service;
