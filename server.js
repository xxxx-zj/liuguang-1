const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');

const app = express();
const port = 3000;

// 启用CORS
app.use(cors());

// 设置静态文件目录
app.use(express.static('public'));

// 创建上传和处理后的视频目录
const uploadDir = path.join(__dirname, 'uploads');
const processedDir = path.join(__dirname, 'processed');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir);
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 限制100MB
  fileFilter: function (req, file, cb) {
    // 只接受视频文件
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('只允许上传视频文件!'), false);
    }
    cb(null, true);
  }
});

// 处理视频上传
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有上传文件' });
  }
  
  res.json({ 
    success: true, 
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path
  });
});

// 处理视频去水印
app.post('/process', express.json(), (req, res) => {
  const { filename, x, y, width, height } = req.body;
  
  if (!filename || x === undefined || y === undefined || width === undefined || height === undefined) {
    return res.status(400).json({ error: '参数不完整' });
  }
  
  const inputPath = path.join(uploadDir, filename);
  const outputFilename = 'processed_' + filename;
  const outputPath = path.join(processedDir, outputFilename);
  
  // 使用ffmpeg处理视频
  ffmpeg(inputPath)
    .videoFilters([
      // 使用drawbox滤镜在水印位置绘制一个与背景相似的矩形
      `drawbox=x=${x}:y=${y}:w=${width}:h=${height}:color=black@0.9:t=fill`
    ])
    .output(outputPath)
    .on('end', () => {
      res.json({ 
        success: true, 
        processedFilename: outputFilename,
        downloadPath: `/download/${outputFilename}`
      });
    })
    .on('error', (err) => {
      console.error('Error processing video:', err);
      res.status(500).json({ error: '处理视频时出错' });
    })
    .run();
});

// 处理视频下载
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(processedDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }
  
  res.download(filePath);
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});