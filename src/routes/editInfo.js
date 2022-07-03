const express = require("express");
const multer = require("multer");
const path = require("path");
const { isLoggedIn } = require("./middlewares");
const { User } = require("../../models");

const router = express.Router();

const avatarEdit = multer({
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
  "/editavatar",
  isLoggedIn,
  avatarEdit.single("avataredit"),
  (req, res, next) => {
    res.json(req.file.filename);
  }
);

router.post(
  "/editinfo",
  isLoggedIn,
  avatarEdit.none(),
  async (req, res, next) => {
    try {
      await User.update(
        {
          nickname: req.body.nickname,
          avatar: req.body.avatar,
        },
        {
          where: { id: req.user.id },
        }
      );
      res
        .status(200)
        .json({ nickname: req.body.nickname, avatar: req.body.avatar });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

module.exports = router;
