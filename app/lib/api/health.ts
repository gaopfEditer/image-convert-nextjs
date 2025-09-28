import { api } from '../request';

// 健康检查相关类型定义
export interface HealthResponse {
  status: string;
  timestamp: string;
  ip: string;
  hostId: string;
  region?: string;
  country?: string;
  isDomestic?: boolean;
}

export interface RegionInfo {
  ip: string;
  hostId: string;
  region: string;
  country: string;
  isDomestic: boolean;
}

// 健康检查 API
export const healthApi = {
  // 获取健康状态和IP信息
  getHealth: (): Promise<HealthResponse> => {
    return api.get('/health');
  },

  // 检测IP地区信息
  detectRegion: async (): Promise<RegionInfo> => {
    try {
      const healthData = await api.get('/health');
      
      // 根据IP地址判断是否为国内
      const isDomestic = isDomesticIP(healthData.ip);
      
      return {
        ip: healthData.ip,
        hostId: healthData.hostId,
        region: isDomestic ? 'domestic' : 'international',
        country: isDomestic ? 'CN' : 'US', // 简化处理，实际应该根据IP查询
        isDomestic
      };
    } catch (error) {
      console.error('检测地区信息失败:', error);
      // 默认返回国际版本
      return {
        ip: 'unknown',
        hostId: 'unknown',
        region: 'international',
        country: 'US',
        isDomestic: false
      };
    }
  }
};

// 判断IP是否为国内IP的辅助函数
function isDomesticIP(ip: string): boolean {
  // 简化的IP判断逻辑，实际项目中应该使用更精确的IP库
  if (!ip || ip === 'unknown') return false;
  
  // 检查是否为内网IP
  if (ip.startsWith('192.168.') || 
      ip.startsWith('10.') || 
      ip.startsWith('172.') ||
      ip === '127.0.0.1' ||
      ip === 'localhost') {
    return true; // 内网IP默认认为是国内
  }
  
  // 检查是否为已知的中国IP段（简化版本）
  const chineseIPRanges = [
    '1.0.0.0/8',
    '14.0.0.0/8',
    '27.0.0.0/8',
    '36.0.0.0/8',
    '39.0.0.0/8',
    '42.0.0.0/8',
    '49.0.0.0/8',
    '58.0.0.0/8',
    '59.0.0.0/8',
    '60.0.0.0/8',
    '61.0.0.0/8',
    '101.0.0.0/8',
    '103.0.0.0/8',
    '106.0.0.0/8',
    '110.0.0.0/8',
    '111.0.0.0/8',
    '112.0.0.0/8',
    '113.0.0.0/8',
    '114.0.0.0/8',
    '115.0.0.0/8',
    '116.0.0.0/8',
    '117.0.0.0/8',
    '118.0.0.0/8',
    '119.0.0.0/8',
    '120.0.0.0/8',
    '121.0.0.0/8',
    '122.0.0.0/8',
    '123.0.0.0/8',
    '124.0.0.0/8',
    '125.0.0.0/8',
    '126.0.0.0/8',
    '171.0.0.0/8',
    '175.0.0.0/8',
    '180.0.0.0/8',
    '182.0.0.0/8',
    '183.0.0.0/8',
    '202.0.0.0/8',
    '203.0.0.0/8',
    '210.0.0.0/8',
    '211.0.0.0/8',
    '218.0.0.0/8',
    '219.0.0.0/8',
    '220.0.0.0/8',
    '221.0.0.0/8',
    '222.0.0.0/8',
    '223.0.0.0/8'
  ];
  
  // 简化的IP匹配逻辑
  const ipParts = ip.split('.').map(Number);
  if (ipParts.length !== 4) return false;
  
  // 检查是否匹配中国IP段（简化版本）
  for (const range of chineseIPRanges) {
    const [rangeIP, mask] = range.split('/');
    const rangeParts = rangeIP.split('.').map(Number);
    const maskBits = parseInt(mask);
    
    if (isIPInRange(ipParts, rangeParts, maskBits)) {
      return true;
    }
  }
  
  return false;
}

// 检查IP是否在指定范围内
function isIPInRange(ip: number[], range: number[], maskBits: number): boolean {
  if (ip.length !== 4 || range.length !== 4) return false;
  
  const mask = (0xFFFFFFFF << (32 - maskBits)) >>> 0;
  const ipInt = (ip[0] << 24) | (ip[1] << 16) | (ip[2] << 8) | ip[3];
  const rangeInt = (range[0] << 24) | (range[1] << 16) | (range[2] << 8) | range[3];
  
  return (ipInt & mask) === (rangeInt & mask);
}

