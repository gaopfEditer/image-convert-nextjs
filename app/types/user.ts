export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  isLoggedIn: boolean
  membership: Membership
  createdAt: Date
  lastLoginAt: Date
}

export interface Membership {
  type: 'free' | 'vip' | 'premium'
  startDate: Date
  endDate: Date
  isActive: boolean
  dailyUsage: number
  maxDailyUsage: number
  totalStorage: number
  usedStorage: number
  features: string[]
}

export interface HistoryRecord {
  id: string
  userId: string
  operation: string
  originalFiles: FileInfo[]
  resultFiles: FileInfo[]
  createdAt: Date
  processingTime: number
}

export interface FileInfo {
  name: string
  size: number
  type: string
  url: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}
