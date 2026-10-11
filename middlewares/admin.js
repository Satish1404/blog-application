
function restrictToAdmin(req, res , next){
    if(!req.user){
        return res.rediredct("/login");
    }
    if(req.user.role !== "ADMIN"){
        return res.status(403).send("Access Denied")
    }
    next()
}

module.exports = {
    restrictToAdmin,
}
