document.addEventListener('keydown', function(event) {
	keys[event.keyCode] = true;
});

document.addEventListener('keyup', function(event) {
	delete keys[event.keyCode];
});

var start_x = 0;
var start_y = 0;
var move_x = 0;
var move_y = 0;

canvas.addEventListener('touchstart', function(event) {
	var touchobj = event.changedTouches[0];
	move_x = 0;
	move_y = 0;
	start_x = touchobj.pageX;
	start_y = touchobj.pageY;
	event.preventDefault();
}, false);

canvas.addEventListener('touchmove', function(event) {
	var touchobj = event.changedTouches[0];
	move_x = touchobj.pageX*window.devicePixelRatio - start_x*window.devicePixelRatio;
	move_y = touchobj.pageY*window.devicePixelRatio - start_y*window.devicePixelRatio;
	player.speed_x += move_x;
	player.speed_y += move_y;
	start_x = touchobj.pageX;
	start_y = touchobj.pageY;
	event.preventDefault();
}, false);

function handleInput() {
	// Arrow keys
	if (37 in keys) {
		player.speed_x -= accel;
	}
	if (39 in keys) {
		player.speed_x += accel;
	}
	if (38 in keys) {
		player.speed_y -= accel;
	}
	if (40 in keys) {
		player.speed_y += accel;
	}
	// ZQSD - azerty ftw
	if (81 in keys) {
		player.speed_x -= accel;
	}
	if (68 in keys) {
		player.speed_x += accel;
	}
	if (90 in keys) {
		player.speed_y -= accel;
	}
	if (83 in keys) {
		player.speed_y += accel;
	}
}