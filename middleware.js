const Listing = require('./models/listing.js'); // Import the Listing model
const Review = require('./models/review.js'); // Import the Review model
const expressError = require('./utils/expressError'); // Import the expressError utility
const {listingSchema,reviewSchema} = require('./schema.js'); // Import the listingSchema validation schema

module.exports.isLoggedIn= (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async (req,res,next)=>{
    let {id}=req.params;
    let editedListing=req.body.listing;
    let listing=await Listing.findById(id)
    if(!listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error","You are not the owner of this listing!")
        return res.redirect(`/listings/${id}`)
    }
    next();
}

module.exports.isAuthor=async (req,res,next)=>{
    let {id}=req.params;
    let {reviewId}=req.params;
    let listing=await Listing.findById(id)
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error","You are not the author of this review!")
        return res.redirect(`/listings/${id}`)
    }
    next();
}

module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if (error){
        throw new expressError(400,error);
    }else{
        next();
    }
}

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if (error){
        throw new expressError(400,error);
    }else{
        next();
    }
}