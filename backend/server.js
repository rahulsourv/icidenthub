const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const orgRoutes = require("./src/routes/orgRoutes");
const incidentRoutes = require("./src/routes/incidentRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const invitationRoutes = require("./src/routes/invitationRoutes");
const messageRoutes = require("./src/routes/messageRoutes");

const User = require("./src/models/User");
const Membership = require("./src/models/Membership");
const Message = require("./src/models/Message");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);


/* ---------------------------
   CORS CONFIG
--------------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://your-vercel-app.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());


/* ---------------------------
   SOCKET SERVER
--------------------------- */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  pingTimeout: 120000,
  pingInterval: 25000,
});

app.set("io", io);


/* ---------------------------
   ROUTES
--------------------------- */

app.use("/api/org", orgRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/messages", messageRoutes);


/* ---------------------------
   HEALTH CHECK
--------------------------- */

app.get("/", (req, res) => {
  res.send("IncidentHub API running");
});


/* ---------------------------
   SOCKET AUTH
--------------------------- */

io.use(async (socket, next) => {
  try {

    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Not authorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();

  } catch (error) {

    console.error("Socket auth error:", error);
    next(new Error("Authentication error"));

  }
});


/* ---------------------------
   SOCKET CONNECTION
--------------------------- */

io.on("connection", async (socket) => {

  console.log("User connected:", socket.user.email);

  try {

    const memberships = await Membership.find({
      user: socket.user._id,
    });

    memberships.forEach((m) => {

      const orgId = m.organization.toString();

      socket.join(orgId);

      console.log(`Joined org room: ${orgId}`);

    });

  } catch (error) {

    console.error("Room join error:", error);

  }


  /* USER JOINS CHAT */

  socket.on("join_org", (orgId) => {

    socket.join(orgId);

    console.log("User joined org room:", orgId);

  });


  /* SEND MESSAGE */

  socket.on("send_message", async ({ orgId, message }) => {

    try {

      const newMessage = await Message.create({
        organization: orgId,
        sender: socket.user._id,
        senderName: socket.user.name,
        message,
      });

      io.to(orgId).emit("receive_message", {
        sender: newMessage.senderName,
        message: newMessage.message,
        timestamp: newMessage.createdAt,
      });

    } catch (error) {

      console.error("Message save error:", error);

    }

  });


  /* DISCONNECT */

  socket.on("disconnect", (reason) => {

    console.log(
      `User disconnected: ${socket.user.email}, Reason: ${reason}`
    );

  });

});


/* ---------------------------
   START SERVER
--------------------------- */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
