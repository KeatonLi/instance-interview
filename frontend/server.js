/**
 * 前端静态服务器 — 正确处理 MIME 类型和 SPA 路由
 * 替换 serve -s，解决 JS 模块 MIME 错误导致白屏的问题
 */
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

const PORT = parseInt(process.env.PORT || '3001', 10);
const DIST = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

function serveFile(res, filePath) {
  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': ext === '.html'
        ? 'no-cache, no-store, must-revalidate'
        : 'public, max-age=31536000, immutable',
    });
    res.end(content);
  } catch {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
}

function serveSPA(res) {
  const indexPath = join(DIST, 'index.html');
  if (existsSync(indexPath)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(readFileSync(indexPath));
  } else {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('index.html not found');
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`).pathname;
  const safePath = url.replace(/^\/+/, '').replace(/\.\./g, '');
  const filePath = safePath ? join(DIST, safePath) : join(DIST, 'index.html');

  // 先尝试作为静态文件
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    serveFile(res, filePath);
    return;
  }

  // 目录请求 → index.html
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    const dirIndex = join(filePath, 'index.html');
    if (existsSync(dirIndex)) {
      serveFile(res, dirIndex);
      return;
    }
  }

  // 根路径 → index.html
  if (url === '/') {
    serveSPA(res);
    return;
  }

  // SPA 路由：不是已知静态资源的路径 → index.html
  // 但 assets/ 下的请求如果文件不存在，返回 404 防止 MIME 错误
  if (url.startsWith('/assets/')) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  serveSPA(res);
});

server.listen(PORT, () => {
  console.log(`Frontend static server: http://0.0.0.0:${PORT}`);
});
