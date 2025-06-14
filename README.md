# Pixelate MVP

This project is a Node.js application for managing blog posts and photo uploads using Firebase. It requires Node.js and a Firebase service account for full functionality.

## Prerequisites

- **Node.js**: version 20 or higher is required. You can check your version with `node --version`.
- **Firebase configuration**: the application looks for a service account JSON
  file mounted at `/etc/secrets/firebase-service-account-key.json`. If present,
  it will be used automatically. When running locally, supply **all** Firebase
  settings via environment variables:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` (escape newlines with `\n`)
  - `GOOGLE_CLIENT_EMAIL`
  - `GOOGLE_PRIVATE_KEY` (escape newlines with `\n`)
  - see `.env.example` for an example configuration
  - `FIREBASE_DB_URL` (Realtime Database URL)
  - `FIREBASE_BUCKET` (Storage bucket name)
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`
  - `FIREBASE_MEASUREMENT_ID`

The application will exit during startup if any required variable is missing,
so make sure to provide your own values before running the server.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) set the `PORT` environment variable to control the server port. If not set, the app defaults to port `8080`.
3. (Optional) set `ADMIN_EMAILS` to a comma-separated list of addresses that should have admin access.
4. Start the server:
   ```bash
   node index.js
   ```
   You can also use `npm start` if you have updated the `start` script accordingly.

The application serves static files from the `public` directory and uses EJS templates in `views`.

## Deployment

This repository contains a `render.yaml` file for deploying the app to
[Render](https://render.com). To deploy:

1. Push your copy of the repository to GitHub.
2. Log in to Render and choose **New &rarr; Blueprint**.
3. Select your repository so Render can read `render.yaml` and create the web
   service.
4. Provide any required environment variables (for example `PORT` or Firebase
   credentials) in the Render dashboard.
5. Click **Apply** to provision the service and start the deployment.

When deployed on Render, responses will not automatically include the
`Content-Security-Policy` header defined in `firebase.json`. The middleware added
in `index.js` sets the same policy for every request so be sure to keep it
enabled when running on Render.

## Firebase Realtime Database Rules

The repository also includes a `database.rules.json` file for the Firebase
Realtime Database:

```json
{
  "rules": {
    "hashtags": { ".indexOn": ["title"] }
  }
}
```

Deploy these rules using the Firebase CLI:

```bash
firebase deploy --only database
```

## Firebase Hosting

The `firebase.json` file configures response headers for hosting, and
`index.js` sets the same `Content-Security-Policy` header at runtime. The policy
includes these directives:

- `default-src 'self'`
- `script-src-elem 'self' 'unsafe-inline' blob: https://cdn.jsdelivr.net https://fonts.googleapis.com https://www.gstatic.com https://cdnjs.cloudflare.com https://infird.com https://*.firebaseio.com`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net`
- `font-src 'self' data: https://fonts.gstatic.com`
- `img-src 'self' data: blob:`
- `connect-src 'self' https://firestore.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://www.google-analytics.com https://www.googleapis.com`
- `frame-ancestors 'none'`

Deploy the hosting configuration with:

```bash
firebase deploy --only hosting
```

## Running Tests

After installing dependencies, run:

```bash
npm test
```

This project uses Jest for testing, and `NODE_ENV` defaults to `test` when the suite runs.


## License

This project is licensed under the ISC License. See [LICENSE](LICENSE) for details.
