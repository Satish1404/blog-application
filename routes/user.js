const express = require('express');
const User = require('../models/user');
const upload = require('../middlewares/upload');
const Blog = require('../models/blog');


const router = express.Router();

router.get('/signup', (req, res)=>{
    res.render('signup')
})

router.get('/signin', (req, res)=>{
    res.render('signin')
})

router.post('/signin', async (req, res)=>{
    const {email, password, fullName} = req.body
    try{
         const token = await User.matchpasswordAndGenerateToken(email, password, fullName)
         return res.cookie('token', token).redirect('/')
    }catch(error){
        return res.render('signin',{
        error: "incorect email or password"
      })
    }   
})

router.post('/signup', async (req, res)=>{
    const {fullName, email, password} = req.body
   await User.create({
        fullName,
        email,
        password,
    })
    return res.redirect('/signin')
})

router.get('/logout',(req, res)=>{
  res.clearCookie('token').redirect('/')
})

router.get('/profile', async(req, res)=>{
  const user = await User.findById(req.user._id);
  const blogs = await Blog.find({createdBy: user})
  return res.render('profile',{
    user,
    blogs,
  })
})

router.get('/profile/edit', async(req, res)=>{
    const user = await User.findById(req.user._id);
    return res.render('edit-profile',{
        user,
    })
})

router.post('/profile/edit',async(req, res)=>{
    const {fullName, email, bio, location, website} = req.body;
    await User.findByIdAndUpdate(req.user._id, {
        fullName,
        email,
        bio,
        location,
        website
    })

   return res.redirect('/user/profile');
})

router.post('/profile/image', upload.single('profileImage'), async(req, res)=>{
const userId = req.user._id;
await User.findByIdAndUpdate(userId,{profileImageURL: `/images/${req.file.filename}`})

return res.redirect('/user/profile')
})

module.exports = router;