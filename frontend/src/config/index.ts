// API 配置
// 所有地址完全通过环境变量配置，不硬编码任何服务器地址

// API 基础地址 - 必须通过 VITE_API_URL 环境变量设置
// 开发环境：在 .env.local 中设置 VITE_API_URL
// 生产环境：通过部署脚本注入 VITE_API_URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 便捷方法：检查是否使用远程 API
export const isRemote = API_BASE_URL.includes('://');