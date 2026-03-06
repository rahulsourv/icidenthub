const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  inviteCode: {
    type: String,
    required: true,
  },
  invitedEmail: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
  },
});

module.exports = mongoose.model("Invitation", invitationSchema);