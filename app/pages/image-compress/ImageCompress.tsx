'use client'

import { useState, useCallback } from 'react'
import { Download, Zap, Loader2, HelpCircle } from 'lucide-react'
import { User as UserType, HistoryRecord } from '../../types/user'
import { useI18nContext } from '../../i18n/context'
import { 
  ImageUploadArea, 
  CompressFileList, 
  FormatSelector, 
  ConversionResultList 
} from '../../components'
import { imageApi } from '../../lib/api'

interface CompressionResult {
  id: string
  originalSize: number
  convertedSize: number  // 改为 convertedSize 以匹配 ConversionResult
  compressionRatio: number
  dataUrl: string
  fileName: string
  format: string  // 添加 format 字段
  quality: number
  status?: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  error?: string
}

interface ImageCompressProps {
  user: UserType | null
  onUpdateUser: (user: UserType) => void
  onAddHistory: (record: HistoryRecord) => void
  onShowFeatureGuide: () => void
}

const COMPRESSION_ALGORITHMS = [
  { value: 'mozjpeg', label: 'MozJPEG', description: '高质量JPEG压缩' },
  { value: 'webp', label: 'WebP', description: '现代WebP压缩' },
  { value: 'avif', label: 'AVIF', description: '最新压缩技术' },
  { value: 'smart', label: '智能压缩', description: '自动选择最佳算法' },
]

