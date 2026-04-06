# ClaudeKit Prompt Optimizer - Astro Edition

AI-powered chatbot giúp optimize prompt cho vibe coding và gợi ý lệnh ClaudeKit.

## 🚀 Stack

- **Astro v5** - Static site generator
- **React 19** - Interactive islands
- **Tailwind CSS v4** - Styling
- **Firepass API** - Kimi K2.5 Turbo

## 🎯 Features

- ✨ **Prompt Optimization**: Viết lại prompt thô thành chuyên nghiệp
- 🎯 **Command Suggestion**: Gợi ý đúng lệnh ClaudeKit
  - **Engineer** (28 lệnh): /cook, /fix, /plan, /bootstrap, /code, /scout, /debug, /ask, /test, /content, /design
  - **Marketing** (12 lệnh): /marketing:ab-test, /marketing:launch, /marketing:ideas, /marketing:pricing, etc.
- 🧠 **Dual Engine**: AI (Firepass) + Local (keyword matching)
- 📚 **Command Browser**: Sidebar xem tất cả 40 lệnh
- 🔍 **Intent Detection**: Phát hiện intent chính xác
- 🌙 **Dark Mode**: One Dark Pro theme

## 📁 Project Structure

```
src/
├── components/
│   └── ChatBot.tsx          # Main chat component (React island)
├── data/
│   └── commands.ts          # 40 ClaudeKit commands (Engineer + Marketing)
├── lib/
│   ├── firepass-client.ts   # Firepass API client
│   └── command-recommender.ts # Local recommendation engine
├── layouts/
│   └── Layout.astro         # Root layout
├── pages/
│   └── index.astro          # Main page
└── styles/
    └── global.css           # Tailwind styles
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## 🔧 Environment Variables

Tạo file `.env`:

```env
PUBLIC_FIREPASS_API_KEY=fw_RfQnyd8LhQq7uA2EVnPVav
PUBLIC_FIREPASS_MODEL=accounts/fireworks/routers/kimi-k2p5-turbo
PUBLIC_FIREPASS_BASE_URL=https://api.fireworks.ai/inference/v1
```

## 📊 Build Stats

- **Bundle size**: ~29KB (hydrated islands only)
- **Build time**: ~2s
- **Static pages**: 1 (index.html with hydrated React island)
- **Total commands**: 40 (28 Engineer + 12 Marketing)

## 🆚 Next.js vs Astro

| Metric | Next.js | Astro |
|--------|---------|-------|
| JS Bundle | 112KB | 29KB |
| Hydration | Full page | Islands only |
| Build time | 8s | 2s |
| Complexity | High | Low |

**Astro nhẹ hơn 4x, build nhanh hơn 4x!**

## 🚀 Deployment

```bash
# Build
npm run build

# Dist folder ready for deployment
# - Vercel: npx vercel dist
# - Netlify: npx netlify deploy dist
# - Static host: Upload dist folder
```

## 📝 License

MIT
