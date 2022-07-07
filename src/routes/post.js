const express = require("express");
const multer = require("multer");
const { isLoggedIn } = require("./middlewares");
const path = require("path");
const fs = require("fs");
const { Post, Image, Comment, User } = require("../../models");
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

router.post(
  "/post",
  isLoggedIn,
  postImgUpload.none(),
  async (req, res, next) => {
    try {
      const post = await Post.create({
        content: req.body.content,
        UserId: req.user.id,
      });
      if (req.body.image) {
        if (Array.isArray(req.body.image)) {
          const images = await Promise.all(
            req.body.image.map((image) => Image.create({ src: image }))
          );
          await post.addImages(images);
        } else {
          const image = await Image.create({ src: req.body.image });
          await post.addImages(image);
        }
      }
      const fullPost = await Post.findOne({
        where: {
          id: post.id,
        },
        include: [
          {
            model: Image,
          },
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
        ],
      });
      res.status(201).json(fullPost);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.delete(
  `/post/:postId/:commentId`,
  isLoggedIn,
  async (req, res, next) => {
    try {
      await Comment.destroy({
        where: {
          id: req.params.commentId,
        },
      });

      res
        .status(200)
        .json({ postId: req.params.postId, commentId: req.params.commentId });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.post("/post/:postId/comment", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    } else {
      const comment = await Comment.create({
        content: req.body.content,
        PostId: req.params.postId,
        UserId: req.user.id,
      });

      const fullComment = await Comment.findOne({
        where: {
          id: comment.id,
        },
        include: [
          {
            model: User,
            attributes: ["id", "nickname", "avatar"],
          },
        ],
      });
      res.status(200).json(fullComment);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/post/:postId", isLoggedIn, async (req, res, next) => {
  try {
    const clickedPost = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });

    if (clickedPost.UserId !== req.user.id) {
      return res.status(403).send("작성자만 가능합니다");
    } else {
      await Comment.destroy({
        where: {
          PostId: req.params.postId,
        },
      });
      await Post.destroy({
        where: {
          id: req.params.postId,
          UserId: req.user.id,
        },
      });

      res.status(200).json({ postId: req.params.postId });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
