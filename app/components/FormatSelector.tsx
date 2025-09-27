'use client'

import styles from './FormatSelector.module.css';

interface FormatOption {
  value: string;
  label: string;
  description: string;
  disabled?: boolean;
}

interface FormatSelectorProps {
  formats: FormatOption[];
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  title?: string;
  className?: string;
}

export default function FormatSelector({
  formats,
  selectedFormat,
  onFormatChange,
  title = '选择输出格式',
  className = ''
}: FormatSelectorProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
      <h3 className="text-xl font-semibold mb-6 text-gray-800">{title}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {formats.map((format) => (
          <div
            key={format.value}
            className={`${styles['format-option']} ${
              selectedFormat === format.value ? styles.selected : ''
            } ${format.disabled ? styles.disabled : ''}`}
            onClick={() => !format.disabled && onFormatChange(format.value)}
          >
            <div className="font-medium text-gray-800">{format.label}</div>
            <div className="text-xs text-gray-600 mt-1">{format.description}</div>
            {format.disabled && (
              <div className="text-xs text-red-500 mt-1">暂不支持</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
