import express, { Request, Response, NextFunction } from "express";
const db = require("../models");
const app = express();

db.sequelize
  .sync()
  .then(() => {
    console.log("db connected");
  })
  .catch(console.error);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello Express with Typescript!");
});

app.listen(3000, () => {
  console.log("Starting Server with 3000 port!");
});
