import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");

    socket = io("https://icidenthub.onrender.com", {
      auth: { token },
    });
  }

  return socket;
};

export const getSocket = () => socket;
