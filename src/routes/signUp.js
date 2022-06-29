const express = require("express");

const { User } = require("../../models");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/signup", async (req, res, next) => {
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
