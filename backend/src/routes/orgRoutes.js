const express = require("express");
const protect = require("../middleware/authmiddleware");
const { createOrganization, generateInvite } = require("../controllers/orgController"); 
const requireOrgMembership = require("../middleware/orgMiddleware");
const requireOrgAdmin = require("../middleware/orgAdminMiddleware");
const Membership = require("../models/Membership");
const { inviteByEmail } = require("../controllers/orgController");
const router = express.Router();
router.post("/", protect, createOrganization);

router.post(
  "/:orgId/generate-invite",
  protect,
  requireOrgMembership,
  requireOrgAdmin,
  generateInvite
);

router.get("/my-orgs", protect, async (req, res) => {
  try {
    const memberships = await Membership.find({
      user: req.user._id,
    }).populate("organization");

    const orgs = memberships
      .filter((m) => m.organization) // 🔥 prevent crash
      .map((m) => ({
        orgId: m.organization._id,
        name: m.organization.name,
        role: m.role,
      }));



    res.json(orgs);
  } catch (error) {
    console.error("Error in /my-orgs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/:orgId/generate-invite",
  protect,
  generateInvite
);

module.exports = router;