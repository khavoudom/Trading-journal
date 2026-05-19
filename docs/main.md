# Trading Journal

A full-stack trading journal application for tracking, analyzing, and improving trading performance. Built with a React frontend and Express backend, using Prisma ORM with PostgreSQL.

## Architecture

```
trading/
├── server/          # Express API server (runs on :3001)
│   └── src/
│       ├── index.ts           # Server entry — HTTP server, socket, price stream, reminder queue
│       ├── app.ts             # Express app — middleware, routes, error handling
│       ├── config/            # Environment-based configuration
│       ├── controllers/       # Request handlers
│       ├── services/          # Business logic and external integrations
│       ├── repositories/      # Database access layer
│       ├── routes/            # Route definitions (Express Router)
│       ├── types/             # TypeScript interfaces and types
│       ├── validation/        # Zod schemas for request validation
│       ├── errors/            # Custom error classes
│       ├── database/          # Prisma client setup
│       ├── socket/            # Socket.IO WebSocket server
│       ├── queue/             # Cron-based reminder queue
│       ├── commands/          # CLI commands
│       ├── generated/         # Prisma-generated code
│       └── utils/             # Logging and utilities
├── frontend/        # React single-page application
│   └── src/
│       ├── App.tsx            # Root component
│       ├── router/            # App-level and space-level routing
│       ├── store/             # Zustand state stores
│       ├── services/          # API client services
│       ├── components/        # Shared UI components (layout, auth, shared)
│       ├── pages/             # Page-level components (one directory per route)
│       ├── constants/         # Application constants
│       ├── types/             # Shared frontend types
│       ├── utils/             # Formatting and utility functions
│       └── lib/               # Miscellaneous helpers
├── scripts/
│   └── setup.js     # One-command project setup script
├── docs/
│   └── main.md      # This file
└── package.json
```

## Frontend Routes

| Path                            | Page             | Description                                              |
| ------------------------------- | ---------------- | -------------------------------------------------------- |
| `/login`                        | LoginPage        | Authentication — email/password login                    |
| `/register`                     | RegisterPage     | New user registration                                    |
| `/space/:spaceId/dashboard`     | DashboardPage    | Home — recent trades, key metrics, portfolio chart       |
| `/space/:spaceId/portfolio`     | PortfolioPage    | Trade list, history, and management                      |
| `/space/:spaceId/analytics`     | AnalyticsPage    | Performance analytics, equity curve, distribution charts |
| `/space/:spaceId/calendar`      | CalendarPage     | Calendar view with trade events and drawings             |
| `/space/:spaceId/alerts`        | AlertsPage       | Risk alerts and notifications                            |
| `/space/:spaceId/risk-manager`  | RiskManagerPage  | Risk rules configuration and management                  |
| `/space/:spaceId/drawing-board` | DrawingBoardPage | Freeform drawing canvas for chart markups                |
| `/space/:spaceId/watchlist`     | WatchlistPage    | Track watched instruments                                |
| `/space/:spaceId/backtest`      | BacktestPage     | Strategy backtesting with equity curve preview           |
| `/space/:spaceId/schedule`      | SchedulePage     | Scheduled tasks and reminders                            |
| `/space/:spaceId/trade-plan`    | TradePlanPage    | Trading plan templates and rule setup                    |
| `/space/:spaceId/settings`      | SettingsPage     | User and space settings                                  |

## API Endpoints

All API routes are prefixed with `/api` unless noted.

**Authentication** (`/api/auth`)

- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Log in
- `GET /api/auth/me` — Get current user

**Trades** (`/api/trades`)

- `GET /api/trades?spaceId=` — List trades in space
- `GET /api/trades/:id` — Get trade by ID
- `POST /api/trades` — Create trade
- `PUT /api/trades/:id` — Update trade
- `DELETE /api/trades/:id` — Delete trade
- `GET /api/trades/analytics/summary?spaceId=` — Aggregated analytics (win rate, P&L, etc.)

**Trade Plans** (`/api/plan`)

- `GET /api/plan?spaceId=` — Get plan data
- `PUT /api/plan` — Update plan data

**Spaces** (`/api`)

- `GET /api/spaces` — List user's spaces
- `POST /api/spaces` — Create space
- `PUT /api/spaces/:id` — Update space
- `DELETE /api/spaces/:id` — Delete space

**Risk Rules** (`/api/risk-rules`)

