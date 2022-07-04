const express = require("express");
const multer = require("multer");
const { isLoggedIn } = require("./middlewares");
const path = require("path");
const fs = require("fs");

const router = express.Router();

try {
  fs.accessSync("postImgUpload");
} catch (err) {
  console.log("postImgUpload 폴더 생성");
  fs.mkdirSync("postImgUpload");
}

const postImgUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "postImgUpload");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      done(null, basename + "_" + new Date().getTime() + ext);
    },
  }),
  limits: { fieldSize: 10 * 1024 * 1024 },
});

router.post(
  "/postimg",
  isLoggedIn,
  postImgUpload.array("postimg"),
  (req, res, next) => {
    res.json(req.files.map((file) => file.filename));
  }
);

module.exports = router;
