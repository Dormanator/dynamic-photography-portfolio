const mongoose = require('mongoose');

// MONGOOSE/MODEL CONFIG
const photoSchema = new mongoose.Schema({
    title: String,
    image: {
        id: String,
        thumb: String,
        small: String,
        medium: String,
        large: String
    },
    alt: String,
    tag: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);