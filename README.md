# Tapitude Creator Hub

Tapitude Creator Hub is a web dashboard that allows approved content creators to manage posts that appear on their public Tapitude page. Public consumers access a creator's page through a URL connected to a Tapitude NFC chip.

This repository is currently in the MVP planning and early build stage.

## Wireframes
https://www.figma.com/design/W1BkkZE7PTu8sxLuJfRDy4/Taptitude-Content-Hub?t=3r912hp1jZ2P1sw1-0

## Quick Start

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Recommended development values:

```env
USE_MOCK_DATA=true
MONGODB_URI=
SESSION_SECRET=replace-with-local-secret
```

Start the development server:

```bash
npm run dev
```

Open the app locally:

```txt
http://localhost:3000
```

# Documentation

The full project documentation is maintained in the Wiki/docs files.

https://github.com/enockola/tapitude/wiki

## Documentation Update Rule

To keep documentation easy to maintain, update the source page first:

- Scope changes go in [Project Plan](https://github.com/enockola/tapitude/wiki/Project-Plan).
- Post limits and lifecycle rules go in [Content Strategy](https://github.com/enockola/tapitude/wiki/Content-Strategy).
- Media upload or deletion changes go in [Media and Storage](https://github.com/enockola/tapitude/wiki/Media-and-Storage).
- Route changes go in [API Plan](https://github.com/enockola/tapitude/wiki/Api-Plan).
- Data field or relationship changes go in [Database Schema](https://github.com/enockola/tapitude/wiki/Database-Schema).

The README should stay short and point to the Wiki/docs for details.
