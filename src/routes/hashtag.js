const express = require("express");
const { Op } = require("sequelize");
const { Post, Hashtag, User, Image, Comment } = require("../../models");

const router = express.Router();

router.get("/hashtag/:hashtag", async (req, res, next) => {
  try {
    const where = {};
    if (parseInt(req.query.lastId, 10)) {
      where.id = {
        [Op.lt]: parseInt(req.query.lastId, 10),
      };
    }
    const hashtagPost = await Post.findAll({
      where,
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Hashtag,
          where: { name: decodeURIComponent(req.params.hashtag) },
        },
        {
          model: User,
          attributes: ["id", "nickname", "avatar"],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["id", "nickname", "avatar"],
            },
          ],
        },
        {
          model: User,
          as: "Likers",
          attributes: ["id", "nickname", "avatar"],
        },
      ],
    });
    res.status(200).json(hashtagPost);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
