const requireOrgAdmin = async (req, res, next) => {
  try {
    if (!req.membership) {
      return res.status(403).json({
        message: "Membership not found",
      });
    }

    if (req.membership.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = requireOrgAdmin;