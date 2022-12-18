const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Register New User
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, dob } = req.body;
    if (!name || !email || !password || !dob) {
        res.status(400)
        throw new Error('Please add all fields')
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        dob,
        followersCnt: 0,
        followers: [],
        following: [],
        followingCnt: 0,
        posts: []
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    }
    else {
        res.status(400)
        throw new Error('Invalid User Data')
    }
})


// @desc    Login User
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // Check User Email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    }
    else {
        res.status(400)
        throw new Error('Invalid Credentials')
    }
})


// @desc    Update Profile
// @route   PUT /api/users/profile
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const { name, dob } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user._id, { name: name, dob: dob });
    res.status(200).json({id: updatedUser._id});
})


// @desc    Update Password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    
    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updateUser = await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    res.status(200).json({id: updateUser._id});
})


// @desc    Delete User
// @route   DELETE /api/users/
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    for (let i = 0; i < user.followersCnt; i++){
        const followUser = await User.findById(user.followers[i]);
        var followUserFollowing = followUser.following;
        followUserFollowing.splice(followUserFollowing.indexOf(user._id), 1);
        const updatedFollowUser = await User.findByIdAndUpdate(followUser._id, {
            following: followUserFollowing,
            followingCnt: followUser.followingCnt - 1
        });
    }

    for (let i = 0; i < user.followingCnt; i++){
        const followUser = await User.findById(user.following[i]);
        var followUserFollowers = followUser.followers;
        followUserFollowers.splice(followUserFollowers.indexOf(user._id), 1);
        const updatedFollowUser = await User.findByIdAndUpdate(followUser._id, {
            followers: followUserFollowers,
            followersCnt: followUser.followersCnt - 1
        });
    }

    await user.remove();
    res.status(200).json({
        id: req.user._id
    });
})


// @desc    User Profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
})


// @desc    Follow another User
// @route   POST /api/users/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if (req.user._id === id) {
        res.status(400);
        throw new Error("Can't follow Yourself");
    }

    const user = await User.findById(req.user._id);
    const followUser = await User.findById(id).select('-password');
    const users = await User.find({ _id: user._id, following: { $in: [id] } }).count();
    if (users === 1) {
        res.status(400);
        throw new Error("Already Followed!");
    }
    const updatedUser = await User.findByIdAndUpdate(user._id, {
        following: user.following.concat([id]),
        followingCnt: user.followingCnt + 1
    });
    console.log(`${followUser.name} - ${followUser.followersCnt}`);
    const updatedFollowUser = await User.findByIdAndUpdate(id, {
        followers: followUser.followers.concat([user._id]),
        followersCnt: followUser.followersCnt + 1
    });
    res.status(200).json({
        id: user._id
    });
})


// @desc    Unfollow another User
// @route   POST /api/users/unfollow
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if (req.user._id === id) {
        res.status(400);
        throw new Error("Can't Unfollow Yourself");
    }

    const user = await User.findById(req.user._id);
    const followUser = await User.findById(id).select('-password');
    const users = await User.find({ _id: user._id, following: { $in: [id] } }).count();
    if (users === 0) {
        res.status(400);
        throw new Error("Not Followed!");
    }
    let userFollowing = user.following;
    userFollowing.splice(userFollowing.indexOf(id), 1);
    const updatedUser = await User.findByIdAndUpdate(user._id, {
        following: userFollowing,
        followingCnt: user.followingCnt - 1
    });
    let followUserFollowers = followUser.followers;
    followUserFollowers.splice(followUserFollowers.indexOf(user._id), 1);
    const updatedFollowUser = await User.findByIdAndUpdate(id, {
        followers: followUserFollowers,
        followersCnt: followUser.followersCnt - 1
    });
    res.status(200).json({
        id: user._id
    });
})


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}


const userController = {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    updatePassword,
    getProfile,
    followUser,
    unfollowUser
};


module.exports = userController;

