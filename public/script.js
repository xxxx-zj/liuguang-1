document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadStatus = document.getElementById('upload-status');
    const videoPreview = document.getElementById('video-preview');
    const videoContainer = document.getElementById('video-container');
    const watermarkSelector = document.getElementById('watermark-selector');
    const processBtn = document.getElementById('process-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    const processStatus = document.getElementById('process-status');
    const downloadContainer = document.getElementById('download-container');
    const downloadLink = document.getElementById('download-link');
    
    // 步骤元素
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    
    // 存储上传的文件信息
    let uploadedFile = null;
    
    // 拖放上传功能
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('highlight');
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('highlight');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('highlight');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // 点击上传功能
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            handleFileUpload(fileInput.files[0]);
        }
    });
    
    // 处理文件上传
    function handleFileUpload(file) {
        // 检查文件类型
        if (!file.type.startsWith('video/')) {
            showStatus(uploadStatus, '请上传视频文件', 'error');
            return;
        }
        
        // 检查文件大小 (100MB限制)
        if (file.size > 100 * 1024 * 1024) {
            showStatus(uploadStatus, '文件大小不能超过100MB', 'error');
            return;
        }
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append('video', file);
        
        // 显示上传中状态
        showStatus(uploadStatus, '上传中...', 'info');
        
        // 发送上传请求
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                uploadedFile = data;
                showStatus(uploadStatus, '上传成功', 'success');
                
                // 预览视频
                videoPreview.src = URL.createObjectURL(file);
                videoPreview.onloadedmetadata = function() {
                    // 显示第二步
                    step1.classList.add('hidden');
                    step2.classList.remove('hidden');
                    
                    // 初始化水印选择器
                    initWatermarkSelector();
                };
            } else {
                showStatus(uploadStatus, data.error || '上传失败', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showStatus(uploadStatus, '上传失败: ' + error.message, 'error');
        });
    }
    
    // 初始化水印选择器
    function initWatermarkSelector() {
        let isDragging = false;
        let isResizing = false;
        let currentHandle = null;
        let startX, startY;
        let startLeft, startTop, startWidth, startHeight;
        
        // 显示水印选择器
        watermarkSelector.style.display = 'block';
        
        // 初始位置和大小
        watermarkSelector.style.left = '10%';
        watermarkSelector.style.top = '10%';
        watermarkSelector.style.width = '20%';
        watermarkSelector.style.height = '20%';
        
        // 启用处理按钮
        processBtn.disabled = false;
        
        // 移动水印选择器
        watermarkSelector.addEventListener('mousedown', function(e) {
            if (e.target === watermarkSelector) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseFloat(watermarkSelector.style.left);
                startTop = parseFloat(watermarkSelector.style.top);
                e.preventDefault();
            }
        });
        
        // 调整水印选择器大小
        const resizeHandles = watermarkSelector.querySelectorAll('.resize-handle');
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', function(e) {
                isResizing = true;
                currentHandle = handle;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseFloat(watermarkSelector.style.left);
                startTop = parseFloat(watermarkSelector.style.top);
                startWidth = parseFloat(watermarkSelector.style.width);
                startHeight = parseFloat(watermarkSelector.style.height);
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        // 处理鼠标移动
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                const containerRect = videoContainer.getBoundingClientRect();
                const selectorRect = watermarkSelector.getBoundingClientRect();
                
                let newLeft = startLeft + (dx / containerRect.width * 100);
                let newTop = startTop + (dy / containerRect.height * 100);
                
                // 限制在视频容器内
                newLeft = Math.max(0, Math.min(newLeft, 100 - parseFloat(watermarkSelector.style.width)));
                newTop = Math.max(0, Math.min(newTop, 100 - parseFloat(watermarkSelector.style.height)));
                
                watermarkSelector.style.left = newLeft + '%';
                watermarkSelector.style.top = newTop + '%';
            } else if (isResizing) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                const containerRect = videoContainer.getBoundingClientRect();
                
                // 根据不同的调整柄计算新的位置和大小
                if (currentHandle.classList.contains('se')) {
                    const newWidth = startWidth + (dx / containerRect.width * 100);
                    const newHeight = startHeight + (dy / containerRect.height * 100);
                    watermarkSelector.style.width = Math.max(5, Math.min(newWidth, 100 - startLeft)) + '%';
                    watermarkSelector.style.height = Math.max(5, Math.min(newHeight, 100 - startTop)) + '%';
                } else if (currentHandle.classList.contains('sw')) {
                    const newWidth = startWidth - (dx / containerRect.width * 100);
                    const newHeight = startHeight + (dy / containerRect.height * 100);
                    const newLeft = startLeft + (dx / containerRect.width * 100);
                    
                    if (newWidth >= 5 && newLeft >= 0) {
                        watermarkSelector.style.left = newLeft + '%';
                        watermarkSelector.style.width = newWidth + '%';
                    }
                    watermarkSelector.style.height = Math.max(5, Math.min(newHeight, 100 - startTop)) + '%';
                } else if (currentHandle.classList.contains('ne')) {
                    const newWidth = startWidth + (dx / containerRect.width * 100);
                    const newHeight = startHeight - (dy / containerRect.height * 100);
                    const newTop = startTop + (dy / containerRect.height * 100);
                    
                    watermarkSelector.style.width = Math.max(5, Math.min(newWidth, 100 - startLeft)) + '%';
                    if (newHeight >= 5 && newTop >= 0) {
                        watermarkSelector.style.top = newTop + '%';
                        watermarkSelector.style.height = newHeight + '%';
                    }
                } else if (currentHandle.classList.contains('nw')) {
                    const newWidth = startWidth - (dx / containerRect.width * 100);
                    const newHeight = startHeight - (dy / containerRect.height * 100);
                    const newLeft = startLeft + (dx / containerRect.width * 100);
                    const newTop = startTop + (dy / containerRect.height * 100);
                    
                    if (newWidth >= 5 && newLeft >= 0) {
                        watermarkSelector.style.left = newLeft + '%';
                        watermarkSelector.style.width = newWidth + '%';
                    }
                    if (newHeight >= 5 && newTop >= 0) {
                        watermarkSelector.style.top = newTop + '%';
                        watermarkSelector.style.height = newHeight + '%';
                    }
                }
            }
        });
        
        // 处理鼠标释放
        document.addEventListener('mouseup', function() {
            isDragging = false;
            isResizing = false;
            currentHandle = null;
        });
    }
    
    // 处理视频按钮点击事件
    processBtn.addEventListener('click', function() {
        if (!uploadedFile) {
            return;
        }
        
        // 获取水印选择器的位置和大小
        const videoRect = videoPreview.getBoundingClientRect();
        const selectorRect = watermarkSelector.getBoundingClientRect();
        
        // 计算水印在视频中的实际位置和大小
        const x = Math.round((selectorRect.left - videoRect.left) / videoRect.width * videoPreview.videoWidth);
        const y = Math.round((selectorRect.top - videoRect.top) / videoRect.height * videoPreview.videoHeight);
        const width = Math.round(selectorRect.width / videoRect.width * videoPreview.videoWidth);
        const height = Math.round(selectorRect.height / videoRect.height * videoPreview.videoHeight);
        
        // 显示第三步
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
        progressContainer.style.display = 'block';
        
        // 发送处理请求
        fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: uploadedFile.filename,
                x: x,
                y: y,
                width: width,
                height: height
            })
        })
        .then(response => response.json())
        .then(data => {
            progressContainer.style.display = 'none';
            
            if (data.success) {
                // 显示下载链接
                downloadContainer.classList.remove('hidden');
                downloadLink.href = data.downloadPath;
                showStatus(processStatus, '处理成功', 'success');
            } else {
                showStatus(processStatus, data.error || '处理失败', 'error');
            }
        })
        .catch(error => {
            progressContainer.style.display = 'none';
            console.error('Error:', error);
            showStatus(processStatus, '处理失败: ' + error.message, 'error');
        });
        
        // 模拟进度条（实际进度无法获取）
        simulateProgress();
    });
    
    // 模拟进度条
    function simulateProgress() {
        let progress = 0;
        const interval = setInterval(function() {
            progress += Math.random() * 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            progressBarFill.style.width = progress + '%';
            progressText.textContent = '处理中... ' + Math.round(progress) + '%';
        }, 500);
    }
    
    // 显示状态信息
    function showStatus(element, message, type) {
        element.textContent = message;
        element.className = 'status ' + type;
        element.classList.remove('hidden');
    }
});