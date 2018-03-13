const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  flash = require("connect-flash"),
  Photo = require("./models/photo"),
  User = require("./models/user"),
  seedDB = require("./seeds");

// LOCAL ENV VARS
require("dotenv").config();

// IMPORT IN ROUTES
const photoRoutes = require("./routes/photos"),
  tagRoutes = require("./routes/tags");
(userRoutes = require("./routes/users")),
  (contactRoutes = require("./routes/contact")),
  (indexRoutes = require("./routes/index"));

// APP CONFIG
mongoose.connect(process.env.DATABASEURL);

// SEED DB
//seedDB();

// SERVER CONFIG
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

// PASSPORT CONFIG
app.use(
  require("express-session")({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GLOBAL MIDDLEWARE TO CREATE VARS ACCESSIBLE IN VIEWS
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// USING ROUTER
app.use("/photos", photoRoutes);
app.use("/tags", tagRoutes);
app.use("/contact", contactRoutes);
app.use("/", userRoutes);
app.use("/", indexRoutes);

// SERVER LISTEN SETUP
app.listen(process.env.PORT, process.env.IP, () => {
  console.log("Server Listening on 3000");
});
