/*********************************************************************
					IMPORTS	
**********************************************************************/
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid, makeid2, beginSection, endSection} = require('./utils.js');
const util = require('util');
const os = require('os');

/*********************************************************************
					READ COMPUTER SPECS
**********************************************************************/

const numCPUs = os.cpus();
console.log(numCPUs);

var availableMemory = os.freemem();
console.log("Free memory available: " + availableMemory / (1024 * 1024) + ' MB');

/*********************************************************************
					STATES, CLIENT ROOMS
**********************************************************************/

const state = {};
const clientRooms = {}; // lookup table that looks up a room name of a room.


/*********************************************************************
					INITIALIZE SERVER
**********************************************************************/
const express = require('express');
const http = require('http');
const app = express();

const server = http.createServer(app);

const io = require('socket.io').listen(server);

const PORT = 3000;
console.time('Time since server started');
server.listen(PORT, () => {
	console.log(`go to http://localhost:${PORT}`);
	console.timeLog('Time since server started');
});

/*************************************************
			REGULAR ROUTING
*************************************************/
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Expose the node_modules folder as static resources (to access socket.io.js in the browser)
app.use('/static', express.static('node_modules'));
app.use(express.static('static'));



/*********************************************************************
	REMATCH HANDLER
**********************************************************************/

var rematchArray = [];
io.on('connect', client => {
	client.on('rematch', handleRematch);


	function handleRematch(playerNumber) {
		console.log(client.id);
		beginSection("Player Wants rematch");
		console.log("Player " + playerNumber + " wants a rematch!");
		var name = "Anonymous";
		if(client.name && client.name != "") {
			name = client.name;
		}
		console.log("Name: " + name);
		const myRoom = client.rooms;
		const gameCode = Object.keys(myRoom)[1];
		console.log("Game Code: " + gameCode);
		
		if(rematchArray.length == 0) { 
			rematchArray.push(client.id);
			io.to(gameCode).emit('rematch', playerNumber);
		} else if (rematchArray[0] == client.id) {
			console.log("Rematch requested again by player " + playerNumber + ". ");
			// do nothing
		} else {
			console.log("Rematch accepted by both players. Rematching...");
			// io.sockets.in(gameCode).emit('server__message', 'Rematch!');
			state[gameCode] = initGame();
			io.sockets.in(gameCode).emit('init', 2);
			io.sockets.in(gameCode).emit('rematch__accepted');
			console.table(state);
			console.table(state[gameCode]);
			console.table(state[gameCode].players[0]);
			console.table(state[gameCode].players[1]);
			console.log()
			startGameInterval(gameCode);
			while(rematchArray.length > 0) {
				rematchArray.pop();
			}
		}
		console.log(rematchArray);
		endSection("Rematch");
	}
});





