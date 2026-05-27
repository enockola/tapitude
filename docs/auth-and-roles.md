# Authentication and Roles

## User Roles

The project should start with two roles:

```txt
admin
creator
```

## Admin

Admins can manage the system.

Possible permissions:

- Create creator accounts
- View creator accounts
- Edit creator account status
- View creator content for support/moderation

## Creator

Creators can manage their own content.

Possible permissions:

- View their dashboard
- Create content pages
- Edit their own content pages
- Save drafts
- Schedule posts
- Publish posts
- Customize content page themes

## Consumer

Consumers do not need accounts.

They only view public content pages through a URL like:

```txt
/p/:slug
```

## Auth Recommendation

For this dashboard project, cookie/session-based authentication is a good simple option.

The app should include:

- Password hashing
- Login route
- Logout route
- Protected dashboard routes
- Role-based middleware
- Secure environment variables
