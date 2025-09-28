# Ngrok 配置说明

## 当前问题分析

您当前的ngrok配置：
- **代理地址**: `https://subpredicative-jerrica-subtepidly.ngrok-free.dev -> http://localhost:8000`
- **问题**: ngrok正在代理后端端口(8000)，但前端运行在端口(3000)

## 解决方案

### 方案1：代理前端地址（推荐）

```bash
# 停止当前ngrok
# 重新启动，代理前端端口
ngrok http 3000
```

**结果**：
- 前端地址：`https://your-ngrok-url.ngrok-free.dev`
- 后端地址：`http://localhost:8000` (本地访问)

### 方案2：同时代理前端和后端

```bash
# 终端1：代理前端
ngrok http 3000

# 终端2：代理后端
ngrok http 8000
```

**结果**：
- 前端地址：`https://frontend-url.ngrok-free.dev`
- 后端地址：`https://backend-url.ngrok-free.dev`

### 方案3：使用ngrok配置文件

创建 `ngrok.yml` 配置文件：

```yaml
version: "2"
authtoken: your_auth_token
tunnels:
  frontend:
    proto: http
    addr: 3000
  backend:
    proto: http
    addr: 8000
```

然后运行：
```bash
ngrok start --all
```

## 环境变量配置

### 方案1：只代理前端
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 方案2：同时代理前后端
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-backend-ngrok-url.ngrok-free.dev
```

## 验证配置

### 1. 检查ngrok状态
访问 `http://127.0.0.1:4040` 查看ngrok管理界面

### 2. 测试前端访问
访问ngrok提供的前端URL，检查页面是否正常加载

### 3. 测试API调用
打开浏览器开发者工具，查看API请求是否正常

## 常见问题

### 1. CORS错误
如果遇到CORS错误，需要在后端配置允许ngrok域名：

```python
# 后端CORS配置
CORS_ALLOWED_ORIGINS = [
    "https://your-ngrok-url.ngrok-free.dev",
    "http://localhost:3000"
]
```

### 2. 域名变化
每次重启ngrok，域名都会变化。可以：
- 使用ngrok付费版本获得固定域名
- 或者每次更新环境变量

### 3. 网络延迟
ngrok会增加网络延迟，这是正常现象

## 推荐配置

对于开发环境，推荐使用**方案1**：

1. **前端**: 通过ngrok访问 (`https://xxx.ngrok-free.dev`)
2. **后端**: 本地访问 (`http://localhost:8000`)
3. **API调用**: 前端直接调用本地后端

这样配置简单，且API调用延迟最小。

## 测试步骤

1. 停止当前ngrok
2. 运行 `ngrok http 3000`
3. 复制新的ngrok URL
4. 访问ngrok URL测试前端
5. 测试登录功能是否正常

