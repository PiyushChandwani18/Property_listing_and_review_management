const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js")

dbUrl=process.env.ATLAS_DB_URL ;

async function main() {
    await mongoose.connect(dbUrl);    
}

main()
.then(console.log("connected to database"))
.catch((err)=>{
    console.log(err);
})

//this function will clean the database i.e. if some data already exists in database ,it will be deleted
const initDB=async ()=>{

    await Listing.deleteMany();
    initData.data=initData.data.map((obj)=>({...obj, owner:"67f96c77157a411b3a2bcc96"}))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();