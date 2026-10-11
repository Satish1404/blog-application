const express = require('express');
const User = require('../models/user');
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const Category = require('../models/category');
const Tag = require('../models/tag');


const router = express.Router();

const {restrictToAdmin} = require('../middlewares/admin')

router.get("/", restrictToAdmin, async(req, res)=>{

    const totalUsers = await User.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalCategories = await Category.countDocuments();
    const tatalTags = await Tag.countDocuments();

    res.render("admin/dashboard",{
       user: req.user,
       totalUsers,
       totalBlogs,
       totalComments,
       totalCategories,
       tatalTags

    })
})


module.exports = router;