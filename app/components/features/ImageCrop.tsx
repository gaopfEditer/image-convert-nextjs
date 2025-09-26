'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Scissors, Loader2, X, HelpCircle, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react'
import { User as UserType, HistoryRecord } from '../../types/user'

interface CropResult {
  originalSize: number
  croppedSize: number
  dataUrl: string
  fileName: string
  dimensions: { width: number; height: number }
}

interface ImageCropProps {
  user: UserType | null
  onUpdateUser: (user: UserType) => void
  onAddHistory: (record: HistoryRecord) => void
  onShowFeatureGuide: () => void
}

const ASPECT_RATIOS = [
  { value: 'free', label: '自由裁剪', description: '任意比例' },
  { value: '1:1', label: '正方形', description: '1:1' },
  { value: '4:3', label: '标准', description: '4:3' },
  { value: '16:9', label: '宽屏', description: '16:9' },
  { value: '3:2', label: '照片', description: '3:2' },
  { value: '9:16', label: '竖屏', description: '9:16' },
]

const PRESET_SIZES = [
  { label: '社交媒体', sizes: [
    { name: 'Instagram 正方形', width: 1080, height: 1080 },
    { name: 'Instagram 故事', width: 1080, height: 1920 },
    { name: 'Facebook 封面', width: 1200, height: 630 },
    { name: 'Twitter 卡片', width: 1200, height: 675 },
  ]},
  { label: '网站用途', sizes: [
    { name: '网站横幅', width: 1920, height: 600 },
    { name: '缩略图', width: 300, height: 200 },
    { name: '头像', width: 200, height: 200 },
    { name: '图标', width: 64, height: 64 },
  ]},
]

