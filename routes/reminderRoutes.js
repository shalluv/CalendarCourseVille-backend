const express = require("express");
const reminderController = require("../controller/reminderController");

const router = express.Router();

router.get("/", reminderController.getReminders);
router.post("/", reminderController.addReminder);
router.delete("/:reminder_id", reminderController.deleteReminder);

module.exports = router;

