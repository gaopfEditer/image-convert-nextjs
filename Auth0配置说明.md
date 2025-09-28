# Auth0 Google登录配置说明

## 环境变量配置

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
# Auth0 配置
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=your-api-identifier
AUTH0_REDIRECT_URI=http://localhost:3000/api/auth/callback
AUTH0_LOGOUT_REDIRECT_URI=http://localhost:3000

# 生产环境配置
# AUTH0_REDIRECT_URI=https://yourdomain.com/api/auth/callback
# AUTH0_LOGOUT_REDIRECT_URI=https://yourdomain.com
```

## Auth0控制台配置

### 1. 创建Auth0应用
1. 登录 [Auth0控制台](https://manage.auth0.com/)
2. 进入 Applications > Applications
3. 点击 "Create Application"
4. 选择 "Regular Web Applications"
5. 填写应用名称，如 "Image Convert App"

### 2. 配置应用设置
在应用设置页面配置以下参数：

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback
https://yourdomain.com/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000
https://yourdomain.com
```

**Allowed Web Origins:**
```
http://localhost:3000
https://yourdomain.com
```

### 3. 启用Google社交登录
1. 进入 Authentication > Social
2. 点击 "Create Connection"
3. 选择 "Google"
4. 配置Google OAuth设置：
   - Client ID: 你的Google OAuth客户端ID
   - Client Secret: 你的Google OAuth客户端密钥
5. 启用连接

### 4. 配置API（可选）
如果需要访问受保护的API：
1. 进入 Applications > APIs
2. 点击 "Create API"
3. 填写API信息
4. 将API标识符复制到 `AUTH0_AUDIENCE` 环境变量

## 前端集成

### 1. 登录流程
```typescript
// 用户点击Google登录按钮
const handleGoogleLogin = () => {
  const returnUrl = window.location.pathname
  window.location.href = `/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
}
```

### 2. 回调处理
Auth0会重定向到 `/api/auth/callback`，然后：
1. 验证授权码
2. 调用后端API交换token
3. 重定向到成功页面
4. 更新用户状态

### 3. 用户信息获取
```typescript
// 从localStorage获取用户信息
const user = JSON.parse(localStorage.getItem('auth_user') || '{}')
const token = localStorage.getItem('auth_token')
```

## 后端API集成

后端需要实现以下接口：

### 1. Auth0回调处理
```typescript
POST /api/auth/auth0-callback
Body: {
  code: string;
  state?: string;
}
Response: {
  user: UserProfile;
  token: string;
  expiresIn: number;
  loginType: 'google';
}
```

### 2. 实现步骤
1. 使用Auth0 Management API或SDK
2. 用授权码换取access_token
3. 获取用户信息
4. 创建或更新本地用户记录
5. 生成JWT token返回给前端

## 测试流程

1. 配置环境变量
2. 启动开发服务器：`npm run dev`
3. 访问 `/test-login` 页面
4. 点击Google登录按钮
5. 完成Auth0登录流程
6. 验证用户信息是否正确获取

## 安全注意事项

1. **环境变量安全**：不要将敏感信息提交到代码仓库
2. **HTTPS**：生产环境必须使用HTTPS
3. **State参数**：使用state参数防止CSRF攻击
4. **Token安全**：妥善存储和传输JWT token
5. **域名验证**：确保回调URL与配置一致

## 故障排除

### 常见问题
1. **重定向URI不匹配**：检查Auth0控制台配置
2. **CORS错误**：检查Allowed Web Origins配置
3. **Token无效**：检查JWT签名和过期时间
4. **用户信息缺失**：检查scope配置

### 调试方法
1. 查看浏览器控制台错误
2. 检查Auth0控制台日志
3. 验证环境变量配置
4. 测试API接口响应

