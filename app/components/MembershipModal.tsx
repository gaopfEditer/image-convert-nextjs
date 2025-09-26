'use client'

import { useState } from 'react'
import { X, Crown, Star, Check, Zap, Shield, Infinity } from 'lucide-react'

interface MembershipModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: (type: 'vip' | 'premium') => void
  currentType: string
}

const membershipPlans = [
  {
    id: 'vip',
    name: 'VIP会员',
    price: '29',
    period: '月',
    color: 'from-yellow-400 to-orange-500',
    icon: Crown,
    features: [
      '每日处理 100 张图片',
      '10GB 云存储空间',
      '批量处理功能',
      '高级压缩算法',
      '优先客服支持',
      '去除水印功能'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: '特级会员',
    price: '99',
    period: '月',
    color: 'from-purple-500 to-pink-500',
    icon: Star,
    features: [
      '无限图片处理',
      '100GB 云存储空间',
      'AI 智能处理',
      '专业级压缩',
      '24/7 专属客服',
      '所有高级功能',
      'API 接口访问',
      '团队协作功能'
    ],
    popular: false
  }
]

export default function MembershipModal({ isOpen, onClose, onUpgrade, currentType }: MembershipModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'vip' | 'premium'>('vip')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">升级会员</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              选择适合您的会员套餐
            </h3>
            <p className="text-gray-600">
              解锁更多功能，享受专业级图片处理服务
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {membershipPlans.map((plan) => {
              const Icon = plan.icon
              const isCurrent = currentType === plan.id
              const isSelected = selectedPlan === plan.id
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border-2 p-6 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isCurrent && setSelectedPlan(plan.id as 'vip' | 'premium')}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        最受欢迎
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        当前套餐
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                      <Icon className="text-white" size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800">{plan.name}</h4>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-800">¥{plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !isCurrent && onUpgrade(plan.id as 'vip' | 'premium')}
                    disabled={isCurrent}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg`
                    }`}
                  >
                    {isCurrent ? '当前套餐' : '立即升级'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              会员权益保障
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 7天无理由退款保障</li>
              <li>• 数据安全加密存储</li>
              <li>• 24小时技术支持</li>
              <li>• 随时可取消订阅</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
