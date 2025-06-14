const express = require('express');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const debugRoutes = require('./controllers/debugController');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const firebaseClientConfig = require('./firebaseClientConfig');

const app = express();

// generate Firebase config for client
const configPath = path.join(__dirname, 'public', 'firebaseConfig.js');
const configContent = 'export default ' + JSON.stringify(firebaseClientConfig, null, 2) + ';\n';
fs.writeFileSync(configPath, configContent);

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "script-src-elem": [
        "'self'",
        "'unsafe-inline'",
        "blob:",
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com",
        "https://www.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://infird.com",
        "https://*.firebaseio.com",
      ],
      "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
      ],
      "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "blob:"],
      "connect-src": [
        "'self'",
        "https://firestore.googleapis.com",
        "https://*.firebaseio.com",
        "https://identitytoolkit.googleapis.com",
        "https://www.google-analytics.com",
        "https://www.googleapis.com",
      ],
      "frame-ancestors": ["'none'"],
    },
  })
);
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")))
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")))
app.use("/jquery", express.static(path.join(__dirname, "node_modules/jquery/dist")))

// view engine
app.set('view engine', 'ejs');

app.all('*', checkUser);
app.use(authRoutes);
app.use(blogRoutes);
app.use(debugRoutes);



const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`App is listening on ${PORT}`)
    });
}

// generic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

module.exports = app;
