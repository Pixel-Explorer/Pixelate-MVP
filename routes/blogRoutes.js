const { Router } = require('express');
const blogController = require('../controllers/blogController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB file size limit
    },
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.cr2', '.nef', '.dng'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    }
});


const router = Router();

router.get('/dashboard', requireAuth, blogController.get_dashboard);
router.post('/upload', upload.single('photo'), blogController.post_upload);
router.post('/upload-multiple', upload.array('images', 1000), blogController.post_uploadMultiple);
router.get('/profile', requireAuth, blogController.get_profile);
// The photo details page is accessible to any authenticated user, including admins.
router.get('/photo-details', requireAuth, blogController.get_postData);

//Admin Routes

router.get('/admin/dashboard', requireAdmin, blogController.get_adminDashboard);
router.get('/admin/dashboard/photos',requireAdmin, blogController.get_adminPhotos);
router.get('/admin/dashboard/hashtags',requireAdmin, blogController.get_adminHashtags);


// router.get('/login', authController.login_get);
// router.post('/login', authController.login_post);
// router.get('/logout', authController.logout_get); 

module.exports = router;
