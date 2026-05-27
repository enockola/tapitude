# Project Plan

## Project Summary

Tapitude Creator Hub is a simple dashboard where content creators can manage content that will eventually be viewed by consumers through NFC-connected public URLs.

The current scope is focused on:

- Creator dashboard
- Admin dashboard
- Backend API
- MongoDB database
- Documentation
- Deployment/scalability planning

The NFC chip implementation is not the main focus yet. The main focus is making sure content can be created, stored, customized, and displayed through public URLs.

## Recommended Stack

- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Frontend:** EJS views, CSS, and client-side JavaScript
- **API style:** REST-style endpoints
- **Authentication:** Session or cookie-based login for dashboard users

## Express Views Direction

Since the project is using Express, the HTML pages should be handled as EJS templates inside a `views/` folder.

The CSS, JavaScript, images, and icons should stay in `public/` because those are static assets served directly to the browser.

Recommended approach:

- Use `views/` for `.ejs` templates
- Use `views/partials/` for reusable page pieces
- Use `views/errors/` for error pages
- Use `public/css/` for CSS files
- Use `public/js/` for browser JavaScript
- Use `public/assets/` for images and icons

## Main Features Needed

### Admin Features

- Admin login
- Create creator accounts
- View creator accounts
- Edit creator account status
- Possibly view creator content for support/moderation

### Creator Features

- Creator login
- View dashboard
- Create content pages
- Edit content pages
- Save content as draft
- Schedule content for later
- Publish content right away
- Preview public page
- Customize page theme

### Public Consumer Features

- View a public content page
- No login required
- Access page through a public slug/URL

Example:

```txt
/p/:slug
```

## No Internal Media Storage

Tapitude should not store uploaded media files or documents for creators in the MVP.

Instead, Tapitude should store:

- Text content
- Titles and descriptions
- External links
- Embed URLs
- Theme and layout settings
- Public slug/URL information
- Publishing status and schedule information

If a creator wants to show a video, image, PDF, or other media, they should use a URL from another platform instead of uploading the file directly to Tapitude.

Examples:

- YouTube/Vimeo video link
- Google Drive or Dropbox document link
- Cloud-hosted image URL
- Social media post embed
- Creator's own website link

## MVP Scope

The MVP should stay focused:

- Admin can create creator accounts
- Creator can log in
- Creator can create/edit content
- Creator can schedule or publish content
- Public page displays published content
- MongoDB stores users, content, and theme settings

## Future Improvements

- External media links and embeds
- Analytics
- Password reset
- Email invitations
- Team accounts
- More advanced themes
- Version history
- Archive status
- Full Swagger/OpenAPI documentation
- Draft-saving/autosave if creators request it later
