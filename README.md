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
