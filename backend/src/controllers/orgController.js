const Organization = require("../models/Organization");
const Invitation = require("../models/Invitation");
const Membership = require("../models/Membership");
const User = require("../models/User");

const inviteByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const { orgId } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const existingUser = await User.findOne({ email });

    // If user exists → add instantly
    if (existingUser) {

      const alreadyMember = await Membership.findOne({
        user: existingUser._id,
        organization: orgId,
      });

      if (alreadyMember) {
        return res.json({ message: "User already a member" });
      }

      await Membership.create({
        user: existingUser._id,
        organization: orgId,
        role: "member",
      });
      const io = req.app.get("io");

io.to(orgId.toString()).emit("member_joined", {
  name: existingUser.name,
});

      return res.json({ message: "User added instantly" });
    }

    // If user not registered → save pending invite
    await Invitation.create({
      organization: orgId,
      invitedEmail: email,
      invitedBy: req.user._id,
      status: "pending",
    });

    res.json({
      message: "Invitation saved. User will auto-join when registering.",
    });

  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const createOrganization = async (req, res) => {
  try {
    const org = await Organization.create({
      name: req.body.name,
      createdBy: req.user._id,
    });
    await Membership.create({
      user: req.user._id,
      organization: org._id,
      role: "admin",
    });

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const generateInvite = async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!orgId) {
      return res.status(400).json({ message: "Org ID missing" });
    }

    // generate random invite code
    const inviteCode = Math.random().toString(36).substring(2, 8);

    // save invite in DB
    const invitation = await Invitation.create({
      organization: orgId,
      inviteCode,
      status: "pending",
    });

    res.json({
      inviteLink: `http://localhost:5173/join/${inviteCode}`,
      inviteCode: inviteCode,
    });

  } catch (error) {
    console.error("Generate Invite Error:", error);
    res.status(500).json({ message: "Server error generating invite" });
  }
};

module.exports = {
  createOrganization,
  generateInvite,
  inviteByEmail,
};