var canvas  = document.getElementById("canvas");
if (!canvas.getContext) {
	alert("Could not obtain rendering context");
}

var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-70;

window.addEventListener('resize', function(event){
	canvas.width = window.innerWidth-20;
	canvas.height = window.innerHeight-70;

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

		var unit_x = this.speed_x / len;
		var unit_y = this.speed_y / len;

		this.speed_x = unit_x*(len-this.slowing_speed);
		this.speed_y = unit_y*(len-this.slowing_speed);
	}

	this.draw = function(context) {
		if (this.dead) {
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

var enemy_density = 6; // Allows scaling to small screens (fuck high-res ones)
var max_density = 15;
var num_enemies = 0;
setEnemyDensity(enemy_density, 800*600);

var cube_size = 40;
var enemy_size = 15;
var accel = 7;

var playerCube = new Square(cube_size, cube_size);
playerCube.color = '#ecf0f1';

var targetCube = new Square(cube_size, cube_size);
targetCube.color = '#e74c3c';
var enemies = [];
createEnemies();

respawn();
var interval = setInterval(loop, 3);
playTimer();

var finished = false;
var keys = {};
var score = 0;
var last_time = Date.now();
var paused = false;

function createEnemies() {
	console.log("Enemies recreated "+num_enemies);

	enemies = []
	for (var i = 0; i < num_enemies; i++) {
		var enemy = new Square(enemy_size, enemy_size);
		enemy.color = '#27ae60';
		enemies.push(enemy);
	}
}

function setEnemyDensity(num, area) {
	var enemy_ratio = num/Math.pow(area, 2);
	var px_num = canvas.width*canvas.height;
	num_enemies = Math.round(enemy_ratio*(px_num*px_num));
}

function respawn() {
	if (enemies.length != num_enemies) { // Density changed
		createEnemies();
	}

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
	canvas.width = canvas.width; // Clear canvas

	if (paused || finished) {
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
		score++;
		if (enemy_density < max_density) {
			enemy_density++;
		}
		setEnemyDensity(enemy_density, 800*600);
		playerCube.speed_x = 0;
		playerCube.speed_y = 0;
		respawn();
	}

	for (var i = 0; i < num_enemies; i++) {
		if (playerCube.intersects(enemies[i])) {
			finished = true;
			playerCube.dead = true;
			stopTimer();
		}
	}
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