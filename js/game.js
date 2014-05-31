var canvas  = document.getElementById("canvas");
if (!canvas.getContext) {
	alert("Could not obtain rendering context");
}

var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight-50;

window.addEventListener('resize', function(event){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight-50;

	updateEnemyDensity();
	respawn();
});

function Square(w, h) {
	this.toRandomLocation = function() { // Specialization
		this.x = Math.random()*(canvas.width-this.width);
		this.y = Math.random()*(canvas.height-this.height);
	}

	this.intersects = function(square) {
		if(square.x >= this.x+this.width ||
			square.x+square.width <= this.x ||
			square.y >= this.y+this.height ||
			square.y+square.height <= this.y) {
			return false;
		}

		return true;
	}

	this.update = function(delta_t) { // Specialization
		if (Math.abs(this.speed_x) > this.max_speed) {
			this.speed_x = (this.speed_x > 0 ?
				this.max_speed : -this.max_speed);
		}

		if (Math.abs(this.speed_y) > this.max_speed) {
			this.speed_y = (this.speed_y > 0 ?
				this.max_speed : -this.max_speed);
		}

		this.x += this.speed_x*delta_t;
		this.y += this.speed_y*delta_t;
	}

	this.slowdown = function() { // Specialization
		var len = Math.sqrt((this.speed_x*this.speed_x)
							+ (this.speed_y*this.speed_y));

		if (Math.round(len) == 0) {
			this.speed_x = 0;
			this.speed_y = 0;
			return;
		}

		this.speed_x = (this.speed_x / len)*(len-this.slowing_speed);
		this.speed_y = (this.speed_y / len)*(len-this.slowing_speed);
	}

	this.draw = function(context) {
		if (this.dead) { // Specialization
			context.drawImage(this.deadImage, this.x, this.y);
			return;
		}

		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.width, this.height);
	}

	this.x = 0;
	this.y = 0;
	this.width = w;
	this.height = h;
	this.color = '#FFFFFF';

	this.dead = false; // Specialization
	this.deadImage = new Image();
	this.deadImage.src = "menu/deadPlayer.png";
	this.max_speed = 300; // Specialization
	this.slowing_speed = 0.7; // Specialization
	this.speed_x = 0; // Specialization
	this.speed_y = 0; // Specialization
	this.toRandomLocation(); // Specialization
}

// Prevent double initialization
var enemy_density = undefined;
var max_density = undefined;
var num_enemies = undefined;
var cube_size = undefined;
var enemy_size = undefined;
var accel = undefined;
var playerCube = undefined;
var targetCube = undefined;
var enemies = undefined;
var interval = undefined;
var keys = undefined;
var score = undefined;
var last_time = undefined;
var paused = undefined;
var highScore = undefined;

// Only function called when (re)starting
init();

function init() {
	hideMenu();
	resetTimer();
	enemy_density = 6; // Allows scaling to small screens (fuck high-res ones)
	max_density = 15;
	num_enemies = 0;
	updateEnemyDensity();

	cube_size = 40;
	enemy_size = 15;
	accel = 7;

	playerCube = new Square(cube_size, cube_size);
	playerCube.color = '#ecf0f1';

	targetCube = new Square(cube_size, cube_size);
	targetCube.color = '#e74c3c';
	enemies = [];
	createEnemies();

	respawn();

	if (interval != undefined) {
		clearInterval(interval);
	}

	interval = setInterval(loop, 3);

	keys = {};
	score = 0;
	last_time = Date.now();
	paused = false;

	highScore = Cookies.get('highScore');
	if (highScore == undefined) {
		highScore = 0;
		Cookies.set('highScore', 0, { expires: 600 });
	}
}

function createEnemies() {
	console.log(num_enemies+" created");

	enemies = []
	for (var i = 0; i < num_enemies; i++) {
		var enemy = new Square(enemy_size, enemy_size);
		enemy.color = '#27ae60';
		enemies.push(enemy);
	}
}

