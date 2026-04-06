# Scout Report: Chatbot API Connection Investigation

**Date:** 2026-04-07
**Investigator:** scout-api-issue
**Status:** COMPLETED

---

## Summary

Investigated why chatbot shows demo responses instead of connecting to real AI backend. Found that the **current code has proper API integration**, but there are potential issues with environment variables and possibly stale builds.

---

## Key Findings

### 1. Which Component is Being Used?

**File:** `src/pages/index.astro` (line 3-4)
```astro
import ChatFrameWithGlassmorphismAndVietnamese from '../components/chat/chat-frame-with-glassmorphism-and-vietnamese';
<ChatFrameWithGlassmorphismAndVietnamese client:load />
```

**Result:** The Vietnamese component (with real API) is being used, NOT the demo component.

---

### 2. Is There Hardcoded Demo Code?

**Two components exist:**

| Component | Location | API Integration? |
|-----------|----------|------------------|
| **Vietnamese version** (ACTIVE) | `src/components/chat/chat-frame-with-glassmorphism-and-vietnamese.tsx` | YES - Real API call to `/api/chat` (lines 380-443) |
| **Demo version** (INACTIVE) | `src/components/chat/chat-frame-with-glassmorphism-and-demo.tsx` | NO - Hardcoded response (lines 456-463) |

**Demo component hardcoded message (line 460):**
```typescript
content: `I received your message: "${text}"\n\nThis is a demo response. In production, this would be connected to your AI backend.`
```

**Note:** The user reported seeing Vietnamese text "Tôi đã nhận được tin nhắn... Đây là phản hồi demo..." but the source code shows this message is in **English**. This suggests a **stale build** - the running code doesn't match the current source.

---

### 3. API Endpoint Analysis

**File:** `src/pages/api/chat.ts`

**Status:** Properly implemented with:
- Firepass API integration (lines 135-159)
- Streaming SSE responses (lines 80-417)
- Tool call support with execution
- Database persistence for chat history
- Error handling

**Required Environment Variables (lines 135-137):**
```typescript
const apiKey = import.meta.env.PUBLIC_FIREPASS_API_KEY;
const model = import.meta.env.PUBLIC_FIREPASS_MODEL;
const baseUrl = import.meta.env.PUBLIC_FIREPASS_BASE_URL;
```

---

### 4. Environment Configuration Check

**File:** `.env.example` only shows:
```
DATABASE_URL=postgresql://username:password@localhost:5432/claudekit_chatbot
```

**Missing from .env.example:**
- `PUBLIC_FIREPASS_API_KEY`
- `PUBLIC_FIREPASS_MODEL`
- `PUBLIC_FIREPASS_BASE_URL`

**Likely Root Cause:** If these env vars are not set in the actual `.env` file, the API will fail.

---

### 5. UI-to-API Flow Analysis

```
User Input
    |
    v
ChatFrameWithGlassmorphismAndVietnamese (src/components/chat/chat-frame-with-glassmorphism-and-vietnamese.tsx:380)
    |
    v
fetch('/api/chat', {method: 'POST', body: JSON.stringify({message, sessionId})}) (line 388)
    |
    v
POST handler in src/pages/api/chat.ts (line 26)
    |
    v
Firepass API call with streaming (line 142)
    |
    v
SSE response back to UI (lines 403-431)
```

**Error handling in UI (lines 433-439):**
```typescript
} catch (error) {
  toast.error('Lỗi: ' + (error instanceof Error ? error.message : 'Unknown'));
  setMessages(prev => [...prev, {
    id: Date.now().toString(),
    role: 'assistant' as const,
    content: '❌ Không thể kết nối AI backend. Kiểm tra API key và kết nối mạng.',
  }]);
}
```

---

## Root Cause Analysis

### Most Likely Causes (in order):

1. **Stale Build (60% probability)**
   - The dist folder was last built at 00:59 on Apr 7
   - User may be seeing old code if server wasn't restarted
   - Vietnamese translation of demo message might have existed in earlier version

2. **Missing Environment Variables (30% probability)**
   - `.env.example` is incomplete (missing Firepass vars)
   - If `PUBLIC_FIREPASS_API_KEY` is not set, API calls will fail
   - Check if `.env` file contains all required variables

3. **Server Not Running (10% probability)**
   - If the Astro dev server isn't running, requests to `/api/chat` will 404

---

## Recommended Actions

### Immediate:

1. **Rebuild and restart:**
   ```bash
   npm run build
   npm start
   ```
   Or for dev mode:
   ```bash
   npm run dev
   ```

2. **Verify environment variables:**
   Check `.env` file contains:
   ```
   PUBLIC_FIREPASS_API_KEY=your_api_key_here
   PUBLIC_FIREPASS_MODEL=your_model_name
   PUBLIC_FIREPASS_BASE_URL=https://api.firepass.example.com
   DATABASE_URL=postgresql://...
   ```

3. **Clear caches:**
   ```bash
   rm -rf .astro dist node_modules/.vite
   ```

### Debug Steps:

1. Open browser DevTools Network tab
2. Send a chat message
3. Check if request to `/api/chat` is made
4. Check response status:
   - 200 with streaming data = working
   - 404 = server not running
   - 500 = API key missing or invalid

---

## File Paths (Absolute)

- Active component: `D:/project/Clone/ck/claudekit-chatbot-astro/src/components/chat/chat-frame-with-glassmorphism-and-vietnamese.tsx`
- Demo component: `D:/project/Clone/ck/claudekit-chatbot-astro/src/components/chat/chat-frame-with-glassmorphism-and-demo.tsx`
- Page: `D:/project/Clone/ck/claudekit-chatbot-astro/src/pages/index.astro`
- API endpoint: `D:/project/Clone/ck/claudekit-chatbot-astro/src/pages/api/chat.ts`
- Environment: `D:/project/Clone/ck/claudekit-chatbot-astro/.env`

---

## Unresolved Questions

1. Does the `.env` file contain the Firepass API configuration?
2. Is the Astro dev server currently running?
3. Was there an earlier version with Vietnamese hardcoded demo text?
