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
    handleJoinRoom(name, roomCode);
  });

  socket.on("join_room", ({name, roomCode}) => {
    console.log(`${name} joined room ${roomCode}`);
    handleJoinRoom(name, roomCode);
  });

  socket.on("leave_room", (roomCode) => {
    console.log(`left room ${roomCode}`);
    socket.leave(roomCode);
    socket.emit('room_left');

    const roomIndex = roomList.findIndex((room) => room.code === roomCode);
    console.log('roomIndex', roomIndex);
    if (roomIndex >= 0) {
      console.log('socket.id', socket.id);
      const teamOneIndex = roomList[roomIndex].teamOne.findIndex((player) => player.id === socket.id);
      console.log('teamOneIndex', teamOneIndex);
      if (teamOneIndex >= 0) {
        roomList[roomIndex].teamOne.splice(teamOneIndex, 1);
        console.log(roomList);
        io.to(roomList[roomIndex].code).emit('room_updated', roomList[roomIndex]);
      }
      const teamTwoIndex = roomList[roomIndex].teamTwo.findIndex((player) => player.id === socket.id);
      if (teamTwoIndex >= 0) {
        roomList[roomIndex].teamTwo.splice(teamTwoIndex, 1);
        console.log(roomList);
        io.to(roomList[roomIndex].code).emit('room_updated', roomList[roomIndex]);
      }
      // remove room if its now empty
      if (roomList[roomIndex].teamOne.length === 0 && roomList[roomIndex].teamTwo.length === 0) {
        roomList.splice(roomIndex, 1);
        console.log('roomList', roomList);
      }
    }
  });

  const handleJoinRoom = (name, roomCode) => {
    let room = roomList.find((room) => room.code === roomCode);
    console.log('roomFound', room);
    if (!room) {
      room = {
        code: roomCode,
        teamOne: [],
        teamTwo: [],
      }
      roomList = [...roomList, room];
    }

    if (room.teamOne.length <= room.teamTwo.length) {
      room.teamOne.push({name, id: socket.id});
    } else {
      room.teamTwo.push({name, id: socket.id});
    }
    
    socket.join(roomCode);
    
    console.log('updated room list:', roomList)
    io.to(roomCode).emit('room_updated', room);
  }
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
