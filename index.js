const express = require('express');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const debugRoutes = require('./controllers/debugController');
const cookieParser = require('cookie-parser');
const csrf = require('tiny-csrf');
const helmet = require('helmet');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const firebaseClientConfig = require('./firebaseClientConfig');
const logger = require('./logger');

const app = express();

// middleware
app.use(
  helmet({
    // This is necessary to allow for Google Sign-In popups.
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        // By default, only allow resources from our own origin.
        "default-src": ["'self'"],
        // NOTE: 'unsafe-inline' and 'unsafe-eval' are security risks.
        // They are often required for libraries like Bootstrap or older frameworks.
        // The long-term goal should be to refactor to remove their necessity.
        "script-src": [
          "'self'",
          "'unsafe-inline'", // For inline event handlers (e.g., onclick)
          "'unsafe-eval'",   // For eval()-like mechanisms used by some libraries
          "blob:",           // For scripts created dynamically by libraries
          "https://cdn.jsdelivr.net", // For CDNs like Bootstrap
          "https://cdnjs.cloudflare.com", // For js-cookie and other libraries
          "https://fonts.googleapis.com",
          // Firebase and Google Auth domains
          "https://apis.google.com",
          "https://www.gstatic.com",
          "https://*.firebaseio.com",
          "https://www.googleapis.com",
          "https://identitytoolkit.googleapis.com",
          "https://securetoken.googleapis.com",
          "https://infird.com",
        ],
        // Allow inline event handlers (e.g., onclick). This is needed because
        // helmet's default policy sets 'script-src-attr' to 'none'.
        // This is still a security risk and should be removed if possible by
        // attaching event listeners in your JS code instead.
        "script-src-attr": ["'unsafe-inline'"],
        "style-src": [
          "'self'",
          "'unsafe-inline'", // For inline styles
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
        ],
        "img-src": [
          "'self'",
          "data:", // For base64 encoded images
          "blob:"  // For images created dynamically in the browser
        ],
        "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
        "connect-src": [
          "'self'",
          // Firebase and Google Auth domains
          "https://firestore.googleapis.com",
          "https://identitytoolkit.googleapis.com",
          "https://www.googleapis.com",
          "https://*.firebaseio.com",
          "https://www.google-analytics.com",
          "https://accounts.google.com",
        ],
        "frame-src": [
          "'self'",
          "https://apis.google.com",
          "https://accounts.google.com",
          "https://*.firebaseapp.com",
        ],
        "frame-ancestors": ["'none'"],
        "media-src": ["'self'"],
        "report-uri": ["/csp-report"],
      }
    }
  })
);

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
  app.use(csrf(process.env.CSRF_SECRET, ['POST']));
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
