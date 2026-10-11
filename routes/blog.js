const express = require('express');
const multer = require('multer')
const path = require('path');
const Blog = require('../models/blog');
const Tag = require('../models/tag');
const Comment = require('../models/comment');
const Category = require('../models/category');


const router = express.Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`))
  },
  filename: function (req, file, cb) {
  const fileName = `${Date.now()}-${file.originalname}`
  cb(null,fileName)
  }
})

const upload = multer({ storage: storage })


router.get('/add-new',async(req, res)=>{
  const categories = await Category.find({})
  const tags = await Tag.find({});
  res.render('addBlog',{
    user: req.user,
    categories,
    tags,
  })
})

router.post('/', upload.single('coverImage'), async(req, res)=>{
 const {title, body, category} = req.body;

const tags = req.body.tag || [];

if(!Array.isArray(tags)){
  tags = [tags];
}
 const blog =  await Blog.create({
    body,
    title,
    tags: 
    category,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`
 })
 return res.redirect(`/blog/${blog._id}`)
})



router.get('/:id', async (req, res)=>{
  const blogs = await Blog.findById(req.params.id).populate('createdBy').populate('category').populate('tags');
  const comments = await Comment.find({blogId : req.params.id}).populate('createdBy')
  const isLiked = req.user? blogs.likes.includes(req.user._id): false;
  try{
      const blog = await Blog.findByIdAndUpdate(req.params.id,
        {
        $inc:{
          views: 1,
        }
      },
      {
        new: true
      }
    ).populate('createdBy');
    if(!blog){
      return res.status(404).send('Blog not found')
  }
    return res.render('blog',{
      user: req.user,
      blogs,
      comments,
      isLiked,
      blog,
    })
  }catch(error){
    console.log(error);
    res.status(500).send('Something went wrong')
  }

})


router.post('/comment/:blogId', async (req, res)=>{
  const {content} = req.body
  const blogId = req.params.blogId
  await Comment.create({
    content: req.body.content,
    blogId: blogId,
    createdBy: req.user._id,
  })
  return res.redirect(`/blog/${req.params.blogId}`)
})

router.get('/:id/edit',async(req, res)=>{
  const blog = await Blog.findById(req.params.id);

  if(!blog){
    return res.status(404).send('Blog Is Not Found')
  }

  if(blog.createdBy.toString() !== req.user._id.toString()){
    return res.status(403).send('You are not allowed to edit this blog')
  }

  return res.render('edit-blog',{
    blog,
  })
})

router.put('/:id', async(req, res)=>{

  const blog = await Blog.findById(req.params.id);

  if(!blog){
    return res.status(404).send('Blog is not found')
  }
  if(blog.createdBy.toString() !== req.user._id.toString()){
    return res.status(403).send("You are not allowed to update this blog")
  }

  const {title, body} = req.body
  await Blog.findByIdAndUpdate(req.params.id,{
    title,
    body,
  })
  return res.redirect(`/blog/${req.params.id}`)
})

router.delete('/:id', async(req, res)=>{
  const blog = await Blog.findById(req.params.id);
  if(!blog){
    return res.status(404).send("Blog is not found")
  }
  if(blog.createdBy.toString() !== req.user._id.toString()){
    return res.status(403).send("You are not allowed to delete this blog")
  }
  await Blog.findByIdAndDelete(req.params.id);
  return res.redirect('/');
})

router.post("/:id/like",async(req, res)=>{
  const blog = await Blog.findById(req.params.id)
    if(!blog){
      return res.status(404).send("Blog is not found");
    }
  const userId = req.user._id;
  const alredyLiked = blog.likes.includes(userId);
    if(alredyLiked){
      blog.likes.pull(userId)
    }else{
      blog.likes.push(userId);
    }
  await blog.save()
  return res.redirect(`/blog/${req.params.id}`)
})



module.exports = router;