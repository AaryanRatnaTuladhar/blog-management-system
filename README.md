# Aaryan CMS — Blog Management System

A fullstack editorial workflow with role-based dashboards, async approvals, threaded comments, and in-app notifications.

| Layer        | Stack                                                              |
| ------------ | ------------------------------------------------------------------ |
| Frontend     | Next.js 16 (App Router), React 19, Tailwind v4, lucide-react       |
| Backend      | NestJS 11, TypeORM, Passport JWT, class-validator                  |
| Persistence  | PostgreSQL 16                                                      |
| Cache        | Redis 7 (cached public blog list/detail with invalidation)         |
| Queue        | RabbitMQ 3 (publish + notification jobs after approval)            |
| Rate limit   | `@nestjs/throttler` (5 comments / minute / user)                   |

---

## Features (mapped from the task brief)

### Authentication
- Register / login (`POST /auth/register`, `POST /auth/login`).
- JWT bearer auth (`Authorization: Bearer …`); `/auth/me` returns the current user.
- Role-based access — every account is `user` or `admin`. The default admin is created automatically from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### Blog management
- Authors create drafts in the dashboard.
- Drafts can be edited or deleted (approved blogs are locked from edits).
- Submitting a draft moves it to `pending`. Admins approve or reject; only approved blogs are publicly visible.
- Approval triggers the public list/detail cache invalidation and asynchronous queue jobs (RabbitMQ).

### Comments
- Threaded comments and nested replies on approved blogs.
- Authors can soft-delete their own comments (admins can also moderate).
- Comment endpoints are throttled to 5 per minute / user.

### Notifications
- Notifications are created for blog approval, rejection, comments, and replies.
- Notification dispatch is also queued to RabbitMQ for async processing (consumer is intentionally minimal — the in-app store is the source of truth).

### Caching
- Public list (`/public/blogs`) and detail (`/public/blogs/:id`) are cached in Redis (TTL 120s) and invalidated on approve / reject / new comment / blog delete.

---

## Project layout

```
blog-management-system/
├── backend/                # NestJS API
│   └── src/
│       ├── auth/           # register, login, JWT strategy
│       ├── users/          # entity + bootstrap default admin
│       ├── blogs/          # CRUD, submit, public listing, admin actions
│       ├── comments/       # threaded comments + moderation
│       ├── notifications/  # in-app notifications + unread count
│       ├── admin/          # admin-only endpoints (stats, approvals, users, comments)
│       ├── infrastructure/ # cache, queue, rate-limit modules
│       ├── common/         # decorators + guards
│       ├── seed.ts         # demo seeder
│       └── main.ts
└── frontend/               # Next.js App Router
    └── src/
        ├── app/
        │   ├── page.tsx                  # public landing
        │   ├── blogs/                    # public list + detail
        │   ├── login, register/          # auth (with role-based redirect)
        │   ├── dashboard/                # user-only routes (auth-gated)
        │   │   ├── page.tsx              #   overview
        │   │   ├── blogs/                #   list / new / [id]/edit
        │   │   └── notifications/
        │   └── admin/                    # admin-only routes (auth-gated)
        │       ├── page.tsx              #   overview + stats
        │       ├── approvals/            #   pending queue with reject reasons
        │       ├── blogs/                #   all blogs
        │       ├── users/                #   activate / deactivate
        │       ├── comments/             #   moderation
        │       └── notifications/
        ├── components/                   # PublicHeader, DashboardShell, AdminShell, AuthGate, BlogCard, …
        └── lib/                          # api client, auth context, types
```

---

## Prerequisites
- Node.js 22+
- npm
- Docker + Docker Compose (for Postgres, Redis, RabbitMQ)

## Environment

Copy the example envs (already provided checked-in):

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local 2>/dev/null || echo 'NEXT_PUBLIC_API_URL=http://localhost:4000' > frontend/.env.local
```

Defaults are local-friendly:
- Postgres on host port `5433` (mapped from container 5432)
- Redis on `6379`
- RabbitMQ on `5672` (management UI on `15672`)
- Backend on `4000`, frontend on `3000`
- Default admin created on backend boot: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (default `admin@example.com` / `password123`)

## Run it

### 1. Start infrastructure
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
npm install
npm run start:dev      # http://localhost:4000
```

`TypeORM` runs with `synchronize: true` so the schema is created automatically on first boot.

### 3. (Optional) Seed demo data
```bash
cd backend
npm run seed
```

This (re)creates the demo accounts (each with password `password123`) and 7 approved blogs:
- `admin@example.com`
- `maya@example.com`
- `ram@example.com`
- `sita@example.com`

### 4. Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

### Make shortcuts
From the repository root:
```bash
make up      # docker compose up -d
make api     # backend dev
make web     # frontend dev
make dev     # both at once
make seed    # run the seeder
make status  # ping both ports
make down    # stop docker
```

---

## API summary

