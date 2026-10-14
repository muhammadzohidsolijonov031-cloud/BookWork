const express = require("express");
const router = express.Router();
const controller = require("../controllers/book.controller.js");
const platformController = require("../controllers/platform.controller.js");
const validate = require("../middlewares/validate.js");
const { requireAuth } = require("../middlewares/auth.middleware.js");
const {
  bookPostSchema,
  reviewSchema,
} = require("../validations/platform.validation.js");
const {
  createBookSchema,
  updateBookSchema,
} = require("../validations/books.validation.js");

router.get("/public/:id", platformController.getPublicBook);
router.post("/public/:id/read", platformController.markBookRead);
router.get("/genres", platformController.getGenres);
router.get("/discover", platformController.getDiscoverBooks);

router.use(requireAuth);

router.get("/details/:id", platformController.getBookDetails);
router.post("/:id/read", platformController.markBookRead);
router.post(
  "/upload-cover",
  express.raw({
    type: ["image/jpeg", "image/png", "image/webp"],
    limit: "5mb",
  }),
  controller.uploadCover,
);
router.get("/", controller.getAll);
router.get("/recommendations", requireAuth, platformController.getRecommendations);
router.post(
  "/:id/posts",
  requireAuth,
  validate(bookPostSchema),
  platformController.createBookPost,
);
router.post(
  "/:id/reviews",
  requireAuth,
  validate(reviewSchema),
  platformController.saveReview,
);
router.post("/:id/share", requireAuth, platformController.shareBook);
router.get("/:id", controller.getById);
router.post("/", validate(createBookSchema), controller.create);
router.put("/:id", validate(updateBookSchema), controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
