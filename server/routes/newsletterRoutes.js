const express = require("express");
const { subscribeNewsletter } = require("../controllers/newsletterController");

const router = express.Router();

router.post("/newsletter/subscribe", subscribeNewsletter);

module.exports = router;
