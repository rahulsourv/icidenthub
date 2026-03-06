const express = require("express");
const protect = require("../middleware/authmiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const requireOrgMembership = require("../middleware/orgMiddleware");


const {
  createIncident,
  getIncidents,
  updateIncidentStatus
} = require("../controllers/incidentController");

const router = express.Router();
router.post(
  "/",
  protect,
  authorizeRoles("admin", "engineer"),
  createIncident
);
router.get(
  "/",
  protect,
  authorizeRoles("admin", "engineer", "viewer"),
  getIncidents
);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "engineer"),
  updateIncidentStatus
);
router.post(
  "/",
  protect,
  requireOrgMembership,
  createIncident
);

router.get(
  "/",
  protect,
  requireOrgMembership,
  getIncidents
);

router.patch(
  "/:id/status",
  protect,
  requireOrgMembership,
  updateIncidentStatus
);
module.exports = router;