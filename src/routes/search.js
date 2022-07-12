const express = require("express");
const { Op } = require("sequelize");
const { Post, User, Comment, Image } = require("../../models");
const router = express.Router();

router.get("/search/:keyword", async (req, res, next) => {
  try {
    const where = {
      content: {
        [Op.like]: `%${req.params.keyword}%`,
      },
    };
    if (parseInt(req.query.lastId, 10)) {
      where.id = {
        [Op.lt]: parseInt(req.query.lastId, 10),
      };
    }

    const searchPost = await Post.findAll({
      where,
      limit: 10,
      order: [
        ["createdAt", "DESC"],
        [Comment, "CreatedAt", "DESC"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname", "avatar"],
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
          model: Image,
        },
        {
          model: User,
          as: "Likers",
          attributes: ["id"],
        },
      ],
    });
    res.status(200).json(searchPost);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
