# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 React + Vite 的节日圣诞树交互式 Web 应用，使用 Canvas 2D 进行高性能渲染，集成 MediaPipe AI 手势识别控制。

## 开发命令

```bash
npm run dev      # 启动开发服务器 (端口 3000)
npm run build    # 生产构建
npm run preview  # 预览生产构建
```

## 架构

### 组件层次

```
App.tsx (根组件)
├── Snow.tsx           # Canvas 雪花粒子动画
├── Tree.tsx           # 圣诞树 Canvas 渲染（叶子、装饰、彩灯、彩带）
├── GestureController.tsx  # MediaPipe 手势识别
└── Controls.tsx       # UI 控制面板（雪花、灯光、颜色切换）
```

### 通用 Hooks

- [hooks/useCanvasResize.ts](hooks/useCanvasResize.ts) - Canvas 尺寸调整，支持 DPR（高分屏适配）
- [hooks/useAnimationFrame.ts](hooks/useAnimationFrame.ts) - requestAnimationFrame 循环管理

### 核心设计模式

1. **Canvas 2D 渲染**: 圣诞树和雪花使用粒子系统，通过 z-index 深度排序实现伪 3D 效果
2. **DPR 支持**: 所有 Canvas 自动适配设备像素比，确保高分屏清晰度
3. **状态管理**: 使用泛型化的 `updateSetting<T>(key, value)` 函数进行类型安全的状态更新
4. **手势识别**: MediaPipe Tasks Vision，使用 `MEDIAPIPE_CONFIG` 配置
5. **路径别名**: `@/*` 映射到项目根目录

### 文件结构

| 文件 | 说明 |
|------|------|
| [App.tsx](App.tsx) | 主应用，管理全局 `TreeSettings` 状态 |
| [types.ts](types.ts) | 类型定义 (`LightColorMode`, `TreeParticle`, `MEDIAPIPE_CONFIG`, `GESTURES`) |
| [components/Tree.tsx](components/Tree.tsx) | 圣诞树渲染，使用 `useRef` 缓存粒子避免不必要的重建 |
| [components/Snow.tsx](components/Snow.tsx) | 雪花粒子动画，带 `maxParticles` 上限 |
| [components/GestureController.tsx](components/GestureController.tsx) | 摄像头和手势识别，`gestureThreshold: 0.35` |
| [components/Controls.tsx](components/Controls.tsx) | 控制面板（雪花、灯光开关、颜色模式切换） |
| [hooks/](hooks/) | 通用 Hooks |

### 重要约定

- **Canvas 组件**: 使用 `useCanvasResize` 和 `useAnimationFrame` Hooks
- **粒子系统**: 使用 `useRef` 缓存粒子数据，避免 props 变化时重新初始化
- **类型定义**: 所有配置常量和类型定义在 `types.ts` 中统一管理
- **可访问性**: 按钮添加 `aria-label` 属性

## 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages，推送到 `main` 分支触发部署。基础路径为 `/tree/`。
