"use strict";

var mainloop = function() {
	console.log("Kloggr start");

	function handleEvents(event) {
		switch (event.name) {
		case kloggr.Events.StateChanged:
			// Menu.changeTo(event.value);
			break;
		case kloggr.Events.NewHighscore:
			// Cookies.set('highScore', event.value);
			break;
		case kloggr.Events.ScoreChanged:
			// kloggrInterface.setScore(event.value);
			break;
		case kloggr.Events.TargetReached:
			kloggr.restart();
			break;
		}
	}

	function toggleHome() {
		kloggr.state = kloggr.State.Playing;
		document.getElementById("gameContainer").style.display = "initial";
		document.getElementById("menuContainer").style.display = "none";
	}

	window.addEventListener('keydown', function(event) {
		kloggr.setKeyState(event.keyCode, true);
	});

	window.addEventListener('keyup', function(event) {
		kloggr.setKeyState(event.keyCode, false);
	})

	var canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - 50;
	if (!canvas.getContext('2d')) {
		alert("Could not obtain rendering context");
	}
	var ctx = canvas.getContext('2d');

	var kloggr = new Kloggr(canvas.width, canvas.height);
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

		if (kloggr.state == kloggr.State.Playing) {	
			// Clear canvas
			canvas.width = canvas.width;

			kloggr.handleKeys();
			kloggr.update(delta_t)
			kloggr.collisionDetection();
		}

		kloggr.draw(ctx);

		// ???
		// Profit !
	}, 2);

	return {
		toggleHome:toggleHome
	}
}();
