# 图片格式转换器

一个基于 Next.js 的现代化图片格式转换工具，支持多种图片格式之间的转换。

## 功能特性

- 🖼️ **多格式支持**: 支持 JPEG、PNG、WebP、AVIF、BMP、GIF 等格式
- 🚀 **客户端处理**: 所有转换操作在浏览器中完成，保护隐私
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🎨 **现代UI**: 简洁美观的用户界面
- 📊 **转换统计**: 显示文件大小和压缩率信息
- 🖱️ **拖拽上传**: 支持拖拽文件上传
- ⚡ **实时预览**: 上传后立即预览图片

## 支持的格式

### 输入格式
- JPEG/JPG
- PNG
- WebP
- AVIF
- BMP
- GIF
- 其他常见图片格式
 
### 输出格式
- **JPEG**: 通用图片格式，适合照片
- **PNG**: 支持透明背景，适合图标和图形
- **WebP**: 现代高效格式，文件更小
- **AVIF**: 最新压缩格式，最佳压缩率
- **BMP**: 位图格式，无压缩
- **GIF**: 动图格式


## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 使用方法

1. **上传图片**: 点击上传区域或拖拽图片文件到页面上
2. **选择格式**: 从支持的格式中选择目标输出格式
3. **开始转换**: 点击"开始转换"按钮
4. **下载结果**: 转换完成后点击"下载转换后的图片"

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **图片处理**: HTML5 Canvas API

## 项目结构

```
image-convert/
├── app/
│   ├── globals.css      # 全局样式
│   ├── layout.tsx       # 根布局组件
│   └── page.tsx         # 主页面组件
├── package.json         # 项目依赖
├── tailwind.config.js   # Tailwind 配置
├── tsconfig.json        # TypeScript 配置
└── README.md           # 项目说明
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 开发命令

- **安装依赖**：`pnpm install`
- **启动开发**：`pnpm dev`
- **构建项目**：`pnpm build`
- **启动生产**：`pnpm start`
- **代码检查**：`pnpm lint`
- **类型检查**：`pnpm type-check`

## 注意事项

- 所有图片转换都在客户端进行，不会上传到服务器
- 大文件转换可能需要较长时间，请耐心等待
- 某些格式转换可能不支持所有浏览器，建议使用现代浏览器
- 推荐使用 pnpm 作为包管理器以获得更好的性能和磁盘空间利用

## 许可证

MIT License
