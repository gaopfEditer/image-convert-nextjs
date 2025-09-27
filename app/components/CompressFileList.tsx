'use client'

import { X, Download, FileImage, Loader2 } from 'lucide-react';

interface CompressFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
  thumbnail?: string; // 压缩前的缩略图
  compressedSize?: number; // 压缩后的大小
  compressionRatio?: number; // 压缩率
  compressedUrl?: string; // 压缩后的图片URL
}

interface CompressFileListProps {
  files: CompressFileItem[];
  onRemove: (id: string) => void;
  onDownload?: (id: string) => void;
  showDownload?: boolean;
  showRemove?: boolean;
  className?: string;
  emptyMessage?: string;
}

export default function CompressFileList({
  files,
  onRemove,
  onDownload,
  showDownload = false,
  showRemove = true,
  className = '',
  emptyMessage = '暂无文件'
}: CompressFileListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status?: string): string => {
    switch (status) {
      case 'processing':
        return '压缩中...';
      case 'completed':
        return '压缩完成';
      case 'error':
        return '压缩失败';
      default:
        return '待压缩';
    }
  };

  if (files.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500 py-8">
          <FileImage size={48} className="mx-auto mb-4 text-gray-300" />
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          文件列表 ({files.length})
        </h3>
      </div>
      
      <div className="space-y-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* 缩略图 */}
            <div className="flex-shrink-0">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded border"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                  <FileImage size={24} className="text-gray-400" />
                </div>
              )}
            </div>
            
            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {file.name}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(file.status)} bg-opacity-10`}>
                  {getStatusText(file.status)}
                </span>
              </div>
              
              {/* 文件大小信息 */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="text-gray-500">原始大小:</span>
                  <span className="ml-1 font-medium">{formatFileSize(file.size)}</span>
                </div>
                <div>
                  <span className="text-gray-500">压缩后:</span>
                  <span className="ml-1 font-medium">
                    {file.compressedSize ? formatFileSize(file.compressedSize) : '-'}
                  </span>
                </div>
              </div>
              
              {/* 压缩率 */}
              {file.compressionRatio !== undefined && (
                <div className="text-sm text-green-600 mt-1">
                  压缩率: {file.compressionRatio.toFixed(1)}%
                </div>
              )}
              
              {/* 进度条 */}
              {file.status === 'processing' && file.progress !== undefined && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{file.progress}%</span>
                  </div>
                </div>
              )}
              
              {/* 错误信息 */}
              {file.error && (
                <div className="text-sm text-red-600 mt-1">{file.error}</div>
              )}
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {showDownload && onDownload && file.status === 'completed' && (
                <button
                  onClick={() => onDownload(file.id)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="下载压缩后的图片"
                >
                  <Download size={20} />
                </button>
              )}
              
              {showRemove && (
                <button
                  onClick={() => onRemove(file.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="移除文件"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
