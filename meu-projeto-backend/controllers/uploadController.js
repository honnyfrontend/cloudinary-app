const multer = require('multer');
const { storage, cloudinary } = require('../config/cloudinary');
const Image = require('../models/Image');

// Configuração do Multer com Cloudinary
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
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
    // Configura timeout de 2 minutos
    req.setTimeout(120000);

    // Executa o upload
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

    // Cria registro no MongoDB
    const newImage = new Image({
      url: req.file.path,
      publicId: req.file.filename,
      format: req.file.mimetype.split('/')[1],
      size: req.file.size,
      width: req.file.width,
      height: req.file.height
    });

    await newImage.save();

    // Gera URL de thumbnail (opcional)
    const thumbnailUrl = cloudinary.url(req.file.filename, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto'
    });

    // Resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Upload e armazenamento realizados com sucesso!',
      imageUrl: req.file.path,
      thumbnailUrl: thumbnailUrl,
      imageId: newImage._id,
      publicId: req.file.filename,
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
    
    // Tenta remover do Cloudinary em caso de falha no MongoDB
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
    
    // Remove do Cloudinary
    await cloudinary.uploader.destroy(publicId);
    
    // Remove do MongoDB
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