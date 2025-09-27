// 日期处理工具函数

/**
 * 安全地创建日期对象
 * @param date 日期值（可以是 Date、string、number 或 null/undefined）
 * @param fallback 如果日期无效时的默认值
 * @returns 有效的 Date 对象或 fallback
 */
export function safeCreateDate(
  date: Date | string | number | null | undefined,
  fallback: Date = new Date()
): Date {
  if (!date) {
    return fallback;
  }

  if (date instanceof Date) {
    return isNaN(date.getTime()) ? fallback : date;
  }

  const newDate = new Date(date);
  return isNaN(newDate.getTime()) ? fallback : newDate;
}

/**
 * 格式化日期为中文格式
 * @param date 日期值
 * @param fallback 如果日期无效时的默认文本
 * @returns 格式化后的日期字符串
 */
export function formatDateChinese(
  date: Date | string | number | null | undefined,
  fallback: string = '未知日期'
): string {
  const validDate = safeCreateDate(date);
  
  if (validDate === new Date() && (date === null || date === undefined)) {
    return fallback;
  }

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(validDate);
  } catch (error) {
    console.error('日期格式化失败:', error);
    return fallback;
  }
}

/**
 * 检查日期是否有效
 * @param date 日期值
 * @returns 是否为有效日期
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 创建未来日期的安全方法
 * @param daysFromNow 从现在开始的天数
 * @returns 有效的未来日期
 */
export function createFutureDate(daysFromNow: number): Date {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  return isValidDate(futureDate) ? futureDate : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
}
