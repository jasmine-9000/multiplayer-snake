const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid, makeid2 } = require('./utils.js');
const util = require('util');
const os = require('os');

/*********************************************************************
	REMATCH HANDLER
**********************************************************************/
module.exports = function(socket, next) {
    var rematchArray = [];
	socket.on('connect', client => {
	client.on('rematch', handleRematch);

 
	function handleRematch(playerNumber) {
		beginSection("Player Wants rematch");
		console.log("Player " + playerNumber + " wants a rematch!");
		const myRoom = client.rooms;
		const gameCode = Object.keys(myRoom)[1];
		console.log("Game Code: " + gameCode);
		
		if(rematchArray.length == 0) { 
			rematchArray.push(playerNumber);
			io.to(gameCode).emit('rematch', playerNumber);
		} else if (rematchArray[0] == playerNumber) {
			console.log("Rematch requested again by player " + playerNumber + ". ");
			// do nothing
		} else {
			console.log("Rematch accepted by both players. Rematching...");
			// io.sockets.in(gameCode).emit('server__message', 'Rematch!');
			state[gameCode] = initGame();
			io.sockets.in(gameCode).emit('init', 2);
			io.sockets.in(gameCode).emit('rematch__accepted');
			console.table(state);
			console.log()
			startGameInterval(gameCode);
			rematchArray = [];
		}
		
		endSection("Rematch");
	}
});
}
/*
io.on('connect', client => {
	client.on('rematch', handleRematch);


	function handleRematch(playerNumber) {
		beginSection("Player Wants rematch");
		console.log("Player " + playerNumber + " wants a rematch!");
		const myRoom = client.rooms;
		const gameCode = Object.keys(myRoom)[1];
		console.log("Game Code: " + gameCode);
		
		if(rematchArray.length == 0) { 
			rematchArray.push(playerNumber);
			io.to(gameCode).emit('rematch', playerNumber);
		} else if (rematchArray[0] == playerNumber) {
			console.log("Rematch requested again by player " + playerNumber + ". ");
			// do nothing
		} else {
			console.log("Rematch accepted by both players. Rematching...");
			// io.sockets.in(gameCode).emit('server__message', 'Rematch!');
			state[gameCode] = initGame();
			io.sockets.in(gameCode).emit('init', 2);
			io.sockets.in(gameCode).emit('rematch__accepted');
			console.table(state);
			console.log()
			startGameInterval(gameCode);
			rematchArray = [];
		}
		
		endSection("Rematch");
	}
});
*/