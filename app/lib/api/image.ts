import { api } from '../request';

// 图片处理相关类型定义
export interface ImageConvertOptions {
  quality?: number;
  width?: number;
  height?: number;
  format: string;
}

export interface ImageCropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio?: boolean;
}

export interface ImageCompressOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageProcessResult {
  id: string;
  originalUrl: string;
  processedUrl: string;
  format: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
}

export interface ImageUploadResult {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
}

// 图片处理相关 API
export const imageApi = {
  // 上传图片
  upload: (file: File): Promise<ImageUploadResult> => {
    const formData = new FormData();
    formData.append('image', file);
    return api.upload('/api/upload', formData);
  },

  // 转换图片格式
  convert: (file: File, options: ImageConvertOptions): Promise<ImageProcessResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', options.format);
    
    if (options.quality) {
      formData.append('quality', options.quality.toString());
    }
    if (options.width) {
      formData.append('width', options.width.toString());
    }
    if (options.height) {
      formData.append('height', options.height.toString());
    }
    
    return api.upload('/api/image/convert', formData);
  },

  // 下载图片
  downloadImage: (url: string, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        
        // 添加到DOM，触发点击，然后移除
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // 预览图片
  previewImage: (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        resolve(url);
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      
      img.src = url;
    });
  },

  // 压缩图片
  compress: (file: File, options: ImageCompressOptions): Promise<ImageProcessResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', options.quality.toString());
    
    if (options.maxWidth) {
      formData.append('maxWidth', options.maxWidth.toString());
    }
    if (options.maxHeight) {
      formData.append('maxHeight', options.maxHeight.toString());
    }
    
    return api.upload('/api/image/compress', formData);
  },

  // 裁剪图片
  crop: (file: File, options: ImageCropOptions): Promise<ImageProcessResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('x', options.x.toString());
    formData.append('y', options.y.toString());
    formData.append('width', options.width.toString());
    formData.append('height', options.height.toString());
    
    return api.upload('/api/image/crop', formData);
  },

  // 调整图片大小
  resize: (file: File, options: ImageResizeOptions): Promise<ImageProcessResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('width', options.width.toString());
    formData.append('height', options.height.toString());
    
    if (options.maintainAspectRatio !== undefined) {
      formData.append('maintainAspectRatio', options.maintainAspectRatio.toString());
    }
    
    return api.upload('/api/image/resize', formData);
  },

  // 获取处理结果
  getResult: (taskId: string): Promise<ImageProcessResult> => {
    return api.get(`/api/result/${taskId}`);
  },

  // 获取用户图片列表
  getImages: (params?: {
    page?: number;
    limit?: number;
    format?: string;
  }): Promise<{
    images: ImageProcessResult[];
    total: number;
    page: number;
    limit: number;
  }> => {
    return api.get('/api/images', params);
  },

  // 删除图片
  deleteImage: (imageId: string): Promise<void> => {
    return api.delete(`/api/images/${imageId}`);
  },

  // 批量删除图片
  deleteImages: (imageIds: string[]): Promise<void> => {
    return api.post('/api/images/batch-delete', { imageIds });
  },
};
