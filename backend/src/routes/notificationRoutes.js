const express = require("express");
const protect = require("../middleware/authmiddleware");
const Notification = require("../models/Notification");
const requireOrgMembership = require("../middleware/orgMiddleware");
const router = express.Router();
router.get("/", protect, requireOrgMembership, async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
    organization: req.orgId,
  }).sort({ createdAt: -1 });

  res.json(notifications);
});
router.patch("/:id/read", protect, async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: "Not found" });
  }

  notification.read = true;
  await notification.save();

  res.json({ message: "Marked as read" });
});
router.get("/unread-count", protect, async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.json({ unreadCount: count });
});
router.patch("/:id/read", protect, async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: "Not found" });
  }

  notification.read = true;
  await notification.save();

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  const io = req.app.get("io");

  io.to(req.user._id.toString()).emit("unread_count_update", {
    unreadCount,
  });

  res.json({ message: "Marked as read" });
});

module.exports = router;