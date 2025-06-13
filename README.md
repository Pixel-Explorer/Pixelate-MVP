# Pixelate MVP

This application requires Firebase and Google Sheets service account credentials. Provide these credentials through environment variables before starting the server.

Set the following variables:

- `FIREBASE_CREDENTIALS` – JSON string of the Firebase service account used for `firebase-admin`.
- `GOOGLE_SHEETS_CREDENTIALS` – JSON string of the Google service account used for accessing Google Sheets.

When storing the private key in these variables, replace actual newline characters with `\n`. The application will convert them automatically at runtime.

Example using a `.env` file:

```bash
FIREBASE_CREDENTIALS='{"type":"service_account", ... }'
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account", ... }'
```

You can load the variables with [dotenv](https://www.npmjs.com/package/dotenv) or through your deployment environment's configuration.
