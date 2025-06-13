# Pixelate MVP

This project is a Node.js application for managing blog posts and photo uploads using Firebase. It requires Node.js and a Firebase service account for full functionality.

## Prerequisites

- **Node.js**: version 20 or higher is required. You can check your version with `node --version`.
- **Firebase configuration**: the server expects Firebase service account credentials in the root directory:
  - `sdk-firebase.json` – your Firebase Admin SDK service account.
  - `haus-of-pixels-e9f3b6d268f5.json` – credentials used for Google Sheets access.

Ensure these files contain your own credentials before starting the application.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) set the `PORT` environment variable to control the server port. If not set, the app defaults to port `8080`.
3. Start the server:
   ```bash
   node index.js
   ```
   You can also use `npm start` if you have updated the `start` script accordingly.

The application serves static files from the `public` directory and uses EJS templates in `views`.
