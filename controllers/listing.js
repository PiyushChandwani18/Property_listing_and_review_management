const Listing = require('../models/listing.js'); // Adjust the path as necessary
const axios = require('axios');

//index route
module.exports.index=async (req,res)=>{
    const { search, category } = req.query; // Get the category from the query parameters
    let filter = {}; // Initialize an empty filter object

    if (search) {
        filter.$or = [
            {   title: { $regex: search, $options: 'i' } },   // Case-insensitive search
            {   'location.city': { $regex: search, $options: 'i' } },    // Case-insensitive search
            {   country: { $regex: search, $options: 'i' } },    // Case-insensitive search
            {   category: { $regex: search, $options: 'i' } }  // Case-insensitive search
        ];

    }
    if (category) {
        filter.category = category; // Add the category filter if provided
    }
    const allListings=await Listing.find(filter);
    //console.log(allListings);
    res.render("./listings/index.ejs",{allListings,search})
}

//New and Create route
module.exports.renderNewListingForm=(req,res)=>{
    res.render("./listings/new.ejs")
}

module.exports.createListing=async (req,res,next)=>{
    const enteredLocation = req.body.listing.location; // Assuming the user provides a location
    const { address } = req.body.listing; // Assuming the user provides an address
    const apiKey = process.env.MAP_API_KEY;

    // Geocode the address to get latitude and longitude
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
            address: address,
            key: apiKey,
        },
    });

    if (!response.data.results || response.data.results.length === 0) {
        req.flash("error", "Unable to geocode the provided address.");
        return res.redirect("/listings/new");
    }
    const location = response.data.results[0].geometry.location; // { lat: ..., lng: ... }

    // let result=listingSchema.validate(req.body);
    // console.log(result)
    // if (result.error){
    //     throw new expressError(400,result.error);
    // }

    let url=req.file.path;
    let filename=req.file.filename;
    let newListing=new Listing(req.body.listing);
    // let {title,description,image,price,location,country}=req.body;
    // let newListing=new Listing({
    //     title:title,
    //     description:description,
    //     image:image,
    //     price:price,
    //     location:location,
    //     country:country
    // });
    newListing.owner=req.user._id;
    newListing.image={
        url:url,
        filename:filename
    }
    newListing.location = {
        city: enteredLocation,
        lat: location.lat,
        lng: location.lng,
        address: address,
    };
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings"); 

}

//Show route
module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    let specificListing=await Listing.findById(id)
        .populate({
            path:"reviews",
            populate:{
                path:"author",
            }
        })
        .populate("owner");
    if(!specificListing){
        req.flash("error","Listing you requested for does not exist!")
        res.redirect("/listings");
    }
    else{
        res.render("./listings/show.ejs",{specificListing})
    }
}

//edit and update route
module.exports.renderEditListingForm=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    
    if(!listing){
        req.flash("error","Listing you requested for does not exist!")
        res.redirect("/listings");
    }else{
        let originalImageUrl=listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload/","/upload/w_250/");
        res.render("./listings/edit.ejs",{listing,originalImageUrl})
    }
    
}

module.exports.updateListing=async (req,res)=>{
    let {id}=req.params;
    let editedListing=req.body.listing;
    const enteredLocation = req.body.listing.location; // Assuming the user provides a location
    const { address } = req.body.listing; // Assuming the user provides an address
    const apiKey = process.env.MAP_API_KEY;

    // Geocode the address to get latitude and longitude
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
            address: address,
            key: apiKey,
        },
    });

    if (!response.data.results || response.data.results.length === 0) {
        req.flash("error", "Unable to geocode the provided address.");
        return res.redirect("/listings/new");
    }
    const location = response.data.results[0].geometry.location; // { lat: ..., lng: ... }
    editedListing.location = {
        city: enteredLocation,
        lat: location.lat,
        lng: location.lng,
        address: address,
    };

    // let listing=await Listing.findById(id)
    // if(!listing.owner.equals(res.locals.currentUser._id)){
    //     req.flash("error","You don't have permission to edit this listing!")
    //     return res.redirect(`/listings/${id}`)
    // }
    let updatedListing=await Listing.findByIdAndUpdate({_id:id},editedListing);
    if(req.file){
        let url=req.file.path;
        let filename=req.file.filename;
        updatedListing.image={
            url:url,
            filename:filename
        };
        await updatedListing.save();
    }
    
    // let {title,description,image,price,location,country}=req.body;
    // let updatedListing=await Listing.findByIdAndUpdate({_id:id},{
    //     title:title,
    //     description:description,
    //     image:image,
    //     price:price,
    //     location:location,
    //     country:country
    // })

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`)
    
}

//Delete route
module.exports.deleteListing=async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings")
}