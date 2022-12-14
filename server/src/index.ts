import express from "express";
import path from 'path';
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { Category, Player, Room } from "./myTypes";
import database from './database.json';

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

let roomList: Room[] = [];
let categories:string[] = [];
database.words.forEach((phrase) => {
	if (!categories.includes(phrase.category)) {
		categories.push(phrase.category);
	}
});
console.log('categories', categories);
const default_filters = categories.map((category) => {return {name: category, active: category === 'Winter Holiday'}});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("create_room", (name) => {
    const roomCode = makeCode(4);
    console.log(`${name} created room ${roomCode}`);
    handleJoinRoom(name, roomCode);
  });

  socket.on("join_room", ({name, roomCode}, callbackFn) => {
    name = name.trim();
    console.log(`${name} joined room ${roomCode}`);
    const room = roomList.find((room) => room.code === roomCode);
    if (room) {
      const players = [...room.teamOne, ...room.teamTwo];
      const names = players.map((player) => player.name.toLowerCase());
      console.log('roomNames', names);
      if (names.includes(name.toLowerCase())) {
        return callbackFn("duplicate");
      }
    }

    handleJoinRoom(name, roomCode);
  });

  socket.on("leave_room", ({roomCode, id}) => {
    const roomIndex = roomList.findIndex((room) => room.code === roomCode);
    console.log('roomIndex', roomIndex, id);
    if (roomIndex >= 0) {
      const socketId = id ?? socket.id;
      console.log('remove socket.id', socketId);
      removeUserFromRoom(roomIndex, socketId);
      io.to(socketId).emit('room_left');
    }
  });

  socket.on("leave_room_helper", (roomCode) => {
    socket.leave(roomCode);
  });

  socket.on("disconnect", (reason) => {
    console.log('disconnect: ', reason);
    for (let i=0; i < roomList.length; i++) {
      removeUserFromRoom(i, socket.id);
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
      // socket.emit('notification', 'Timer length updated.');
    }
  });

  socket.on("start_timer", (roomCode) => {
    let room = roomList.find((room) => room.code === roomCode);
    if (room) {
      room.previousWords.push(room.turn.phrase.word);
      room.turn.phrase = newWord(room.filters, room.previousWords);
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
        room.previousTurn.winningTeam = 2;
      } else {
        room.teamOneScore = room.teamOneScore + 1;
        room.previousTurn.winningTeam = 1;
      }

      room.timerDate = undefined;
      console.log('timer ended', room);
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on("skip", (roomCode) => {
    let room = roomList.find((room) => room.code === roomCode);
    if (room) {
      room.turn.phrase = newWord(room.filters, room.previousWords);
      io.to(roomCode).emit('room_updated', room);
    }
  });

  socket.on("next_turn", (roomCode) => {
    let room = roomList.find((room) => room.code === roomCode);
    changeTurn(room);
    io.to(roomCode).emit('room_updated', room);
  });

  const changeTurn = (room?: Room) => {
    if (room && room.teamOne.length > 0 && room.teamTwo.length > 0) {

      if (room.turn.team === 1) {
        room.teamOnePlayerIndex = findNextPlayerIndex(room.teamOne, room.teamOnePlayerIndex);
      } else {
        room.teamTwoPlayerIndex = findNextPlayerIndex(room.teamTwo, room.teamTwoPlayerIndex);
      }

      room.turn.team = room.turn.team === 1 ? 2 : 1;

      if (room.turn.team === 1) {
        room.turn.player = room.teamOne[room.teamOnePlayerIndex].name;
      } else {
        room.turn.player = room.teamTwo[room.teamTwoPlayerIndex].name;
      }

      room.previousWords.push(room.turn.phrase.word);
      room.turn.phrase = newWord(room.filters, room.previousWords);
    }
  }

  const handleJoinRoom = (name: string, roomCode: string) => {
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
        turn: {team: 1, player: name, phrase: newWord(default_filters, [])},
        previousTurn: {winningTeam: undefined, wordList: []},
        previousWords: []
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

  const removeUserFromRoom = (roomIndex: number, id: string) => {
    const teamOneIndex = roomList[roomIndex].teamOne.findIndex((player: Player) => player.id === id);
    console.log('teamOneIndex', teamOneIndex);
    if (teamOneIndex >= 0) {
      if (roomList[roomIndex].turn.team === 1 && roomList[roomIndex].turn.player === roomList[roomIndex].teamOne[teamOneIndex].name) {
        changeTurn(roomList[roomIndex]);
      }
      roomList[roomIndex].teamOne.splice(teamOneIndex, 1);
      console.log(roomList);
      io.to(roomList[roomIndex].code).emit('room_updated', roomList[roomIndex]);
    }
    const teamTwoIndex = roomList[roomIndex].teamTwo.findIndex((player: Player) => player.id === id);
    if (teamTwoIndex >= 0) {
      if (roomList[roomIndex].turn.team === 2 && roomList[roomIndex].turn.player === roomList[roomIndex].teamTwo[teamTwoIndex].name) {
        changeTurn(roomList[roomIndex]);
      }
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

function findNextPlayerIndex(players: Player[], startIndex: number) {
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

function newWord(filters: Category[], previousWords: string[]) {
  console.log('prev', previousWords)
  const filteredCategories = filters.filter((filter) => filter.active);
  const validCategories = filteredCategories.map((category) => category.name);

  const phrases = database.words.filter((phrase) => validCategories.includes(phrase.category));
  const count = phrases.length;

  let wordIndex;
  let word;
  let loopCount = 0;
  do {
    loopCount++;
    console.log('loopCount', loopCount);
    wordIndex = Math.floor(Math.random() * count);
    word = phrases[wordIndex];
  } while (previousWords.includes(word.word) && loopCount < 30);
  
  console.log('word', word);
  return word;
}

function makeCode(length: number) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getBaffledTimer(length: number) {
  const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
  const fifthOfLength = length / 5;

  // Returns a random integer from 0 to fifthOfLength:
  const randomInt = Math.floor(Math.random() * fifthOfLength);

  const baffle = (randomInt * plusOrMinus) + length;
  return baffle;
}
