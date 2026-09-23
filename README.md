# 待办清单 / Desktop Todo List

一个简洁、精致的 Windows 桌面待办应用，基于 Electron 构建。它支持普通待办、提醒弹窗、系统托盘、桌面小窗、定时任务和中英文界面，适合把日常事项、临时任务和周期提醒都放在一个轻量工具里管理。

A polished Windows desktop todo app built with Electron. It supports one-off tasks, reminder popups, tray mode, a compact desktop window, recurring schedules, and both Chinese and English UI, making it a lightweight place for daily tasks and recurring reminders.

## 功能亮点 / Features

- 待办管理：创建、编辑、完成、删除任务，并支持备注、优先级和搜索。
- 任务筛选：按超期未处理、进行中、今天提醒、全部任务和已完成快速查看。
- 提醒能力：支持任务提醒、提前提醒、到点弹窗和系统通知。
- 桌面小窗：将进行中的任务固定在更轻量的窗口中，方便随时查看。
- 定时任务：支持每天、工作日、每周、每月、自定义星期和间隔天数等重复提醒。
- 系统托盘：关闭窗口后可后台常驻，并通过托盘菜单快速打开、添加任务或退出。
- 个性设置：支持简体中文 / English 切换、开机自启动、关闭到托盘和小窗置顶。
- 本地存储：任务数据保存到 Electron 的用户数据目录，不依赖远程服务。

- Task management: create, edit, complete, delete, prioritize, annotate, and search tasks.
- Smart filters: view overdue, active, today, all, and completed tasks quickly.
- Reminders: task reminders with advance alerts, due popups, and native notifications.
- Compact window: keep active tasks visible in a lightweight desktop window.
- Recurring schedules: daily, weekdays, weekly, monthly, custom weekdays, and interval-based reminders.
- Tray mode: keep the app running in the background and access common actions from the tray menu.
- Preferences: switch between Simplified Chinese and English, enable auto-start, minimize to tray, and pin the compact window.
- Local-first data: task data is stored in Electron's user data directory with no remote service required.

## 截图 / Screenshots

> 可以在上传 GitHub 后补充应用截图，例如主界面、桌面小窗和提醒弹窗。
>
> Add screenshots after uploading to GitHub, such as the main window, compact window, and reminder popup.

## 技术栈 / Tech Stack

- Electron
- JavaScript
- HTML / CSS
- electron-builder

## 快速开始 / Getting Started

### 环境要求 / Requirements

- Node.js 18 或更高版本 / Node.js 18 or later
- npm
- Windows 系统用于完整体验托盘、通知、安装包和便携版构建 / Windows is recommended for tray, notification, installer, and portable build support

### 安装依赖 / Install

```bash
npm install
```

### 本地运行 / Run Locally

```bash
npm start
```

### 打包便携版 / Build Portable App

```bash
npm run pack
```

### 打包安装版和便携版 / Build Installer and Portable App

```bash
npm run dist
```

构建产物会输出到 `release/` 目录。

Build artifacts are generated in the `release/` directory.

## 项目结构 / Project Structure

```text
.
├── assets/              # 应用图标 / App icons
├── main.js              # Electron 主进程 / Electron main process
├── preload.js           # 安全桥接 API / Preload bridge APIs
├── renderer/            # 前端界面 / Renderer UI
│   ├── app.js
│   ├── index.html
│   ├── splash.html
│   └── styles.css
├── patches/             # patch-package 补丁 / patch-package patches
├── release/             # 打包输出 / Build output
├── package.json
└── package-lock.json
```

## 数据存储 / Data Storage

应用会将任务、定时任务和设置保存到 Electron 的 `userData` 目录中的 `todo-data.json` 文件。你也可以在应用设置中点击“打开数据目录”查看本地数据位置。

The app stores tasks, scheduled tasks, and preferences in `todo-data.json` under Electron's `userData` directory. You can also open the data folder from the settings panel.

## GitHub 上传建议 / GitHub Notes

建议提交源码、图标、补丁和锁文件。通常不需要提交 `node_modules/`，如果发布包体积较大，也可以只在 GitHub Releases 中上传 `release/` 里的安装包或便携版。

Commit the source code, icons, patches, and lock file. You usually do not need to commit `node_modules/`; for large build artifacts, consider uploading installers or portable builds from `release/` to GitHub Releases instead.

## 许可证 / License

MIT
