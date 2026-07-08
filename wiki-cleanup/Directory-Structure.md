# Directory Structure

This page documents the current project structure. It replaces older starter-template structure proposals that did not match the actual repository.

## Root Files

```txt
README.md
package.json
package-lock.json
tsconfig.json
.env.example
project-overview.md
project-recommendations.md
```

## Main Application Folders

```txt
src/
views/
public/
storage/
```

## `src/`

Backend application code.

```txt
src/
  server.ts
  controllers/
  routes/
  models/
  middleware/
  utils/
  types/
  new_admin_account.ts
  test.ts
```

### `src/server.ts`

Main application entry point.

Responsibilities:

- Load environment configuration.
- Connect to MongoDB.
- Set up Express.
- Set up sessions.
- Register middleware.
- Mount routes.
- Start Socket.IO.
- Register error handlers.
- Start the HTTP server.

### `src/controllers/`

Request handlers and workflow logic.

Current major controllers:

```txt
admin.controller.ts
auth.controller.ts
creator.controller.ts
index.controller.ts
viewer_content_hub.controller.ts
```

### `src/routes/`

Small route registration files that delegate behavior to controllers.

Current route groups:

```txt
admin.routes.js
auth.routes.js
creator.routes.js
index.routes.js
viewer_content_hub.routes.js
```

### `src/models/`

Mongoose models and file storage service.

Important files:

```txt
User.ts
CreatorProfile.ts
ContentPage.ts
FileService.ts
AuditLog.js
Theme.js
```

### `src/middleware/`

Authentication, role checks, CSRF protection, request attachment, and error pages.

Important files:

```txt
security.ts
requireAuth.ts
reqAttachments.ts
errorPages.js
```

### `src/utils/`

Shared helpers.

Important files:

```txt
asyncHandler.ts
dbUtils.ts
loggingUtils.ts
timezoneUtils.ts
```

## `views/`

Server-rendered EJS templates.

```txt
views/
  admin/
  creator/
  content_hub/
  errors/
  partials/
  public/
  about.ejs
  home.ejs
  login.ejs
```

Important sections:

- `views/admin/`: admin dashboard and creator account pages.
- `views/creator/`: creator dashboard, content list, editor, and profile.
- `views/content_hub/`: public viewer content hub.
- `views/partials/`: shared head, topbar, sidebar, scripts, footer.
- `views/errors/`: 403, 404, and 500 pages.

## `public/`

Static browser-loaded assets.

```txt
public/
  assets/
  bootstrap/
  css/
  js/
```

Important files:

- `public/js/content-editor.js`
- `public/js/content-hub.js`
- `public/js/main.js`
- `public/css/dashboard.css`
- `public/css/content-hub.css`
- `public/css/layout/forms.css`

## `storage/`

Runtime upload storage.

Uploaded files are served through:

```txt
/storage/<fileKey>
```

Uploaded user files should not be committed to Git.

## Future Refactor Direction

The current app does not have a `src/services/` folder, but adding one later would be useful.

Good future service candidates:

- `ContentPageService`
- `CreatorProfileService`
- `AnalyticsService`
- Cloud-backed `FileService`

Do not document these as current folders until they exist.

