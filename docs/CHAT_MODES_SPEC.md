# Chat Message Order Modes Specification

## Overview

Two message display modes: **asc** (queue/fifo) and **desc** (reverse/lifo).

## ASC Mode (Queue/WeChat Style)

**Principle**: Older messages at queue head (top), newer messages at queue tail (bottom).

### Layout
```
[更多按钮] ← Queue head direction (top), scroll up to see
[msg_oldest]
[msg_older]
...
[msg_newest] ← Queue tail
[输入框]   ← Queue tail direction (bottom), fixed
```

### Message Loading Rules

1. **Initial Load (30 messages)**:
   - Backend sends: `[newest, ..., oldest]` (newest first)
   - Client prepends each: `[oldest, ..., newest]` ✅

2. **New Message (user sends)**:
   - Client appends to queue tail
   - Result: `[oldest, ..., newest, new_msg]` ✅

3. **Load More (older messages)**:
   - Client prepends older messages below button
   - Result: `[older_msg, oldest, ..., newest]` ✅

### Operations Summary

| Operation | Action | Result |
|-----------|--------|--------|
| Initial load | prepend | oldest at top |
| New message | append | newest at bottom |
| Load more | prepend (before oldest) | older above oldest |

### New Message Position (ASC)
```
┌─────────────────────────────────┐
│           Header                 │
├─────────────────────────────────┤
│         [更多按钮]               │  ← 队列头
│         [msg1 - 最老]           │
│         [msg2]                  │
│         ...                      │
│         [msg30 - 最新]          │
├─────────────────────────────────┤
│    [新消息] ← append 到这里     │  ← 输入框上方
│  [输入框]              [发送]    │
└─────────────────────────────────┘
```

### Load More Position (ASC)
```
┌─────────────────────────────────┐
│  [更多按钮] ← 按钮在顶部         │
├─────────────────────────────────┤
│  [新加载的老消息] ← prepend      │  ← 比最老的更老
│         ↓                       │
│         [msg1 - 最老]           │
│         [msg2]                  │
│         ...                     │
│         [msg30 - 最新]          │
│  [输入框]              [发送]   │
└─────────────────────────────────┘
```

---

## DESC Mode (Reverse)

**Principle**: Newer messages at queue head (top), older messages at queue tail (bottom).

### Layout
```
[输入框]   ← Queue head direction (top), fixed
[msg_newest] ← Queue head
[msg_newer]
...
[msg_oldest] ← Queue tail
[更多按钮] ← Queue tail direction (bottom), scroll down to see
```

### Message Loading Rules

1. **Initial Load (30 messages)**:
   - Backend sends: `[newest, ..., oldest]` (newest first)
   - Client prepends each: `[newest, ..., oldest]` ✅

2. **New Message (user sends)**:
   - Client prepends to queue head
   - Result: `[new_msg, newest, ..., oldest]` ✅

3. **Load More (older messages)**:
   - Client appends older messages before button
   - Result: `[newest, ..., oldest, older_msg]` ✅

### Operations Summary

| Operation | Action | Result |
|-----------|--------|--------|
| Initial load | prepend | newest at top |
| New message | prepend | newest at top |
| Load more | append (after oldest) | older below oldest |

### New Message Position (DESC)
```
┌─────────────────────────────────┐
│           Header                 │
├─────────────────────────────────┤
│  [输入框]              [发送]    │
│    [新消息] ← prepend 到这里     │  ← 输入框下方
├─────────────────────────────────┤
│         [msg1 - 最新]           │  ← 队列头
│         [msg2]                  │
│         ...                      │
│         [msg30 - 最老]          │
│         [更多按钮]               │  ← 队列尾
└─────────────────────────────────┘
```

### Load More Position (DESC)
```
┌─────────────────────────────────┐
│  [输入框]              [发送]   │
│         [msg1 - 最新]           │
│         [msg2]                  │
│         ...                     │
│         [msg30 - 最老]         │
├─────────────────────────────────┤
│  [新加载的消息] ← append        │  ← 比最老的更新
│  [更多按钮] ← 按钮在底部         │
└─────────────────────────────────┘
```

---

## Technical Implementation

### Backend
- Storage key: `timestamp` (ISO string)
- Initial load: `storage.list({reverse: true, limit: 31})` → newest first
- Load more: filter by timestamp < cursor, sort descending

### Frontend
- `messageOrder` state: `'asc'` or `'desc'`
- `displayedTimestamps` Set: deduplication
- `isReceivingHistory` flag: distinguish initial load vs new messages

### Key Functions
- `addMsg(..., isHistory)`: Add single message
  - asc + isHistory=true: prepend
  - asc + isHistory=false: append
  - desc: prepend
- `addMsgOld()`: Add older messages (load more)
  - asc: insertBefore(button)
  - desc: insertAfter(oldest)

---

## Test Scenarios

### ASC Mode
1. Enter room → 30 messages displayed with oldest at top
2. Send message → appears at bottom, above input
3. Click "Load more" → older messages appear at top, above existing
4. Message times increase from top to bottom (older → newer)

### DESC Mode
1. Enter room → 30 messages displayed with newest at top
2. Send message → appears at top, below input
3. Click "Load more" → older messages appear at bottom, below existing
4. Message times decrease from top to bottom (newer → older)
