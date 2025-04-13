const User = require('../models/user'); // Import the User model

//signup route
module.exports.renderSignupForm=(req, res) => {
    res.render("users/signup.ejs");
}
module.exports.signup=async(req,res)=>{
    try {
        let {username,email,password}=req.body;
        const newUser=new User({
            username:username,
            email:email
        });

        const registeredUser=await User.register(newUser,password);
        req.login(registeredUser, (err) => {
            if (err){
                return next(err);
            } 
            req.flash("success","Welcome to Wanderlust!");
            res.redirect("/listings");
        });
        } catch (error) {
            req.flash("error",error.message);
            res.redirect("/signup");
            
        }   
}

//login route
module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
}
module.exports.login=async(req,res)=>{
    req.flash("success","Welcome back to WanderLust!");
    res.redirect(res.locals.redirectUrl || "/listings");
}

//logout route
module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged you out!");
        res.redirect("/");
    })
}