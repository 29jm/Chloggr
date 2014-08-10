"use strict";
 
function Kloggr(width, height) {
	// Used by update, draw etc... to know what to do and
	// to generate events (not sure yet)
	this.State = {
		Playing:"Playing",
		Paused:"Paused",
		Dead:"Dead",
		MainMenu:"MainMenu"
	};
 
	this.Events = {
		NewHighscore:"NewHighscore",
		StateChanged:"StateChanged",
		ScoreChanged:"ScoreChanged",
		TargetReached:"TargetReached"
	};
 
	this.width = width;
	this.height = height;
 
	this.restart();
	this.state = this.State.MainMenu;
}
 
/* Equivalent of the good ol' init function */
Kloggr.prototype.restart = function() {
	// Other variables
	this.events = [];
	this.keys_pressed = {};
	this.score = 0;
	this.counter = 0;
	this.enemy_density = 3;

	// Spawn gameobjects
	this.respawnAll();
};
 
Kloggr.prototype.setKeyState = function(key, state) {
	if (state) {
		this.keys_pressed[key] = state;
	}
	else {
		delete this.keys_pressed[key];
	}
};

// Essentially a big switch
Kloggr.prototype.handleKeys = function() {
	if (37 in this.keys_pressed) {
		this.player.speed_x -= this.player.accel;
	}
 
	if (39 in this.keys_pressed) {
		this.player.speed_x += this.player.accel;
	}
 
	if (38 in this.keys_pressed) {
		this.player.speed_y -= this.player.accel;
	}
 
	if (40 in this.keys_pressed) {
		this.player.speed_y += this.player.accel;
	}
};

// Move objects
Kloggr.prototype.update = function(delta_t) {
	this.counter += delta_t;

	for (var i = 0; i < this.gameobjects.length; i++) {
		this.gameobjects[i].update(delta_t);
	}
};

Kloggr.prototype.collisionDetection = function() {
	// Wall collisions
	this.player.collideBox(0, 0, this.width, this.height);
	this.target.collideBox(0, 0, this.width, this.height);
 
	if (Square.intersect(this.player, this.target)) {
		this.score += 1;
		this.newEvent(this.Events.TargetReached);
		this.newEvent(this.Events.ScoreChanged, score);
		this.respawnEnemies();
	}
 
	for (var i = 0; i < this.gameobjects.length; i++) {
		if (this.gameobjects[i] instanceof Enemy) {
			if (Square.intersect(this.player, this.gameobjects[i])) {
				this.state = this.State.Dead;
				this.newEvent(this.Events.StateChanged, this.state);
			}
		}
	}
};

// Draw objects
Kloggr.prototype.draw = function(context) {
	for (var i = 0; i < this.gameobjects.length; i++) {
		this.gameobjects[i].draw(context);
	}
};

/* newEvent and getEvents will be used by the main loop
 * to do things like update cookies, change html etc....
 */
Kloggr.prototype.newEvent = function(evt, val) {
	// Is this the right syntax? TODO
	this.events.push({
		name:evt,
		value:val
	});
};

Kloggr.prototype.getEvents = function() {
	var tmp = this.events;
	this.events = []; // Way to avoid copy? TODO
 
	return tmp;
};

/* Various functions used by the game */
Kloggr.prototype.numberOfEnemies = function() {
	var screen_w = getUnits(document.body, "width").cm;
	var screen_h = getUnits(document.body, "height").cm;

	if (screen_h != 0) {
		console.log("tell me it happened");
	}
	else {
		screen_h = screen_w/2;
	}

	var enemy_ratio = this.enemy_density/Math.pow(10, 2);
	var screen_area = screen_w*screen_h;

	return Math.round(enemy_ratio*screen_area);
};

Kloggr.prototype.respawnAll = function() {
	console.log("respawnAll");

	// Save player position
	var player_x;
	var player_y;

	if (this.player) {
		player_x = this.player.x;
		player_y = this.player.y;
	}

	// Respawn objects
	this.gameobjects = [];
	this.gameobjects.push(new Player());
	this.gameobjects.push(new Target());
	this.respawnEnemies();

	// Special game objects get special names
	this.player = this.gameobjects[0];
	this.target = this.gameobjects[1];

	// Move player to its old position
	if (player_x && player_y) {
		this.player.x = player_x;
		this.player.y = player_y;
	}

	for (var i = 0; i < this.gameobjects.length; i++) {
		// Don't respawn player (except the 1st time)
		if (!(this.gameobjects[i] instanceof Player &&
			player_x && player_y)) {
			this.gameobjects[i].init
				(this.gameobjects, this.width, this.height);
		}
	}
};

Kloggr.prototype.respawnEnemies = function() {
	console.log("spawning "+this.numberOfEnemies()+" enemies");

	var num_enemies = this.numberOfEnemies();
	while (true) {
		var found = false;
		for (var i = 0; i < this.gameobjects.length; i++) {
			if (this.gameobjects[i] instanceof BasicEnemy) {
				found = true;
				this.gameobjects.splice(i, 1);
				break;
			}
		}
 
		if (!found) {
			break;
		}
	}
 
	for (var i = 0; i < this.gameobjects.length; i++) {
		// Respawn everything but the player
		if (!(this.gameobjects[i] instanceof Player)) {
			this.gameobjects[i].init
				(this.gameobjects, this.width, this.height);
		}
	}
 
	for (var i = 0; i < num_enemies; i++) {
		this.gameobjects.push(new BasicEnemy());
	}
};

/* Main loop will be like:
 * - Get events from Kloggr and react accordingly
 * - Get key presses and send them to Kloggr
 * - Call black magic to get touchscreen events
 * - Call Kloggr.handleKeys
 * - Update Kloggr (need a timer, will refactor that too)
 * - Call Kloggr.collisionDetection
 * - Call Kloggr.draw with a canvas context we created
 * - Repeat
 * - ???
 * - Profit
 */