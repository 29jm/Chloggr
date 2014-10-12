"use strict";
 
function Kloggr(width, height) {
	this.width = width;
	this.height = height;
 
	this.restart();
	this.state = Kloggr.State.MainMenu;
}

Kloggr.State = {
	Playing:"Playing",
	Paused:"Paused",
	Dead:"Dead",
	MainMenu:"MainMenu"
};

Kloggr.Events = {
	NewHighscore:"NewHighscore",
	StateChanged:"StateChanged",
	ScoreChanged:"ScoreChanged",
	TargetReached:"TargetReached",
	TimeChanged:"TimeChanged"
};

Kloggr.prototype.restart = function() {
	// Set default values
	this.state = Kloggr.State.Playing;
	this.events = [];
	this.keys_pressed = {};
	this.touchmoves = [0, 0];
	this.score = 0;
	this.counter = 0;
	this.enemy_density = 3;

	// Spawn gameobjects
	this.respawnAll(true);
};

Kloggr.prototype.setKeyState = function(key, state) {
	if (state) {
		this.keys_pressed[key] = state;
	}
	else {
		delete this.keys_pressed[key];
	}
};

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

Kloggr.prototype.handleTouchStart = function(event) {
	var touchobj = event.changedTouches[0];
	this.touchmoves[0] = touchobj.pageX;
	this.touchmoves[1] = touchobj.pageY;

	event.preventDefault();
};

Kloggr.prototype.handleTouchMove = function(event) {
	var touchobj = event.changedTouches[0];
	var dpr = window.devicePixelRatio;
	var move_x = touchobj.pageX*dpr - this.touchmoves[0]*dpr;
	var move_y = touchobj.pageY*dpr - this.touchmoves[1]*dpr;

	// Should be done during update(), but hey, lack of funding
	this.player.speed_x += move_x;
	this.player.speed_y += move_y;

	this.touchmoves[0] = touchobj.pageX;
	this.touchmoves[1] = touchobj.pageY;
	event.preventDefault();
};

// Move objects
Kloggr.prototype.update = function(delta_t) {
	if (Math.floor(this.counter+delta_t)
			> Math.floor(this.counter)) {
		this.newEvent(Kloggr.Events.TimeChanged,
				Math.floor(this.counter+delta_t));
	}

	this.counter += delta_t;

	var len = this.gameobjects.length;
	for (var i = 0; i < len; i++) {
		if (this.gameobjects[i].to_update === false) {
			continue;
		}

		this.gameobjects[i].update(delta_t);
	}
};

Kloggr.prototype.collisionDetection = function() {
	// Wall collisions
	this.player.collideBox(0, 0, this.width, this.height);
	this.target.collideBox(0, 0, this.width, this.height);
 
	if (Square.prototype.intersect.call(this.player, this.target)) {
		this.score += 1;
		this.enemy_density += 0.5;

		// Kloggr.score has its own setter that calls
		// Kloggr.newEvents, so no need for it here
		this.newEvent(Kloggr.Events.TargetReached);
	}
 
	var len = this.gameobjects.length;
	for (var i = 0; i < len; i++) {
		if (this.gameobjects[i] instanceof Enemy) {
			if (this.gameobjects[i].collidable) {
				if (Square.prototype.intersect.call(this.player, this.gameobjects[i])) {
					this.state = Kloggr.State.Dead;
					this.newEvent(Kloggr.Events.StateChanged, this.state);
				}
			}
		}
	}
};

// Draw objects
Kloggr.prototype.draw = function(context) {
	var len = this.gameobjects.length;
	for (var i = 0; i < len; i++) {
		this.gameobjects[i].draw(context);
	}
};

/* These 2 functions are used to transmit messages
 * to the external main loop.
 */
Kloggr.prototype.newEvent = function(evt, val) {
	this.events.push({
		name:evt,
		value:val
	});
};

Kloggr.prototype.getEvents = function() {
	var tmp = this.events;
	this.events = [];
 
	return tmp;
};

// Return the the number of enemies to create
Kloggr.prototype.numberOfEnemies = function() {
	var screen_w = getUnits(document.body, "width").cm;
	var screen_h = getUnits(document.body, "height").cm;

	// One day, a clever man will find a solution
	if (screen_h == 0) {
		screen_h = screen_w/2;
	}

	var enemy_ratio = this.enemy_density/Math.pow(10, 2);
	var screen_area = screen_w*screen_h;

	return Math.round(enemy_ratio*screen_area);
};

Kloggr.prototype.respawnAll = function(full_restart) {
	if (!full_restart) {
		var player_x = this.player.x;
		var player_y = this.player.y;

		this.player.respawn(this.gameobjects, this.width, this.height);
		this.target.respawn(this.gameobjects, this.width, this.height);
		
		this.player.x = player_x;
		this.player.y = player_y;
	}
	else {
		this.gameobjects = [];
		this.gameobjects.push(new Player());
		this.gameobjects.push(new Target());

		this.player = this.gameobjects[0];
		this.target = this.gameobjects[1];

		this.player.respawn(this.gameobjects, this.width, this.height);
		this.target.respawn(this.gameobjects, this.width, this.height);
	}

	this.respawnEnemies();
};

Kloggr.prototype.respawnEnemies = function() {
	console.log("Spawning "+this.numberOfEnemies()+" enemies");

	var num_enemies = this.numberOfEnemies();
	var enemy_count = 0;
	for (var i = 0; i < this.gameobjects.length; i++) {
		if (this.gameobjects[i] instanceof BasicEnemy) {
			enemy_count	+= 1;
		}
	}
	
	if (enemy_count < num_enemies) {
		var diff = num_enemies - enemy_count;
		for (var i = 0; i < diff; i++) {
			this.gameobjects.push(new BasicEnemy());
		}
	}

	for (var i = 0; i < this.gameobjects.length; i++) {
		if (this.gameobjects[i] instanceof Enemy) {
			this.gameobjects[i].
				respawn(this.gameobjects, this.width, this.height);
		}
	}
};

// Define getters/setters to automatize things
Object.defineProperty(Kloggr.prototype, 'score', {
	get: function() {
		return this._score;
	},

	set: function(value) {
		this._score = value;
		this.newEvent(Kloggr.Events.ScoreChanged, value);

		// Allow objects to change state
		if (!this.gameobjects) {
			return;
		}

		for (var i = 0; i < this.gameobjects.length; i++) {
			if (this.gameobjects[i].updateState) {
				this.gameobjects[i].updateState(value);
			}
		}

		switch (value) {
		case 10:
			this.gameobjects.push(new Lazer());
			break;
		}
	}
});

