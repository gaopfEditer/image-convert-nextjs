'use client'

import { Download, FileImage } from 'lucide-react';

interface ConversionResult {
  id: string;
  fileName: string;
  originalSize: number;
  convertedSize: number;
  format: string;
  dataUrl: string;
  compressionRatio?: number;
}

interface ConversionResultListProps {
  results: ConversionResult[];
  onDownload: (result: ConversionResult) => void;
  onDownloadAll?: () => void;
  className?: string;
  showImages?: boolean;
}

export default function ConversionResultList({
  results,
  onDownload,
  onDownloadAll,
  className = '',
  showImages = false
}: ConversionResultListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateCompressionRatio = (original: number, converted: number): number => {
    return ((1 - converted / original) * 100);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          转换结果 ({results.length})
        </h3>
        {onDownloadAll && (
          <button
            onClick={onDownloadAll}
            className="btn-primary flex items-center space-x-2"
          >
            <Download size={20} />
            <span>下载全部</span>
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {results.map((result, index) => {
          const compressionRatio = result.compressionRatio ?? calculateCompressionRatio(result.originalSize, result.convertedSize);
          
          return (
            <div
              key={result.id || index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {showImages && (
                  <div className="flex-shrink-0">
                    <img
                      src={result.dataUrl}
                      alt={`结果 ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileImage size={16} className="text-gray-400" />
                    <p className="font-medium text-gray-900 truncate">
                      {result.fileName}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>格式: {result.format.toUpperCase()}</span>
                    <span>大小: {formatFileSize(result.convertedSize)}</span>
                    <span className={`${compressionRatio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      压缩率: {compressionRatio > 0 ? '+' : ''}{compressionRatio.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <button
                  onClick={() => onDownload(result)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>下载</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
