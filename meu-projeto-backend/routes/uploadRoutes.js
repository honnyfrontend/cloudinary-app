const express = require('express');
const router = express.Router();
const { upload, uploadImage, deleteImage } = require('../controllers/uploadController');

router.post('/', upload.single('image'), uploadImage);
router.delete('/:publicId', deleteImage);

module.exports = router;