# Express Views and Static Assets

## Main Direction

Tapitude should use Express with EJS templates.

This means regular HTML pages become `.ejs` files inside the `views/` folder.

CSS and browser JavaScript should stay in the `public/` folder because they are static assets.

## Why EJS Views

EJS is helpful because the dashboard pages will need dynamic data.

Examples:

- Showing the logged-in creator's name
- Showing a creator's content pages
- Showing admin user lists
- Showing validation messages
- Rendering public content pages by slug

## Recommended Express Setup

In `src/app.js`, the app will eventually need settings similar to this:

```js
const path = require("path");
const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.static(path.join(__dirname, "..", "public")));
```

## What Goes in `views/`

```txt
views/
├── errors/
├── forms/
├── partials/
├── admin/
├── creator/
└── public/
```

## What Goes in `public/`

```txt
public/
├── css/
├── js/
└── assets/
```

## Key Rule

Use `views/` for templates that Express renders.

Use `public/` for files the browser loads directly.
