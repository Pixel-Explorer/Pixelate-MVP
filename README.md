# Pixelate-MVP

This project uses Firebase on the client side. The Firebase configuration is now loaded from environment variables. Before running or deploying the application, define the following variables in your environment:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`

For local development you can create a `.env` file or export them in your shell. When deploying to platforms such as Render or Heroku, add the same keys through the provider's environment variable settings.
