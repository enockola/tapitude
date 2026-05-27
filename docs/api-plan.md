# API Plan

This is a starter API plan for the Tapitude Creator Hub.

## Auth Routes

```txt
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Admin Routes

```txt
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id
DELETE /api/admin/users/:id
```

Admin routes should be protected so only users with the `admin` role can access them.

## Creator Routes

```txt
GET   /api/creator/dashboard
GET   /api/creator/profile
PATCH /api/creator/profile
```

Creator routes should be protected so only logged-in creators can access their own information.

## Content Page Routes

```txt
GET    /api/content-pages
POST   /api/content-pages
GET    /api/content-pages/:id
PATCH  /api/content-pages/:id
DELETE /api/content-pages/:id
```

Possible content actions:

```txt
PATCH /api/content-pages/:id/publish
PATCH /api/content-pages/:id/schedule
PATCH /api/content-pages/:id/unpublish
```

## Public Content Route

```txt
GET /p/:slug
```

This route should only show content that is published.

## Health Check Route

```txt
GET /api/health
```

This route can be used to confirm that the server is running.
