# Backend API

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run prisma:generate
npm run prisma:migrate
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API info
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course detail
- (more endpoints to be implemented)
