const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const debugRoutes = require('./controllers/debugController');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
// Content Security Policy to match firebase.json
const CSP_VALUE = "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' blob: https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
  "font-src 'self' data: https://fonts.gstatic.com; " +
  "img-src 'self' data: blob:; " +
  "connect-src 'self' https://firestore.googleapis.com https://*.firebaseio.com; " +
  "frame-ancestors 'none';";

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// apply the same Content Security Policy as firebase hosting
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', CSP_VALUE);
    next();
});
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

module.exports = app;
