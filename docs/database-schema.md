# Database Schema

MongoDB collections will likely include:

- `users`
- `creator_profiles`
- `content_pages`
- `themes`
- `audit_logs`

## `users`

Stores account/login information.

```txt
_id
name
email
passwordHash
role
status
createdAt
updatedAt
```

Recommended roles:

```txt
admin
creator
```

Recommended account statuses:

```txt
active
disabled
```

## `creator_profiles`

Stores creator-specific profile information.

```txt
_id
userId
displayName
bio
profileImageUrl
brandName
createdAt
updatedAt
```

## Content Storage Direction

Tapitude should not store creator-uploaded media files or documents in the MVP.

The database should store content records and references, such as text, links, embed URLs, status, schedule information, theme settings, and public slugs.

## `content_pages`

Stores the actual content that consumers see.

```txt
_id
creatorId
title
slug
body
externalLinks
embedUrl
embedType
themeId
status
scheduledFor
publishedAt
createdAt
updatedAt
```

Recommended MVP status values:

```txt
draft
scheduled
published
```

Optional future status:

```txt
archived
```

## `themes`

Stores personalization settings.

```txt
_id
creatorId
name
fontFamily
primaryColor
backgroundColor
buttonColor
layout
createdAt
updatedAt
```

## `audit_logs`

Tracks important admin/system actions.

```txt
_id
actorUserId
action
targetType
targetId
metadata
createdAt
```

## Helpful Indexes

These fields will probably need indexes:

```txt
users.email
content_pages.creatorId
content_pages.slug
content_pages.status
content_pages.scheduledFor
```
