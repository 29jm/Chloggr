"use strict";

var mainloop = function() {
	console.log("Kloggr start");

	function handleEvents(event) {
		switch (event.name) {
		case kloggr.Events.StateChanged:
			setState(event.value);
			break;
		case kloggr.Events.NewHighscore:
			break;
		case kloggr.Events.ScoreChanged:
			break;
		case kloggr.Events.TargetReached:
			kloggr.restart();
			break;
		}
	}

	function setState(state) {
		console.log("Switching between states "+kloggr.state
				+" and "+state);

		// UI elements might decide to change the game state
		var new_state = kloggr_interface.changeState(state);
		if (new_state) {
			// Possible infinite recursion
			setState(new_state);
			return kloggr.state;
		}

		kloggr.state = state;

		return kloggr.state;
	}

	window.addEventListener('keydown', function(event) {
		kloggr.setKeyState(event.keyCode, true);
	});

	window.addEventListener('keyup', function(event) {
		kloggr.setKeyState(event.keyCode, false);
	})

	var canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	if (!canvas.getContext('2d')) {
		alert("Could not obtain rendering context");
	}
	var ctx = canvas.getContext('2d');

	var kloggr = new Kloggr(canvas.width, canvas.height);
	var kloggr_interface = new KloggrInterface();
	var last = Date.now();
	var now = last;

	setInterval(function() {
		now = Date.now();
		var delta_t = (now - last) / 1000;
		last = now;

		var events = kloggr.getEvents();
		for (var i = 0; i < events.length; i++) {
			handleEvents(events[i]);
		}

		// Clear canvas
		canvas.width = canvas.width;

		if (kloggr.state == Kloggr.State.Playing) {
			kloggr.handleKeys();
			kloggr.update(delta_t)
			kloggr.collisionDetection();
		}

		kloggr.draw(ctx);
	}, 2);

	// Expose some symbols needed by other parts
	window.kloggr = kloggr; // TODO mainloop.kloggr
	window.kloggr_interface = kloggr_interface;
	window.setState = setState;
}();