- `GET /api/risk-rules?spaceId=` — List rules
- `POST /api/risk-rules` — Create rule
- `PUT /api/risk-rules/:id` — Update rule
- `DELETE /api/risk-rules/:id` — Delete rule

**Templates** (`/api/templates`)

- `GET /api/templates?spaceId=` — List templates
- `POST /api/templates` — Create template
- `PUT /api/templates/:id` — Update template
- `DELETE /api/templates/:id` — Delete template

**Calendar Events** (`/api`)

- `GET /api/events?spaceId=&date=` — List events
- `POST /api/events` — Create event
- `PUT /api/events/:id` — Update event
- `DELETE /api/events/:id` — Delete event

**Drawings** (`/api`)

- `GET /api/drawings?spaceId=&date=` — List drawings
- `POST /api/drawings` — Create drawing
- `PUT /api/drawings/:id` — Update drawing
- `DELETE /api/drawings/:id` — Delete drawing

**Scheduled Tasks** (`/api`)

- `GET /api/schedule-tasks?spaceId=` — List scheduled tasks
- `POST /api/schedule-tasks` — Create scheduled task
- `PUT /api/schedule-tasks/:id` — Update scheduled task
- `DELETE /api/schedule-tasks/:id` — Delete scheduled task

**Price Data** (`/api`)

- `GET /api/price?symbol=&from=&to=` — Historical price data
- `GET /api/price/realtime?symbol=` — Latest real-time price

**Settings** (`/api/settings`)

- `GET /api/settings/:spaceId` — Get space settings
- `PUT /api/settings/:spaceId` — Update space settings
- `PUT /api/settings/:spaceId/notifications` — Update notification preferences

**System**

- `GET /health` — Health check endpoint

## Data Model

### Trade

- `id` (string) — Unique identifier
- `instrument` (string) — Trading instrument (e.g., OANDA:XAUUSD)
- `side` (enum: Long | Short) — Trade direction
- `strategy` (string) — Strategy name
- `entryPrice`, `exitPrice` (number) — Entry and exit prices
- `quantity` (number) — Position size
- `entryTime`, `exitTime` (ISO timestamp) — Timestamps
- `profitLoss`, `profitLossPercent` (number) — Computed P&L
- `tags` (string[]) — User-defined tags
- `notes` (string, optional) — Trade notes
- `screenshots` (string[], optional) — Screenshot URLs
- `emotion` (string, optional) — Emotion at time of trade
- `planData`, `setupData` (TemplateTradeAttachment[], optional) — Template-based checklist data
- `spaceId` (string) — Parent space
- `status` (enum: pending | running | closed) — Trade lifecycle state

### Space

- `id`, `userId`, `name`, `createdAt`

### User

- `id`, `email`, `username`, `password` (hashed), `createdAt`

### PlanData

- `checklist`, `coreRules`, `tradingSetup`, `mistakes`, `identity` (string[])

### CalendarEvent

- `id`, `userId`, `spaceId`, `date`, `title`, `content`

### Drawing

- `id`, `userId`, `spaceId`, `date`, `title`, `sceneData` (JSON)

### ScheduledTask

- Task with date/time, type, reminder settings, recurrence config

### Notification

- System notifications with type, category, read state, and optional link path

### RiskRule

- Configurable risk management rules per space

### Template

- Trade plan templates with typed items (checkbox, text, number)

### Settings

- Per-space settings including notification preferences

## Key Services

**Finnhub Price Stream** — WebSocket connection to Finnhub for real-time price data on configured instruments (XAUUSD, GBPUSD, IXIC). Data is broadcast to all connected clients via Socket.IO.

**Socket.IO** — Real-time communication. Clients authenticate via JWT token on connection and join a user-scoped room for targeted events (price updates, task reminders).

**Reminder Queue** — Cron job running every minute that checks for due scheduled tasks, emits socket notifications, and sends email reminders.

**Prisma ORM** — PostgreSQL database accessed through Prisma client with a connection pool via `@prisma/adapter-pg`.

## Getting Started

```bash
# Install dependencies (root, server, frontend) and run migrations
npm run setup

# Edit credentials
vim server/.env

# Start development servers
cd server && npm run dev     # Backend on :3001
cd frontend && npm run dev   # Frontend on :5173
```

## Environment Variables

**server/.env**

- `PORT` — Server port (default: 3001)
- `JWT_SECRET` — Secret key for JWT signing
- `DATABASE_URL` — PostgreSQL connection string
- `FINNHUB_API_KEY` — Finnhub API key for real-time prices
- `REDIS_URL` — Redis connection string (optional)
