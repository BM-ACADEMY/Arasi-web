const express = require("express");
const router = express.Router();
const {
  getSocialMedia,
  createSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
} = require("../controllers/socialMediaController");

router.get("/", getSocialMedia);
router.post("/", createSocialMedia);
router.put("/:id", updateSocialMedia);
router.delete("/:id", deleteSocialMedia);

module.exports = router;