'use client'

import { X, Download, FileImage } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onDownload?: (id: string) => void;
  showDownload?: boolean;
  showRemove?: boolean;
  className?: string;
  emptyMessage?: string;
}

export default function FileList({
  files,
  onRemove,
  onDownload,
  showDownload = false,
  showRemove = true,
  className = '',
  emptyMessage = '暂无文件'
}: FileListProps) {
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
        return '处理中...';
      case 'completed':
        return '已完成';
      case 'error':
        return '处理失败';
      default:
        return '待处理';
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
      
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <FileImage size={20} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span className={`${getStatusColor(file.status)}`}>
                    {getStatusText(file.status)}
                  </span>
                  {file.progress !== undefined && (
                    <span>{file.progress}%</span>
                  )}
                </div>
                {file.error && (
                  <p className="text-xs text-red-600 mt-1">{file.error}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {showDownload && onDownload && file.status === 'completed' && (
                <button
                  onClick={() => onDownload(file.id)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="下载文件"
                >
                  <Download size={16} />
                </button>
              )}
              
              {showRemove && (
                <button
                  onClick={() => onRemove(file.id)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="移除文件"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
