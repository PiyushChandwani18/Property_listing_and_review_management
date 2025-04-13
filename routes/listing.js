const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync");
const {isLoggedIn,isOwner,validateListing} =require("../middleware.js");

const listingController=require("../controllers/listing.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({storage});

//Index route
router.get("/",
    wrapAsync(listingController.index)
)

//New and Create route
router.get("/new",
    isLoggedIn,
    listingController.renderNewListingForm
)
router.post("/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
)


//Show route  
router.get("/:id",
    wrapAsync(listingController.showListing)
)

//edit and update route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditListingForm)
)
router.put("/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
)

//Delete route
router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
)

module.exports=router;