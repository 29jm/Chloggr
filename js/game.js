var canvas  = document.getElementById("canvas");
if (!canvas.getContext) {
	alert("Could not obtain rendering context");
}

var ctx = canvas.getContext('2d');
 
// Marcheras pas sous IE - balec'
const num_enemies = 25;
const cube_size = 40;
const enemy_size = 15;
const accel = 7;
 
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

	this.draw = function() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
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

var playerCube = new Square(cube_size, cube_size);
playerCube.color = '#FF0000';

var targetCube = new Square(cube_size, cube_size);
targetCube.color = '#0000FF';

var enemies = [];
for (var i = 0; i < num_enemies; i++) {
	var enemy = new Square(enemy_size, enemy_size);
	enemy.color = '#BADA55';
	enemies.push(enemy);
}

respawn();

var finished = false;
var interval = setInterval(loop, 3); // *1000 = second to millisecond conv
var keys = {};
var score = 0;
var last_time = Date.now();

document.addEventListener('keydown', function(event) {
	keys[event.keyCode] = true;
});

document.addEventListener('keyup', function(event) {
	delete keys[event.keyCode];
});

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
	var delta_t = (now - last_time) / 1000;
	last_time = now;

	console.log(delta_t);

	update(delta_t);
	draw();
}

function update(dt) {
	if (37 in keys) {
		playerCube.speed_x -= accel;
	}
	if (39 in keys) {
		playerCube.speed_x += accel;
	}
	if (38 in keys) {
		playerCube.speed_y -= accel;
	}
	if (40 in keys) {
		playerCube.speed_y += accel;
	}

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

function draw() {
	playerCube.draw();
	targetCube.draw();

	for (var i = 0; i < num_enemies; i++) {
		enemies[i].draw();
	}
}
