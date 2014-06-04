"use strict";

var canvas  = document.getElementById("canvas");
if (!canvas.getContext) {
	alert("Could not obtain rendering context");
}

var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight-50;

// Prevent double initialization
var enemy_density = undefined;
var max_density = undefined;
var num_enemies = undefined;
var cube_size = undefined;
var enemy_size = undefined;
var accel = undefined;
var player = undefined;
var target = undefined;
var enemies = undefined;
var interval = undefined;
var keys = undefined;
var score = undefined;
var last_time = undefined;
var paused = undefined;
var cookie_exp = undefined;
var highScore = undefined;
var deathNumber = undefined;
var screen_size_x = undefined;
var screen_size_y = undefined;
var min_delta_t = undefined;
var max_delta_t = undefined;

// Only function called when (re)starting
init();

function init() {
	screen_size_x = getUnits(document.body, "width").cm;
	screen_size_y = getUnits(document.body, "height").cm;

	hideMenu();
	resetTimer();
	enemy_density = 3;
	max_density = 14;
	num_enemies = 0;
	updateEnemyDensity();

	cube_size = 40;
	enemy_size = 15;
	accel = 7;

	player = new Player(cube_size, cube_size, 'assets/playerCube.png', 300, 0.7);
	player.toRandomLocation(canvas.width-player.width,
							canvas.height-player.height);
	player.dead = false;

	target = new Target(cube_size, cube_size, 'assets/targetCube.png', 200, 0.7);
	target.toRandomLocation(canvas.width-target.width,
							canvas.height-target.height);

	enemies = [];
	createEnemies();
	respawn();

	if (interval != undefined) {
		clearInterval(interval);
	}

	interval = setInterval(loop, 2);

	keys = {};
	score = 0;
	last_time = Date.now();
	paused = false;

	var cookie_exp = 60*60*24*365;

	highScore = Cookies.get('highScore');
	if (highScore == undefined) {
		highScore = 0;
		Cookies.set('highScore', 0, { expires: cookie_exp });
	}

	deathNumber = Cookies.get('deathNumber');
	if (deathNumber == undefined) {
		deathNumber = 0;
		Cookies.set('deathNumber', 0, { expires: cookie_exp });
	}

	min_delta_t = (1.0/30.0); // 30 FPS-like motion
	max_delta_t = (1.0/15.0); // 15 FPS minimum
}

function createEnemies() {
	console.log(num_enemies+" created. density="+enemy_density);

	enemies = [];
	for (var i = 0; i < num_enemies; i++) {
		var enemy = new Enemy(enemy_size, enemy_size);
		enemy.color = '#27ae60';
		enemies.push(enemy);
	}
}

function updateEnemyDensity() {
	var enemy_ratio = enemy_density/Math.pow(10, 2);
	var screen_area = screen_size_x*screen_size_y;
	num_enemies = Math.round(enemy_ratio*screen_area);

	createEnemies();
}

function respawn() {
	if (enemies.length != num_enemies) { // Density changed
		createEnemies();
	}

	for (var i = 0; i < enemies.length; i++) {
		enemies[i].toRandomLocation(canvas.width-enemies[i].width,
									canvas.height-enemies[i].height);
		while (!isValidEnemySpawn(enemies[i])) {
			enemies[i].toRandomLocation(canvas.width-enemies[i].width,
										canvas.height-enemies[i].height);
		}
	}

	target.toRandomLocation(canvas.width-target.width,
							canvas.height-target.height);
	while (!isValidTargetSpawn(target)) {
		target.toRandomLocation(canvas.width-target.width,
								canvas.height-target.height);
	}
}

function isValidTargetSpawn(square) {
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].intersects(square)) {
			return false;
		}
	}

	var minimum = toCentimeter(((canvas.width+canvas.height)/2) / 2); // Half the average screen size

	if (toCentimeter(distanceBetween(player, square)) < minimum) {
		return false;
	}

	return true;
}

function isValidEnemySpawn(square) {
	if (square.intersects(player)) {
		return false;
	}

	var minimum = toCentimeter(((square.width+square.height)/2) * 2); // Two times the size of an enemy

	if (square.x > player.x+player.width) {
		if (toCentimeter(distanceBetween(square, player)) < minimum+toCentimeter(player.width)) {
			return false;
		}
	}

	if (square.y > player.y+player.height) {
		if (toCentimeter(distanceBetween(square, player)) < minimum+toCentimeter(player.height)) {
			return false;
		}
	}

	if (toCentimeter(distanceBetween(square, player)) < minimum) {
		return false;
	}

	return true;
}

function distanceBetween(a, b) {
	return Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y));
}

function toCentimeter(pixels) {
	return (pixels*screen_size_x) / canvas.width; // is window.devicePixelRatio needed ? TODO
}

function loop() {
	canvas.width = canvas.width; // Clear canvas

	if (paused || player.dead) { // Draw but stop updating
		draw(ctx);
		return;
	}

	var now = Date.now();
	var delta_t = (now - last_time) / 1000; // second to millisecond conv
	last_time = now;

	if (delta_t > max_delta_t) {
		delta_t = min_delta_t;
	}

	update(delta_t);
	draw(ctx);
}

function update(dt) {
	handleInput(); // input.js
	player.update(dt);
	target.update(dt);
	collisionDetection();
}

function collisionDetection() {
	player.collideBox(0, 0, canvas.width, canvas.height);
	target.collideBox(0, 0, canvas.width, canvas.height);

	if (player.intersects(target)) {
		onTarget();
	}

	for (var i = 0; i < num_enemies; i++) {
		if (player.intersects(enemies[i])) {
			onDead();
		}
	}
}

function onTarget() {
	if (++score > highScore) {
		highScore = score;
		Cookies.set('highScore', highScore);
	}

	if (enemy_density < max_density) {
		enemy_density++;
		updateEnemyDensity();
	}

	if (score == 10) {
		target.state = target.State.Bouncing;
	}

	player.speed_x = 0;
	player.speed_y = 0;
	respawn();
}

function onDead() {
	player.dead = true;
	player.texture.src = 'assets/deadPlayer.png';
	Cookies.set('deathNumber', ++deathNumber);

	stopTimer();
	loseMenu();
}

function draw(context) {
	// Drawed every time
	player.draw(context);

	target.draw(context);

	for (var i = 0; i < num_enemies; i++) {
		enemies[i].draw(context);
	}
	
	document.getElementById("timer").innerHTML = hours + ":" + minutes + ":" + seconds;
	document.getElementById("score").innerHTML = score ;
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

	var menuScore = document.getElementById("finalScore");
	menuScore.style.fontWeight = 'bold';

	if (score > 1) {
		menuScore.innerHTML = "You won: " + score + " points!";
	}
	else {
		menuScore.innerHTML = "You won: " + score + " point! YOU SUCK";
	}
}

function onPauseButton() {
	if (player.dead) {
		return;
	}

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

window.addEventListener('resize', function(event){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight-50;

	screen_size_x = getUnits(document.body, "width").cm;
	screen_size_y = getUnits(document.body, "height").cm;

	updateEnemyDensity();
	respawn();
});
