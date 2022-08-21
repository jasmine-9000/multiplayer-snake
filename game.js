const { GRID_SIZE } = require('./constants');

module.exports = {
	initGame,
	gameLoop,
	getUpdatedVelocity,
}


function initGame() {
	const state = createGameState();
	randomFood(state);
	return state;
}


function createGameState(playerOneName="", playerTwoName="") {
	return {
		players: [{
			pos: {
				x: 3,
				y: 10,
			},
			vel: {
				x: 1,
				y: 0,
			},
			snake: [
				{x: 1, y:10},
				{x: 2, y:10},
				{x: 3, y:10},
			],
			name: playerOneName,
		}, {
			pos: {
				x: 18,
				y: 10,
			},
			vel: {
				x: 0,
				y: 0,
			},
			snake: [
				{x: 20, y:10},
				{x: 19, y:10},
				{x: 18, y:10},
			],
			name: playerTwoName,
		}],
		food: {},
		gridsize: GRID_SIZE,
		active: true,
	};
}

function gameLoop(state) {
	if(!state) {
		return;
	}
	const playerOne = state.players[0];
	const playerTwo = state.players[1];
	
	playerOne.pos.x += playerOne.vel.x;
	playerOne.pos.y += playerOne.vel.y;
	
	playerTwo.pos.x += playerTwo.vel.x;
	playerTwo.pos.y += playerTwo.vel.y;
	
	
	
	if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
		return 2; // player 2 wins the game
	}
	
	if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
		return 1; // player 1 wins the game
	}
	
	
	// has player one eaten food?
	if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
		playerOne.snake.push({ ...playerOne.pos});
		playerOne.pos.x += playerOne.vel.x;
		playerOne.pos.y += playerOne.vel.y;
		randomFood(state);
	}
	
	// has player two eaten food?
	if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
		playerTwo.snake.push({ ...playerTwo.pos});
		playerTwo.pos.x += playerTwo.vel.x;
		playerTwo.pos.y += playerTwo.vel.y;
		randomFood(state);
	}
	
	
	// has player one bumped into itself? first check if player one is moving
	if(playerOne.vel.x || playerOne.vel.y) {
		for(let cell of playerOne.snake) {
			if(cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
				return 2;
			}
		}
		// if we make it here, player one is still in the game. move 1 forwards.
		// push snake one square.
		playerOne.snake.push({ ...playerOne.pos});
		playerOne.snake.shift();
		
	}
	
	// has player two bumped into itself? first check if player two is moving
	if(playerTwo.vel.x || playerTwo.vel.y) {
		for(let cell of playerTwo.snake) {
			if(cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
				return 1;
			}
		}
		// if we make it here, player one is still in the game. move 1 forwards.
		// push snake one square.
		playerTwo.snake.push({ ...playerTwo.pos});
		playerTwo.snake.shift();
		
	}
	
	
	
	return false; // no winner yet.
	
	
}

function randomFood(state) {
	food = {
		x: Math.floor(Math.random() * GRID_SIZE),
		y: Math.floor(Math.random() * GRID_SIZE),
	}
	for(let cell of state.players[0].snake) {
		if(cell.x === food.x && cell.y === food.y) {
			// try again.
			return randomFood(state);
		}
	}
	for(let cell of state.players[1].snake) {
		if(cell.x === food.x && cell.y === food.y) {
			// try again.
			return randomFood(state);
		}
	}
	state.food = food;
}

const LEFT = {x: -1, y: 0};
const DOWN = {x: 0, y: -1};
const RIGHT = {x: 1, y: 0};
const UP = {x: 0, y: 1};

function getUpdatedVelocity(keyCode, vel) {
	var dir = {x: vel.x, y: vel.y};

	switch(keyCode) {
		case 37: { return (isDirectionEqual(dir, RIGHT) ? RIGHT: LEFT); } // left
		case 38: { return (isDirectionEqual(dir, UP) ? UP : DOWN); } // down
		case 39: { return (isDirectionEqual(dir, LEFT) ? LEFT: RIGHT); } // right
		case 40: { return (isDirectionEqual(dir, DOWN) ? DOWN: UP); } // up
		
	}
}

function isDirectionEqual(dir1, dir2) {
	if(dir1.x == dir2.x && dir1.y == dir2.y) {
		return true;
	}
	return false;
}