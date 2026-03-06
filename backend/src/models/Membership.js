const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  { timestamps: true }
);

MembershipSchema.index(
  { user: 1, organization: 1 },
  { unique: true }
);

module.exports = mongoose.model("Membership", MembershipSchema);