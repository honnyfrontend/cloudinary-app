const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado com sucesso!');
  } catch (err) {
    console.error('Erro na conexão com MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;