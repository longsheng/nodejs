/**
 * CloudBase 云托管最小示例
 *
 * 要点（这几条是新手最容易踩坑的）：
 * 1. 必须监听 0.0.0.0，不能监听 127.0.0.1 —— 否则容器外的网关访问不到。
 * 2. 端口必须与云托管服务配置里的「服务端口」一致（本服务配置为 80）。
 *    这里用 process.env.PORT 兜底，方便本地改成 3000 调试。
 * 3. 进程必须常驻（前台运行），不能跑完就退出，否则容器反复重启。
 */
const http = require('node:http');

// 云托管可通过环境变量注入端口；未注入时用 80，与线上服务端口保持一致
const PORT = Number(process.env.PORT) || 80;
// 监听所有网卡，容器场景必须如此
const HOST = '0.0.0.0';

const server = http.createServer((req, res) => {
  // 健康检查路由：云托管的存活探针可以打这个
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  // 根路径返回一个纯 HTML 页面，浏览器直接可见
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello CloudBase</title>
  <style>
    html, body { height: 100%; margin: 0; }
    body {
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
      background: #0f1115; color: #e8eaed;
    }
    .box { text-align: center; }
    h1 { font-size: 40px; margin: 0 0 12px; font-weight: 600; }
    p { margin: 6px 0; color: #9aa0a6; font-size: 15px; }
    code { color: #7cc7ff; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Hello CloudBase 👋</h1>
    <p>这是一个跑在腾讯云开发云托管上的最小 Node 服务 v0.2</p>
    <p>进程 PID <code>${process.pid}</code> · 已运行 <code>${process.uptime().toFixed(1)}s</code></p>
    <p>访问 <code>/health</code> 查看健康检查结果</p>
  </div>
</body>
</html>`);
});

server.listen(PORT, HOST, () => {
  console.log(`[hello] 服务已启动: http://${HOST}:${PORT}`);
});

// 云托管滚动更新时会发送 SIGTERM，这里做优雅退出，避免请求被硬切断
process.on('SIGTERM', () => {
  console.log('[hello] 收到 SIGTERM，正在关闭...');
  server.close(() => process.exit(0));
});
