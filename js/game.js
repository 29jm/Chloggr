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
var highScore = undefined;

// Only function called when (re)starting
init();

function init() {
	hideMenu();
	resetTimer();
	enemy_density = 3;
	max_density = 10;
	num_enemies = 0;
	updateEnemyDensity();

	cube_size = 40;
	enemy_size = 15;
	accel = 7;

	player = new Player(cube_size, cube_size, 'assets/playerCube.png', 300, 0.7);
	player.toRandomLocation(canvas.width-player.width,
							canvas.height-player.height);
	player.dead = false;

	target = new Player(cube_size, cube_size, 'assets/targetCube.png');
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

	highScore = Cookies.get('highScore');
	if (highScore == undefined) {
		highScore = 0;
		Cookies.set('highScore', 0, { expires: 600 });
	}
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
	var screen_size = getUnits(document.body, "width").cm
						* getUnits(document.body, "height").cm;
	num_enemies = Math.round(enemy_ratio*screen_size);

	createEnemies();
}

function respawn() {
	if (enemies.length != num_enemies) { // Density changed
		createEnemies();
	}

	target.toRandomLocation(canvas.width-target.width,
							canvas.height-target.height);
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].toRandomLocation(canvas.width-enemies[i].width,
									canvas.height-enemies[i].height);
		while (target.intersects(enemies[i]) ||
			   player.intersects(enemies[i])) {
			enemies[i].toRandomLocation(canvas.width-enemies[i].width,
										canvas.height-enemies[i].height);
		}
	}
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

	update(delta_t);
	draw(ctx);
}

function update(dt) {
	handleInput(); // input.js
	player.update(dt);
	collisionDetection();
}

function collisionDetection() {
	if (player.x < 0) {
		player.x = 0;
		player.speed_x = 0;
	}
	if (player.x+player.width > canvas.width) {
		player.x = canvas.width-player.width;
		player.speed_x = 0;
	}
	if (player.y < 0) {
		player.y = 0;
		player.speed_y = 0;
	}
	if (player.y+player.height > canvas.height) {
		player.y = canvas.height-player.height;
		player.speed_y = 0;
	}

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
	score++;
	if (score > highScore) {
		highScore = score;
		Cookies.set('highScore', highScore);
	}

	if (enemy_density < max_density) {
		enemy_density++;
		updateEnemyDensity();
	}

	player.speed_x = 0;
	player.speed_y = 0;
	respawn();
}

function onDead() {
	player.dead = true;
	player.texture.src = 'assets/deadPlayer.png';
	console.log("Dead");
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

	menuScore = document.getElementById("finalScore");
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