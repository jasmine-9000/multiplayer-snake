/********************************************************************
					CONSTANTS
*********************************************************************/
const BG_COLOR = '#231f20';
const SNAKE_COLOR = '#C2C2C2';
const FOOD_COLOR = '#e66916';

/*********************************************************************
					SOCKET.IO CONSTANTS
*********************************************************************/
const URL = 'http://desktop-3STA050:3000';
const socket = io(URL); // initialize socket.io library

/*********************************************************************
					ATTACH EVENT HANDLERS
*********************************************************************/
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('playerDisconnected', handleDisconnect);
socket.on('rematch', handleOtherPlayerWantsRematch);
socket.on('rematch__accepted', handleRematchAccepted);
socket.on('server__message', handleServerMessage);
socket.on('scoreboard__display', handleScoreboardDisplay);

/*********************************************************************
*********************************************************************
*********************************************************************
					DOM ELEMENTS
*********************************************************************
*********************************************************************
*********************************************************************/


/*********************************************************************
					SCREENS
*********************************************************************/
const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
/*********************************************************************
					BUTTONS AND TEXT FIELDS
*********************************************************************/
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const rematchBtn = document.getElementById("rematchButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const nameInput = document.getElementById("nameInput");


/*********************************************************************
					SPAN ELEMENTS
*********************************************************************/
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const rematchDisplay = document.getElementById("otherPlayerWantsRematch");


/*********************************************************************
					SCOREBOARD
*********************************************************************/
const namesDisplay = document.getElementById("namesDisplay");


/*********************************************************************
					BUTTON EVENT HANDLERS
*********************************************************************/
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
rematchBtn.addEventListener('click', handleRematch);

function newGame() {
	handleName();
	socket.emit('newGame');
	init();
}
function joinGame() {
	handleName();
	const code = gameCodeInput.value;
	socket.emit('joinGame', code);
	init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;
let playerName;


function init() {
	$('.toast').toast('show');
	console.log("Game initialized");
	initialScreen.style.display = "none";
	gameScreen.style.display = "block";
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvas.width = canvas.height = 600;
		
	ctx.filStyle = BG_COLOR;
	ctx.fillRect(0,0, canvas.width, canvas.height);
	
	document.addEventListener('keydown', keydown);
	gameActive = true;
	
	populateNamesDisplay(["jasmine", "michael"]);
}

function keydown(e) {
	socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const food = state.food;
	const gridsize = state.gridsize;
	const size = canvas.width / gridsize;
	ctx.fillStyle = FOOD_COLOR;
	ctx.fillRect(food.x * size, food.y * size, size, size);
	paintPlayer(state.players[0], size, SNAKE_COLOR);
	paintPlayer(state.players[1], size, 'red');
}

function populateNamesDisplay(names) {
	if(!Array.isArray(names)) {
		console.log("not an array");
		return;
	}
	var display = "";
	for(let name of names) {
		display += name + " ";
	}
	console.log("meow");
	namesDisplay.innerHTML = display;
}

function paintPlayer(playerState, size, color) {
	const snake = playerState.snake;
	ctx.fillStyle = color;
	for(let cell of snake) {
		ctx.fillRect(cell.x * size, cell.y*size, size, size);
	}
}

function handleInit(number) {
	playerNumber = number;
}

function handleGameState(gameState) {
	if(!gameActive) {return; };
	gameState = JSON.parse(gameState);
	requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
	if(!gameActive) { return; };
	
	
	data = JSON.parse(data);
	if(data.winner===playerNumber) {
		alert('you win');
	} else {
		alert('you lose');
	}
	gameActive = false;
}

function handleGameCode(gameCode) {
	gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
	reset();
	alert('Unknown Game Code');
}

function handleTooManyPlayers() {
	reset();
	alert('This game is already in progress');
}

function reset() {
	playerNumber = null;
	gameCodeInput.value = "";
	gameCodeDisplay.innerText = "";
	initialScreen.style.display = "block";
	gameScreen.style.display = "none";
}

function handleDisconnect() {
	alert('other player disconnected. you win');
	reset();
}

function handleRematch() {
	console.log("rematch button pressed");
	socket.emit('server__message', "player wants rematch", playerNumber);
	socket.emit('rematch', playerNumber);
}
function handleOtherPlayerWantsRematch(playerNumber) {
	rematchDisplay.innerHTML = "Player " + playerNumber + " wants rematch";
}

function handleServerMessage(message) {
	alert(message);
}


function handleRematchAccepted() {
	console.log('Rematch has been accepted');
	init();
	paintGame();
}

function handleName() {
	var name = nameInput.value;
	if(!name || name == "") {
		return;
	}
	playerName = name;
	socket.emit('name__input', name);
}

function handleScoreboardDisplay(scoreboard) {
	const scores = JSON.parse(scoreboard);
	populateNamesDisplay();
}
	
