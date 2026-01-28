const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getCart, addToCart, removeFromCart } = require("../controllers/cartController");

const router = express.Router();

// All cart routes require login
router.use(protect);

router.route("/")
  .get(getCart);

router.post("/add", addToCart);
router.delete("/:itemId", removeFromCart);

module.exports = router;
