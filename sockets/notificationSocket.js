import { Server } from "socket.io";

export const setupNotificationSocket = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("Client connected to WebSocket");

    socket.on("subscribeToBookings", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} subscribed to booking updates`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};

// Emit notification
export const notifyUser = (io, userId, message) => {
  io.to(userId).emit("bookingUpdate", message);
};
