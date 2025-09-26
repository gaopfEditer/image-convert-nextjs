'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, FileImage, Loader2, X, HelpCircle } from 'lucide-react'
import { User as UserType, HistoryRecord } from '../../types/user'
import { useI18nContext } from '../../i18n/context'

interface ConversionResult {
  originalSize: number
  convertedSize: number
  format: string
  dataUrl: string
  fileName: string
}

interface FormatConvertProps {
  user: UserType | null
  onUpdateUser: (user: UserType) => void
  onAddHistory: (record: HistoryRecord) => void
  onShowFeatureGuide: () => void
}

const SUPPORTED_FORMATS = [
  { value: 'jpeg', label: 'JPEG', description: '通用图片格式' },
  { value: 'png', label: 'PNG', description: '支持透明背景' },
  { value: 'webp', label: 'WebP', description: '现代高效格式' },
  { value: 'avif', label: 'AVIF', description: '最新压缩格式' },
  { value: 'bmp', label: 'BMP', description: '位图格式' },
  { value: 'gif', label: 'GIF', description: '动图格式' },
  { value: 'tiff', label: 'TIFF', description: '专业图片格式' },
  { value: 'heic', label: 'HEIC', description: '苹果图片格式' },
]

export default function FormatConvert({ user, onUpdateUser, onAddHistory, onShowFeatureGuide }: FormatConvertProps) {
  const { t } = useI18nContext()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedFormat, setSelectedFormat] = useState<string>('jpeg')
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversionResults, setConversionResults] = useState<ConversionResult[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert(t('errors.selectImageFiles'))
      return
    }

    if (!user) return

    // 检查用户权限
    const totalFiles = selectedFiles.length + imageFiles.length
    if (user.membership.type === 'free' && totalFiles > user.membership.maxDailyUsage) {
      alert(t('errors.dailyLimitExceeded', { max: user.membership.maxDailyUsage }))
      return
    }

    setSelectedFiles(prev => [...prev, ...imageFiles])
    const urls = imageFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...urls])
    setConversionResults([])
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
    setConversionResults(prev => prev.filter((_, i) => i !== index))
  }, [])

  // 转换图片格式
  const convertImage = useCallback(async (file: File, index: number) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建画布上下文')

      const img = new Image()
      return new Promise<ConversionResult>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          let mimeType = 'image/jpeg'
          let quality = 0.9

          switch (selectedFormat) {
            case 'jpeg':
              mimeType = 'image/jpeg'
              quality = 0.9
              break
            case 'png':
              mimeType = 'image/png'
              quality = 1.0
              break
            case 'webp':
              mimeType = 'image/webp'
              quality = 0.8
              break
            case 'avif':
              mimeType = 'image/avif'
              quality = 0.8
              break
            case 'bmp':
              mimeType = 'image/bmp'
              quality = 1.0
              break
            case 'gif':
              mimeType = 'image/gif'
              quality = 1.0
              break
          }

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('转换失败'))
              return
            }

            const reader = new FileReader()
            reader.onload = () => {
              const dataUrl = reader.result as string
              const originalSize = file.size
              const convertedSize = blob.size
              const fileName = file.name.replace(/\.[^/.]+$/, `.${selectedFormat}`)

              resolve({
                originalSize,
                convertedSize,
                format: selectedFormat.toUpperCase(),
                dataUrl,
                fileName
              })
            }
            reader.readAsDataURL(blob)
          }, mimeType, quality)
        }
        img.src = previewUrls[index]
      })
    } catch (error) {
      console.error('转换失败:', error)
      throw error
    }
  }, [selectedFormat, previewUrls])

  // 批量转换
  const convertAllImages = useCallback(async () => {
    if (selectedFiles.length === 0 || !user) return

    setIsProcessing(true)
    try {
      const results = await Promise.all(
        selectedFiles.map((file, index) => convertImage(file, index))
      )
      setConversionResults(results)
      
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
        operation: '格式转换',
        originalFiles: selectedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        })),
        resultFiles: results.map(result => ({
          name: result.fileName,
          size: result.convertedSize,
          type: `image/${result.format.toLowerCase()}`,
          url: result.dataUrl
        })),
        createdAt: new Date(),
        processingTime: Date.now() - performance.now()
      }
      onAddHistory(historyRecord)
    } catch (error) {
      console.error('批量转换失败:', error)
      alert('图片转换失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedFiles, convertImage, user, onUpdateUser, onAddHistory])

  // 下载转换后的图片
  const downloadImage = useCallback((result: ConversionResult) => {
    const link = document.createElement('a')
    link.href = result.dataUrl
    link.download = result.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // 下载所有结果
  const downloadAll = useCallback(() => {
    conversionResults.forEach(result => downloadImage(result))
  }, [conversionResults, downloadImage])

  // 重置
  const reset = useCallback(() => {
    setSelectedFiles([])
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls([])
    setConversionResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrls])

  return (
    <div className="space-y-6">
      {/* 功能标题和帮助按钮 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('formatConvert.title')}</h2>
          <p className="text-gray-600">{t('formatConvert.description')}</p>
        </div>
        <button
          onClick={onShowFeatureGuide}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
          title={t('formatConvert.title')}
        >
          <HelpCircle size={20} />
          <span className="font-medium">{t('common.help')}</span>
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
            {selectedFiles.length > 0 ? t('formatConvert.uploadTextMultiple') : t('formatConvert.uploadText')}
          </h3>
          <p className="text-gray-500">
            {t('formatConvert.supportedFormats')}
          </p>
          {user?.membership.type === 'free' && (
            <p className="text-sm text-orange-600 mt-2">
              {t('formatConvert.dailyLimit', { max: user?.membership.maxDailyUsage, used: user?.membership.dailyUsage })}
            </p>
          )}
        </div>
      </div>

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

      {/* 格式选择 */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-4">选择输出格式</h3>
          <div className="format-selector">
            {SUPPORTED_FORMATS.map((format) => (
              <div
                key={format.value}
                className={`format-option ${
                  selectedFormat === format.value ? 'selected' : ''
                }`}
                onClick={() => setSelectedFormat(format.value)}
              >
                <div className="font-medium">{format.label}</div>
                <div className="text-xs opacity-75">{format.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 转换按钮 */}
      {selectedFiles.length > 0 && (
        <div className="text-center">
          <button
            onClick={convertAllImages}
            disabled={isProcessing}
            className="btn-primary mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="inline-block mr-2 animate-spin" size={20} />
                转换中...
              </>
            ) : (
              <>
                <FileImage className="inline-block mr-2" size={20} />
                开始转换
              </>
            )}
          </button>
        </div>
      )}

      {/* 转换结果 */}
      {conversionResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">转换结果</h3>
            <button onClick={downloadAll} className="btn-primary">
              <Download className="inline-block mr-2" size={20} />
              下载全部
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversionResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <img
                  src={result.dataUrl}
                  alt={`结果 ${index + 1}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="text-sm">
                  <p className="font-medium">{result.fileName}</p>
                  <p className="text-gray-600">
                    压缩率: {((1 - result.convertedSize / result.originalSize) * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-500">
                    大小: {(result.convertedSize / 1024 / 1024).toFixed(2)} MB
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
