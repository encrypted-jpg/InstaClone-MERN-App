const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    caption: {
        type: String
    },
    likeCnt: {
        type: Integer
    },
    likedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    image: {
        data: Buffer,
        contentType: String,
        required: true
    },
}, {
    timestamps: true
})


module.exports = mongoose.model('Post', postSchema);
