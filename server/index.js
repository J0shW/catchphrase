const express = require("express");
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '/public')));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://catchphrase-649dd.web.app"],
    methods: ["GET", "POST"],
  },
});

let roomList = [];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("create_room", (name) => {
    const roomCode = makeCode(4);
    console.log(`${name} created room ${roomCode}`);
    socket.join(roomCode);
    roomList = [...roomList, roomCode];
    console.log('updated room list:', roomList)
    socket.emit('room_joined', roomCode);
  });

  socket.on("join_room", ({name, roomCode}) => {
    console.log(`${name} joined room ${roomCode}`);
    socket.join(roomCode);
    socket.emit('room_joined', roomCode);
  });
});

server.listen(443, () => {
  console.log("SERVER IS RUNNING");
});

function makeCode(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
