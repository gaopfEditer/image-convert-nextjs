import { NextRequest, NextResponse } from 'next/server'
import { getAuth0LoginUrl } from '@/app/lib/auth0/config'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const returnUrl = searchParams.get('returnUrl') || '/'
    
    // 生成随机state参数用于安全验证
    const state = Buffer.from(JSON.stringify({ returnUrl })).toString('base64')
    
    // 生成Auth0登录URL
    const authUrl = getAuth0LoginUrl(state)
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Auth0 login error:', error)
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    )
  }
}