function updateEnemyDensity() {
	var enemy_ratio = enemy_density/Math.pow(800*600, 2);
	var px_num = (canvas.width*window.devicePixelRatio)*(canvas.height*window.devicePixelRatio);
	num_enemies = Math.round(enemy_ratio*(px_num*px_num));

	createEnemies();
}

function respawn() {
	if (enemies.length != num_enemies) { // Density changed
		createEnemies();
	}

	targetCube.toRandomLocation();
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].toRandomLocation();
		while (targetCube.intersects(enemies[i]) ||
			   playerCube.intersects(enemies[i])) {
			enemies[i].toRandomLocation();
		}
	}
}

function loop() {
	canvas.width = canvas.width; // Clear canvas

	if (paused || playerCube.dead) { // Draw but stop updating
		draw(ctx);
		return;
	}

	var now = Date.now();
	var delta_t = (now - last_time) / 1000; // second to millisecond conv
	last_time = now;

	update(delta_t);
	draw(ctx);
}

function update(dt) {
	playerCube.slowdown();

	handleInput(); // input.js
	playerCube.update(dt);
	collisionDetection();
}

function collisionDetection() {
	if (playerCube.x < 0) {
		playerCube.x = 0;
		playerCube.speed_x = 0;
	}
	if (playerCube.x+playerCube.width > canvas.width) {
		playerCube.x = canvas.width-playerCube.width;
		playerCube.speed_x = 0;
	}
	if (playerCube.y < 0) {
		playerCube.y = 0;
		playerCube.speed_y = 0;
	}
	if (playerCube.y+playerCube.height > canvas.height) {
		playerCube.y = canvas.height-playerCube.height;
		playerCube.speed_y = 0;
	}

	if (playerCube.intersects(targetCube)) {
		onTarget();
	}

	for (var i = 0; i < num_enemies; i++) {
		if (playerCube.intersects(enemies[i])) {
			onDead();
		}
	}
}

function onTarget() {
	score++;
	if (score > highScore) {
		highScore = score;
		Cookies.set('highScore', highScore);
	}

	if (enemy_density < max_density) {
		enemy_density++;
		updateEnemyDensity();
	}

	playerCube.speed_x = 0;
	playerCube.speed_y = 0;
	respawn();
}

function onDead() {
	playerCube.dead = true; // Specialization
	stopTimer();
	loseMenu();
}

function draw(context) {
	// Drawed every time
	playerCube.draw(context);

	targetCube.draw(context);

	for (var i = 0; i < num_enemies; i++) {
		enemies[i].draw(context);
	}

	context.fillStyle = '#FFFFFF';
	context.font = "20px Open Sans";
	context.fillText(hours + ":" + minutes + ":" + seconds, 20, 25);

	context.font = "20px Open Sans";
	context.fillText("Score: " + score, 100, 25);
}

function pauseMenu(){
	var menuPause = document.getElementById("menuPause");
	menuPause.style.display = "inline-block";

	var quit = document.getElementById("quit");
	quit.style.display = "inline-block";
	quit.style.backgroundColor = " #1abc9c";

	var replay = document.getElementById("replay");
	replay.style.display = "inline-block";
	replay.style.backgroundColor =" #e74c3c";
}

function hideMenu(){
	var menuPause = document.getElementById("menuPause");
	menuPause.style.display = "none";

	var replay = document.getElementById("replay");
	replay.style.display = "none";

	var menuLose = document.getElementById("menuLose");
	menuLose.style.display = "none";

	var quit = document.getElementById("quit");
	quit.style.display = "none";
}

function loseMenu(){
	var menuLose = document.getElementById("menuLose");
	menuLose.style.display = "inline-block";

	var quit = document.getElementById("quit");
	quit.style.display = "inline-block";
	quit.style.backgroundColor = "#e74c3c";

	var replay = document.getElementById("replay");
	replay.style.display = "inline-block";
	replay.style.backgroundColor =" #1abc9c";
}

function onPauseButton() {
	paused = (paused ? false : true); // Toggles paused var
	if (paused) {
		pauseMenu();
		stopTimer();
		document.getElementById("button").innerHTML = "Play";
	}
	else {
		playTimer();
		hideMenu();
		document.getElementById("button").innerHTML = "Pause";
	}
}