io.on('connect', client => {
	beginSection("New Client Connected");
	console.log("Remote address: " + client.conn.remoteAddress);
	console.timeLog('Time since server started');
	endSection("New Client");
	
	
/**************************************************************
	ATTACH EVENT HANDLERS
***************************************************************/
	
	client.on('keydown', handleKeydown);
	client.on('newGame', handleNewGame);
	client.on('joinGame', handleJoinGame);
	client.on('server__message', handleServerMessage);
	
	client.on('name__input', handleNameInput);


	
	
	function handleJoinGame(gameCode) {
		beginSection("Client joining game");
		if(client.name) {
			console.log("Name: " + client.name);
		}
		const room = io.sockets.adapter.rooms[gameCode]; 
		
		let allUsers;
		if(room) {
			allUsers = room.sockets;
			
		}
		
		let numClients = 0;
		if(allUsers) {
			numClients = Object.keys(allUsers).length;
		}
		
		if( numClients == 0) {
			client.emit('unknownGame');
			endSection('Client entered unknownGame');
			return;
		} else if (numClients > 1) {
			client.emit('tooManyPlayers');
			endSection('Client tried to join full room');
			return;
		}
		clientRooms[client.id] = gameCode;
		
		client.join(gameCode, () => {
			let rooms = Object.keys(client.rooms);
			console.log("Rooms: ");
			console.log(rooms);
		});
		client.number = 2;
		client.emit('init', 2);
		startGameInterval(gameCode);
		endSection("Client joined game");
	}
	
	function handleNewGame() {
		beginSection("New Game");
		if(client.name) {
			console.log("Name: " + client.name);
		}
		let roomName = makeid2(5);
		console.log("Client id: " + client.id);
		console.log("Room name: " + roomName);
		clientRooms[client.id] = roomName;
		client.emit('gameCode', roomName);
		
		state[roomName] = initGame();
		console.log("states table: ");
		console.table(state);
		
		client.join(roomName);
		client.number = 1;
		client.emit('init', 1);
		
		
		
		endSection("New Game");
	}
	
	// define function inside io.on() because we only want it in this scope.
	function handleKeydown(keyCode) {
		const roomName = clientRooms[client.id];
		
		if(!roomName) {
			// no room exists.
			return;
		}
		// JSON parse the integer.
		try {
			keyCode = parseInt(keyCode);
		} catch(e) {
			console.error(e);
			return;
		}
		let vel1;
		if(state[roomName]) {
			vel1 = state[roomName].players[client.number - 1].vel;
		} else {
			vel1 = {x: 0, y: 0};
		}
		const vel = getUpdatedVelocity(keyCode, vel1);
		
		
		if (vel && state[roomName]) {
			state[roomName].players[client.number - 1].vel = vel;
		}
	};
	
	
	
	
	function handleServerMessage(message, playerNumber) {
		beginSection("Message to Server from player!");
		console.log("Message: \"" + message + "\" sent from player " + playerNumber);
		if(client.name) {
			console.log("Player name: " + client.name);
		}
		endSection("End message");
	}
	function handleNameInput(name) {
		client.name = name;
	}
	
	
});






/**************************************************************
	DISCONNECTION HANDLERS
***************************************************************/
io.on('connect', client => {
	
	client.on('disconnect', handleDisconnect);
	client.on('disconnecting', handleDisconnecting);
	function handleDisconnecting(reason) {
		let rooms = Object.keys(client.rooms);
		beginSection("Client will disconnect soon");
		console.log('Client is about to disconnect. Reason: ' + reason);
		console.log('Rooms to leave: ' + rooms[client.id]);
		endSection();
	}
	
	function handleDisconnect(reason) {
		beginSection("Client Disconnection");
		
		// Log name to console.
		if(client.name) {
			console.log(client.name + " disconnected. Reason: " + reason);
		} else {
			console.log('client disconnected. Reason: ' + reason);
		}
		// find room name
		const roomName = clientRooms[client.id];
		if(clientRooms[client.id] && state[roomName]) {
			console.log('Disconnecting Player number: ' + client.number);
			
			console.log('Room still exists. notifying players');
			clearInterval(intervalId);
			
			io.sockets.in(roomName).emit('playerDisconnected');
		}
		endSection();
	}
});





/**************************************************************
	GAME EVENT HANDLERS
***************************************************************/

let intervalId; // global intervalId. 

/**************************************************************
Function startGameInterval()
	@args roomName (string): the game code.
	@returns: none
	Starts the game interval of 16.667ms, or 60fps.

***************************************************************/
function startGameInterval(roomName) {
	beginSection("Starting game interval of room " + roomName + ".");
	intervalId = setInterval(() => {
		const winner = gameLoop(state[roomName]);
	
		if(!winner) {
			emitGameState(roomName, state[roomName]);
		
		} else {
			console.log('GAME OVER, WINNER = ' + winner);
			emitGameOver(roomName, winner);
			state[roomName] = null;
			clearInterval(intervalId);
		}
	}, 1000 / FRAME_RATE);
	endSection();
}

/**************************************************************
	emitGameState()
	@arg roomName (string): the name of the room emitting it
	@arg state (JSON object): the state that room is in.
	@return none
	
	Emits the game state to all clients in the room. 
***************************************************************/
function emitGameState(roomName, state) {
	io.sockets.in(roomName)
		.emit('gameState', JSON.stringify(state));
}

/**************************************************************
	emitGameOver()
	@arg roomName (string): the name of the room emitting it
	@arg winner (JSON object): the winner of the game.
	
	Emitted when a winner is declared.
***************************************************************/
function emitGameOver(roomName, winner) {
	io.sockets.in(roomName)
		.emit('gameOver', JSON.stringify({ winner }));
}






