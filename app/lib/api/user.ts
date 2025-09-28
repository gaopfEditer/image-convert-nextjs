import { api } from '../request';

// 用户相关类型定义
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  name?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
  expiresIn: number;
}

// 第三方登录相关类型
export interface WechatLoginData {
  code: string;
  state?: string;
}

export interface GoogleLoginData {
  idToken: string;
  accessToken?: string;
}

export interface ThirdPartyLoginResponse extends LoginResponse {
  loginType: 'wechat' | 'google' | 'email';
}

// 用户相关 API
export const userApi = {
  // 登录
  login: (credentials: LoginCredentials): Promise<LoginResponse> => {
    return api.post('/api/auth/login', credentials);
  },

  // 注册
  register: (userData: RegisterData): Promise<LoginResponse> => {
    return api.post('/api/auth/register', userData);
  },

  // 获取用户信息
  getProfile: (): Promise<UserProfile> => {
    return api.get('/api/user/profile');
  },

  // 更新用户信息
  updateProfile: (userData: Partial<UserProfile>): Promise<UserProfile> => {
    return api.put('/api/user/profile', userData);
  },

  // 登出
  logout: (): Promise<void> => {
    return api.post('/api/auth/logout');
  },

  // 修改密码
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    return api.post('/api/user/change-password', data);
  },

  // 上传头像
  uploadAvatar: (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.upload('/api/user/avatar', formData);
  },

  // 删除账户
  deleteAccount: (): Promise<void> => {
    return api.delete('/api/user/account');
  },

  // 微信登录
  wechatLogin: (data: WechatLoginData): Promise<ThirdPartyLoginResponse> => {
    return api.post('/api/auth/wechat-login', data);
  },

  // Google登录
  googleLogin: (data: GoogleLoginData): Promise<ThirdPartyLoginResponse> => {
    return api.post('/api/auth/google-login', data);
  },

  // 获取微信登录URL
  getWechatLoginUrl: (): Promise<{ url: string; state: string }> => {
    return api.get('/api/auth/wechat-login-url');
  },

  // 获取Google登录URL
  getGoogleLoginUrl: (): Promise<{ url: string; state: string }> => {
    return api.get('/api/auth/google-login-url');
  },

  // Auth0回调处理
  auth0Callback: (data: { code: string; state?: string }): Promise<ThirdPartyLoginResponse> => {
    return api.post('/api/auth/auth0-callback', data);
  },

  // 验证Auth0 token
  validateAuth0Token: (data: { token: string }): Promise<{ user: UserProfile; valid: boolean }> => {
    return api.post('/api/auth/validate-token', data);
  },

  // Auth0完成登录
  completeAuth0Login: (data: { code: string; state: string }): Promise<{
    access_token: string;
    user: {
      id: string;
      username: string;
      email: string;
      name?: string;
      avatar?: string;
    };
  }> => {
    return api.post('/api/auth/auth0/complete-login', data);
  },
};
