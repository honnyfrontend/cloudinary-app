require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Image = require('./models/Image');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro na conexão:', err));

// Rotas
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/uploads', uploadRoutes);

// Rota para listar imagens agrupadas por autor
app.get('/api/uploads', async (req, res) => {
    try {
        const images = await Image.find().sort({ author: 1, uploadedAt: -1 });
        res.json(images);
    } catch (error) {
        console.error('Erro ao buscar imagens:', error);
        res.status(500).json({ message: 'Erro ao carregar imagens' });
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});