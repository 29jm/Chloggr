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

	// Touchscreen stuff...
}