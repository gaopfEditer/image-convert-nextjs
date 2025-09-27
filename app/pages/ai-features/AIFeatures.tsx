'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Sparkles, Loader2, X, HelpCircle, Wand2, Eye, Zap, Palette } from 'lucide-react'
import { User as UserType, HistoryRecord } from '../../types/user'

interface AIResult {
  originalSize: number
  processedSize: number
  dataUrl: string
  fileName: string
  operation: string
  confidence?: number
}

interface AIFeaturesProps {
  user: UserType | null
  onUpdateUser: (user: UserType) => void
  onAddHistory: (record: HistoryRecord) => void
  onShowFeatureGuide: () => void
}

const AI_OPERATIONS = [
  { 
    id: 'background-remove', 
    name: '背景移除', 
    icon: Wand2, 
    description: 'AI智能识别并移除背景',
    requiresVip: true,
    color: 'from-pink-500 to-rose-500'
  },
  { 
    id: 'enhance', 
    name: '图片增强', 
    icon: Zap, 
    description: '提升图片清晰度和质量',
    requiresVip: true,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'style-transfer', 
    name: '风格转换', 
    icon: Palette, 
    description: '将图片转换为不同艺术风格',
    requiresVip: true,
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'upscale', 
    name: '超分辨率', 
    icon: Eye, 
    description: 'AI放大图片并保持清晰度',
    requiresVip: true,
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'colorize', 
    name: '智能上色', 
    icon: Palette, 
    description: '为黑白照片自动上色',
    requiresVip: true,
    color: 'from-orange-500 to-red-500'
  },
  { 
    id: 'repair', 
    name: '老照片修复', 
    icon: Wand2, 
    description: '修复破损和模糊的老照片',
    requiresVip: true,
    color: 'from-amber-500 to-yellow-500'
  }
]

