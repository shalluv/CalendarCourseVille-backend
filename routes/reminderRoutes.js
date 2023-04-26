const express = require("express");
const reminderController = require("../controller/reminderController");

const router = express.Router();

router.get("/auth_app", coursevilleController.authApp);

module.exports = router;
