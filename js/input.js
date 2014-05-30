document.addEventListener('keydown', function(event) {
	keys[event.keyCode] = true;
});

document.addEventListener('keyup', function(event) {
	delete keys[event.keyCode];
});

var start_x = 0;
var start_y = 0;
var start_time = Date.now();
var move_x = 0;
var move_y = 0;

canvas.addEventListener('touchstart', function(event) {
	var touchobj = e.changedTouches[0];
	move_x = 0;
	move_y = 0;
	start_x = touchobj.pageX;
	start_y = touchobj.pageY;
	e.preventDefault();
});

canvas.addEventListener('touchmove', function(event) {
	event.preventDefault();
});

canvas.addEventListener('touchend', function(event) {
	var touchobj = e.changedTouches[0];
	move_x = touchobj.pageX - start_x;
	move_y = touchobj.pageY - start_Y;
	var len = Math.sqrt(move_x*move_x + move_y*move_y);
	// check that elapsed time is within specified, horizontal dist traveled >= threshold, and vertical dist traveled <= 100
	playerCube.speed_x += move_x;
	playerCube.speed_y += move_y;
	e.preventDefault();
});

function handleInput() {
	// Arrow keys
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
	// ZQSD - azerty ftw
	if (81 in keys) {
		playerCube.speed_x -= accel;
	}
	if (68 in keys) {
		playerCube.speed_x += accel;
	}
	if (90 in keys) {
		playerCube.speed_y -= accel;
	}
	if (83 in keys) {
		playerCube.speed_y += accel;
	}
}