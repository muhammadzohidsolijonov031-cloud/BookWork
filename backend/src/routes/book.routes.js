const express = require("express");
const router = express.Router();
const controller = require("../controllers/book.controller.js");
const validate = require("../middlewares/validate.js");
const { requireAuth } = require("../middlewares/auth.middleware.js");
const {
  createBookSchema,
  updateBookSchema,
} = require("../validations/books.validation.js");

router.use(requireAuth);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", validate(createBookSchema), controller.create);
router.put("/:id", validate(updateBookSchema), controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