### Public
| Method | Path                            | Notes                                    |
| ------ | ------------------------------- | ---------------------------------------- |
| GET    | `/health`                        | Service health                           |
| GET    | `/public/blogs`                  | Cached list of approved blogs            |
| GET    | `/public/blogs/:id`              | Cached approved blog detail              |
| GET    | `/public/blogs/:id/comments`     | Threaded comments tree                   |

### Auth
| Method | Path                | Notes              |
| ------ | ------------------- | ------------------ |
| POST   | `/auth/register`    | Returns `accessToken` |
| POST   | `/auth/login`       | Returns `accessToken` |
| GET    | `/auth/me`          | Current user (JWT) |

### Authenticated user
| Method | Path                                | Notes                                  |
| ------ | ----------------------------------- | -------------------------------------- |
| GET    | `/blogs/mine`                        | My drafts / pending / approved / rejected |
| POST   | `/blogs`                             | Create draft                           |
| PATCH  | `/blogs/:id`                         | Edit draft / rejected blog             |
| DELETE | `/blogs/:id`                         | Delete (cascades comments)             |
| POST   | `/blogs/:id/submit`                  | Move draft → pending                   |
| POST   | `/blogs/:id/comments`                | Add comment (rate-limited)             |
| POST   | `/comments/:id/replies`              | Add reply (rate-limited)               |
| DELETE | `/comments/:id`                      | Soft-delete own comment                |
| GET    | `/notifications`                     | My notifications                       |
| GET    | `/notifications/unread-count`        | `{ count }`                            |
| PATCH  | `/notifications/:id/read`            | Mark one read                          |
| PATCH  | `/notifications/read-all`            | Mark all read                          |

### Admin
| Method | Path                                  | Notes                                      |
| ------ | ------------------------------------- | ------------------------------------------ |
| GET    | `/admin/stats`                         | Counts (blogs by status + users summary)   |
| GET    | `/admin/blogs`                         | All blogs                                  |
| GET    | `/admin/blogs/pending`                 | Approval queue                             |
| POST   | `/admin/blogs/:id/approve`             | Approve (queues publish + notify)          |
| POST   | `/admin/blogs/:id/reject`              | Reject with `{ reason }`                   |
| GET    | `/admin/users`                         | Users list                                 |
| PATCH  | `/admin/users/:id/status`              | Toggle active state                        |
| GET    | `/admin/comments`                      | Comments list                              |
| POST   | `/admin/comments/:id/remove`           | Soft-delete (preserves thread)             |

---

## Frontend pages

| Route                                  | Audience             | Purpose                                         |
| -------------------------------------- | -------------------- | ----------------------------------------------- |
| `/`                                    | public               | Landing with featured blogs                     |
| `/blogs`                               | public               | Beautiful card grid of approved blogs           |
| `/blogs/[id]`                          | public               | Article + threaded comments (login to comment)  |
| `/login`, `/register`                  | guests               | Role-based redirect after login                 |
| `/dashboard`                           | authenticated user   | Stats + recent blogs + notifications            |
| `/dashboard/blogs`                     | user                 | My blogs list with status filters & actions     |
| `/dashboard/blogs/new`                 | user                 | Compose draft (Save / Save & submit)            |
| `/dashboard/blogs/[id]/edit`           | user                 | Edit draft / rejected blog                      |
| `/dashboard/notifications`             | user                 | All notifications with mark-read                |
| `/admin`                               | admin                | Stats overview + quick links                    |
| `/admin/approvals`                     | admin                | Approval queue with reject reason field         |
| `/admin/blogs`                         | admin                | Every blog with filters & search                |
| `/admin/users`                         | admin                | Toggle active state                             |
| `/admin/comments`                      | admin                | Comment moderation (soft-delete)                |
| `/admin/notifications`                 | admin                | Admin's own notifications                       |

User and admin dashboards have their **own** sidebar navigation, color accent, and routes — admins never see the user sidebar and vice versa. Unauthenticated visits to a guarded route are redirected to `/login?next=…`. Authenticated users hitting the wrong dashboard are redirected to their role's home.

---

## End-to-end flow

1. Sign up / log in. New accounts are `user` role.
2. From the user dashboard, write a blog and either save as draft or "Save and submit for approval".
3. Admin sees the blog in `/admin/approvals`, optionally types a reason, then approves or rejects.
4. Approval triggers:
   - the public list cache to invalidate,
   - a `blog.publish` queue job to RabbitMQ,
   - a `notification.dispatch` queue job, and
   - an in-app notification for the author.
5. Approved blog appears immediately on `/blogs` and can receive comments / replies.
6. Comments and replies enqueue a notification job and create an in-app notification for the blog author.

---

## Notes / trade-offs

- The repo runs with `synchronize: true` (TypeORM auto-DDL) for an easy demo. For production, switch to migrations using the existing `migration:*` scripts.
- The RabbitMQ queue currently only **publishes** (no in-process consumer in this codebase). The in-app notification table is the user-facing source of truth; the queue jobs document the asynchronous boundary the brief asks for and are ready for a worker to be added.
- Blog deletion cascades comments (and detaches reply chains) inside a transaction so referential integrity is preserved without losing the user-facing "delete my blog" capability.
