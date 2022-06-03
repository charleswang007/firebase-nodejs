const auth = function(req,res,next){
    if(!res.locals.session.uid) return res.redirect("/");
    next();
}

module.exports = auth;
