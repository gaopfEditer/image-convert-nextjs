# Auth0 后端API实现说明

## 需要实现的后端API接口

### 1. Auth0完成登录接口

**接口地址：** `POST /api/auth/auth0/complete-login`

**请求参数：**
```json
{
  "code": "string",    // Auth0返回的授权码
  "state": "string"    // Auth0返回的状态参数
}
```

**响应格式：**
```json
{
  "access_token": "string",  // 后端生成的JWT token
  "user": {
    "id": "string",          // 用户ID
    "username": "string",    // 用户名
    "email": "string",       // 邮箱
    "name": "string",        // 显示名称（可选）
    "avatar": "string"       // 头像URL（可选）
  }
}
```

## 后端实现步骤

### 1. 验证Auth0授权码
```python
# Python示例
import requests
from authlib.integrations.requests_client import OAuth2Session

def complete_auth0_login(code: str, state: str):
    # 1. 验证state参数（防止CSRF攻击）
    if not validate_state(state):
        raise ValueError("Invalid state parameter")
    
    # 2. 使用授权码换取access_token
    token_url = f"https://{AUTH0_DOMAIN}/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "code": code,
        "redirect_uri": AUTH0_REDIRECT_URI
    }
    
    response = requests.post(token_url, json=token_data)
    if response.status_code != 200:
        raise ValueError("Failed to exchange code for token")
    
    auth0_token = response.json()
    access_token = auth0_token["access_token"]
```

### 2. 获取用户信息
```python
def get_user_info(access_token: str):
    # 3. 使用access_token获取用户信息
    user_url = f"https://{AUTH0_DOMAIN}/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(user_url, headers=headers)
    if response.status_code != 200:
        raise ValueError("Failed to get user info")
    
    user_info = response.json()
    return user_info
```

### 3. 创建或更新本地用户
```python
def create_or_update_user(auth0_user_info: dict):
    # 4. 在本地数据库中创建或更新用户
    user = User.objects.get_or_create(
        auth0_id=auth0_user_info["sub"],
        defaults={
            "username": auth0_user_info.get("nickname", auth0_user_info["email"]),
            "email": auth0_user_info["email"],
            "name": auth0_user_info.get("name", auth0_user_info["email"]),
            "avatar": auth0_user_info.get("picture", ""),
            "login_method": "Auth0"
        }
    )[0]
    
    # 更新最后登录时间
    user.last_login = timezone.now()
    user.save()
    
    return user
```

### 4. 生成JWT token
```python
def generate_jwt_token(user):
    # 5. 生成JWT token
    payload = {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return token
```

### 5. 完整实现示例
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class Auth0LoginRequest(BaseModel):
    code: str
    state: str

class Auth0LoginResponse(BaseModel):
    access_token: str
    user: dict

@router.post("/api/auth/auth0/complete-login", response_model=Auth0LoginResponse)
async def complete_auth0_login(request: Auth0LoginRequest):
    try:
        # 1. 验证state参数
        if not validate_state(request.state):
            raise HTTPException(status_code=400, detail="Invalid state parameter")
        
        # 2. 换取access_token
        auth0_token = exchange_code_for_token(request.code)
        
        # 3. 获取用户信息
        user_info = get_user_info(auth0_token["access_token"])
        
        # 4. 创建或更新用户
        user = create_or_update_user(user_info)
        
        # 5. 生成JWT token
        jwt_token = generate_jwt_token(user)
        
        return Auth0LoginResponse(
            access_token=jwt_token,
            user={
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "name": user.name,
                "avatar": user.avatar
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## 环境变量配置

```bash
# Auth0配置
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_REDIRECT_URI=https://yourdomain.com/google-login/success

# JWT配置
JWT_SECRET=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24
```

## 安全注意事项

1. **State参数验证**：必须验证state参数防止CSRF攻击
2. **Token安全**：使用安全的JWT密钥和算法
3. **HTTPS**：生产环境必须使用HTTPS
4. **错误处理**：不要暴露敏感的错误信息
5. **日志记录**：记录登录尝试和失败情况

## 测试方法

### 1. 使用Postman测试
```bash
POST /api/auth/auth0/complete-login
Content-Type: application/json

{
  "code": "test_code_12345",
  "state": "test_state_67890"
}
```

### 2. 前端测试
访问 `/test-login` 页面，点击"测试Auth0登录成功页面"按钮

### 3. 验证响应
检查返回的access_token和user信息是否正确

## 错误处理

### 常见错误情况
1. **无效的code**：Auth0授权码过期或无效
2. **无效的state**：State参数不匹配
3. **网络错误**：无法连接到Auth0服务器
4. **用户信息获取失败**：Auth0用户信息API调用失败

### 错误响应格式
```json
{
  "detail": "错误描述信息"
}
```

## 扩展功能

### 1. 用户权限管理
- 根据用户角色设置不同的权限
- 支持用户组和角色管理

### 2. 会话管理
- 支持token刷新
- 实现登出功能
- 会话超时处理

### 3. 审计日志
- 记录用户登录日志
- 跟踪用户活动
- 安全事件监控

