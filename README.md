# Trading Journal

A full-stack trading journal application for tracking, analyzing, and improving trading performance. Built with React, Express, Prisma ORM, and PostgreSQL.

## Architecture

```
trading/
├── server/               # Express API server (:3001)
│   ├── prisma/           # Database schema and migrations
│   └── src/
│       ├── index.ts           # Entry point — HTTP server, socket, price stream, reminder queue
│       ├── app.ts             # Express app setup — middleware, routes, error handling
│       ├── config/            # Environment-based configuration
│       ├── controllers/       # Request handlers (@/controllers)
│       ├── services/          # Business logic and external integrations
│       ├── repositories/      # Database access layer
│       ├── routes/            # Route definitions (Express Router)
│       ├── types/             # TypeScript types and interfaces
│       ├── validation/        # Zod schemas for request validation
│       ├── errors/            # Custom error classes
│       ├── database/          # Prisma client and connection management
│       ├── socket/            # Socket.IO WebSocket server
│       ├── queue/             # Cron-based reminder queue
│       ├── commands/          # CLI commands
│       ├── generated/         # Prisma-generated types
│       └── utils/             # Logging and utilities
├── frontend/              # React SPA (:5173)
│   └── src/
│       ├── App.tsx            # Root component
│       ├── main.tsx           # Vite entry point
│       ├── router/            # App-level and space-level routing (react-router-dom v7)
│       ├── store/             # Zustand state stores
│       ├── services/          # Axios API client services
│       ├── components/        # Shared UI components (auth, layout, loaders, notifications)
│       ├── pages/             # Page-level components (one directory per route)
│       ├── constants/         # Application constants
│       ├── types/             # Frontend TypeScript types
│       ├── utils/             # Formatting and utility functions
│       └── lib/               # Helper modules
├── scripts/
│   └── setup.js               # One-command project setup
├── docs/
│   └── main.md                # Full documentation
├── package.json               # Root workspace scripts (dev:full, build:full, test:full)
└── README.md                  # This file
```

## Frontend Routes

| Path                            | Page             | Description                                              |
| ------------------------------- | ---------------- | -------------------------------------------------------- |
| `/login`                        | LoginPage        | Email/password authentication                            |
| `/register`                     | RegisterPage     | New user registration                                    |
| `/space/:spaceId/dashboard`     | DashboardPage    | Home — recent trades, key metrics, portfolio chart       |
| `/space/:spaceId/portfolio`     | PortfolioPage    | Trade list, history, and management                      |
| `/space/:spaceId/analytics`     | AnalyticsPage    | Performance metrics, equity curve, distribution charts   |
| `/space/:spaceId/calendar`      | CalendarPage     | Calendar view with trade events and drawings             |
| `/space/:spaceId/alerts`        | AlertsPage       | Risk alerts and notifications                            |
| `/space/:spaceId/risk-manager`  | RiskManagerPage  | Risk rules configuration and management                  |
| `/space/:spaceId/drawing-board` | DrawingBoardPage | Freeform canvas for chart markups (Excalidraw)           |
| `/space/:spaceId/watchlist`     | WatchlistPage    | Track watched instruments                                |
| `/space/:spaceId/backtest`      | BacktestPage     | Strategy backtesting with equity curve preview           |
| `/space/:spaceId/schedule`      | SchedulePage     | Scheduled tasks and reminders                            |
| `/space/:spaceId/trade-plan`    | TradePlanPage    | Trading plan templates and checklist setup               |
| `/space/:spaceId/settings`      | SettingsPage     | User and space settings                                  |

## API Overview

All routes prefixed with `/api`. See [docs/main.md](docs/main.md) for full endpoint reference.

- **Auth** — Register, login, current user
- **Trades** — CRUD with analytics summary endpoint
- **Trade Plans** — Trading plan rules (checklist, core rules, setup, mistakes, identity)
- **Spaces** — Multi-space support for organizing trading contexts
- **Templates** — Reusable trade plan templates with typed items
- **Calendar** — Events and drawings per day
- **Risk Rules** — Configurable risk management per space
- **Scheduled Tasks** — Tasks with reminders and recurrence
- **Price Data** — Historical and real-time price feeds
- **Settings** — Per-space settings including notification preferences

## Data Model (Prisma + PostgreSQL)

Core entities: **User**, **Space**, **Trade**, **PlanRule**, **Template**, **CalendarEvent**, **Drawing**, **RiskRule**, **ScheduleTask**, **Notification**, **Setting**.

Trades support long/short sides, running/closed status, emotion tracking, and template-based checklist attachments. Prisma schema at `server/prisma/schema.prisma`.

## Key Technical Details

- **Real-time prices** — WebSocket connection to Finnhub, broadcast via Socket.IO to authenticated client rooms
- **Reminder system** — Cron job (every minute) checks due tasks, emits socket notifications, sends email via Nodemailer
- **Authentication** — JWT-based, protected routes via middleware
- **Validation** — Zod schemas for all request bodies
- **State management** — Zustand on the frontend
- **UI framework** — React 19, Tailwind CSS v4, Base UI, Recharts, Tiptap editor, Excalidraw canvas, Sonner toasts
- **Testing** — Vitest on both server and frontend

## Getting Started

```bash
# Install dependencies (root + server + frontend) and run Prisma migrations
npm run setup

# Configure environment
cp server/.env.example server/.env

# Start both servers concurrently
npm run dev:full
# → Backend at http://localhost:3001
# → Frontend at http://localhost:5173
```

### Environment Variables (server/.env)

- `PORT` — Server port (default: 3001)
- `JWT_SECRET` — Secret key for JWT signing
- `DATABASE_URL` — PostgreSQL connection string
- `FINNHUB_API_KEY` — API key for real-time price data
- `REDIS_URL` — Optional Redis connection string
