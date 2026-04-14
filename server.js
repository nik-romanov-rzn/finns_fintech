const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const users = new Map();

function getOnlineCount() {
  return users.size;
}

function getOnlineUsersList() {
  return Array.from(users.values()).map((user) => user.label);
}

function createVisitorLabel(visitorId) {
  return `Visitor ${visitorId.slice(-6)}`;
}

function broadcastOnlineData() {
  io.emit("onlineData", {
    count: getOnlineCount(),
    users: getOnlineUsersList()
  });
}

io.on("connection", (socket) => {
  let currentVisitorId = null;

  socket.on("registerVisitor", (visitorId) => {
    if (!visitorId || typeof visitorId !== "string") return;

    currentVisitorId = visitorId;

    if (!users.has(visitorId)) {
      users.set(visitorId, {
        label: createVisitorLabel(visitorId),
        sockets: new Set()
      });
    }

    const user = users.get(visitorId);
    user.sockets.add(socket.id);

    broadcastOnlineData();
    console.log("Registered:", visitorId, "Online:", getOnlineCount());
  });

  socket.on("disconnect", () => {
    if (!currentVisitorId) return;
    if (!users.has(currentVisitorId)) return;

    const user = users.get(currentVisitorId);
    user.sockets.delete(socket.id);

    if (user.sockets.size === 0) {
      users.delete(currentVisitorId);
    }

    broadcastOnlineData();
    console.log("Disconnected:", currentVisitorId, "Online:", getOnlineCount());
  });

  socket.emit("onlineData", {
    count: getOnlineCount(),
    users: getOnlineUsersList()
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});