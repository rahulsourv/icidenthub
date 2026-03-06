const express = require("express");
const protect = require("../middleware/authmiddleware");
const Invitation = require("../models/Invitation");
const Membership = require("../models/Membership");

const router = express.Router();

// JOIN ORG USING INVITE CODE
router.post("/join", protect, async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const invitation = await Invitation.findOne({ inviteCode });

    if (!invitation) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    // check if already member
    const existing = await Membership.findOne({
      user: req.user._id,
      organization: invitation.organization,
    });

    if (existing) {
      return res.status(400).json({ message: "Already a member" });
    }

    await Membership.create({
      user: req.user._id,
      organization: invitation.organization,
      role: "member",
    });

    res.json({ message: "Joined organization successfully" });
  } catch (error) {
    console.error("Join error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;