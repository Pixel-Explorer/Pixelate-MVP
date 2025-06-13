const admin = require('firebase-admin');

const firebaseClientConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const handleErrors = (err) => {
    console.error(err.message, err.code);
    let errors = { email: '', password: '' };

    if (err.message === 'Incorrect Email') {
        errors.email = 'That email is not registered';
    }

    if (err.message === 'Incorrect Password') {
        errors.password = 'Incorrect Password';
    }

    // duplicate email error
    if (err.code === 11000) {
        errors.email = 'Entered email is already registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('users validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

module.exports.signup_get = (req, res) => {
    res.render('signup', {
        pageTitle: "Sign Up",
        firebaseConfig: firebaseClientConfig
    });
}

module.exports.login_get = (req, res) => {
    res.render('login', {
        pageTitle: "Login",
        firebaseConfig: firebaseClientConfig
    });
}

module.exports.signup_post = async (req, res) => {
    try {
        const userResponse = await admin.auth().createUser({
            email: req.body.email,
            password: req.body.password,
        })
        res.json(userResponse);
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {

    const idToken = req.body.idToken.toString();

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    admin
        .auth()
        .createSessionCookie(idToken, { expiresIn })
        .then(
            (sessionCookie) => {
                const options = { maxAge: expiresIn, httpOnly: true };
                if (process.env.NODE_ENV === 'production') {
                    options.secure = true;
                }
                res.cookie('session', sessionCookie, options);
                res.end(JSON.stringify({ status: 'success' }));
            },
            (err) => {
                const errors = handleErrors(err);
                res.status(400).json({ errors });
            }
        )
        .catch((err) => {
            const errors = handleErrors(err);
            res.status(400).json({ errors });
        })
}

module.exports.logout_get = (req, res) => {
    res.clearCookie("session");
    res.redirect('/');
}
