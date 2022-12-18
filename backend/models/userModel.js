const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    dob: {
        type: Date
    },
    followersCnt: {
        type: Number
    },
    followers: [{
        type: String
    }],
    followingCnt: {
        type: Number
    },
    following: [{
        type: String
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
}, {
    timestamps: true
})


module.exports = mongoose.model('User', userSchema);
