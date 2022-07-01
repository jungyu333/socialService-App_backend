const express = require("express");
const { isNotLoggedIn, isLoggedIn } = require("./middlewares");
const { User } = require("../../models");
const path = require("path");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();

try {
  fs.accessSync("avatarupload");
} catch (err) {
  console.log("avatarupload 폴더 생성");
  fs.mkdirSync("avatarupload");
}

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "avatarupload");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      done(null, basename + "_" + new Date().getTime() + ext);
    },
  }),
  limits: { fieldSize: 20 * 1024 * 1024 },
});

router.post(
  "/avatar",
  isNotLoggedIn,
  avatarUpload.single("avatar"),
  (req, res, next) => {
    res.json(req.file.filename);
  }
);

router.post("/signup", isNotLoggedIn, async (req, res, next) => {
  try {
    const existUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (existUser) {
      return res.status(403).send("중복된 이메일입니다");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      email: req.body.email,
      nickname: req.body.name,
      password: hashedPassword,
    });
    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
