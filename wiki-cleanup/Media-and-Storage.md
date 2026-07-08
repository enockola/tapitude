# Media and Storage

This page documents the current media upload and storage behavior.

## Current Storage Approach

Tapitude currently stores uploaded files on the local filesystem.

Physical files are stored in:

```txt
storage/
```

The server exposes that folder at:

```txt
/storage
```

Example public file URL:

```txt
/storage/<fileKey>
```

Older wiki references to `uploads/` or `GET /uploads/:filename` do not match the current codebase.

## File Metadata

File metadata is stored in MongoDB through the `File` model inside:

```txt
src/models/FileService.ts
```

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

## How Uploaded Files Are Referenced

Content posts store media through:

```txt
ContentPage.fileKey
```

Creator profile images are stored through:

```txt
CreatorProfile.profileImageKey
```

The file key points to file metadata and to the physical file in `storage/`.

## Creator Post Media

Current editor behavior supports one media file per post.

The post editor accepts:

```txt
image/*
video/*
```

Upload route:

```txt
POST /creator/pages/upload
```

The upload flow:

1. Browser submits the media form.
2. Controller streams the upload with Busboy.
3. `FileService.uploadFile` saves the physical file.
4. `FileService` creates MongoDB file metadata.
5. The content page stores the returned `fileKey`.
6. If the post already had media, old media is deleted.

## Profile Images

Creator profile updates can include a profile image.

If a creator uploads a new profile image, the old image should be deleted when the key changes.

## Media Deletion Rules

Media should be deleted when:

- A creator removes media from a post.
- A creator replaces media on a post.
- A creator deletes a post.
- The system deletes the oldest post because the creator exceeded the post limit.
- A profile image is replaced.

Recommended additional review:

- Confirm admin creator deletion removes related posts and media.
- Confirm media upload/update routes are creator-owner scoped.
- Add tests for media deletion to avoid orphaned files.

## Production Storage Recommendation

Local storage is fine for development and controlled demos, but production should use durable object storage.

Recommended future providers:

- AWS S3
- Cloudflare R2
- Azure Blob Storage
- Google Cloud Storage
- Sponsor-approved storage

Keep `FileService` as the abstraction so controllers do not need to know whether files are local or cloud-hosted.

## File Rules to Confirm

Before production, confirm:

- Maximum file size.
- Allowed MIME types.
- Whether videos are required.
- Whether documents/PDFs are allowed.
- Whether one post can ever have multiple files.
- Whether uploaded media needs moderation.

