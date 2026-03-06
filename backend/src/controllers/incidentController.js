const Incident = require("../models/Incident");
const Notification = require("../models/Notification");
const createIncident = async (req, res) => {
  try {
    const { title, description, severity, assignedTo } = req.body;

    const incident = await Incident.create({
      title,
      description,
      severity,
      organization: req.user.organization,
      createdBy: req.user._id,
      assignedTo,
    });

    const io = req.app.get("io");

    if (assignedTo) {
      const notification = await Notification.create({
        recipient: assignedTo,
        organization: req.user.organization,
        type: "incident_assigned",
        message: `${req.user.name} assigned you to: ${title}`,
        incident: incident._id,
      });

      io.to(assignedTo.toString()).emit("notification", {
        notification,
      });

      const unreadCount = await Notification.countDocuments({
        recipient: assignedTo,
        read: false,
      });

      io.to(assignedTo.toString()).emit("unread_count_update", {
        unreadCount,
      });
    }

    res.status(201).json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      organization: req.user.organization,
    });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
const updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    incident.status = status;
    await incident.save();

    const io = req.app.get("io");

    io.to(incident.organization.toString()).emit("incident_status_updated", {
      incidentId: incident._id,
      status: incident.status,
      updatedBy: req.user.name,
    });

    if (incident.assignedTo) {
      const notification = await Notification.create({
        recipient: incident.assignedTo,
        organization: incident.organization,
        type: "status_updated",
        message: `${req.user.name} updated status of ${incident.title} to ${status}`,
        incident: incident._id,
      });

      io.to(incident.assignedTo.toString()).emit("notification", {
        notification,
      });

      const unreadCount = await Notification.countDocuments({
        recipient: incident.assignedTo,
        read: false,
      });

      io.to(incident.assignedTo.toString()).emit("unread_count_update", {
        unreadCount,
      });
    }

    res.json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createIncident,
  getIncidents,
  updateIncidentStatus,
};