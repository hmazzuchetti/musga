# Musga - Vocal Marketplace Platform

A SaaS platform connecting singers with DJs, enabling singers to upload and sell vocal tracks for electronic music production.

## Features

- **User Authentication**: JWT-based authentication with singer/DJ roles
- **Vocal Upload**: Singers can upload vocal tracks with metadata (genre, BPM, key, licensing)
- **Licensing System**: Exclusive and non-exclusive licensing options
- **Audio Previews**: 30-second preview clips generated automatically
- **Search & Discovery**: Advanced filtering for DJs to find perfect vocals
- **Secure Payments**: Stripe integration for purchases with marketplace payouts
- **Leaderboard**: Top singers based on sales and feedback
- **Community Features**: Comments and feedback system

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: NestJS with TypeORM
- **Database**: PostgreSQL
- **Storage**: Local file system (upgradeable to AWS S3)
- **Payments**: Stripe
- **Audio Processing**: FFmpeg
- **Deployment**: Docker

## Project Structure

```
musga/
├── frontend/          # Next.js React application
├── backend/           # NestJS API server
├── shared/            # Shared types and utilities
├── uploads/           # Local file storage
├── docker-compose.yml # Development environment
└── README.md
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start development environment**:
   ```bash
   npm run docker:up
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432

## Development Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run start` - Start both applications in production mode
- `npm run docker:up` - Start PostgreSQL and Redis containers
- `npm run docker:down` - Stop all containers

## Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories:

### Backend (.env)
```
DATABASE_URL=postgresql://musga:musga123@localhost:5432/musga
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Deployment

The project is configured for easy deployment with Docker. See deployment documentation for specific platform instructions.

## Cost Optimization

This prototype is designed to be cost-effective:
- Local file storage instead of AWS S3
- Simple in-memory caching instead of Redis
- Basic logging without external services
- Minimal third-party dependencies

## License

Private - All rights reserved