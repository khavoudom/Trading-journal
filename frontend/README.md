# Trading Journey

A full-stack trading journal application for tracking trades, analyzing performance, and maintaining trading discipline.

## Features

- **Trade Logging** — Record trades with instrument, side, strategy, entry/exit prices, quantity, and timestamps
- **Portfolio Tracking** — View equity curve and portfolio value over time
- **Analytics Dashboard** — Win rate, trade distribution, strategy P&L breakdown, and equity curve charts
- **Trading Plan & Discipline** — Define a discipline checklist and trading setup; track compliance per trade with discipline and setup scores
- **Calendar View** — See trading activity on a calendar
- **Multi-Instrument** — Supports XAU/USD, GBP/USD, and NASDAQ (US Tech 100) with contract size calculations
- **User Authentication** — JWT-based registration, login, and profile management
- **Responsive UI** — Built with Tailwind CSS 4 and React 19

## Tech Stack

| Layer    | Technology                                                         |
| -------- | ------------------------------------------------------------------ |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Recharts, React Router |
| Backend  | Express, SQLite, JWT (jsonwebtoken + bcryptjs)                     |
| Testing  | Vitest, React Testing Library                                      |
| Tooling  | ESLint, Prettier, Husky                                            |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### Environment

A `.env` file in the root directory configures the API base URL:

```
VITE_API_BASE_URL=http://localhost:3001/api
```

### Development

```bash
# Start both frontend (Vite) and backend (Express) concurrently
npm run dev:full
```

This runs:

- **Frontend** at `http://localhost:5173`
- **Backend** at `http://localhost:3001`

Or start them individually:

```bash
npm run dev       # frontend only
cd server && npm run dev  # backend only
```

### Build

```bash
npm run build
```

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── auth/           # Login, Register, ProtectedRoute
│   │   ├── dashboard/      # TradeForm, AnalyticsPage, CalendarView
│   │   ├── layout/         # DashboardLayout
│   │   └── ui/             # Button, Card, StatCard, Table
│   ├── pages/              # Route pages
│   ├── services/           # API client and service layer
│   ├── store/              # Zustand stores (trades, auth)
│   ├── types/              # TypeScript type definitions
│   └── constants/          # Instrument definitions and config
├── server/                 # Express backend
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── database/       # SQLite setup and queries
│       ├── middleware/      # Auth middleware
│       ├── routes/         # Express routes
│       ├── services/       # Business logic
│       └── types/          # TypeScript types
└── docs/                   # Additional documentation
```

## API Endpoints

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| POST   | `/api/auth/register`            | Register a new user |
| POST   | `/api/auth/login`               | Login               |
| GET    | `/api/auth/profile`             | Get user profile    |
| PATCH  | `/api/auth/profile`             | Update profile      |
| GET    | `/api/trades`                   | List trades         |
| POST   | `/api/trades`                   | Create a trade      |
| GET    | `/api/trades/:id`               | Get trade details   |
| PUT    | `/api/trades/:id`               | Update a trade      |
| DELETE | `/api/trades/:id`               | Delete a trade      |
| GET    | `/api/trades/analytics/summary` | Analytics summary   |
| GET    | `/api/plan`                     | Get trading plan    |
| PUT    | `/api/plan`                     | Update trading plan |
| GET    | `/health`                       | Health check        |

## Instruments

The journal supports three instruments with contract sizes for P&L calculation:

- **XAU/USD** (Gold) — 1 lot = 100 ounces
- **GBP/USD** — 1 lot = 100,000 units
- **NASDAQ** (US Tech 100) — 1 lot = 1 contract × $20/pt

# Trading-journey
