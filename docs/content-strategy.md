# Content Strategy

## Main Clarification

Tapitude does not need to store uploaded documents, videos, images, or large media files in the MVP.

Instead, Tapitude should store the content page information needed to display a public page to consumers.

## What Tapitude Stores

Tapitude stores structured content in MongoDB, such as:

```txt
title
description/body text
external links
embed URL
embed type
theme settings
layout settings
status
scheduledFor
publishedAt
slug
creatorId
```

This means the app stores the instructions and information needed to build the public page, not the actual media file itself.

## What Tapitude Does Not Store

Tapitude should not store:

```txt
uploaded videos
uploaded PDFs
uploaded images
uploaded audio files
large document files
creator file libraries
```

## How Media Can Still Appear on the Public Page

If creators want to show media, they can provide links or embeds from another platform.

Examples:

- YouTube or Vimeo video link
- Google Drive or Dropbox document link
- Image URL hosted elsewhere
- Social media post link/embed
- Creator website link
- Link to a file already hosted by the creator

Tapitude saves the link/embed and displays it on the public content page.

## Example Flow

1. Admin creates a creator account.
2. Creator logs into Tapitude.
3. Creator creates a content page.
4. Creator enters a title, description, button text, external link, and optional embed URL.
5. Creator chooses a theme or colors.
6. Creator publishes the content page.
7. Tapitude creates a public URL like:

```txt
/p/summer-drop-2026
```

8. The NFC chip points to that public URL.
9. Consumer scans the NFC chip.
10. Consumer sees the public Tapitude page.

## Why This Works

The NFC chip does not need to store the content itself. It only needs to point to a URL.

The public Tapitude page loads content from MongoDB and displays it to the consumer.

## Recommended MVP Content Fields

```txt
title
body
buttonText
externalLink
embedUrl
embedType
themeId
status
scheduledFor
publishedAt
slug
```

## Suggested Embed Types

```txt
none
youtube
vimeo
imageUrl
googleDrive
dropbox
externalWebsite
socialPost
```

## Important Design Decision

Use the phrase "create content page" instead of "upload media" when describing the MVP.

This helps avoid confusion because creators are not uploading files to Tapitude. They are creating a public content page that can include text, links, and embeds.
