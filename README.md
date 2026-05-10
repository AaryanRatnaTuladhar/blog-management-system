# Blog Management System

Fullstack blog management app with:
- Next.js frontend
- NestJS backend
- PostgreSQL
- Redis (cache/rate-limiting support)
- RabbitMQ (async task publishing)

## Prerequisites
- Node.js 22+
- npm
- Docker + Docker Compose

## Project Structure
- `C:/Users/LENOVO/Desktop/aaryan-cms/frontend`
- `C:/Users/LENOVO/Desktop/aaryan-cms/backend`

## Environment
1. Copy `C:/Users/LENOVO/Desktop/aaryan-cms/.env.example` to `.env`.
2. Copy `C:/Users/LENOVO/Desktop/aaryan-cms/backend/.env.example` to `backend/.env`.
3. Copy `C:/Users/LENOVO/Desktop/aaryan-cms/frontend/.env.example` to `frontend/.env.local`.

## Start Infrastructure
```bash
docker compose up -d
```

This starts:
- Postgres on `5432`
- Redis on `6379`
- RabbitMQ on `5672` (`15672` management UI)

## Run Backend
```bash
cd backend
npm install
npm run start:dev
```

Backend URL: `http://localhost:4000`

## Run Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

## DB & Admin Seed
- TypeORM `synchronize: true` is enabled, so schema is created automatically.
- Default admin is auto-created on backend boot when both are set:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- Demo data can be seeded with:
```bash
cd backend
npm run seed
```
- Seeded login password for all seeded users is `password123`.
- Seeded users:
  - `admin@example.com`
  - `maya@example.com`
  - `ram@example.com`
  - `sita@example.com`

## Make Commands
From the repository root:
```bash
make up
make api
make web
make dev
make seed
make status
make down
```

`make up` starts Postgres, Redis, and RabbitMQ with Docker. `make api` runs the backend on `http://localhost:4000`. `make web` runs the frontend on `http://localhost:3000`. `make status` checks whether both are responding.

## API Summary
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Blogs:
  - `POST /blogs`
  - `PATCH /blogs/:id`
  - `DELETE /blogs/:id`
  - `POST /blogs/:id/submit`
  - `GET /blogs/mine`
- Public:
  - `GET /public/blogs`
  - `GET /public/blogs/:id`
- Comments:
  - `POST /blogs/:id/comments`
  - `POST /comments/:id/replies`
  - `DELETE /comments/:id`
- Notifications:
  - `GET /notifications`
  - `PATCH /notifications/:id/read`
- Admin:
  - `GET /admin/blogs/pending`
  - `POST /admin/blogs/:id/approve`
  - `POST /admin/blogs/:id/reject`
  - `GET /admin/users`
  - `PATCH /admin/users/:id/status`
