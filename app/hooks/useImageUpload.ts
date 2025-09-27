import { useState } from 'react';
import { imageApi } from '@/app/lib/api/image';

export interface UploadResult {
  success: boolean;
  imageId?: string;
  url?: string;
  error?: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await imageApi.upload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return {
        success: true,
        imageId: result.imageId,
        url: result.url,
      };
    } catch (error) {
      console.error('上传失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      };
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const convertImage = async (imageId: string, targetFormat: string) => {
    try {
      const result = await imageApi.convert(imageId, targetFormat);
      return { success: true, taskId: result.taskId };
    } catch (error) {
      console.error('转换失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '转换失败' };
    }
  };

  const compressImage = async (imageId: string, quality: number) => {
    try {
      const result = await imageApi.compress(imageId, quality);
      return { success: true, taskId: result.taskId };
    } catch (error) {
      console.error('压缩失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '压缩失败' };
    }
  };

  const cropImage = async (imageId: string, cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    try {
      const result = await imageApi.crop(imageId, cropData);
      return { success: true, taskId: result.taskId };
    } catch (error) {
      console.error('裁剪失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '裁剪失败' };
    }
  };

  const getResult = async (taskId: string) => {
    try {
      const result = await imageApi.getResult(taskId);
      return { success: true, data: result };
    } catch (error) {
      console.error('获取结果失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '获取结果失败' };
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadImage,
    convertImage,
    compressImage,
    cropImage,
    getResult,
  };
}
