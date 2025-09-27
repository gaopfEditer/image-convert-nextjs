'use client'

import { useState, useCallback } from 'react'
import { FileImage, Loader2, HelpCircle } from 'lucide-react'
import { User as UserType, HistoryRecord } from '../../types/user'
import { useI18nContext } from '../../i18n/context'
import { 
  ImageUploadArea, 
  FileList, 
  FormatSelector, 
  ConversionResultList 
} from '../../components'
import { imageApi } from '../../lib/api'

interface ConversionResult {
  id: string
  originalSize: number
  convertedSize: number
  format: string
  dataUrl: string
  fileName: string
  compressionRatio?: number
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
  const [fileList, setFileList] = useState<Array<{id: string, name: string, size: number, type: string, status?: 'pending' | 'processing' | 'completed' | 'error'}>>([])
  const [selectedFormat, setSelectedFormat] = useState<string>('jpeg')
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversionResults, setConversionResults] = useState<ConversionResult[]>([])

  // 处理文件选择
  const handleFileSelect = useCallback((files: File[]) => {
    if (!user) return

    // 检查用户权限
    const totalFiles = selectedFiles.length + files.length
    if (user.membership.type === 'free' && totalFiles > user.membership.maxDailyUsage) {
      alert(t('errors.dailyLimitExceeded', { max: user.membership.maxDailyUsage }))
      return
    }

    setSelectedFiles(prev => [...prev, ...files])
    
    // 更新文件列表
    const newFileList = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending' as const
    }))
    setFileList(prev => [...prev, ...newFileList])
    setConversionResults([])
  }, [selectedFiles.length, user, t])

  // 移除文件
  const removeFile = useCallback((fileId: string) => {
    const fileIndex = fileList.findIndex(file => file.id === fileId)
    if (fileIndex === -1) return

    setSelectedFiles(prev => prev.filter((_, index) => index !== fileIndex))
    setFileList(prev => prev.filter(file => file.id !== fileId))
  }, [fileList])



  // 批量转换 - 使用后端API
  const convertAllImages = useCallback(async () => {
    if (selectedFiles.length === 0 || !user) return

    setIsProcessing(true)
    try {
      // 批量转换所有文件
      const results = await Promise.all(
        selectedFiles.map(async (file, index) => {
          const response = await imageApi.convert(file, {
            format: selectedFormat,
            quality: 90
          })
          
          return {
            id: `result-${Date.now()}-${index}`,
            originalSize: file.size,
            convertedSize: response.size,
            format: selectedFormat.toUpperCase(),
            dataUrl: response.processedUrl,
            fileName: file.name.replace(/\.[^/.]+$/, `.${selectedFormat}`)
          }
        })
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
  }, [selectedFiles, selectedFormat, user, onUpdateUser, onAddHistory])

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
    setFileList([])
    setConversionResults([])
  }, [])

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
      <ImageUploadArea
        onFilesSelected={handleFileSelect}
        maxFiles={user?.membership.maxDailyUsage || 10}
        disabled={!user}
      >
        <div className="text-center">
          <FileImage size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">
            {selectedFiles.length > 0 ? '继续添加图片或拖拽新图片' : '拖拽图片到这里或点击选择'}
          </h3>
          <p className="text-gray-500 mb-4">
            支持 JPG、PNG、WebP、AVIF 等格式
          </p>
          {user?.membership.type === 'free' && (
            <p className="text-sm text-orange-600">
              今日剩余: {user?.membership.maxDailyUsage - user?.membership.dailyUsage} 张
            </p>
          )}
        </div>
      </ImageUploadArea>

      {/* 文件列表 */}
      {fileList.length > 0 && (
        <FileList
          files={fileList}
          onRemove={removeFile}
          showRemove={true}
          emptyMessage="暂无文件"
        />
      )}

      {/* 格式选择 */}
      {fileList.length > 0 && (
        <FormatSelector
          formats={SUPPORTED_FORMATS}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          title="选择输出格式"
        />
      )}

      {/* 转换按钮 */}
      {fileList.length > 0 && (
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
          <button
            onClick={reset}
            className="btn-secondary"
          >
            清空所有
          </button>
        </div>
      )}

      {/* 转换结果 */}
      {conversionResults.length > 0 && (
        <ConversionResultList
          results={conversionResults}
          onDownload={downloadImage}
          onDownloadAll={downloadAll}
          showImages={false}
        />
      )}
    </div>
  )
}
