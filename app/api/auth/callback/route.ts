import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // 处理错误情况
    if (error) {
      console.error('Auth0 callback error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=missing_code', request.url)
      )
    }

    // 解析state参数
    let returnUrl = '/'
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        returnUrl = stateData.returnUrl || '/'
      } catch (e) {
        console.warn('Invalid state parameter:', e)
      }
    }

    // 这里应该调用后端API来交换code获取token
    // 暂时重定向到成功页面
    return NextResponse.redirect(
      new URL(`/auth/success?code=${code}&returnUrl=${encodeURIComponent(returnUrl)}`, request.url)
    )
  } catch (error) {
    console.error('Auth0 callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=callback_error', request.url)
    )
  }
}
