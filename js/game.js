var canvas  = document.getElementById("canvas");
if (!canvas.getContext) {
	alert("Could not obtain rendering context");
}

var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-70;

function Square(w, h) {
	this.toRandomLocation = function() {
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

	this.update = function(delta_t) {
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

	this.draw = function(context) {
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.width, this.height);
	}

	this.x = 0;
	this.y = 0;
	this.width = w;
	this.height = h;
	this.color = '#FFFFFF';

	this.max_speed = 300;
	this.speed_x = 0;
	this.speed_y = 0;

	this.toRandomLocation();
}

var enemy_ratio = 6/Math.pow(800*600, 2); // <-- 10 enemies on a 800*600 screen
var px_num = canvas.width*canvas.height;
var num_enemies = Math.round(enemy_ratio*(px_num*px_num));

var cube_size = 40;
var enemy_size = 15;
var accel = 7;

var playerCube = new Square(cube_size, cube_size);
playerCube.color = '#ecf0f1';

var targetCube = new Square(cube_size, cube_size);
targetCube.color = '#e74c3c';
var enemies = [];
for (var i = 0; i < num_enemies; i++) {
	var enemy = new Square(enemy_size, enemy_size);
	enemy.color = '#27ae60';
	enemies.push(enemy);
}

respawn();
var interval = setInterval(loop, 3);
playTimer();

var finished = false;
var keys = {};
var score = 0;
var last_time = Date.now();
var paused = false;

function respawn() {
	targetCube.toRandomLocation();
	for (var i = 0; i < num_enemies; i++) {
		enemies[i].toRandomLocation();
		while (targetCube.intersects(enemies[i]) ||
			   playerCube.intersects(enemies[i])) {
			enemies[i].toRandomLocation();
		}
	}
}

function loop() {
	if (finished) {
		clearInterval(interval);
	}

	canvas.width = canvas.width; // Clear canvas

	var now = Date.now();
	var delta_t = (now - last_time) / 1000; // second to millisecond conv
	last_time = now;

	update(delta_t);
	draw(ctx);
}

function update(dt) {
	if (paused) {
		return;
	}

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
		score++;
		playerCube.speed_x = 0;
		playerCube.speed_y = 0;
		respawn();
	}

	for (var i = 0; i < num_enemies; i++) {
		if (playerCube.intersects(enemies[i])) {
			finished = true;
		}
	}
}

function draw(context) {
	// Drawed every time
	playerCube.draw(context);

	context.font = "20px Georgia";
	context.fillText(hours + ":" + minutes + ":" + seconds, 20, 20);

	context.font = "20px Georgia";
	context.fillText(score, 100, 20);

	targetCube.draw(context);

	for (var i = 0; i < num_enemies; i++) {
		enemies[i].draw(context);
	}
}

function onPauseButton() {
	paused = (paused ? false : true); // Toggles paused var
	if (paused) {
		stopTimer();
		document.getElementById("button").innerHTML = "Play";
	}
	else {
		playTimer();
		document.getElementById("button").innerHTML = "Pause";
	}
}