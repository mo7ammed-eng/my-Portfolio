# Waleed Portfolio — Laravel CMS Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Sarang Cinematic Portfolio into Mohammed Waleed's fully dynamic portfolio: CV content, new color palette, Laravel+MySQL CMS backend, expanded admin dashboard, cinematic 404 — with ZERO visual redesign.

**Architecture:** Laravel 12 REST API (Sanctum, MySQL `waleed_portfolio`) at `G:\waleed-portfolio-api` becomes the source of truth. Next.js API routes are kept as a BFF proxy layer (same public contracts, e.g. `/api/works`) that forward to Laravel server-side, preserving every existing frontend fetch. Next keeps its own JWT cookie (`admin_token`, jose) for `/admin/*` middleware; mutations additionally proxy with a Laravel Sanctum service token. All content components fetch Next API routes with static fallbacks (offline-safe).

**Tech Stack:** Next.js 15 (existing, untouched design), Tailwind v4 CSS vars for palette, Laravel 12 + Sanctum + Eloquent + Form Requests + API Resources, MySQL 8.0, Playwright for browser testing.

**Spec:** User's 10-phase brief (this session).

## Global Constraints

- DO NOT redesign: layouts, animations, GSAP/Three.js scenes, scrolling, navigation, spacing, typography stay as-is.
- Palette: bg `#09090F`, surface `#15121F`, surface-light `#211A30`, primary `#8B5CF6`, secondary `#A78BFA`, accent `#E83252`, text `#F5F3FF`, muted `#A5A1B2` — applied via CSS variables (`--primary` etc.) so the admin Theme editor works at runtime.
- CV (public PDF) is private: moved to Laravel `storage/app/private/cv/`, never publicly served.
- MySQL: root/12345678 @localhost:3306, DB `waleed_portfolio` (created).
- Required entities: users, site_settings, hero_sections, about_sections, skills, skill_categories, experiences, projects, project_images, services, testimonials, blog_posts, social_links, contact_messages, seo_settings, theme_settings (+ subscribers, visits, ad_clicks, searches to preserve existing features).
- Env: `.env.example` committed; no hardcoded secrets.

## Review Focus

1. Admin JWT still gates all mutating Next routes (jose verify) — tests: mutation without cookie → 401.
2. Public reads work with Laravel down → components render static fallback (offline resilience).
3. `works` field compatibility (gallery JSON, image_url, mobile_image_url, desktop_view_url, logo_full_view_url, review, services, client, month, year, sort_order, visible) — project detail page must render identically.
4. Uploads return absolute URLs served by Laravel `/storage` — next.config remotePatterns includes Laravel origin.
5. 404 page returns real HTTP 404 and does not affect valid routes.

---

### Task 1: Laravel scaffold + migrations
`composer create-project laravel/laravel G:\waleed-portfolio-api`; Sanctum; `.env` (MySQL); migrations for all entities with relationships; models.

### Task 2: Laravel API layer
Auth (`/api/auth/login`), public content endpoints (hero, about, skills, experiences, projects/works, services, testimonials, settings, seo, theme, social-links), admin CRUD endpoints (Form Requests + API Resources), uploads (storage), seeders (admin user + CV data + palette).

### Task 3: Verify Laravel
`php artisan serve` (port 8000), curl public + auth + CRUD endpoints.

### Task 4: Palette swap (frontend)
Catalog all hex colors in `src/`; substitute via CSS vars; keep WebGL/canvas hex static; verify visual parity.

### Task 5: CV integration
Hero (name/label/paragraphs), about content (bio from CV summary, skills per CV groups, experiences), Work service cards, Contact copy, Footer, Navbar logo (generated MW monogram), layout.js metadata + JSON-LD, llms.txt/searchwords/SeoContent, WhatsApp number, move CV PDF to private.

### Task 6: Rewire Next API routes to Laravel
login (proxy auth), works/projects, settings, inquiries, reviews, subscribe, upload, contact, analytics, middleware coming-soon, sitemap.

### Task 7: Dynamic content components
Hero, About, Work, Contact, Footer, Navbar, projects view, project detail — fetch with fallback; conditional rendering identical to static design.

### Task 8: Admin dashboard expansion
New pages following existing admin design system: hero, about, skills, experience, services, testimonials, blog, seo, theme, general settings; extend projects manager (github/demo URLs, featured, dates, gallery via project_images); rename reviews→testimonials mapping.

### Task 9: 404 page
Enhance existing not-found.jsx with palette + cinematic glow + grain + entrance animation; genuine 404.

### Task 10: Browser testing (Playwright) + fixes
Run Laravel + Next dev; test all flows; fix discovered issues; final report.
