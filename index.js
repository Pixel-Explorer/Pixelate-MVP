const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const debugRoutes = require('./controllers/debugController');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// apply security headers including Content Security Policy
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: false,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "blob:",
                'https://cdn.jsdelivr.net',
                'https://fonts.googleapis.com',
                'https://www.gstatic.com',
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                'https://fonts.googleapis.com',
                'https://cdn.jsdelivr.net',
            ],
            fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: [
                "'self'",
                'https://firestore.googleapis.com',
                'https://*.firebaseio.com',
            ],
            frameAncestors: ["'none'"],
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
