const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync");
const {isLoggedIn,isOwner,validateListing,validateReview, isAuthor} =require("../middleware.js");

const reviewController=require("../controllers/review.js");


//Post Review route
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
)

//Delete Review route
router.delete("/:reviewId",
    isLoggedIn,
    isAuthor,
    wrapAsync(reviewController.deleteReview)
)

module.exports=router;