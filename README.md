# Pixelate MVP

This project is a Node.js application for managing blog posts and photo uploads using Firebase. It requires Node.js and a Firebase service account for full functionality.

This project uses npm for dependency management. A `package-lock.json` file is provided; Yarn is not required.

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
  - `MAX_UPLOAD_BYTES` (optional upload size limit in bytes; defaults to 104857600)

The application will exit during startup if any required variable is missing,
so make sure to provide your own values before running the server.

## Installation

1. Install dependencies (includes `winston` for logging):
   ```bash
   npm install
   ```
2. Build vendor assets and (optionally) generate the Firebase client config:
   ```bash
   npm run build:assets
   # `npm start` runs build:config automatically, but run it manually if
   # you start the server with `node index.js`.
   npm run build:config
   ```
3. (Optional) set the `PORT` environment variable to control the server port. If not set, the app defaults to port `8080`.
4. (Optional) set `ADMIN_EMAILS` to a comma-separated list of addresses that should have admin access.
5. (Optional) set `MAX_UPLOAD_BYTES` to override the default 100MB upload limit.
6. Start the server:
   ```bash
   node index.js
   ```
   You can also use `npm start` if you have updated the `start` script accordingly.

The application serves static files from the `public` directory and uses EJS templates in `views`.

## Logging

This project uses the [Winston](https://github.com/winstonjs/winston) logger, configured in
[`logger.js`](logger.js). The log level defaults to `info` but can be changed with
the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=debug node index.js
```

By default logs are sent to the console. Additional transports or formatting can
be customized by editing `logger.js`.

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

When deployed on Render, responses include a `Content-Security-Policy`
header generated at runtime in `index.js`. The previous static policy in
`firebase.json` has been removed, so ensure the middleware remains
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

The `Content-Security-Policy` header is now generated dynamically in
`index.js` using a nonce value. An example of the directives produced at
runtime is:

- `default-src 'self'`
- `script-src 'self' 'nonce-<generated>' blob: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com https://www.gstatic.com https://apis.google.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://infird.com`
- `style-src 'self' 'nonce-<generated>' https://fonts.googleapis.com https://cdn.jsdelivr.net`
- `font-src 'self' data: https://fonts.gstatic.com`
- `img-src 'self' data: blob:`
- `connect-src 'self' https://firestore.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://www.google-analytics.com https://www.googleapis.com https://accounts.google.com`
- `frame-src 'self' https://apis.google.com https://accounts.google.com https://*.firebaseapp.com`
- `media-src 'self'`
- `frame-ancestors 'none'`

Any inline `<script>` or `<style>` blocks must include the nonce attribute:
```html
<script nonce="<%= cspNonce %>"></script>
<style nonce="<%= cspNonce %>"></style>
```
Alternatively move the code into external files served from the `public`
directory.

- Avoid inline `style` attributes; create reusable classes in `public/styles.css`.
- Always run `npm run build:assets` and `npm run build:config` before starting the server.
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

## Security and Bug Considerations

The Pixelate MVP codebase was adapted from various open-source projects and
may contain typical issues found in similar applications. When reviewing or
contributing code, keep the following areas in mind:

- **Authorization** – ensure all API routes and page actions properly check the
  current user's permissions before performing updates or returning sensitive
  data.
- **Input validation** – validate user-supplied values (including file uploads)
  and escape outputs to reduce the risk of XSS or injection flaws.
- **Error handling** – avoid leaking stack traces or other internal details in
  responses. Uncaught exceptions should be logged but not displayed to the
  client.
- **Dependencies** – periodically audit the `package.json` dependencies for
  newer versions and known security advisories.
- **Image processing** – test edge cases such as very large or malformed image
  files to ensure the pixelation logic fails gracefully.


## License

This project is licensed under the ISC License. See [LICENSE](LICENSE) for details.
