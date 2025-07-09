const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuração do armazenamento
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'meu-projeto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

module.exports = { cloudinary, storage };