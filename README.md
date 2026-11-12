# Mohammed Waleed — Cinematic Developer Portfolio & GitHub Developer Platform

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Laravel](https://img.shields.io/badge/Laravel-13-FF7043?style=for-the-badge&logo=laravel)
![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)
![GSAP](https://img.shields.io/badge/GSAP-3-07903A?style=for-the-badge&logo=gsap)
![Three.js](https://img.shields.io/badge/Three.js-111111?style=for-the-badge&logo=threejs)

## Overview

This repository contains a **cinematic full-stack developer portfolio** combined with an **open-source GitHub developer platform**.

The public side presents Mohammed Waleed as a creative full-stack developer through a cinematic portfolio experience. The platform side allows visitors to browse published public GitHub repositories, inspect repository details, read README content, and navigate repository files.

The private side provides an admin dashboard for managing GitHub connections, repository publishing, analytics, monitoring, security, and operations.

The project is split into two applications:

1. **Next.js 15 (App Router) frontend** — public portfolio, admin UI, and backend-for-frontend API routes.
2. **Laravel 13 API** — source of truth for GitHub data, monitoring, security, logs, and repository state.

---

## What the Website Does

### Public portfolio experience

- Cinematic hero section with scroll-driven video scrubbing.
- GSAP-powered entrance animations and scroll-triggered effects.
- Smooth scrolling with Lenis.
- Three.js / React Three Fiber visual effects.
- Framer Motion and GSAP animations.
- Projects, work, about, contact, and coming-soon sections.
- Custom cursor and grain/blur visual treatments.
- Responsive design across desktop, tablet, and mobile.

### Open-source GitHub browser

- Public repository listing at `/open-source`.
- Repository detail pages at `/open-source/[owner]/[repo]`.
- Search, filtering, and sorting for published public repositories.
- README rendering.
- File tree navigation.
- File content preview.
- Source code and download links.

### Admin operations

- Admin login and JWT-based session handling through Next.js.
- Laravel-backed admin data through the Next.js BFF.
- GitHub connection and synchronization.
- Repository publishing workflow.
- Dashboard metrics and traffic insights.
- Visitor sessions and request attribution.
- System logs and frontend error reports.
- Security blocking and audit events.
- API client token management.

---

## Features

### Cinematic frontend

- Scroll-synced video playback.
- GSAP ScrollTrigger animations.
- Framer Motion page transitions and motion components.
- Three.js WebGL effects.
- Lenis smooth scroll.
- Custom cursor with hover scaling.
- Grain overlay and visual blur effects.

### GitHub integration

- GitHub OAuth connection.
- Public repository import/sync.
- Webhook handling with HMAC SHA-256 signature validation.
- Published public repository visibility rules.
- Manual repository sync.
- Repository metadata and feature management.

### Admin dashboard

- Light operations theme.
- Mobile-friendly responsive admin layout.
- Admin authentication through Next.js JWT and Laravel Sanctum service token.
- Admin routes protected by Laravel middleware.

### Monitoring and analytics

- Visitor session tracking.
- Page view and request activity monitoring.
- Frontend error reporting.
- System logs with filtering and CSV export.
- Security events and audit trail.
- Request attribution and API client tracking.

---

## Tech Stack

### Frontend

- **Next.js 15** — App Router, API route handlers, middleware.
- **React 19** — UI framework.
- **Tailwind CSS 4** — utility-first styling.
- **GSAP 3** — scroll animations.
- **Framer Motion / Motion** — animation library.
- **Three.js / React Three Fiber** — WebGL effects.
- **Lenis** — smooth scrolling.
- **jose** — JWT admin auth.
- **react-icons** — icon set.
- **Playwright** — browser verification tooling.

### Backend

- **Laravel 13** — API framework.
- **PHP 8.3+**.
- **Sanctum** — API authentication.
- **MySQL** — primary database.
- **Tinker / PHPUnit** — database and testing workflows.

### Integrations

- **GitHub REST API / OAuth / Webhooks**.
- **Resend** — transactional email support.
- **MySQL database** for backend state.

### Deployment

- **Next.js deployment** — Vercel or self-hosted Node server.
- **Laravel deployment** — standard PHP hosting or container platform.

---

## Architecture

### Next.js ↔ Laravel communication

```text
Next.js public/admin/BFF
        ↓
Next.js API route handlers
        ↓
Laravel /api/*
        ↓
MySQL
```

- Next.js owns the public UI and admin UI.
- Laravel owns the source of truth.
- Next.js BFF proxies requests to Laravel.
- Admin calls use a server-side Laravel service token.
- Browser requests to Laravel admin routes should not receive the Laravel token directly.

### Authentication flow

- Next.js issues JWT admin token.
- Next.js BFF forwards admin requests to Laravel with `LARAVEL_SERVICE_TOKEN`.
- Laravel validates token through Sanctum and applies admin middleware.

### GitHub flow

- GitHub OAuth app connects user account.
- Public repositories are synced/imported.
- Webhook validates `X-Hub-Signature-256`.
- Invalid webhook signatures fail closed.
- Public repository browser only shows repositories marked published and visible as public.

### Monitoring flow

- Frontend calls Next.js analytics endpoints.
- Next.js BFF forwards relevant data to Laravel.
- Laravel records visitor sessions and request activity.
- Admin pages poll backend endpoints for live updates.

---

## Getting Started

### Prerequisites

- **Node.js 18+**
- **npm**
- **PHP 8.3+**
- **Composer**
- **MySQL**
- **GitHub OAuth App** for private repository sync / account sync.

### Backend setup

```bash
cd api

composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

### Frontend setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Run the application

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000/api`
- Admin login: `http://localhost:3000/admin/login`

---

## Environment Variables

### Next.js (`.env.local`)

```env
NEXT_PUBLIC_SITE_URL=https://mohammedwaleed.dev
NEXT_PUBLIC_WHATSAPP_NUMBER=201038191703
NEXT_PUBLIC_RESUME_URL=
NEXT_PUBLIC_GITHUB_USERNAME=

JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
COMING_SOON_PASSWORD=

RESEND_API_KEY=

LARAVEL_API_URL=http://127.0.0.1:8000/api
LARAVEL_SERVICE_TOKEN=
```

### Laravel (`api/.env`)

```env
APP_NAME="Waleed Portfolio API"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

FRONTEND_URL=http://localhost:3000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=waleed_portfolio
DB_USERNAME=root
DB_PASSWORD=

SYSTEM_LOG_RETENTION_DAYS=30
REQUEST_ACTIVITY_RETENTION_DAYS=90
VISITOR_RETENTION_DAYS=180

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_OAUTH_REDIRECT_URI=http://localhost:3000/api/admin/github/callback
GITHUB_WEBHOOK_SECRET=
GITHUB_TOKEN=
GITHUB_API_TIMEOUT=20
```

> Do not commit real secrets. Use environment files or secret managers in production.

---

## Scripts

### Root frontend

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Laravel API

```bash
cd api

composer install
composer dev
composer test

php artisan serve --host=127.0.0.1 --port=8000
php artisan migrate
```

---

## Testing and Verification

- Frontend production build:

```bash
npm run build
```

- Backend tests:

```bash
cd api
php artisan test
```

- Manual browser checks are used for public pages, admin pages, GitHub API routes, analytics, logs, and security flows.

---

## Deployment Notes

- Deploy the Next.js frontend to Vercel or a Node.js host.
- Deploy the Laravel API to a PHP-capable host or container platform.
- Set production environment variables for both apps.
- Configure GitHub OAuth callback and webhook URL for production.
- Configure `NEXT_PUBLIC_GITHUB_USERNAME` for the public GitHub profile link.
- Configure backend URL and service token for the frontend BFF.

---

## Current Status

- Public cinematic portfolio implemented.
- Open-source GitHub browser implemented.
- Admin dashboard implemented.
- GitHub OAuth/webhook integration implemented.
- Monitoring and security features implemented.
- Production build passes.
- Backend test suite passes.

---

## License

This project is licensed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

