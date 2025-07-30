const express = require('express');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const debugRoutes = require('./controllers/debugController');
const cookieParser = require('cookie-parser');
const csrf = require('tiny-csrf');
const helmet = require('helmet');
const crypto = require('crypto');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const firebaseClientConfig = require('./firebaseClientConfig');
const logger = require('./logger');

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

const CSRF_SECRET = requireEnv('CSRF_SECRET');

const app = express();

// middleware
// Enable standard Helmet protections but set the CSP header manually so we can
// include a per-request nonce.
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: false,
  })
);

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.cspNonce = nonce;
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' blob: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com https://www.gstatic.com https://apis.google.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://infird.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://cdn.jsdelivr.net`,
    "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.firebaseio.com https://www.google-analytics.com https://accounts.google.com",
    "frame-src 'self' https://apis.google.com https://accounts.google.com https://*.firebaseapp.com",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "media-src 'self'",
    "report-uri /csp-report",
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);
  next();
});

// endpoint to log CSP violations
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
    logger.error('CSP Violation Report:', JSON.stringify(req.body, null, 2));
    res.status(204).end();
});
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
if (process.env.NODE_ENV === 'test') {
  app.use((req, res, next) => {
    req.csrfToken = () => 'test';
    next();
  });
} else {
  app.use(csrf(CSRF_SECRET, ['POST']));
}

// view engine
app.set('view engine', 'ejs');

app.all('*', checkUser);
app.use(authRoutes);
app.use(blogRoutes);
app.use(debugRoutes);



const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`App is listening on ${PORT}`);
    });
}

// generic error handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Internal Server Error');
});

module.exports = app;
