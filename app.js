if (process.env.NODE_ENV !== "production") { // Check if the environment is not production,Now we are developing, during deployment we will set this variable as production
    require("dotenv").config(); // Load environment variables from .env file
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing");
const path=require("path");
const wrapAsync=require("./utils/wrapAsync")
const expressError=require("./utils/expressError")
const {listingSchema,reviewSchema}=require("./schema")
const Review=require("./models/review.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const session=require("express-session");
const MongoStore=require("connect-mongo"); //for storing session in mongoDB
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const dbUrl=process.env.ATLAS_DB_URL;

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600, //time in seconds after which session will be updated
})

store.on("error",function(err){
    console.log("session store error",err);
})

const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
    }
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const methodOverride=require("method-override");
app.use(methodOverride("_method"));

const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate);

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static(path.join(__dirname,"public")))

// const Mongo_url="mongodb://127.0.0.1:27017/wanderlust";


async function main() {
    await mongoose.connect(dbUrl);    
}

main()
.then(console.log("connected to database"))
.catch((err)=>{
    console.log(err);
})

app.listen(8080,()=>{
    console.log("server listening to port 8080")

})

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    next();
})

app.get("/",(req,res)=>{
    res.render("home.ejs");
})

app.use("/listings",listingRouter);

app.use("/listings/:id/reviews",reviewRouter);

app.use("/",userRouter);

//if request is sent to any undefined page
app.all("*",(req,res,next)=>{           
    next(new expressError(404,"Page not found!"));
})

//error handling middleware
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{err});
})