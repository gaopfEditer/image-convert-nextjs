'use client'

import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import styles from './ImageUploadArea.module.css';

interface ImageUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function ImageUploadArea({
  onFilesSelected,
  maxFiles = 10,
  disabled = false,
  className = '',
  children
}: ImageUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('请选择图片文件');
      return;
    }

    if (imageFiles.length > maxFiles) {
      alert(`最多只能选择 ${maxFiles} 个文件`);
      return;
    }

    onFilesSelected(imageFiles);
  }, [onFilesSelected, maxFiles]);

  // 处理文件输入
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect, disabled]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
      <div
        className={`${styles['upload-area']} ${
          isDragOver ? styles.dragover : ''
        } ${disabled ? styles.disabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        {children || (
          <>
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-700">
              拖拽图片到这里或点击选择
            </h3>
            <p className="text-gray-500">
              支持 JPG、PNG、WebP、AVIF 等格式，最多 {maxFiles} 个文件
            </p>
          </>
        )}
      </div>
    </div>
  );
}
