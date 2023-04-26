const express = require("express");
const propController = require("../controller/propController");

const router = express.Router();

router.get("/", propController.getProps);

module.exports = router;
