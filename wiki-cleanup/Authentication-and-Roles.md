# Authentication and Roles

This page explains how users access Tapitude Creator Hub and what each role is allowed to do.

## User Types

Tapitude currently has two authenticated roles:

```txt
admin
creator
```

Public viewers do not have accounts.

## Admin Role

Admins manage creator accounts and oversee the creator platform.

Admins can:

- Log in to the admin dashboard.
- View basic admin dashboard counts.
- View creator accounts.
- Create creator accounts manually.
- Edit creator account details.
- Disable or reactivate creator accounts.
- Delete creator accounts.

Current admin pages live under:

```txt
/admin
```

Admin routes are protected by:

- Session authentication
- `admin` role checks
- CSRF protection on POST requests

## Creator Role

Creators manage their own Tapitude profile and posts.

Creators can:

- Log in to the creator dashboard.
- View dashboard metrics.
- Edit their profile and public brand information.
- Create a new post shell.
- Edit post text, publish timing, media display mode, and media.
- Upload or delete media for their own posts.
- Delete their own posts.

Current creator pages live under:

```txt
/creator
```

Creator routes are protected by:

- Session authentication
- `creator` or `admin` role checks
- Active-account checks
- CSRF protection on POST requests
- Ownership checks in controller queries

## Public Viewer Access

Public viewers do not log in.

Viewers can:

- Open a creator public content hub.
- Load published posts for that creator.
- Like posts.

Current public content hub URL pattern:

```txt
/content-hub/:creatorSlug
```

Older wiki references to `/c/:creatorSlug` and `/p/:postSlug` do not match the current codebase.

## Account Statuses

Current user statuses:

```txt
active
disabled
```

### Active

An active creator can log in and manage content.

### Disabled

A disabled creator should not be able to use the creator dashboard. The current content hub controller also checks the creator account status and hides public content hubs for inactive creator accounts.

### Deleted

Admin deletion currently removes the user and creator profile. Related content and media cleanup should be reviewed before production handoff.

## Authentication Flow

1. User submits the login form at `/auth/login`.
2. The app looks up the user by email.
3. The app checks account status.
4. The app compares the password with the stored bcrypt hash.
5. The app stores the user id in the session.
6. The app redirects admins to `/admin/dashboard`.
7. The app redirects creators to `/creator/dashboard`.

## Security Notes

The app uses:

- Bcrypt password hashing.
- Session cookies.
- MongoDB-backed sessions.
- Current-user attachment middleware.
- Role checks.
- CSRF protection.

Recommended follow-up:

- Confirm every form includes `_csrf`.
- Ensure `.env.example` includes `CSRF_SECRET`.
- Continue owner-scoping all creator post/media updates by both `_id` and `creatorId`.

