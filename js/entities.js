"use strict";

/*	Square base class.
 *	Used by BasicEnemy, Player and Target
 */
function Square(width, height, texture) {
	this.width = width;
	this.height = height;
	this.x = 0;
	this.y = 0;
	this.collidable = true;

	// If it's a color then use canvas.fillRect()
	var pattern = /#[0-9A-Z]{6}/i;

	if (pattern.test(texture)) {
		this.draw = Square.prototype.drawColor;
		this.texture = texture;
	}
	else {
		this.draw = Square.prototype.drawImage;
		this.texture = new Image();
		this.texture.src = texture;
	}
}

Square.prototype.collideBox = function(box_x, box_y, box_w, box_h) {
	if (this.x < box_x) {
		this.x = box_x;
		this.speed_x = 0;
	}
	if (this.x+this.width > box_x+box_w) {
		this.x = (box_x+box_w)-this.width;
		this.speed_x = 0;
	}
	if (this.y < box_y) {
		this.y = box_y;
		this.speed_y = 0;
	}
	if (this.y+this.height > box_y+box_h) {
		this.y = (box_y+box_h)-this.height;
		this.speed_y = 0;
	}
};

Square.prototype.respawn = function(gameobjects, max_x, max_y) {
	this.x = Math.random()*(max_x-this.width);
	this.y = Math.random()*(max_y-this.height);
};

Square.prototype.drawColor = function(context) {
	context.fillStyle = this.texture;
	context.fillRect(this.x, this.y, this.width, this.height);
};

Square.prototype.drawImage = function(context) {
	context.drawImage(this.texture, this.x, this.y, this.width, this.height);
};

// "Static" looking method
Square.intersect = function(a, b, silent) {
	if (b.x >= a.x+a.width ||
		b.x+b.width <= a.x ||
		b.y >= a.y+a.height ||
		b.y+b.height <= a.y) {
		return false;
	}

	if (!silent) {
		if (a.onCollide) {
			a.onCollide(b);
		}

		if (b.onCollide) {
			b.onCollide(a);
		}
	}

	return true;
}

/*  Enemy abstract class. Used by everything that causes damage
 *  to the player.
 */
function Enemy() {
	
}

Enemy.prototype = Object.create(Square.prototype);

/*	BasicEnemy class.
 *	Drawn using color-filled rectangles
 */
function BasicEnemy() {
	Square.call(this, 15, 15, '#27AE60');
	this.to_update = false;
}

BasicEnemy.prototype = Object.create(Enemy.prototype);

BasicEnemy.prototype.respawn = function(gameobjects, max_x, max_y) {
	var location_found = false;

	while (!location_found) {
		Square.prototype.respawn.
			call(this, gameobjects, max_x, max_y);
		var good_location = true;

		var len = gameobjects.length;
		for (var i = 0; i < len; i++) {
			if (gameobjects[i] instanceof Player ||
				gameobjects[i] instanceof Target) {
				if (Square.intersect(gameobjects[i], this, true)) {
					good_location = false;
				}
			}
		}

		if (good_location) {
			location_found = true;
		}
	}
};

BasicEnemy.prototype.update = function(delta_t) {
	
};

/*	Player class.
 *	Drawn using a texture, can move, etc...
 */
function Player() {
	Square.call(this, 40, 40, 'assets/player.svg');

	this.speed_x = 0;
	this.speed_y = 0;
	this.max_speed = 300;
	this.slowing_speed = 0.7;
	this.accel = 7;
	this.dead = false;
}

Player.prototype = Object.create(Square.prototype);

Player.prototype.respawn = function(gameobjects, max_x, max_y) {
	Square.prototype.respawn.
		call(this, gameobjects, max_x, max_y);
	this.speed_x = 0;
	this.speed_y = 0;
}

Player.prototype.update = function(delta_t) {
	var len = Math.sqrt((this.speed_x*this.speed_x)
						+ (this.speed_y*this.speed_y));

	if (Math.round(len) == 0) {
		this.speed_x = 0;
		this.speed_y = 0;
		return;
	}

	this.speed_x = (this.speed_x / len)*(len-this.slowing_speed);
	this.speed_y = (this.speed_y / len)*(len-this.slowing_speed);

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
};

Player.prototype.onCollide = function(gameobject) {
	if (gameobject instanceof Enemy) {
		this.dead = true;
		this.texture.src = 'assets/deadPlayer.svg';
	}
}

/*	Target class. inherits Square.
 *	Able to move, decelerate, change of behavior...
 */
