# Creator Dashboard

The creator dashboard is the authenticated area where creators manage their Tapitude profile, posts, media, and basic performance metrics.

Current creator routes are mounted under:

```txt
/creator
```

## Main Creator Pages

| Page | Purpose |
| --- | --- |
| `/creator/dashboard` | Creator performance summary and recent content |
| `/creator/content` | Full content list |
| `/creator/pages/:id/editor` | Edit a specific post |
| `/creator/profile` | Edit creator profile and branding |

## Dashboard

The dashboard shows creator-level information such as:

- Recent content pages.
- Total content count.
- Published content count.
- Total likes.
- Total views.

Metrics come from:

- `ContentPage`
- `CreatorProfile.totalViews`
- `CreatorProfile.totalLikes`

## Content List

The content list shows all posts owned by the logged-in creator.

The list is sorted by most recently updated first.

It also shows a warning when the creator is at the post limit.

## Post Limit Rule

Creators currently have a maximum of 25 content pages.

When a new content page causes the creator to exceed the limit, the oldest existing content page is deleted. If that old post has media, the media should also be deleted.

Important behavior:

- The backend enforces the limit.
- The UI warns creators when they are at the limit.
- The warning should not block frequent posting with repeated modals.

## Creating Posts

The current create flow creates a new post shell first:

```txt
POST /creator/pages/new-page
```

The app then redirects the creator to the editor for that new post.

## Editing Posts

Creators edit posts from:

```txt
GET /creator/pages/:id/editor
POST /creator/pages/:id/update
```

The edit form supports:

- Description/body text.
- Publish option.
- Scheduled publish date/time.
- Media display mode.
- Media upload/delete through a separate media form.

After an edit is saved, the editor redirects back with:

```txt
?saved=1
```

The editor then displays a success banner.

## Media Uploads

Media upload is handled separately from text/schedule edits:

```txt
POST /creator/pages/upload
```

The current system supports one uploaded media file per post.

The editor accepts:

```txt
image/*
video/*
```

## Profile Settings

Creators can update profile and branding information from:

```txt
GET /creator/profile
POST /creator/profile/update
```

Profile fields include:

- Display name
- Brand name
- Brand color
- Bio
- Profile image

## Known Follow-Up Items

- Confirm media upload ownership checks are applied consistently.
- Confirm the `status`/`publishDate` model is consistent.
- Add automated tests for create, edit, upload, delete, and post-limit behavior.

