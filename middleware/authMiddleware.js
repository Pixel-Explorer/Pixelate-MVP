const admin = require('firebase-admin');
const logger = require('../logger');

// list of admin emails supplied via environment variable
const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

const requireAuth = (req, res, next) => {
    const sessionCookie = req.cookies.session || '';

    admin
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .then((decodedClaims) => {
            if(!decodedClaims){
                return res.status(401).json({ error: 'User is not authenticated' });
            }
            next();
        })
        .catch((error) => {
            logger.error(`Auth check failed: ${error}`);
            res.status(401).json({ error: 'User is not authenticated' });
        });
}

const requireAdmin = (req, res, next) => {
    const sessionCookie = req.cookies.session || '';

    admin
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .then((decodedClaims) => {
            if(!decodedClaims){
                return res.status(401).json({ error: 'User is not authenticated' });
            }
            if(!res.locals.isAdmin){
                return res.status(403).json({ error: 'Admin privileges required' });
            }
            next();
        })
        .catch((error) => {
            logger.error(`Admin check failed: ${error}`);
            res.status(401).json({ error: 'User is not authenticated' });
        });
}

// check current user
const checkUser = async (req, res, next) => {
    const token = req.cookies.session || " ";
    res.locals.isAdmin = false;
    try {
        const decodedClaims = await admin.auth().verifySessionCookie(token, true);
        res.locals.user = decodedClaims;
        if (adminEmails.includes(res.locals.user.email)) {
            res.locals.isAdmin = true;
        }
        logger.info(`Authenticated user ${res.locals.user.email}`);
        next();
    } catch (error) {
        res.locals.user = null;
        logger.warn('User authentication failed');
        next();
    }

}

module.exports = { requireAuth, checkUser, requireAdmin };
