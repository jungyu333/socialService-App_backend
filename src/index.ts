import express, { Request, Response, NextFunction } from "express";
const cors = require("cors");
const db = require("../models");
const app = express();

const signUpRouter = require("./routes/signUp");

db.sequelize
  .sync()
  .then(() => {
    console.log("db connected");
  })
  .catch(console.error);

app.use(
  cors({
    origin: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(signUpRouter);

app.listen(4000, () => {
  console.log("Starting Server with 4000 port!");
});
