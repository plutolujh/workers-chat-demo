# Cloudflare Edge Chat Demo

A real-time chat application running 100% on [Cloudflare Workers](https://workers.cloudflare.com/) with [Durable Objects](https://blog.cloudflare.com/introducing-workers-durable-objects) for stateful chat rooms.

**Live Demo:** https://chat.hao123456.cn

## Features

### Real-time Messaging
- WebSocket-based real-time chat
- Message history persistence in Durable Objects storage
- Multi-room support with unique room IDs
- User presence indicators

### Rich Media Support
- **Images** - Upload with compression, thumbnail generation, full-screen viewer with zoom/rotate
- **Videos** - Upload with thumbnail preview, inline playback, progress indicator
- **PDF** - Opens in new tab using browser's built-in PDF viewer
- **Office Documents** (docx, xlsx) - Preview via Microsoft Office Online (desktop) or direct download (mobile)
- **Voice Messages** - Record and send audio files

### Quote/Reply (WeChat-style)
- Reply to specific messages with quoted context
- Visual indicator of quoted message in thread

### Advanced Features
- **Message Recall** - Delete your own messages after sending
- **Voice to Text** - Convert voice recordings to text using MiniMax ASR API
- **Random Username Generator** - Quick anonymous chat with generated names
- **Multi-language** - English / 中文 toggle
- **Themes** - Dark, Light, Midnight, Sunset themes
- **Rate Limiting** - IP-based rate limiting via Durable Objects

### Technical Highlights
- Durable Objects for chat room state and WebSocket management
- WebSocket Hibernation API for cost-effective connections
- shotsync integration for file storage (images, videos, documents)
- ASR proxy for voice-to-text functionality
- CORS-enabled API endpoints

## Architecture

```
┌─────────────┐     WebSocket      ┌──────────────────┐
│   Browser   │ ◄──────────────► │  Durable Object  │
│  (chat.html)│                  │    (ChatRoom)    │
└─────────────┘                  └────────┬─────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                    ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
                    │  Messages  │  │   Users   │  │   Rate    │
                    │  Storage  │  │   List    │  │  Limiter  │
                    └───────────┘  └───────────┘  └───────────┘
```

The chat app uses a Durable Object to control each chat room. Users connect via WebSockets, messages are broadcast to all users in real-time. Chat history is stored in durable storage for persistence.

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (no framework dependencies)
- **Backend:** Cloudflare Workers (chat.mjs)
- **State:** Cloudflare Durable Objects
- **Storage:** shotsync (R2-based file storage)
- **ASR:** MiniMax Speech-to-Text API

## Deployment

```bash
# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler deploy
```

### Required Secrets

```bash
npx wrangler secret put SHOTSYNC_TOKEN    # shotsync authentication
npx wrangler secret put MINIMAX_ASR_API_KEY  # MiniMax ASR API (optional)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload image/video with thumbnail |
| `/api/list` | GET | List room messages |
| `/api/asr` | POST | Proxy to MiniMax ASR |
| `/api/room` | DELETE | Delete a room |
| `/websocket` | WS | WebSocket connection |

## File Structure

```
src/
├── chat.html    # Frontend (single file, no dependencies)
├── chat.mjs     # Backend (Workers + Durable Objects)
```

## Learn More

- [Durable Objects Documentation](https://developers.cloudflare.com/workers/learning/using-durable-objects)
- [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/api/websockets/)
- [shotsync](https://github.com/plutolujh/shotsync) - File storage service
