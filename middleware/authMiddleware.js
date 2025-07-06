const admin = require('firebase-admin');
const logger = require('../logger');

// list of admin emails supplied via environment variable
const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

// Populates res.locals with user info if a valid session cookie exists.
// This should run on every request. It NEVER blocks a request.
const checkUser = async (req, res, next) => {
    const sessionCookie = req.cookies.session || '';
    // Set defaults
    res.locals.user = null;
    res.locals.isAdmin = false;

    if (!sessionCookie) {
        return next();
    }

    try {
        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
        res.locals.user = decodedClaims;
        if (adminEmails.includes(decodedClaims.email)) {
            res.locals.isAdmin = true;
        }
    } catch (error) {
        // The cookie is invalid (e.g., expired). The user is effectively logged out.
        // This is a normal occurrence, not a server error.
        logger.info({ message: 'Invalid session cookie presented.', error: error.code });
        res.clearCookie('session'); // Clear the invalid cookie from the browser
    }

    next();
};

// Protects a route, requiring a valid user session to proceed.
// This middleware MUST run AFTER checkUser.
const requireAuth = (req, res, next) => {
    if (!res.locals.user) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    next();
};

// Protects a route, requiring a valid ADMIN session to proceed.
// This middleware MUST run AFTER checkUser.
const requireAdmin = (req, res, next) => {
    if (!res.locals.isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Administrator access required.' });
    }
    next();
}

module.exports = { requireAuth, checkUser, requireAdmin };
