# Trading Journal Server

Backend API server for the Trading Journal application.

## Features

- RESTful API for trade management
- In-memory data storage (replace with database for production)
- Analytics endpoints for trade performance
- TypeScript for type safety
- Express.js framework

## API Endpoints

### Trades

- `GET /api/trades` - Get all trades
- `GET /api/trades/:id` - Get trade by ID
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade

### Analytics

- `GET /api/trades/analytics/summary` - Get analytics summary (win rate, P&L, etc.)

### Health

- `GET /health` - Health check endpoint

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd server
npm install
```

### Running the server

Development (with hot reload):

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

The server runs on `http://localhost:3001` by default.

## Project Structure

```
server/
├── src/
│   ├── index.ts          # Main server file
│   ├── controllers/      # Request handlers
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript interfaces
│   └── middleware/      # Custom middleware
├── package.json
├── tsconfig.json
└── README.md
```

## Data Model

### Trade

```typescript
{
  id: string;
  instrument: string;
  strategy: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: string;  // ISO timestamp
  exitTime: string;   // ISO timestamp
  profitLoss: number;
  profitLossPercent: number;
  tags: string[];
  notes?: string;
  screenshots?: string[];
}
```

## Next Steps

1. Add database integration (PostgreSQL, MongoDB, etc.)
2. Add authentication and authorization
3. Add request validation middleware
4. Add logging
5. Add unit tests
6. Add Docker configuration
