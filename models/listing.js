const mongoose=require("mongoose");
const Review=require("./review");
const { required } = require("joi");

const listingSchema=mongoose.Schema({
    title: {
        type:String,
    },
    description : String,
    image:  {
        url:String,
        filename:String
    },
    price: {
        type:Number,
        min:0
    },
    location: {
        city: String,
        lat: Number,
        lng: Number,
        address: String,
      },
    country: {
        type:String,
        
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    category:{
        type:[String],
        enum:["House","Cottage","Flats","Rooms","Hotels","Iconic cities","Mountains","Castles","Beachfront","Amazing pools","Camping"],
        required:true,
    },
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})

const Listing=mongoose.model("Listing",listingSchema);


module.exports=Listing;