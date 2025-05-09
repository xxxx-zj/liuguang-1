# 视频去水印工具

一个简单的网页应用，用于从视频中去除水印。

## 功能特点

- 上传视频文件
- 通过拖拽选择水印区域
- 使用FFmpeg处理视频，去除选定的水印区域
- 下载处理后的视频

## 安装要求

### 必要条件

1. **Node.js** (v12.0.0 或更高版本)
2. **FFmpeg** - 必须安装在系统中并可在命令行中访问

### FFmpeg 安装指南

#### Windows

1. 从 [FFmpeg官网](https://ffmpeg.org/download.html) 或 [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) 下载FFmpeg
2. 解压下载的文件到一个目录，例如 `C:\ffmpeg`
3. 将FFmpeg的bin目录添加到系统环境变量PATH中：
   - 右键点击「此电脑」，选择「属性」
   - 点击「高级系统设置」
   - 点击「环境变量」
   - 在「系统变量」中找到「Path」并编辑
   - 添加FFmpeg的bin目录路径（例如：`C:\ffmpeg\bin`）
   - 点击「确定」保存更改
4. 重启命令提示符或PowerShell
5. 验证安装：输入 `ffmpeg -version` 确认是否正确安装

#### macOS

使用Homebrew安装：

```
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)

```
sudo apt update
sudo apt install ffmpeg
```

## 安装应用

1. 克隆或下载此仓库
2. 安装依赖：

```
npm install
```

3. 启动服务器：

```
npm start
```

4. 在浏览器中访问：`http://localhost:3000`

## 使用方法

1. 上传视频文件（支持MP4, AVI, MOV, WMV等格式，最大100MB）
2. 在视频上拖动鼠标选择要去除的水印区域
3. 点击「处理视频」按钮
4. 处理完成后，点击「下载处理后的视频」

## 常见问题

### 处理视频时出错 (500 Internal Server Error)

如果在处理视频时遇到服务器错误，最常见的原因是FFmpeg未正确安装。请确保：

1. FFmpeg已安装在系统中
2. FFmpeg可以在命令行中访问（添加到系统PATH中）
3. 重启应用服务器

验证FFmpeg安装：在命令行中运行 `ffmpeg -version`，如果正确安装，应该显示FFmpeg的版本信息。

## 许可证

MIT