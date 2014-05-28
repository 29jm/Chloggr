document.addEventListener('keydown', function(event) {
	keys[event.keyCode] = true;
});

document.addEventListener('keyup', function(event) {
	delete keys[event.keyCode];
});

function handleInput() {
	var temp_x = playerCube.speed_x;
	var temp_y = playerCube.speed_y;

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

	if (playerCube.speed_x != temp_x ||
		playerCube.speed_y != temp_y) {
		has_moved = true;
	}

	// Touchscreen stuff...
}