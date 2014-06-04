/*	Square base class.
 *	Used by Enemy, Player and Target
 */
function Square(width, height) {
	this.width = width;
	this.height = height;
	this.x = 0;
	this.y = 0;
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

/*	Enemy class.
 *	Drawn using color-filled reactangles
 */
function Enemy(width, height) {
	Square.call(this);

	this.width = width;
	this.height = height;

	this.color = '#FF0000';
}

Enemy.prototype = Object.create(Square.prototype);

Enemy.prototype.draw = function(context) {
	context.fillStyle = this.color;
	context.fillRect(this.x, this.y, this.width, this.height);
}

/*	Player class.
 *	Drawn using a texture, can move, etc...
 */
function Player(width, height, texture_name, max_speed, slowing_speed) {
	Square.call(this);

	this.width = width;
	this.height = height;

	this.speed_x = 0;
	this.speed_y = 0;
	this.max_speed = (typeof max_speed === undefined ?
						0 : max_speed);
	this.slowing_speed = (typeof slowing_speed === undefined ?
						0 : slowing_speed);

	this.texture = new Image();
	this.texture.src = texture_name;
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

Player.prototype.draw = function(context) {
	context.drawImage(this.texture, this.x, this.y);
}

/*	Target class. inherits Player.
 *	Able to move, decelerate, change of behavior...
 */
function Target(width, height, texture_name, max_speed, slowing_speed) {
	Player.call(this, width, height, texture_name, max_speed, slowing_speed);

	this.State = {
		Fix: "Fix",
		Bouncing: "Bouncing",
		Moving: "Moving"
	}

	this.state = this.State.Fix;
	this.accumulator = 0;
}

Target.prototype = Object.create(Player.prototype);

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