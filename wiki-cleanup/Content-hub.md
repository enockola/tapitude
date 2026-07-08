# Content Hub

The content hub is the public viewer experience. It lets viewers open a creator's Tapitude page and load that creator's published content.

## Current URL

Current public URL pattern:

```txt
/content-hub/:creatorSlug
```

The controller also registers `/content-hub`, but the useful public route is the slug route.

Older references to `/c/:creatorSlug` and `/p/:postSlug` should be removed unless those routes are intentionally reintroduced later.

## What the Content Hub Shows

The content hub uses the creator profile for:

- Creator slug
- Brand name
- Brand color
- Profile image
- User id for loading content

Posts are loaded through Socket.IO from the `/content-hub` namespace.

Current viewer-side behavior:

1. Viewer opens `/content-hub/:creatorSlug`.
2. Server finds the `CreatorProfile` by `creatorSlug`.
3. Server checks that the creator's user account is active.
4. EJS renders the content hub shell.
5. Browser-side JavaScript connects to Socket.IO.
6. Browser emits `requestContent`.
7. Server returns content pages for the creator.

## Content Visibility Rule

The intended rule is:

- Only show posts for the selected creator.
- Only show posts that are published or due to be public.
- Sort newest content first.

The current content hub controller queries by:

```txt
creatorId
status = "published"
publishDate <= now OR publishDate = null
sort by publishDate descending
```

## Known Implementation Note

The current `ContentPage` schema should be reviewed against the controller query. The controller and views reference `status`, but the inspected schema primarily defines `publishDate` as the scheduling/publication field.

Before final handoff, reconcile whether the source of truth is:

- `status + publishDate`, or
- `publishDate` only.

Then update the schema, controller queries, and wiki together.

## Likes and Views

The content hub currently supports:

- View tracking through `viewedBy`.
- Total creator views through `CreatorProfile.totalViews`.
- Likes through `ContentPage.likes`.
- Total creator likes through `CreatorProfile.totalLikes`.

Recommended follow-up:

- Prevent likes from going below zero.
- Validate that liked posts belong to the active creator.
- Avoid broadcasting one viewer's requested content to unrelated viewers.

## Socket.IO Room Recommendation

Current code joins all viewers to the same room:

```txt
viewer_hub
```

Recommended improvement:

- Use `socket.emit(...)` for responses intended only for the requesting viewer.
- Or use creator-specific rooms such as `viewer_hub:<creatorId>`.

This prevents one viewer's feed request from being sent to every connected viewer.

## Current Non-Goals

The current code does not implement:

- Public viewer accounts.
- Comments.
- Public post detail pages.
- Shopping or ecommerce flows.
- Public creator signup.