function Target() {
	Square.call(this, 40, 40, 'assets/target.svg');

	this.State = {
		Fix:"Fix",
		Bouncing:"Bouncing",
		Moving:"Moving"
	};

	this.speed_x = 0;
	this.speed_y = 0;
	this.max_speed = 200;
	this.slowing_speed = 0.7;

	this.state = this.State.Fix;
	this.accumulator = 0;
}

Target.prototype = Object.create(Square.prototype);

Target.prototype.respawn = function(gameobjects, max_x, max_y) {
	var location_found = false;

	while (!location_found) {
		Square.prototype.respawn.call(this, gameobjects, max_x, max_y);
		var good_location = true;

		var len = gameobjects.length;
		for (var i = 0; i < len; i++) {
			if (gameobjects[i] instanceof BasicEnemy) {
				if (Square.intersect(gameobjects[i], this, true)) {
					good_location = false;
				}
			}

			if (gameobjects[i] instanceof Player) {
				var half = ((max_x+max_y)/2)/2;

				if (this.distanceTo(gameobjects[i]) < half) {
					good_location = false;
				}
			}

			if (good_location) {
				location_found = true;
				break;
			}
		}
	}
};

Target.prototype.update = function(delta_t) {
	var len = 0;

	this.accumulator += delta_t;
	if (this.accumulator > 2 && this.state == this.State.Bouncing) {
		this.accumulator = 0;

		this.speed_x = ((Math.random()*this.max_speed*2)-this.max_speed);
		this.speed_y = ((Math.random()*this.max_speed*2)-this.max_speed);
		len = Math.sqrt((this.speed_x*this.speed_x)
						+ (this.speed_y*this.speed_y));
		this.speed_x = (this.speed_x/len)*this.max_speed;
		this.speed_y = (this.speed_y/len)*this.max_speed;
	}

	if (len == 0) { // Don't recalculate twice
		len = Math.sqrt((this.speed_x*this.speed_x)
						+ (this.speed_y*this.speed_y));
	}

	if (Math.round(len) == 0) {
		this.speed_x = 0;
		this.speed_y = 0;
		return; // No movement needed
	}

	this.speed_x = (this.speed_x / len)*(len-this.slowing_speed);
	this.speed_y = (this.speed_y / len)*(len-this.slowing_speed);

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
};

Target.prototype.distanceTo = function(b) {
	return Math.sqrt((this.x-b.x)*(this.x-b.x) + (this.y-b.y)*(this.y-b.y));
};

Target.prototype.updateState = function(score) {
	switch (score) {
	case 5:
		this.state = this.State.Bouncing;
		break;
	}
}

/* The Lazer class is an Enemy, but it initializes from a Square.
 * Its behavior is controlled through the State enumeration.
 */
function Lazer() {
	Square.call(this, 15, 120, "assets/lazer.png");

	this.State = {
		Inactive:"Inactive",
		On:"On",
		Off:"Off"
	};

	this.accumulator = 0;
	this.state = this.State.On;
}

Lazer.prototype = Object.create(Enemy.prototype);

// The lazer spawns between the payer and the target
Lazer.prototype.respawn = function(gameobjects, max_x, max_y) {
	var player;
	var target;
	var len = gameobjects.length;
	for (var i = 0; i < len; i++) {
		if (gameobjects[i] instanceof Player) {
			player = gameobjects[i];
		}
		else if (gameobjects[i] instanceof Target) {
			target = gameobjects[i];
		}
	}

	if (!player || !target) {
		console.log("Lazer was spawned before player or target. FIX");
		Square.prototype.respawn.call(this, gameobjects, max_x, max_y);
		return;
	}

	if (Math.abs(player.x-target.y) < this.texture.width) {
		Square.prototype.respawn.call(this, gameobjects, max_x, max_y);
		return;
	}

	this.height = max_y;
	this.x = Math.abs(player.x+target.y-this.texture.width)/2;
	this.y = 0;
};

Lazer.prototype.update = function(delta_t) {
	if (this.state == this.State.Inactive) {
		return;
	}

	this.accumulator += delta_t;
	if (this.accumulator > 2.0) {
		this.accumulator = 0;
		if (this.state == this.State.On) {
			this.state = this.State.Off;
			this.draw = function(context) {};
			this.collidable = false;
		}
		else {
			this.state = this.State.On;
			this.draw = Square.prototype.drawImage;
			this.collidable = true;
		}
	}
};

Lazer.prototype.updateState = function(score) {
	switch (score) {
	case 10:
		this.state = this.State.On;
		break;
	}
}

