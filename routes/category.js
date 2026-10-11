const express = require("express");
const Category = require("../models/category");

const router = express.Router();


router.get("/", async(req, res)=>{
    const categories = await Category.find({});
    return res.render('categories',{
        user: req.user,
        categories,
    })
})


module.exports = router