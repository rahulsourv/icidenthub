const Membership = require("../models/Membership");

const requireOrgMembership = async (req, res, next) => {
  try {
    const { orgId } = req.params;

    const membership = await Membership.findOne({
      user: req.user._id,
      organization: orgId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "Not a member of this organization",
      });
    }

    req.membership = membership; // IMPORTANT

    next();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = requireOrgMembership;