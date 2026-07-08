# Wiki Cleanup Paste Guide

These files are cleaned-up replacements for the GitHub Wiki pages. Copy the contents of each local file into the matching wiki page.

| GitHub Wiki Page | Local Replacement File |
| --- | --- |
| Home | `wiki-cleanup/Home.md` |
| Authentication and Roles | `wiki-cleanup/Authentication-and-Roles.md` |
| Content-hub | `wiki-cleanup/Content-hub.md` |
| Creator Dashboard | `wiki-cleanup/Creator-Dashboard.md` |
| Database - Data Model | `wiki-cleanup/Database-Data-Model.md` |
| Database - Schema | `wiki-cleanup/Database-Schema.md` |
| Deployment Plan | `wiki-cleanup/Deployment-Plan.md` |
| Directory Structure | `wiki-cleanup/Directory-Structure.md` |
| Media and Storage | `wiki-cleanup/Media-and-Storage.md` |
| Project Plan | `wiki-cleanup/Project-Plan.md` |
| Routes | `wiki-cleanup/Routes.md` |

## Major Cleanup Decisions

- Removed outdated `/c/:creatorSlug`, `/p/:postSlug`, `/uploads/:filename`, and `/api/health` route references.
- Replaced starter-template directory structure with the actual current repo structure.
- Removed schema fields not currently implemented, such as `buttonText`, `externalLink`, `scheduledFor`, `publishedAt`, and separate `media_assets`.
- Documented current local `storage/` behavior instead of old `uploads/` assumptions.
- Kept known implementation mismatches visible, especially the `ContentPage.status` versus `publishDate` issue.
- Removed repeated "API Plan" and "Express Views" links where those pages are not part of the provided wiki page list.

