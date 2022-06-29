const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const db = require("../models");
const dotenv = require("dotenv");
const app = express();
const passportConfig = require("../passport");
const passport = require("passport");

const signUpRouter = require("./routes/signUp");
const logInOutRouter = require("./routes/user");

db.sequelize
  .sync()
  .then(() => {
    console.log("db connected");
  })
  .catch(console.error);

passportConfig();

app.use(
  cors({
    origin: true,
  })
);

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
  })
);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(passport.initialize());
app.use(passport.session());

app.use(signUpRouter);
app.use(logInOutRouter);

app.listen(4000, () => {
  console.log("Starting Server with 4000 port!");
});
