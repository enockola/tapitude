# Database - Schema

This page documents the current important Mongoose models used by Tapitude Creator Hub.

## Users

Model file:

```txt
src/models/User.ts
```

Purpose:

- Stores admin and creator login accounts.

Important fields:

```txt
name
email
passwordHash
role
status
createdAt
updatedAt
```

Roles:

```txt
admin
creator
```

Statuses:

```txt
active
disabled
```

Important methods:

- `createAccount`
- `findByEmail`
- `comparePassword`
- `disableAccount`
- `enableAccount`
- `changePassword`

## Creator Profiles

Model file:

```txt
src/models/CreatorProfile.ts
```

Purpose:

- Stores creator profile and public hub branding information.

Important fields:

```txt
userId
creatorSlug
displayName
brandName
brandColor
bio
profileImageKey
totalViews
totalLikes
createdAt
updatedAt
```

Notes:

- `userId` references the creator's `User`.
- `creatorSlug` is generated from the user id when the profile is saved.
- `profileImageKey` references uploaded file metadata.

## Content Pages

Model file:

```txt
src/models/ContentPage.ts
```

Purpose:

- Stores creator posts/content pages shown in the content hub.

Important fields currently defined in the schema:

```txt
creatorId
fileKey
body
publishDate
likes
viewedBy
preserveAspectRatio
createdAt
updatedAt
```

Notes:

- `creatorId` references the creator's `User`.
- `fileKey` references uploaded file metadata.
- `publishDate` is used to determine whether a post is scheduled or published.
- `viewedBy` helps prevent counting the same viewer repeatedly.
- `preserveAspectRatio` controls how media should display.

Known issue:

- Current controllers and views also reference a `status` field. The schema should be updated to include `status` or the code should be simplified to use `publishDate` only.

## Files

Model/service file:

```txt
src/models/FileService.ts
```

Purpose:

- Stores metadata for uploaded files and manages local file operations.

Important metadata fields:

```txt
fileKey
originalName
contentType
fileSize
ownerId
createdAt
isActive
```

Storage behavior:

- Physical files are saved in `storage/`.
- The browser can access files through `/storage/<fileKey>`.
- The app stores `fileKey` on content pages and creator profiles.

## Audit Logs

Model file:

```txt
src/models/AuditLog.js
```

Purpose:

- Provides a schema for logging important system/admin actions.

Important fields:

```txt
actorUserId
action
targetType
targetId
metadata
createdAt
updatedAt
```

Note:

- The model exists, but audit logging does not appear to be a major active workflow yet.

## Recommended Indexes

Recommended indexes to confirm:

```txt
users.email unique
users.role
users.status
creatorprofiles.userId unique
creatorprofiles.creatorSlug unique
contentpages.creatorId
contentpages.publishDate
files.fileKey
files.ownerId
auditlogs.actorUserId
auditlogs.targetType + targetId
```

## Removed/Outdated Schema Ideas

The old wiki mentioned fields that are not part of the current codebase:

- `title`
- `slug` on content posts
- `buttonText`
- `externalLink`
- `scheduledFor`
- `publishedAt`
- `themeSettings`
- `supportEmail`
- Separate `media_assets` model
- Separate `analytics_events` model

These should not be documented as current implementation unless the team reintroduces them.

