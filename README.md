# DailyCheck — Personal Dashboard

A premium, local-first personal dashboard inspired by **Notion** and **Discord**. Manage subscriptions, track spending, organize tasks, set goals, take notes, and see everything in a calendar — all in one clean, dark-mode interface.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Features

- **Dashboard** — monthly subscription cost, spending, upcoming payments, tasks due today, goal progress, and recent notes at a glance.
- **Subscriptions** — track recurring costs with billing cycles, renewal countdowns, categories, and monthly/yearly totals.
- **Expenses** — log spending, break it down by category, and see your monthly overview.
- **Tasks** — due dates, priorities, statuses, filtering, and one-click completion.
- **Goals** — animated progress bars, deadlines, categories, and quick increment controls.
- **Notes** — a Notion-style note system with full-text search and tag filtering.
- **Calendar** — a unified month view combining renewals, task deadlines, and goal deadlines.

## 🧱 Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling (dark mode by default)
- **lucide-react** for icons
- **localStorage** for persistence — no database, fully private and local-first
- Deploys to **Vercel** with zero configuration

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sample data is seeded automatically on first load, so the app feels alive immediately.

### Build for production

```bash
npm run build
npm start
```

## 📦 Deploy to Vercel

1. Push this repo to GitHub.
2. Import it on [vercel.com/new](https://vercel.com/new).
3. Accept the defaults (Next.js is auto-detected) and deploy.

No environment variables are required — all data lives in the browser.

## 🗂️ Project structure

```
dailycheck-app/
├── app/                  # App Router pages
│   ├── layout.tsx        # Root layout, providers, app shell
│   ├── page.tsx          # Dashboard
│   ├── subscriptions/
│   ├── expenses/
│   ├── tasks/
│   ├── goals/
│   ├── notes/
│   └── calendar/
├── components/
│   ├── AppShell.tsx      # Layout shell + PageHeader
│   ├── Sidebar.tsx       # Discord-style sidebar
│   ├── nav.ts            # Navigation config
│   └── ui.tsx            # Reusable UI primitives (Card, Button, Modal…)
└── lib/
    ├── types.ts          # Domain types
    ├── store.tsx         # localStorage-backed state (React Context)
    ├── sample-data.ts    # Seed data
    └── utils.ts          # Formatting & date helpers
```

## 🔒 Data & privacy

All data is stored in your browser's `localStorage` under the key `dailycheck.data.v1`. Nothing is sent to a server. Clearing your browser data resets the app (and re-seeds the sample data).

---

Built with ❤️ using Claude Code.
