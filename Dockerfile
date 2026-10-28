# CloudBase 云托管最小示例镜像
# 说明：本示例零第三方依赖，所以完全不需要 npm install
# —— 这正是上次构建失败的根因（仓库里没有 package.json 却执行了 npm install）

# 官方 Node LTS 精简镜像
FROM node:lts-slim

# 工作目录
WORKDIR /app

# 只拷贝运行必需的文件，让构建缓存更稳定、镜像更小
COPY package.json ./
COPY index.js ./

# 声明容器监听端口（与云托管服务端口 80 对应）
EXPOSE 80

# 启动命令：必须前台常驻。上次自动生成的 Dockerfile 这里是空字符串，容器会立刻退出
CMD ["node", "index.js"]
