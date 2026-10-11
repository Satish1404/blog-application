const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
const userRoute = require('./routes/user')
const blogRoute = require('./routes/blog')
const categoryRoute = require('./routes/category')
const searchRoute = require('./routes/search');
const adminRoute = require('./routes/admin')
const Blog = require('./models/blog');

const methodoverride = require('method-override')



const app = express();
const PORT = 8000;

mongoose.connect('mongodb://localhost:27017/blogify').then((e) => console.log('mongoDB is connected'))

app.use(express.urlencoded({extended:false}))
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')))
app.use(methodoverride('_method'))

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'))

app.use('/user', userRoute)
app.use('/blog', blogRoute)
app.use('/category', categoryRoute)
app.use('/search', searchRoute)
app.use('/admin', adminRoute)

app.get('/',async(req, res)=>{
   // const allBlogs = await Blog.find({}).populate('createdBy').sort({createdAt: - 1})
   const page = parseInt(req.query.page) || 1;
   const blogsPerPage = 10;
   const skip = (page - 1) * blogsPerPage;
   const blogs = await Blog.find().sort({createdAt: -1}).skip(skip).limit(blogsPerPage);
   const totalBlogs = await Blog.countDocuments();
   const totalPages = Math.ceil(totalBlogs / blogsPerPage);
   const trendingBlogs = await Blog.find().populate('createdAt').sort({views: -1}).limit(6)
    res.render('home',{
        user: req.user,
        blogs,
        currentPage: page,
        totalPages,
        trendingBlogs,
    })
})


app.listen(PORT,()=>{
    console.log(`sever running At http://localhost:${PORT}`)
})