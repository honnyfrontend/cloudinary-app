const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'maridos-de-aluguel',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
    }
});

const upload = multer({ storage });

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhuma imagem enviada' });
        }

        const newImage = new Image({
            url: req.file.path,
            publicId: req.file.filename,
            author: req.body.author || 'Anônimo'
        });

        await newImage.save();
        res.status(201).json(newImage);

    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.params;

        // Verifica se a imagem existe no banco
        const image = await Image.findOne({ publicId });
        if (!image) {
            return res.status(404).json({ message: 'Imagem não encontrada' });
        }

        // Remove do Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Remove do banco de dados
        await Image.deleteOne({ publicId });

        res.json({ message: 'Imagem excluída com sucesso' });

    } catch (error) {
        console.error('Erro ao excluir:', error);
        res.status(500).json({ message: 'Erro ao excluir imagem' });
    }
};

module.exports = { upload, uploadImage, deleteImage };