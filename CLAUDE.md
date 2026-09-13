# workers-chat-demo

Cloudflare Workers 实时聊天应用。

## 部署

### GitHub Actions（主要方式）
推送到 `master` 分支自动触发部署到 Cloudflare Workers。

Actions workflow: `.github/workflows/deploy.yml`

## 环境变量
- `SHOTSYNC_URL`: 图片/视频上传服务 URL
- `SHOTSYNC_TOKEN`: 图片/视频上传 token（通过 `wrangler secret put` 设置）
- `MINIMAX_ASR_API_KEY`: MiniMax 语音识别 API Key（通过 `wrangler secret put` 设置），用于语音转文字功能

## 语音转文字功能

### 功能说明
- 点击输入框旁边的 🎤 按钮开始录音
- 再次点击停止录音并自动转写
- 转写结果自动填入输入框，可直接发送
- 支持中文、英文、日文、韩文自动检测

### 配置步骤
```bash
wrangler secret put MINIMAX_ASR_API_KEY
# 输入你的 MiniMax API Key
```

### 技术实现
- 前端：使用 MediaRecorder API 录音，格式为 webm
- 后端：Worker 代理请求到 MiniMax ASR API（避免 API Key 暴露在前端）
- API：POST /api/asr

## 文件支持

- **图片**: 压缩后上传（最大宽度 800px，质量 0.7）
- **视频**: 上传原文件 + 自动生成缩略图（最大 50MB）
- **其他文件**: 直接上传（PDF, DOC, XLS, TXT 等）

## 消息排序模式

参考文档: `docs/CHAT_MODES_SPEC.md`

- **asc 模式**: 队列风格，最老的消息在顶部，最新的在输入框上方
- **desc 模式**: 倒序，最新的在顶部，最老的在底部

切换按钮在输入框左侧（↑）。
