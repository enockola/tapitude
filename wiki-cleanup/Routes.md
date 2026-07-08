# Routes

This page maps the current route groups in Tapitude Creator Hub.

Routes are registered in:

```txt
src/server.ts
```

Route group files live in:

```txt
src/routes/
```

Controller behavior lives in:

```txt
src/controllers/
```

## Public Index Routes

Mounted at:

```txt
/
```

Routes:

```txt
GET /
GET /about
```

Controller:

```txt
src/controllers/index.controller.ts
```

## Auth Routes

Mounted at:

```txt
/auth
```

Routes:

```txt
GET  /auth/login
POST /auth/login
POST /auth/logout
```

Controller:

```txt
src/controllers/auth.controller.ts
```

## Admin Routes

Mounted at:

```txt
/admin
```

Routes:

```txt
GET  /admin/dashboard
GET  /admin/creators
GET  /admin/creators/new
GET  /admin/edit-creator-account/:id
POST /admin/creators/new
POST /admin/edit-creator-account/:id
POST /admin/delete-creator-account/:id
```

Controller:

```txt
src/controllers/admin.controller.ts
```

Access:

- Must be logged in.
- Must have `admin` role.

## Creator Routes

Mounted at:

```txt
/creator
```

Routes:

```txt
GET  /creator/dashboard
GET  /creator/content
GET  /creator/pages/:id/editor
GET  /creator/profile
POST /creator/profile/update
POST /creator/pages/new-page
POST /creator/pages/create
POST /creator/pages/:id/update
POST /creator/pages/upload
POST /creator/pages/:id/delete
```

Controller:

```txt
src/controllers/creator.controller.ts
```

Access:

- Must be logged in.
- Must have `creator` or `admin` role.
- Creator account must be active.

## Content Hub Routes

Mounted at:

```txt
/content-hub
```

Routes:

```txt
GET /content-hub
GET /content-hub/:slug
```

Controller:

```txt
src/controllers/viewer_content_hub.controller.ts
```

Socket.IO namespace:

```txt
/content-hub
```

Socket events:

```txt
requestContent
likePost
disconnect
```

## Static and Upload Routes

Static files:

```txt
public/
```

Uploaded files:

```txt
/storage
```

## Removed/Outdated Route References

The older wiki referenced routes that do not currently exist:

```txt
/c/:creatorSlug
/p/:postSlug
/content-pages
/uploads/:filename
/api/health
/admin/users
/admin/creators/:creatorId/posts
```

Do not document these as current routes unless they are implemented later.

## Route Rules

- Admin routes require admin access.
- Creator routes require creator/admin access.
- Creators should only mutate their own posts, profile, and media.
- POST routes should include CSRF protection.
- Public viewer routes do not require login.

