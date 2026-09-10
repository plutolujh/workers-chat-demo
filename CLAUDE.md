# workers-chat-demo

Cloudflare Workers 实时聊天应用。

## 部署

### GitHub Actions（主要方式）
推送到 `master` 分支自动触发部署到 Cloudflare Workers。

Actions workflow: `.github/workflows/deploy.yml`

## 环境变量
- `SHOTSYNC_URL`: 图片上传服务 URL
- `SHOTSYNC_TOKEN`: 图片上传 token（通过 `wrangler secret put` 设置）

## 消息排序模式

参考文档: `docs/CHAT_MODES_SPEC.md`

- **asc 模式**: 队列风格，最老的消息在顶部，最新的在输入框上方
- **desc 模式**: 倒序，最新的在顶部，最老的在底部

切换按钮在输入框左侧（↑）。
