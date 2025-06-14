const { Router } = require('express');
const authController = require('../controllers/authController');
const csrf = require('csurf');


const router = Router();
const csrfProtection = csrf({ cookie: true });

router.use(csrfProtection);
router.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/', authController.login_get);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);

module.exports = router;
