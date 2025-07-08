const multer = require('multer');
const { storage, cloudinary } = require('../config/cloudinary');
const Image = require('../models/Image');

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Apenas imagens JPEG, PNG ou GIF são permitidas!'), false);
    }
    cb(null, true);
  }
}).single('image');

const uploadImage = async (req, res) => {
  try {
    req.setTimeout(120000);

    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          console.error('Erro no upload:', err);
          if (err.message.includes('File too large')) {
            return res.status(400).json({ message: 'Arquivo muito grande (máximo 5MB)' });
          }
          return reject(err);
        }
        resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const newImage = new Image({
      url: req.file.path,
      publicId: req.file.filename,
      format: req.file.mimetype.split('/')[1],
      size: req.file.size,
      width: req.file.width,
      height: req.file.height,
      author: req.body.author || 'Anônimo'
    });

    await newImage.save();

    const thumbnailUrl = cloudinary.url(req.file.filename, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto'
    });

    res.status(200).json({
      success: true,
      message: 'Upload realizado com sucesso!',
      imageUrl: req.file.path,
      thumbnailUrl: thumbnailUrl,
      imageId: newImage._id,
      publicId: req.file.filename,
      author: newImage.author,
      details: {
        format: newImage.format,
        size: newImage.size,
        dimensions: {
          width: req.file.width,
          height: req.file.height
        }
      }
    });

  } catch (error) {
    console.error('Erro no controller:', error);
    
    if (req.file?.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    res.status(500).json({ 
      success: false,
      message: 'Erro durante o processamento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    await cloudinary.uploader.destroy(publicId);
    await Image.findOneAndDelete({ publicId });
    
    res.json({ 
      success: true, 
      message: 'Imagem deletada com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Falha ao deletar imagem',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { 
  uploadImage,
  deleteImage
};