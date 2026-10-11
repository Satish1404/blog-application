const express = require('express');
const Blog = require('../models/blog');

const router = express.Router();

router.get("/",async(req, res)=>{

  const search = req.query.q || '';
  const page = parseInt(req.query.page) || 1;
  const blogsPerPage = 10;
  const skip = (page - 1) * blogsPerPage;
  const query = {
    $or :[
      {
        title:{
          $regex: search,
          $options: 'i',
        }
      },
    {
      body:{
        $regex: search,
        $options: 'i'
      }
    }
    ]
  }

  const blogs = await Blog.find(query).sort({createdAt: -1}).skip(skip).limit(blogsPerPage)

  const totalBlogs = await Blog.countDocuments(query);
  const totalPages = Math.ceil(totalBlogs / blogsPerPage)


    return res.render('search',{
      blogs,
      search,
      user: req.user,
      currentPage: page,
      totalPages,
      
    });


})

module.exports = router;