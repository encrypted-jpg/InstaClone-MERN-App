const express = require('express');
const router = express.Router();
const userControls = require('../controller/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', userControls.registerUser);
router.post('/login', userControls.loginUser);
router.put('/profile', protect, userControls.updateUser);
router.delete('/', protect, userControls.deleteUser);
router.put('/password', protect, userControls.updatePassword);
router.get('/profile', protect, userControls.getProfile);
router.post('/follow', protect, userControls.followUser);
router.post('/unfollow', protect, userControls.unfollowUser);


module.exports = router;