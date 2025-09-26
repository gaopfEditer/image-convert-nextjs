'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Zap, Loader2, X, HelpCircle, GripHorizontal } from 'lucide-react'
import { User as UserType, HistoryRecord } from '../../types/user'

interface CompressionResult {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  dataUrl: string
  fileName: string
  quality: number
}

interface ImageCompressProps {
  user: UserType | null
  onUpdateUser: (user: UserType) => void
  onAddHistory: (record: HistoryRecord) => void
  onShowFeatureGuide: () => void
}

const COMPRESSION_ALGORITHMS = [
  { value: 'mozjpeg', label: 'MozJPEG', description: '高质量JPEG压缩' },
  { value: 'webp', label: 'WebP Lossless', description: '无损WebP压缩' },
  { value: 'avif', label: 'AVIF', description: '最新压缩技术' },
  { value: 'smart', label: '智能压缩', description: '自动选择最佳算法' },
]

export default function ImageCompress({ user, onUpdateUser, onAddHistory, onShowFeatureGuide }: ImageCompressProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('smart')
  const [quality, setQuality] = useState(85)
  const [maxFileSize, setMaxFileSize] = useState(1024) // KB
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([])
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
    setCompressionResults([])
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
    setCompressionResults(prev => prev.filter((_, i) => i !== index))
  }, [])

  // 压缩图片
  const compressImage = useCallback(async (file: File, index: number) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建画布上下文')

      const img = new Image()
      return new Promise<CompressionResult>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          let mimeType = 'image/jpeg'
          let compressionQuality = quality / 100

          // 根据算法选择MIME类型
          switch (selectedAlgorithm) {
            case 'webp':
              mimeType = 'image/webp'
              break
            case 'avif':
              mimeType = 'image/avif'
              break
            case 'smart':
              // 智能选择：如果原图是PNG且有透明通道，使用PNG，否则使用WebP
              mimeType = file.type === 'image/png' ? 'image/png' : 'image/webp'
              break
            default:
              mimeType = 'image/jpeg'
          }

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('压缩失败'))
              return
            }

            const reader = new FileReader()
            reader.onload = () => {
              const dataUrl = reader.result as string
              const originalSize = file.size
              const compressedSize = blob.size
              const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100
              const fileName = file.name.replace(/\.[^/.]+$/, `_compressed.${selectedAlgorithm === 'webp' ? 'webp' : selectedAlgorithm === 'avif' ? 'avif' : 'jpg'}`)

              resolve({
                originalSize,
                compressedSize,
                compressionRatio,
                dataUrl,
                fileName,
                quality: compressionQuality * 100
              })
            }
            reader.readAsDataURL(blob)
          }, mimeType, compressionQuality)
        }
        img.src = previewUrls[index]
      })
    } catch (error) {
      console.error('压缩失败:', error)
      throw error
    }
  }, [selectedAlgorithm, quality, previewUrls])

  // 批量压缩
  const compressAllImages = useCallback(async () => {
    if (selectedFiles.length === 0 || !user) return

    setIsProcessing(true)
    try {
      const results = await Promise.all(
        selectedFiles.map((file, index) => compressImage(file, index))
      )
      setCompressionResults(results)
      
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
        operation: '图片压缩',
        originalFiles: selectedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        })),
        resultFiles: results.map(result => ({
          name: result.fileName,
          size: result.compressedSize,
          type: 'image/jpeg',
          url: result.dataUrl
        })),
        createdAt: new Date(),
        processingTime: Date.now() - performance.now()
      }
      onAddHistory(historyRecord)
    } catch (error) {
      console.error('批量压缩失败:', error)
      alert('图片压缩失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedFiles, compressImage, user, onUpdateUser, onAddHistory])

  // 下载压缩后的图片
  const downloadImage = useCallback((result: CompressionResult) => {
    const link = document.createElement('a')
    link.href = result.dataUrl
    link.download = result.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // 下载所有结果
  const downloadAll = useCallback(() => {
    compressionResults.forEach(result => downloadImage(result))
  }, [compressionResults, downloadImage])

  // 重置
  const reset = useCallback(() => {
    setSelectedFiles([])
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls([])
    setCompressionResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrls])

  return (
    <div className="space-y-6">
      {/* 功能标题和帮助按钮 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">图片压缩</h2>
          <p className="text-gray-600">智能压缩算法，在保持质量的同时大幅减小文件大小</p>
        </div>
        <button
          onClick={onShowFeatureGuide}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
          title="查看图片压缩帮助"
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

      {/* 压缩设置 */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6">压缩设置</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 压缩算法 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">压缩算法</label>
              <div className="space-y-2">
                {COMPRESSION_ALGORITHMS.map((algorithm) => (
                  <label key={algorithm.value} className="flex items-center">
                    <input
                      type="radio"
                      name="algorithm"
                      value={algorithm.value}
                      checked={selectedAlgorithm === algorithm.value}
                      onChange={(e) => setSelectedAlgorithm(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{algorithm.label}</div>
                      <div className="text-sm text-gray-500">{algorithm.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 质量设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                压缩质量: {quality}%
              </label>
              <div className="flex items-center space-x-4">
                <GripHorizontal className="flex-1" />
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-12">{quality}%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>最小</span>
                <span>最大</span>
              </div>
            </div>
          </div>

          {/* 文件大小限制 */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              目标文件大小限制: {maxFileSize} KB
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              value={maxFileSize}
              onChange={(e) => setMaxFileSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100 KB</span>
              <span>5 MB</span>
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

      {/* 压缩按钮 */}
      {selectedFiles.length > 0 && (
        <div className="text-center">
          <button
            onClick={compressAllImages}
            disabled={isProcessing}
            className="btn-primary mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="inline-block mr-2 animate-spin" size={20} />
                压缩中...
              </>
            ) : (
              <>
                <Zap className="inline-block mr-2" size={20} />
                开始压缩
              </>
            )}
          </button>
        </div>
      )}

      {/* 压缩结果 */}
      {compressionResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">压缩结果</h3>
            <button onClick={downloadAll} className="btn-primary">
              <Download className="inline-block mr-2" size={20} />
              下载全部
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compressionResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <img
                  src={result.dataUrl}
                  alt={`结果 ${index + 1}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="text-sm">
                  <p className="font-medium">{result.fileName}</p>
                  <p className="text-green-600 font-medium">
                    压缩率: {result.compressionRatio.toFixed(1)}%
                  </p>
                  <p className="text-gray-600">
                    原始: {(result.originalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-gray-600">
                    压缩后: {(result.compressedSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-gray-500">
                    质量: {result.quality.toFixed(0)}%
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