export default function ImageCrop({ user, onUpdateUser, onAddHistory, onShowFeatureGuide }: ImageCropProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('free')
  const [customWidth, setCustomWidth] = useState(800)
  const [customHeight, setCustomHeight] = useState(600)
  const [keepAspectRatio, setKeepAspectRatio] = useState(true)
  const [rotation, setRotation] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cropResults, setCropResults] = useState<CropResult[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('请选择图片文件')
      return
    }

    if (!user) return

    // 检查用户权限
    const totalFiles = selectedFiles.length + imageFiles.length
    if (user.membership.type === 'free' && totalFiles > user.membership.maxDailyUsage) {
      alert(`普通用户每天最多处理 ${user.membership.maxDailyUsage} 张图片，请升级会员享受更多功能`)
      return
    }

    setSelectedFiles(prev => [...prev, ...imageFiles])
    const urls = imageFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...urls])
    setCropResults([])
  }, [selectedFiles.length, user])

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
    setCropResults(prev => prev.filter((_, i) => i !== index))
  }, [])

  // 计算目标尺寸
  const getTargetDimensions = useCallback((originalWidth: number, originalHeight: number) => {
    if (selectedAspectRatio === 'free') {
      return { width: customWidth, height: customHeight }
    }

    const [ratioW, ratioH] = selectedAspectRatio.split(':').map(Number)
    const aspectRatio = ratioW / ratioH

    let targetWidth = customWidth
    let targetHeight = customHeight

    if (keepAspectRatio) {
      if (originalWidth / originalHeight > aspectRatio) {
        targetHeight = Math.round(customWidth / aspectRatio)
      } else {
        targetWidth = Math.round(customHeight * aspectRatio)
      }
    }

    return { width: targetWidth, height: targetHeight }
  }, [selectedAspectRatio, customWidth, customHeight, keepAspectRatio])

  // 裁剪图片
  const cropImage = useCallback(async (file: File, index: number) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建画布上下文')

      const img = new Image()
      return new Promise<CropResult>((resolve, reject) => {
        img.onload = () => {
          const { width: targetWidth, height: targetHeight } = getTargetDimensions(img.width, img.height)
          
          canvas.width = targetWidth
          canvas.height = targetHeight

          // 应用变换
          ctx.save()
          
          // 移动到中心
          ctx.translate(canvas.width / 2, canvas.height / 2)
          
          // 应用旋转
          if (rotation !== 0) {
            ctx.rotate((rotation * Math.PI) / 180)
          }
          
          // 应用翻转
          if (flipHorizontal || flipVertical) {
            ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)
          }

          // 计算缩放比例以适应目标尺寸
          const scaleX = targetWidth / img.width
          const scaleY = targetHeight / img.height
          const scale = Math.min(scaleX, scaleY)

          // 绘制图片
          ctx.drawImage(
            img,
            -img.width * scale / 2,
            -img.height * scale / 2,
            img.width * scale,
            img.height * scale
          )

          ctx.restore()

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('裁剪失败'))
              return
            }

            const reader = new FileReader()
            reader.onload = () => {
              const dataUrl = reader.result as string
              const originalSize = file.size
              const croppedSize = blob.size
              const fileName = file.name.replace(/\.[^/.]+$/, `_cropped.${file.name.split('.').pop()}`)

              resolve({
                originalSize,
                croppedSize,
                dataUrl,
                fileName,
                dimensions: { width: targetWidth, height: targetHeight }
              })
            }
            reader.readAsDataURL(blob)
          }, file.type, 0.9)
        }
        img.src = previewUrls[index]
      })
    } catch (error) {
      console.error('裁剪失败:', error)
      throw error
    }
  }, [getTargetDimensions, rotation, flipHorizontal, flipVertical, previewUrls])

  // 批量裁剪
  const cropAllImages = useCallback(async () => {
    if (selectedFiles.length === 0 || !user) return

    setIsProcessing(true)
    try {
      const results = await Promise.all(
        selectedFiles.map((file, index) => cropImage(file, index))
      )
      setCropResults(results)
      
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
      const historyRecord: HistoryRecord = {
        id: Date.now().toString(),
        userId: user.id,
        operation: '图片裁剪',
        originalFiles: selectedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        })),
        resultFiles: results.map(result => ({
          name: result.fileName,
          size: result.croppedSize,
          type: 'image/jpeg',
          url: result.dataUrl
        })),
        createdAt: new Date(),
        processingTime: Date.now() - performance.now()
      }
      onAddHistory(historyRecord)
    } catch (error) {
      console.error('批量裁剪失败:', error)
      alert('图片裁剪失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedFiles, cropImage, user, onUpdateUser, onAddHistory])

  // 下载裁剪后的图片
  const downloadImage = useCallback((result: CropResult) => {
    const link = document.createElement('a')
    link.href = result.dataUrl
    link.download = result.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // 下载所有结果
  const downloadAll = useCallback(() => {
    cropResults.forEach(result => downloadImage(result))
  }, [cropResults, downloadImage])

  // 重置
  const reset = useCallback(() => {
    setSelectedFiles([])
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls([])
    setCropResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrls])

  return (
    <div className="space-y-6">
      {/* 功能标题和帮助按钮 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">裁剪缩放</h2>
          <p className="text-gray-600">精确的图片裁剪和缩放工具，支持多种比例和预设</p>
        </div>
        <button
          onClick={onShowFeatureGuide}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
          title="查看裁剪缩放帮助"
        >
          <HelpCircle size={20} />
          <span className="font-medium">帮助</span>
        </button>
      </div>

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

      {/* 裁剪设置 */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6">裁剪设置</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 比例设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">裁剪比例</label>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setSelectedAspectRatio(ratio.value)}
                    className={`p-3 text-left border rounded-lg transition-all ${
                      selectedAspectRatio === ratio.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{ratio.label}</div>
                    <div className="text-sm text-gray-500">{ratio.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 尺寸设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">目标尺寸</label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">宽度 (px)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="4000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">高度 (px)</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="4000"
                    />
                  </div>
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={keepAspectRatio}
                    onChange={(e) => setKeepAspectRatio(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">保持宽高比</span>
                </label>
              </div>
            </div>
          </div>

          {/* 变换设置 */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-lg font-medium text-gray-800 mb-4">图片变换</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">旋转角度</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setRotation(prev => (prev - 90) % 360)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RotateCw size={20} className="rotate-180" />
                  </button>
                  <input
                    type="number"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                    min="0"
                    max="360"
                    step="90"
                  />
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RotateCw size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">水平翻转</label>
                <button
                  onClick={() => setFlipHorizontal(!flipHorizontal)}
                  className={`p-2 border rounded-lg transition-all ${
                    flipHorizontal ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'
                  }`}
                >
                  <FlipHorizontal size={20} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">垂直翻转</label>
                <button
                  onClick={() => setFlipVertical(!flipVertical)}
                  className={`p-2 border rounded-lg transition-all ${
                    flipVertical ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'
                  }`}
                >
                  <FlipVertical size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* 预设尺寸 */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-lg font-medium text-gray-800 mb-4">常用预设</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_SIZES.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h5 className="font-medium text-gray-700 mb-2">{category.label}</h5>
                  <div className="space-y-1">
                    {category.sizes.map((size, sizeIndex) => (
                      <button
                        key={sizeIndex}
                        onClick={() => {
                          setCustomWidth(size.width)
                          setCustomHeight(size.height)
                          setSelectedAspectRatio('free')
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        {size.name} ({size.width}×{size.height})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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

      {/* 裁剪按钮 */}
      {selectedFiles.length > 0 && (
        <div className="text-center">
          <button
            onClick={cropAllImages}
            disabled={isProcessing}
            className="btn-primary mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="inline-block mr-2 animate-spin" size={20} />
                裁剪中...
              </>
            ) : (
              <>
                <Scissors className="inline-block mr-2" size={20} />
                开始裁剪
              </>
            )}
          </button>
        </div>
      )}

      {/* 裁剪结果 */}
      {cropResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">裁剪结果</h3>
            <button onClick={downloadAll} className="btn-primary">
              <Download className="inline-block mr-2" size={20} />
              下载全部
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cropResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <img
                  src={result.dataUrl}
                  alt={`结果 ${index + 1}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="text-sm">
                  <p className="font-medium">{result.fileName}</p>
                  <p className="text-gray-600">
                    尺寸: {result.dimensions.width}×{result.dimensions.height}
                  </p>
                  <p className="text-gray-600">
                    原始: {(result.originalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-gray-600">
                    裁剪后: {(result.croppedSize / 1024 / 1024).toFixed(2)} MB
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