export default function AIFeatures({ user, onUpdateUser, onAddHistory, onShowFeatureGuide }: AIFeaturesProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedOperation, setSelectedOperation] = useState<string>('background-remove')
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiResults, setAiResults] = useState<AIResult[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 检查用户权限
  const checkUserPermission = useCallback(() => {
    if (!user) return false
    if (user.membership.type === 'free') {
      alert('AI功能需要VIP或特级会员权限，请升级会员后使用')
      return false
    }
    return true
  }, [user])

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    if (!checkUserPermission()) return

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('请选择图片文件')
      return
    }

    // 检查用户权限
    const totalFiles = selectedFiles.length + imageFiles.length
    if (user && user.membership.type === 'free' && totalFiles > user.membership.maxDailyUsage) {
      alert(`普通用户每天最多处理 ${user.membership.maxDailyUsage} 张图片，请升级会员享受更多功能`)
      return
    }

    setSelectedFiles(prev => [...prev, ...imageFiles])
    const urls = imageFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...urls])
    setAiResults([])
  }, [selectedFiles.length, user, checkUserPermission])

  // 处理拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // 处理文件输入
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // 移除文件
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setAiResults(prev => prev.filter((_, i) => i !== index))
  }, [])

  // 模拟AI处理
  const processImageWithAI = useCallback(async (file: File, index: number) => {
    const operation = AI_OPERATIONS.find(op => op.id === selectedOperation)
    if (!operation) throw new Error('未知的AI操作')

    // 模拟AI处理时间
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建画布上下文')

      const img = new Image()
      return new Promise<AIResult>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // 模拟不同的AI处理效果
          switch (selectedOperation) {
            case 'background-remove':
              // 模拟背景移除：添加透明度
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const data = imageData.data
              for (let i = 0; i < data.length; i += 4) {
                // 简单的背景检测（白色背景）
                if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
                  data[i + 3] = 0 // 设置透明度为0
                }
              }
              ctx.putImageData(imageData, 0, 0)
              break
            case 'enhance':
              // 模拟图片增强：调整对比度和锐化
              ctx.filter = 'contrast(1.2) brightness(1.1) saturate(1.1)'
              ctx.drawImage(img, 0, 0)
              break
            case 'upscale':
              // 模拟超分辨率：放大2倍
              canvas.width = img.width * 2
              canvas.height = img.height * 2
              ctx.imageSmoothingEnabled = false
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              break
            default:
              // 默认处理
              break
          }

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('AI处理失败'))
              return
            }

            const reader = new FileReader()
            reader.onload = () => {
              const dataUrl = reader.result as string
              const originalSize = file.size
              const processedSize = blob.size
              const fileName = file.name.replace(/\.[^/.]+$/, `_ai_${operation.id}.${file.name.split('.').pop()}`)

              resolve({
                originalSize,
                processedSize,
                dataUrl,
                fileName,
                operation: operation.name,
                confidence: Math.random() * 0.3 + 0.7 // 模拟置信度
              })
            }
            reader.readAsDataURL(blob)
          }, file.type, 0.9)
        }
        img.src = previewUrls[index]
      })
    } catch (error) {
      console.error('AI处理失败:', error)
      throw error
    }
  }, [selectedOperation, previewUrls])

  // 批量AI处理
  const processAllImages = useCallback(async () => {
    if (selectedFiles.length === 0 || !user || !checkUserPermission()) return

    setIsProcessing(true)
    setProcessingProgress(0)
    
    try {
      const results: AIResult[] = []
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const result = await processImageWithAI(selectedFiles[i], i)
        results.push(result)
        setProcessingProgress(((i + 1) / selectedFiles.length) * 100)
      }
      
      setAiResults(results)
      
      // 更新用户使用量
      const updatedUser = {
        ...user,
        membership: {
          ...user.membership,
          dailyUsage: user.membership.dailyUsage + selectedFiles.length
        }
      }
      onUpdateUser(updatedUser)

      // 保存到历史记录
      const operation = AI_OPERATIONS.find(op => op.id === selectedOperation)
      const historyRecord: HistoryRecord = {
        id: Date.now().toString(),
        userId: user.id,
        operation: `AI${operation?.name || '处理'}`,
        originalFiles: selectedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        })),
        resultFiles: results.map(result => ({
          name: result.fileName,
          size: result.processedSize,
          type: 'image/jpeg',
          url: result.dataUrl
        })),
        createdAt: new Date(),
        processingTime: Date.now() - performance.now()
      }
      onAddHistory(historyRecord)
    } catch (error) {
      console.error('AI处理失败:', error)
      alert('AI处理失败，请重试')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }, [selectedFiles, processImageWithAI, user, onUpdateUser, onAddHistory, selectedOperation, checkUserPermission])

  // 下载处理后的图片
  const downloadImage = useCallback((result: AIResult) => {
    const link = document.createElement('a')
    link.href = result.dataUrl
    link.download = result.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // 下载所有结果
  const downloadAll = useCallback(() => {
    aiResults.forEach(result => downloadImage(result))
  }, [aiResults, downloadImage])

  // 重置
  const reset = useCallback(() => {
    setSelectedFiles([])
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls([])
    setAiResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrls])

  return (
    <div className="space-y-6">
      {/* 功能标题和帮助按钮 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI功能</h2>
          <p className="text-gray-600">基于人工智能的图片处理和分析功能</p>
        </div>
        <button
          onClick={onShowFeatureGuide}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
          title="查看AI功能帮助"
        >
          <HelpCircle size={20} />
          <span className="font-medium">帮助</span>
        </button>
      </div>

      {/* 权限提示 */}
      {user?.membership.type === 'free' && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Sparkles className="text-purple-500 mr-3" size={24} />
            <div>
              <h3 className="font-semibold text-purple-800">AI功能需要会员权限</h3>
              <p className="text-purple-600 text-sm">升级为VIP或特级会员即可使用所有AI功能</p>
            </div>
          </div>
        </div>
      )}

      {/* 上传区域 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div
          className={`upload-area ${isDragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">
            {selectedFiles.length > 0 ? '点击或拖拽添加更多图片' : '点击或拖拽上传图片'}
          </h3>
          <p className="text-gray-500">
            支持 JPG、PNG、WebP、AVIF 等格式
          </p>
          {user?.membership.type === 'free' && (
            <p className="text-sm text-orange-600 mt-2">
              普通用户每天可处理 {user?.membership.maxDailyUsage} 张图片，已使用 {user?.membership.dailyUsage} 张
            </p>
          )}
        </div>
      </div>

      {/* AI操作选择 */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6">选择AI操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_OPERATIONS.map((operation) => {
              const Icon = operation.icon
              const isDisabled = operation.requiresVip && user?.membership.type === 'free'
              return (
                <button
                  key={operation.id}
                  onClick={() => !isDisabled && setSelectedOperation(operation.id)}
                  disabled={isDisabled}
                  className={`p-4 border rounded-lg transition-all text-left ${
                    selectedOperation === operation.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${operation.color} flex items-center justify-center mb-3`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h4 className="font-medium mb-1">{operation.name}</h4>
                  <p className="text-sm text-gray-500">{operation.description}</p>
                  {isDisabled && (
                    <p className="text-xs text-orange-500 mt-2">需要会员权限</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 图片列表 */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">已选择的图片 ({selectedFiles.length})</h3>
            <button
              onClick={reset}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              清空所有
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative border rounded-lg p-4">
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  <X size={20} />
                </button>
                <img
                  src={previewUrls[index]}
                  alt={`预览 ${index + 1}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-sm text-gray-600 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 处理进度 */}
      {isProcessing && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 animate-spin text-blue-500" size={32} />
            <h3 className="text-lg font-semibold mb-2">AI处理中...</h3>
            <p className="text-gray-600 mb-4">正在使用AI技术处理您的图片，请耐心等待</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{Math.round(processingProgress)}% 完成</p>
          </div>
        </div>
      )}

      {/* 处理按钮 */}
      {selectedFiles.length > 0 && !isProcessing && (
        <div className="text-center">
          <button
            onClick={processAllImages}
            disabled={!checkUserPermission()}
            className="btn-primary mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="inline-block mr-2" size={20} />
            开始AI处理
          </button>
        </div>
      )}

      {/* AI处理结果 */}
      {aiResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">AI处理结果</h3>
            <button onClick={downloadAll} className="btn-primary">
              <Download className="inline-block mr-2" size={20} />
              下载全部
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <img
                  src={result.dataUrl}
                  alt={`结果 ${index + 1}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="text-sm">
                  <p className="font-medium">{result.fileName}</p>
                  <p className="text-blue-600 font-medium">{result.operation}</p>
                  {result.confidence && (
                    <p className="text-gray-500">置信度: {(result.confidence * 100).toFixed(1)}%</p>
                  )}
                  <p className="text-gray-600">
                    原始: {(result.originalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-gray-600">
                    处理后: {(result.processedSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => downloadImage(result)}
                  className="btn-secondary w-full mt-2"
                >
                  <Download className="inline-block mr-1" size={16} />
                  下载
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
