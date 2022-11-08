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
const database = require('./database.json');
let categories = [];
database.words.forEach((phrase) => {
  if (!categories.includes(phrase.category)) {
    categories.push(phrase.category);
  }
});
console.log('categories', categories);
const default_filters = categories.map((category) => {return {name: category, active: true}});

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
    const roomIndex = roomList.findIndex((room) => room.code === roomCode);
    console.log('roomIndex', roomIndex);
    if (roomIndex >= 0) {
      removeUserFromRoom(roomIndex);
    }
  });

  socket.on("set_filters", ({roomCode, filters}) => {
    let room = roomList.find((room) => room.code === roomCode);
    if (room) {
      room.filters = filters;
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on("set_timer_length", ({roomCode, timerLength}) => {
    let room = roomList.find((room) => room.code === roomCode);
    if (room) {
      room.timerLength = timerLength;
      room.baffledTimer = getBaffledTimer(timerLength);
      io.to(roomCode).emit('room_updated', room);
      socket.emit('notification', 'Timer length updated.');
    }
  });

  socket.on("start_timer", (roomCode) => {
    let room = roomList.find((room) => room.code === roomCode);
    if (room) {
      room.turn.phrase = newWord(room.filters);
      room.timerDate = Date.now();
      console.log('timer started', room);
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on("end_timer", (roomCode) => {
    let room = roomList.find((room) => room.code === roomCode);
    if (room) {
      if (room.turn.team === 1) {
        room.teamTwoScore = room.teamTwoScore + 1;
      } else {
        room.teamOneScore = room.teamOneScore + 1;
      }

      room.timerDate = undefined;
      console.log('timer ended', room);
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on("skip", (roomCode) => {
    let room = roomList.find((room) => room.code === roomCode);
    if (room) {
      room.turn.phrase = newWord(room.filters);
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on("next_turn", (roomCode) => {
    let room = roomList.find((room) => room.code === roomCode);
    if (room && room.teamOne.length > 0 && room.teamTwo.length > 0) {
      room.turn.team = room.turn.team === 1 ? 2 : 1;

      if (room.turn.team === 1) {
        room.teamOnePlayerIndex = findNextPlayerIndex(room.teamOne, room.teamOnePlayerIndex);
        room.turn.player = room.teamOne[room.teamOnePlayerIndex].name;
      } else {
        room.teamTwoPlayerIndex = findNextPlayerIndex(room.teamTwo, room.teamTwoPlayerIndex);
        room.turn.player = room.teamTwo[room.teamTwoPlayerIndex].name;
      }

      room.turn.phrase = newWord(room.filters);
      console.log('turn', room.turn)
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log('disconnect: ', reason);
    for (let i=0; i < roomList.length; i++) {
     removeUserFromRoom(i);
    }
  });

  const handleJoinRoom = (name, roomCode) => {
    let room = roomList.find((room) => room.code === roomCode);
    if (!room) {
      room = {
        code: roomCode,
        hostPlayer: name,
        teamOne: [],
        teamTwo: [],
        teamOneScore: 0,
        teamTwoScore: 0,
        teamOnePlayerIndex: 0,
        teamTwoPlayerIndex: 0,
        timerLength: 60,
        baffledTimer: getBaffledTimer(60),
        timerDate: undefined,
        filters: default_filters,
        turn: {team: 1, player: name, phrase: newWord(default_filters)}
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

  const removeUserFromRoom = (roomIndex) => {
    console.log('socket.id', socket.id);
    socket.emit('room_left');
    socket.leave(roomList[roomIndex].code);

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

server.listen(443, () => {
  console.log("SERVER IS RUNNING");
});

function findNextPlayerIndex(players, startIndex) {
  let playerIndex = startIndex + 1;
  while (!players[playerIndex]) {
    if (playerIndex >= players.length) {
      playerIndex = 0;
    } else {
      playerIndex++;
    }
  }
  return playerIndex;
}

function newWord(filters) {
  let validCategories = filters.filter((filter) => filter.active);
  validCategories = validCategories.map((category) => category.name);

  const phrases = database.words.filter((phrase) => validCategories.includes(phrase.category));
  const count = phrases.length;

  const wordIndex = Math.floor(Math.random() * count);
  console.log('word', phrases[wordIndex])
  return phrases[wordIndex];
}

function makeCode(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getBaffledTimer(length) {
  const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
  const fifthOfLength = length / 5;

  // Returns a random integer from 0 to fifthOfLength:
  const randomInt = Math.floor(Math.random() * fifthOfLength);

  const baffle = (randomInt * plusOrMinus) + length;
  return baffle;
}
