// API 配置
// 开发环境默认使用本地服务器，生产环境使用远程服务器

// 远程服务器地址
const REMOTE_API_URL = 'http://111.231.107.210:8082/api/v1';

// 本地服务器地址
const LOCAL_API_URL = 'http://localhost:8082/api/v1';

// 根据环境变量决定使用哪个地址，如果没有设置 VITE_API_URL，默认使用远程服务器
export const API_BASE_URL = import.meta.env.VITE_API_URL || REMOTE_API_URL;

// 便捷方法
export const isRemote = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL.startsWith('http://111.231');
