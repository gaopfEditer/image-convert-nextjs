'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, HelpCircle, Image, Zap, Scissors, Sparkles, Settings, FileImage } from 'lucide-react'

interface FeatureGuideProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
}

const featureGuides = {
  convert: {
    title: '格式转换功能',
    icon: FileImage,
    description: '支持多种图片格式之间的转换，智能优化文件大小',
    features: [
      {
        title: '支持的格式',
        items: [
          'JPEG - 通用图片格式，适合照片',
          'PNG - 支持透明背景，适合图标',
          'WebP - 现代高效格式，文件更小',
          'AVIF - 最新压缩格式，最佳压缩率',
          'BMP - 位图格式，无压缩',
          'GIF - 动图格式',
          'TIFF - 专业图片格式',
          'HEIC - 苹果图片格式'
        ]
      },
      {
        title: '使用方法',
        items: [
          '1. 点击上传区域或拖拽图片文件',
          '2. 选择目标输出格式',
          '3. 点击"开始转换"按钮',
          '4. 下载转换后的图片'
        ]
      },
      {
        title: '权限说明',
        items: [
          '普通用户：每日5张图片',
          'VIP会员：每日100张图片',
          '特级会员：无限处理'
        ]
      }
    ],
    tips: [
      '💡 建议使用WebP格式获得最佳压缩效果',
      '💡 PNG格式适合需要透明背景的图片',
      '💡 大文件转换可能需要较长时间，请耐心等待'
    ]
  },
  compress: {
    title: '图片压缩功能',
    icon: Zap,
    description: '智能压缩算法，在保持质量的同时大幅减小文件大小',
    features: [
      {
        title: '压缩算法',
        items: [
          'MozJPEG - 高质量JPEG压缩',
          'WebP Lossless - 无损WebP压缩',
          'AVIF - 最新压缩技术',
          '智能质量调节'
        ]
      },
      {
        title: '压缩选项',
        items: [
          '质量等级：1-100可调',
          '文件大小限制',
          '保持原始尺寸',
          '批量压缩处理'
        ]
      },
      {
        title: '适用场景',
        items: [
          '网站图片优化',
          '社交媒体分享',
          '邮件附件',
          '存储空间节省'
        ]
      }
    ],
    tips: [
      '💡 质量设置为80-90可获得最佳平衡',
      '💡 压缩前建议备份原图',
      '💡 批量压缩可显著提高效率'
    ]
  },
  crop: {
    title: '裁剪缩放功能',
    icon: Scissors,
    description: '精确的图片裁剪和缩放工具，支持多种比例和预设',
    features: [
      {
        title: '裁剪功能',
        items: [
          '自由裁剪区域选择',
          '预设比例：1:1, 4:3, 16:9等',
          '精确像素定位',
          '实时预览效果'
        ]
      },
      {
        title: '缩放功能',
        items: [
          '按比例缩放',
          '自定义尺寸设置',
          '保持宽高比',
          '批量处理'
        ]
      },
      {
        title: '高级功能',
        items: [
          '智能裁剪（AI识别主体）',
          '旋转和翻转',
          '水印添加',
          '边框效果'
        ]
      }
    ],
    tips: [
      '💡 使用预设比例可快速适配不同平台',
      '💡 智能裁剪能自动识别图片主体',
      '💡 保持宽高比避免图片变形'
    ]
  },
  ai: {
    title: 'AI智能功能',
    icon: Sparkles,
    description: '基于人工智能的图片处理和分析功能',
    features: [
      {
        title: 'AI分析',
        items: [
          '图片内容识别',
          '自动标签生成',
          '相似图片搜索',
          '质量评估'
        ]
      },
      {
        title: '智能处理',
        items: [
          '老照片修复',
          '背景移除',
          '风格转换',
          '超分辨率放大'
        ]
      },
      {
        title: '创意功能',
        items: [
          'AI生成水印',
          '智能抠图',
          '颜色调整',
          '滤镜效果'
        ]
      }
    ],
    tips: [
      '💡 AI功能需要VIP或特级会员权限',
      '💡 处理时间可能较长，请耐心等待',
      '💡 建议上传清晰的原图获得最佳效果'
    ]
  }
}

export default function FeatureGuide({ isOpen, onClose, activeTab }: FeatureGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const currentGuide = featureGuides[activeTab as keyof typeof featureGuides]

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen, activeTab])

  if (!isOpen || !currentGuide) return null

  const Icon = currentGuide.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Icon size={32} />
              <div>
                <h2 className="text-2xl font-bold">{currentGuide.title}</h2>
                <p className="text-blue-100">{currentGuide.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {/* 功能特性 */}
          <div className="space-y-6">
            {currentGuide.features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {feature.title}
                </h3>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-gray-700">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 使用提示 */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              使用提示
            </h3>
            <div className="space-y-2">
              {currentGuide.tips.map((tip, index) => (
                <p key={index} className="text-yellow-700 text-sm">
                  {tip}
                </p>
              ))}
            </div>
          </div>

          {/* 权限说明 */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">权限说明</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-gray-600 font-bold">免</span>
                </div>
                <h4 className="font-medium text-gray-800">普通用户</h4>
                <p className="text-sm text-gray-600">基础功能</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">VIP</span>
                </div>
                <h4 className="font-medium text-gray-800">VIP会员</h4>
                <p className="text-sm text-gray-600">高级功能</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">特</span>
                </div>
                <h4 className="font-medium text-gray-800">特级会员</h4>
                <p className="text-sm text-gray-600">全部功能</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              需要更多帮助？请联系客服
            </div>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
