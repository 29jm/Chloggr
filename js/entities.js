/*	Square base class.
 *	Used by Enemy, Player and Target
 */
function Square(width, height, texture) {
	this.width = width;
	this.height = height;
	this.x = 0;
	this.y = 0;

	var pattern = /#[0-8A-Z]{6}/i; // If it's a color then use canvas.fillRect()

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

Square.prototype.intersects = function(other) {
	if (other.x >= this.x+this.width ||
		other.x+other.width <= this.x ||
		other.y >= this.y+this.height ||
		other.y+other.height <= this.y) {
		return false;
	}

	return true;
};

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
}

Square.prototype.toRandomLocation = function(max_x, max_y) {
	this.x = Math.random()*max_x;
	this.y = Math.random()*max_y;
}

Square.prototype.drawColor = function(context) {
	context.fillStyle = this.texture;
	context.fillRect(this.x, this.y, this.width, this.height);
}

Square.prototype.drawImage = function(context) {
	context.drawImage(this.texture, this.x, this.y, this.width, this.height);
}

/*	Enemy class.
 *	Drawn using color-filled reactangles
 */
function Enemy() {
	Square.call(this, 15, 15, '#27AE60');
}

Enemy.prototype = Object.create(Square.prototype);

/*	Player class.
 *	Drawn using a texture, can move, etc...
 */
function Player() {
	Square.call(this, 40, 40, 'assets/player.svg');

	this.speed_x = 0;
	this.speed_y = 0;
	this.max_speed = 300;
	this.slowing_speed = 0.7;

	this.dead = false;
}

Player.prototype = Object.create(Square.prototype);

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
}

/*	Target class. inherits Square.
 *	Able to move, decelerate, change of behavior...
 */
function Target() {
	Square.call(this, 40, 40, 'assets/target.svg');

	this.State = {
		Fix: "Fix",
		Bouncing: "Bouncing",
		Moving: "Moving"
	}

	this.speed_x = 0;
	this.speed_y = 0;
	this.max_speed = 200;
	this.slowing_speed = 0.7;

	this.state = this.State.Fix;
	this.accumulator = 0;
}

Target.prototype = Object.create(Square.prototype);

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
}

/* The Lazer class is an Enemy, but it initialize from a Square.
 * Its behavior is controlled through the State enumeration.
 */
function Lazer() {
	Square.call(this, 15, 120, "assets/lazer.png");

	this.State = {
		Inactive: "Inactive",
		On: "On",
		Off: "Off"
	}

	this.accumulator = 0;
	this.state = this.State.Inactive;
	this.draw = function(context) {}
}

Lazer.prototype = Object.create(Player.prototype);

Lazer.prototype.toRandomLocation = function(max_x, max_y) {
	this.x = Math.random()*max_x;
	this.y = 0;
}

Lazer.prototype.update = function(delta_t) {
	if (this.state == this.State.Inactive) {
		return;
	}

	this.accumulator += delta_t;
	if (this.accumulator > 2.5 && this.state != this.State.Inactive) {
		this.accumulator = 0;
		if (this.state == this.State.On) {
			this.state = this.State.Off;
			this.draw = function(context) {}
		}
		else {
			this.state = this.State.On;
			this.draw = Square.prototype.drawImage; // TODO: add (bool)to_draw
		}
	}
}

