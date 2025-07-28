const { Router } = require('express');
const blogController = require('../controllers/blogController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const fastCsv = require('fast-csv');

const maxUploadBytes = parseInt(process.env.MAX_UPLOAD_BYTES, 10) || 100 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: maxUploadBytes, // default 100MB limit
    },
});


const router = Router();

router.get('/dashboard', requireAuth, blogController.get_dashboard);
router.post('/upload', requireAuth, upload.single('photo'), blogController.post_upload);
router.post('/upload-multiple', requireAuth, upload.array('images', 1000), blogController.post_uploadMultiple);
// optional query params: ?cursor=<key>&prev=<key>
router.get('/profile', requireAuth, blogController.get_profile);
// The personal gallery page is accessible to any authenticated user, including admins.
router.get('/personal-gallery', requireAuth, blogController.get_postData);

//Admin Routes

router.get('/admin/dashboard', requireAdmin, blogController.get_adminDashboard);
// optional query params: ?cursor=<key>&prev=<key>
router.get('/admin/dashboard/photos', requireAdmin, blogController.get_adminPhotos);
router.get('/admin/dashboard/hashtags', requireAdmin, blogController.get_adminHashtags);

const export_photos_csv = async (req, res) => {
    try {
        // The controller was already exporting fetchPhotos, so we can call it here.
        const photos = await blogController.fetchPhotos();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="photos.csv"');
        const csvStream = fastCsv.format({ headers: ['ID','User','Aperture','Shutter','EV','BaseValue','ImageURL'] });
        csvStream.pipe(res);
        photos.forEach((p) => {
            const shutter = p.tv ? `1/${Math.round(1/parseFloat(p.tv))}` : '';
            csvStream.write({ ID: p.id, User: p.user, Aperture: p.av, Shutter: shutter, EV: p.ev, BaseValue: p.sp, ImageURL: p.imageUrl });
        });
        csvStream.end();
    } catch (err) {
        // Consider adding your logger here
        res.status(500).send('Error generating photos CSV.');
    }
};

const export_hashtags_csv = async (req, res) => {
    try {
        const hashtags = await blogController.fetchHashtags();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="hashtags.csv"');
        const csvStream = fastCsv.format({ headers: ['Title','Count','Locked','AveragePrice'] });
        csvStream.pipe(res);
        hashtags.forEach((h) => csvStream.write({ Title: h.title, Count: h.count, Locked: h.utilityTokensLocked, AveragePrice: h.avgPrice }));
        csvStream.end();
    } catch (err) {
        res.status(500).send('Error generating hashtags CSV.');
    }
};

const export_users_csv = async (req, res) => {
    try {
        const users = await blogController.fetchUsersSummary();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
        const csvStream = fastCsv.format({ headers: ['Username','TotalPhotos','TotalHashtags','TotalWorth','AvgHashPerPhoto'] });
        csvStream.pipe(res);
        users.forEach((u) => {
            const avg = u.imageCount ? (u.hashtagsCount / u.imageCount).toFixed(2) : 0;
            csvStream.write({ Username: u.user, TotalPhotos: u.imageCount, TotalHashtags: u.hashtagsCount, TotalWorth: u.totalSp.toFixed ? u.totalSp.toFixed(3) : u.totalSp, AvgHashPerPhoto: avg });
        });
        csvStream.end();
    } catch (err) {
        res.status(500).send('Error generating users CSV.');
    }
};

// CSV export endpoints
router.get('/export/photos.csv', requireAdmin, export_photos_csv);
router.get('/export/hashtags.csv', requireAdmin, export_hashtags_csv);
router.get('/export/users.csv', requireAdmin, export_users_csv);



// router.get('/login', authController.login_get);
// router.post('/login', authController.login_post);
// router.get('/logout', authController.logout_get); 

module.exports = router;
