const { Router } = require('express');
const authController = require('../controllers/authController');
const {
  validateSignup,
  validateLogin,
} = require('../middleware/validationMiddleware');


// ... other code ...




const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', validateSignup, authController.signup_post);
router.get('/', authController.login_get);
router.get('/login', authController.login_get);
router.post('/login', validateLogin, authController.login_post);
router.get('/logout', authController.logout_get);

module.exports = router;
