const express = require("express");
const passport = require("passport");
const { User, Post } = require("../../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const router = express.Router();

router.get("/user", async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findOne({
        where: {
          id: req.user.id,
        },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: Post,
          },
          {
            model: User,
            as: "Followings",
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followers",
            attributes: ["id"],
          },
        ],
      });
      res.status(200).json(user);
    } else {
      res.status(200).json(null);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get(`/user/:userId`, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.userId,
      },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: Post,
        },
        {
          model: User,
          as: "Followings",
          attributes: ["id"],
        },
        {
          model: User,
          as: "Followers",
          attributes: ["id"],
        },
      ],
    });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: Post,
          },
          {
            model: User,
            as: "Followings",
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followers",
            attributes: ["id"],
          },
        ],
      });
      return res.status(200).json(fullUserWithoutPassword);
    });
  })(req, res, next);
});

router.post("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.send("ok");
});

router.post(`/user/:userId/follow`, isLoggedIn, async (req, res, next) => {
  try {
    const clickedUser = await User.findOne({
      where: {
        id: req.params.userId,
      },
    });
    if (!clickedUser) {
      return res.status(403).send("존재하지 않는 유저입니다");
    } else {
      clickedUser.addFollowers(req.user.id);
      res.status(200).json({
        userId: parseInt(req.params.userId, 10),
        myId: parseInt(req.user.id, 10),
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete(`/user/:userId/follow`, isLoggedIn, async (req, res, next) => {
  try {
    const clickedUser = await User.findOne({
      where: {
        id: req.params.userId,
      },
    });
    if (!clickedUser) {
      return res.status(403).send("존재하지 않는 유저입니다");
    } else {
      clickedUser.removeFollowers(req.user.id);
    }
    res.status(200).json({
      userId: parseInt(req.params.userId, 10),
      myId: parseInt(req.user.id, 10),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