export default function ImageCompress({ user, onUpdateUser, onAddHistory, onShowFeatureGuide }: ImageCompressProps) {
  const { t } = useI18nContext()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileList, setFileList] = useState<Array<{
    id: string, 
    name: string, 
    size: number, 
    type: string, 
    status?: 'pending' | 'processing' | 'completed' | 'error', 
    progress?: number,
    thumbnail?: string,
    compressedSize?: number,
    compressionRatio?: number,
    compressedUrl?: string,
    error?: string
  }>>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('smart')
  const [quality, setQuality] = useState(85)
  const [maxFileSize, setMaxFileSize] = useState(1024) // KB
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([])

  // 处理文件选择 - 拖拽后自动开始压缩
  const handleFileSelect = useCallback(async (files: File[]) => {
    if (!user) return

    // 检查用户权限
    const totalFiles = selectedFiles.length + files.length
    if (user.membership.type === 'free' && totalFiles > user.membership.maxDailyUsage) {
      alert(`普通用户每天最多处理 ${user.membership.maxDailyUsage} 张图片，请升级会员享受更多功能`)
      return
    }

    setSelectedFiles(prev => [...prev, ...files])
    
    // 更新文件列表，生成缩略图
    const newFileList = await Promise.all(files.map(async (file, index) => {
      // 生成缩略图
      const thumbnail = await new Promise<string>((resolve) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve('')
            return
          }
          
          // 计算缩略图尺寸
          const maxSize = 64
          let { width, height } = img
          if (width > height) {
            height = (height * maxSize) / width
            width = maxSize
          } else {
            width = (width * maxSize) / height
            height = maxSize
          }
          
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }
        img.onerror = () => resolve('')
        img.src = URL.createObjectURL(file)
      })

      return {
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending' as const,
        progress: 0,
        thumbnail
      }
    }))
    
    setFileList(prev => [...prev, ...newFileList])
    
    // 自动开始压缩
    await compressFiles(files, newFileList)
  }, [selectedFiles.length, user])

  // 移除文件
  const removeFile = useCallback((fileId: string) => {
    const fileIndex = fileList.findIndex(file => file.id === fileId)
    if (fileIndex === -1) return

    setSelectedFiles(prev => prev.filter((_, index) => index !== fileIndex))
    setFileList(prev => prev.filter(file => file.id !== fileId))
    setCompressionResults(prev => prev.filter((_, index) => index !== fileIndex))
  }, [fileList])

  // 压缩文件 - 使用后端API
  const compressFiles = useCallback(async (files: File[], fileListItems: any[]) => {
    if (files.length === 0 || !user) return

    setIsProcessing(true)
    try {
      // 批量压缩所有文件
      const results = await Promise.all(
        files.map(async (file, index) => {
          const fileItem = fileListItems[index]
          try {
            // 更新文件状态为处理中
            setFileList(prev => prev.map(f => 
              f.id === fileItem.id ? { ...f, status: 'processing', progress: 50 } : f
            ))

            const response = await imageApi.compress(file, {
              quality: quality,
              // maxWidth: maxFileSize * 10, // 转换为像素
              // maxHeight: maxFileSize * 10
            })
            
            const compressionRatio = ((file.size - response.size) / file.size) * 100
            
            const result = {
              id: `result-${Date.now()}-${index}`,
              originalSize: file.size,
              convertedSize: response.size,
              compressionRatio: compressionRatio,
              dataUrl: response.processedUrl,
              fileName: file.name,
              format: selectedAlgorithm.toUpperCase(),
              quality: quality,
              status: 'completed' as const
            }

            // 更新文件状态为完成，包含压缩信息
            setFileList(prev => prev.map(f => 
              f.id === fileItem.id ? { 
                ...f, 
                status: 'completed', 
                progress: 100,
                compressedSize: response.size,
                compressionRatio: compressionRatio,
                compressedUrl: response.processedUrl
              } : f
            ))

            return result
          } catch (error) {
            console.error('压缩失败:', error)
            // 更新文件状态为错误
            setFileList(prev => prev.map(f => 
              f.id === fileItem.id ? { ...f, status: 'error', error: '压缩失败' } : f
            ))
            throw error
          }
        })
      )
      
      setCompressionResults(prev => [...prev, ...results])
      
      // 更新用户使用量
      const updatedUser = {
        ...user,
        membership: {
          ...user.membership,
          dailyUsage: user.membership.dailyUsage + files.length
        }
      }
      onUpdateUser(updatedUser)

      // 保存到历史记录
      const historyRecord: HistoryRecord = {
        id: Date.now().toString(),
        userId: user.id,
        operation: '图片压缩',
        originalFiles: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        })),
        resultFiles: results.map(result => ({
          name: result.fileName,
          size: result.convertedSize,
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
  }, [quality, maxFileSize, user, onUpdateUser, onAddHistory])

  // 下载压缩后的图片
  const downloadImage = useCallback((result: any) => {
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
    setFileList([])
    setCompressionResults([])
  }, [])


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
      <ImageUploadArea
        onFilesSelected={handleFileSelect}
        maxFiles={user?.membership.maxDailyUsage || 10}
        disabled={!user}
      >
        <div className="text-center">
          <Zap size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">
            {selectedFiles.length > 0 ? '继续添加图片或拖拽新图片' : '拖拽图片到这里或点击选择'}
          </h3>
          <p className="text-gray-500 mb-4">
            支持 JPG、PNG、WebP、AVIF 等格式，拖拽后自动开始压缩
          </p>
          {user?.membership.type === 'free' && (
            <p className="text-sm text-orange-600">
              今日剩余: {user?.membership.maxDailyUsage - user?.membership.dailyUsage} 张
            </p>
          )}
        </div>
      </ImageUploadArea>

      {/* 压缩设置 */}
      {fileList.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6">压缩设置</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 压缩算法 */}
            <FormatSelector
              formats={COMPRESSION_ALGORITHMS}
              selectedFormat={selectedAlgorithm}
              onFormatChange={setSelectedAlgorithm}
              title="压缩算法"
            />

            {/* 质量设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                压缩质量: {quality}%
              </label>
              <div className="flex items-center space-x-4">
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

      {/* 文件列表 */}
      {fileList.length > 0 && (
        <CompressFileList
          files={fileList}
          onRemove={removeFile}
          onDownload={(fileId) => {
            const file = fileList.find(f => f.id === fileId)
            if (file?.compressedUrl) {
              const link = document.createElement('a')
              link.href = file.compressedUrl
              link.download = file.name
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }
          }}
          showDownload={true}
          showRemove={true}
          emptyMessage="暂无文件"
        />
      )}

      {/* 操作按钮 */}
      {fileList.length > 0 && (
        <div className="text-center">
          <button
            onClick={reset}
            className="btn-secondary"
          >
            清空所有
          </button>
        </div>
      )}

      {/* 压缩结果 */}
      {compressionResults.length > 0 && (
        <ConversionResultList
          results={compressionResults}
          onDownload={downloadImage}
          onDownloadAll={downloadAll}
          showImages={true}
        />
      )}
    </div>
  )
}
