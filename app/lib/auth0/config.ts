// Auth0 配置
export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || 'gaopfediter.us.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || '5xzUKrmwx7bFlUb9nf7l3C0Xp0q8AqcN',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '5VbXSpLULWdqS7n4dLZOQjvJmkw73otJ8KsMzTPgJPIpfCM8CxAVfU-36OQkEGET',
  audience: process.env.AUTH0_AUDIENCE, // 可选，如果不需要API访问可以注释掉
  scope: 'openid profile email',
  redirectUri: process.env.AUTH0_REDIRECT_URI || 'https://subpredicative-jerrica-subtepidly.ngrok-free.dev/google-login/success',
  logoutRedirectUri: process.env.AUTH0_LOGOUT_REDIRECT_URI || 'http://localhost:3000',
  responseType: 'code',
  responseMode: 'query'
}

// 生成Auth0登录URL
export function getAuth0LoginUrl(state?: string): string {
  const params = new URLSearchParams({
    response_type: auth0Config.responseType,
    client_id: auth0Config.clientId,
    redirect_uri: auth0Config.redirectUri,
    scope: auth0Config.scope,
    ...(auth0Config.audience && { audience: auth0Config.audience }),
    ...(state && { state })
  })

  return `https://${auth0Config.domain}/authorize?${params.toString()}`
}

// 生成Auth0登出URL
export function getAuth0LogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: auth0Config.clientId,
    returnTo: auth0Config.logoutRedirectUri
  })

  return `https://${auth0Config.domain}/v2/logout?${params.toString()}`
}
