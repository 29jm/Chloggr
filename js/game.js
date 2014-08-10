"use strict";


// Prevent double initialization
var enemy_density;
var max_density;
var player;
var target;
var interval;
var keys;
var score;
var finalScore;
var last_time;
var paused;
var cookie_exp;
var highScore;
var deathNumber;
var screen_size_x;
var screen_size_y;
var min_delta_t;
var enemies_texture;
var musicState;
var lazer;
var home;
var gameobjects;

function init() {
	screen_size_x = getUnits(document.body, "width").cm;
	screen_size_y = getUnits(document.body, "height").cm;

	resetTimer();
	enemy_density = 3;
	max_density = 14;

	gameobjects = [];
	gameobjects.push(new Player());
	gameobjects.push(new Target());
	gameobjects = gameobjects.concat(createEnemies());

	player = gameobjects[0];
	target = gameobjects[1];

	for (var i = 0; i < gameobjects.length; i++) {
		// Gives every object the informations needed to spawn
		// at a good place
		gameobjects[i].init(gameobjects, canvas.width, canvas.height);
	}

	if (interval == undefined) {
		interval = setInterval(loop, 2);
	}

	loseMenu();

	keys = {};
	score = 0;
	last_time = Date.now();
	paused = false;

	var next_year = new Date();
	next_year.setFullYear(next_year.getFullYear()+1);

	highScore = Cookies.get('highScore');
	if (highScore === undefined) {
		highScore = 0;
		Cookies.set('highScore', 0, { expires: next_year });
	}

	deathNumber = Cookies.get('deathNumber');
	if (deathNumber === undefined) {
		deathNumber = 0;
		Cookies.set('deathNumber', 0, { expires: next_year });
	}

	// If it's the first time init is called, get the user settings
	// and default to music = on
	if (musicState === undefined) {
		musicState = (Cookies.get('musicState') == 'false' ? false : true);
		if (musicState) {
			startAudio();
		}
	}

	min_delta_t = (1.0/30.0); // 30 FPS-like motion at least
}

function startAudio() {
	var music = new Audio();
	music.src = "assets/ingame_kloggr.mp3";
	music.load();
	music.loop = true;
	music.volume = 0.5;
	music.play();
}

function createEnemies() {
	var num_enemies = numberEnemies();

	var enemies = [];
	for (var i = 0; i < num_enemies; i++) {
		var enemy = new BasicEnemy();
		enemies.push(enemy);
	}

	console.log(enemies.length+" created");

	return enemies;
}

function numberEnemies() {
	var enemy_ratio = enemy_density/Math.pow(10, 2);
	var screen_area = screen_size_x*screen_size_y;

	return Math.round(enemy_ratio*screen_area);
}

// Don't touch, ultra-sensitive code, reacts even to looks plz go away
function respawn() {
	while (true) {
		var found = false;
		for (var i = 0; i < gameobjects.length; i++) {
			if (gameobjects[i] instanceof BasicEnemy) {
				found = true;
				gameobjects.splice(i, 1);
				break;
			}
		}

		if (!found) {
			break;
		}
	}

	gameobjects = gameobjects.concat(createEnemies());

	for (var i = 0; i < gameobjects.length; i++) {
		// Respawn everything but the player
		if (!(gameobjects[i] instanceof Player)) {
			gameobjects[i].init(gameobjects, canvas.width, canvas.height);
		}
	}
}

function toCentimeter(pixels) {
	return (pixels*screen_size_x) / canvas.width; // is window.devicePixelRatio needed ? TODO
}



function collisionDetection() {
	// Wall collisions
	player.collideBox(0, 0, canvas.width, canvas.height);
	target.collideBox(0, 0, canvas.width, canvas.height);

	if (player.intersects(target)) {
		onTarget();
	}

	for (var i = 0; i < gameobjects.length; i++) {
		if (gameobjects[i] instanceof Enemy) {
			if (gameobjects[i].intersects(player)) {
				onDead();
			}
		}
	}
}

function onTarget() {
	score += 1;

	if (score > highScore) {
		highScore = score;
		Cookies.set('highScore', highScore);
	}

	if (enemy_density < max_density) {
		enemy_density++;
	}

	if (score == 5) {
		target.state = target.State.Bouncing;
	}

	if (score == 10) {
		gameobjects.push(new Lazer());
	}

	player.speed_x = 0;
	player.speed_y = 0;
	respawn();
}

function scoreCalc() {
	if (!score) {
		finalScore = 0;
	}
	finalScore = Math.round(score/seconds + score*10);
}

function onDead() {
	Cookies.set('deathNumber', ++deathNumber);

	loseMenu();
	stopTimer();
}

function draw(context) {
	// Drawed every time
	for (var i = 0; i < gameobjects.length; i++) {
		gameobjects[i].draw(context);
	}

	document.getElementById("timer").innerHTML = seconds;
	document.getElementById("score").innerHTML = score ;
}

function renderToCanvas(width, height, renderFunction) {
	var buffer = document.createElement('canvas');
	buffer.width = width;
	buffer.height = height;
	renderFunction(buffer.getContext('2d'));

	return buffer;
}

function toggleHome() {
	if (home == undefined){
		home = false;
	}

	if (home) {
        document.getElementById("gameContainer").style.display = "none";
        document.getElementById("menuContainer").style.display = "initial";
	}
	else {
		kloggr.state = kloggr.State.Playing;
		document.getElementById("gameContainer").style.display = "initial";
		document.getElementById("menuContainer").style.display = "none";
	}

	home = (home ? false : true);
}

function pauseMenu() {
    if (paused) {
        document.getElementById("menuPause").className = "popOut";
        document.getElementById("menuPause").style.display = "block";
    }
    else {
        document.getElementById("menuPause").style.display = "none";      
    }
}

function loseMenu() {
	scoreCalc();

    if (player.dead) {
        document.getElementById("menuLose").className = "popOut";
        document.getElementById("menuLose").style.display = "block";
        document.getElementById("lose").innerHTML = finalScore;
    }
    else {
        document.getElementById("menuLose").style.display = "none";    
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
		document.getElementById("menuPause").className = "popIn";
		pauseMenu();
		playTimer();
		document.getElementById("button").innerHTML = "Pause";
	}
}

function setMusicState(music, state) {

}

