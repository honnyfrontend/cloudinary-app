const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    format: String,
    size: Number,
    width: Number,
    height: Number,
    uploadedAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Image', ImageSchema);