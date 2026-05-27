# Deployment Plan

This document is a starter deployment and scalability plan.

## Environment Variables

Create a `.env.example` file with the required values:

```txt
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tapitude_creator_hub
SESSION_SECRET=replace_this_with_a_long_random_secret
APP_BASE_URL=http://localhost:3000
```

## Development Setup

The team can start locally with:

```txt
npm install
npm run dev
```

## Suggested NPM Scripts

```json
{
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "test": "node --test"
  }
}
```

## Production Considerations

Before production, the team should plan for:

- Hosted MongoDB database
- Secure environment variables
- HTTPS
- Logging
- Error handling
- Restart process if the server crashes
- Database backups
- Basic monitoring

## Media Storage

Tapitude should not store creator-uploaded media files or documents in the MVP.

Instead, creators should provide external links or embeds for media. Tapitude will store the URL or embed reference in MongoDB and render it on the public content page.

This keeps the app simpler, reduces storage costs, and avoids responsibility for managing creator files.

## Scaling Notes

The first version should focus on clean structure and working features.

Later scaling can include:

- Database indexes
- Caching
- CDN for public assets
- Load balancing
- Background jobs for scheduled posts
- Better logging and monitoring
