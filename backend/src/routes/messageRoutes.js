const express = require("express");
const protect = require("../middleware/authmiddleware");
const Message = require("../models/Message");

const router = express.Router();


// GET MESSAGE HISTORY
router.get("/:orgId", protect, async (req, res) => {
  try {

    const messages = await Message.find({
      organization: req.params.orgId,
    })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading messages" });
  }
});


module.exports = router;