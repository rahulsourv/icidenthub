const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Invitation = require("../models/Invitation");
const Membership = require("../models/Membership");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 🔥 AUTO ACCEPT PENDING INVITES
    const pendingInvites = await Invitation.find({
      invitedEmail: newUser.email,
      status: "pending",
    });

    for (const invite of pendingInvites) {
      await Membership.create({
        user: newUser._id,
        organization: invite.organization,
        role: "member",
      });

      const io = req.app.get("io");

io.to(invite.organization.toString()).emit("member_joined", {
  name: newUser.name,
});


      invite.status = "accepted";
      await invite.save();
    }

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(newUser),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user),
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser };