# Directory Structure

This project structure uses Express with EJS views.

The `.ejs` files live in `views/` because they are server-rendered templates. CSS, client-side JavaScript, images, and icons live in `public/` because they are static files served to the browser.

## Recommended Structure

```txt
tapitude-creator-hub/
│
├── README.md
├── package.json
├── .env.example
├── .gitignore
│
├── docs/
│   ├── project-plan.md
│   ├── directory-structure.md
│   ├── api-plan.md
│   ├── database-schema.md
│   ├── auth-and-roles.md
│   ├── content-strategy.md
│   └── deployment-plan.md
│
├── src/
│   ├── server.js
│   ├── app.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── creator.routes.js
│   │   ├── content.routes.js
│   │   └── public.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── creator.controller.js
│   │   └── content.controller.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── creatorProfile.model.js
│   │   ├── contentPage.model.js
│   │   ├── theme.model.js
│   │   └── auditLog.model.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── content.service.js
│   │   └── theme.service.js
│   │
│   ├── middleware/
│   │   ├── requireAuth.js
│   │   ├── requireRole.js
│   │   ├── validateRequest.js
│   │   ├── notFound.js
│   │   └── errorHandler.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   └── content.validator.js
│   │
│   └── utils/
│       ├── createSlug.js
│       ├── generatePublicUrl.js
│       └── logger.js
│
├── views/
│   ├── errors/
│   │   ├── 403.ejs
│   │   ├── 404.ejs
│   │   └── 500.ejs
│   │
│   ├── forms/
│   │   ├── login.ejs
│   │   ├── creator-account.ejs
│   │   ├── content-page.ejs
│   │   └── profile.ejs
│   │
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── nav.ejs
│   │   ├── sidebar.ejs
│   │   ├── footer.ejs
│   │   └── scripts.ejs
│   │
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   ├── creators.ejs
│   │   └── creator-details.ejs
│   │
│   ├── creator/
│   │   ├── dashboard.ejs
│   │   ├── content-list.ejs
│   │   ├── content-editor.ejs
│   │   └── preview.ejs
│   │
│   ├── public/
│   │   └── content-page.ejs
│   │
│   ├── home.ejs
│   └── about.ejs
│
├── public/
│   ├── css/
│   │   ├── base/
│   │   │   ├── elements.css
│   │   │   └── reset.css
│   │   │
│   │   ├── components/
│   │   │   ├── cards.css
│   │   │   ├── nav.css
│   │   │   ├── sidebar.css
│   │   │   └── theme-toggle.css
│   │   │
│   │   ├── layout/
│   │   │   ├── dashboard.css
│   │   │   ├── forms.css
│   │   │   ├── home.css
│   │   │   └── public-page.css
│   │   │
│   │   ├── tokens/
│   │   │   ├── colors.css
│   │   │   └── variables.css
│   │   │
│   │   ├── utilities/
│   │   │   └── utilities.css
│   │   │
│   │   └── main.css
│   │
│   ├── js/
│   │   ├── auth.js
│   │   ├── admin-dashboard.js
│   │   ├── creator-dashboard.js
│   │   └── content-editor.js
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
└── tests/
```

## Important Clarification

The `views/` folder should hold EJS templates, not regular `.html` files.

The `public/` folder should hold static frontend assets:

- CSS
- Browser JavaScript
- Images
- Icons

This means the app can render pages like this:

```js
res.render("creator/dashboard", {
  title: "Creator Dashboard",
  user: req.user
});
```

And the EJS template can load CSS like this:

```html
<link rel="stylesheet" href="/css/main.css">
```

## Folder Responsibilities

### `views/`

Holds EJS templates that Express renders into HTML.

### `views/errors/`

Holds error pages such as 403, 404, and 500.

### `views/forms/`

Holds form templates such as login, creator account creation, content creation, and profile editing.

### `views/partials/`

Holds reusable EJS pieces such as the page head, navigation, sidebar, footer, and scripts.

### `views/admin/`

Holds admin dashboard pages.

### `views/creator/`

Holds creator dashboard pages.

### `views/public/`

Holds public-facing content page templates that consumers see after scanning an NFC chip.

### `public/css/`

Holds CSS files. The CSS structure can still use layers.

### `public/js/`

Holds JavaScript that runs in the browser.

### `public/assets/`

Holds static images and icons used by the site.

## CSS Layer Plan

Even though the pages are now EJS templates, the CSS structure can stay organized with cascade layers.

Example `public/css/main.css`:

```css
@layer reset, tokens, base, layout, components, utilities;

@import url("./base/reset.css") layer(reset);
@import url("./tokens/colors.css") layer(tokens);
@import url("./tokens/variables.css") layer(tokens);
@import url("./base/elements.css") layer(base);
@import url("./layout/home.css") layer(layout);
@import url("./layout/dashboard.css") layer(layout);
@import url("./layout/forms.css") layer(layout);
@import url("./layout/public-page.css") layer(layout);
@import url("./components/cards.css") layer(components);
@import url("./components/nav.css") layer(components);
@import url("./components/sidebar.css") layer(components);
@import url("./components/theme-toggle.css") layer(components);
@import url("./utilities/utilities.css") layer(utilities);
```

## Why This Structure Works

This structure matches a typical Express/EJS project while still keeping the backend organized.

It separates the app into clear areas:

- `src/` for backend logic
- `views/` for rendered pages
- `public/` for static assets
- `docs/` for planning documentation
- `tests/` for tests
