function KloggrInterface() {
	this.state = Kloggr.State.MainMenu;
	this.toggle = {};
	
	this.toggle[Kloggr.State.MainMenu] = this.toggleMainMenu;
	this.toggle[Kloggr.State.Playing] = this.togglePlaying;
	this.toggle[Kloggr.State.Paused] = this.togglePaused;
	this.toggle[Kloggr.State.Dead] = this.toggleDead;
}

KloggrInterface.prototype.toggleMainMenu = function() {
	if (this.state == Kloggr.State.MainMenu) {
		quitAnimation('#menuContainer');
	}
	else {
		enterAnimation('#menuContainer');

		// Make sure we hide the pause button/dead menu
		document.getElementsByClassName("pause")[0].style.display = "none";
		document.getElementsByClassName("lose")[0].style.display = "none";
	}
};

KloggrInterface.prototype.togglePlaying = function(other) {
	if (this.state == Kloggr.State.Playing) {
		if (other == Kloggr.State.MainMenu) {
			quitAnimation('#gameContainer');
		}
	}
	else {
		enterAnimation('#gameContainer');

		// Show pause button
		document.getElementsByClassName("pause")[0].style.display = "initial";
	}
};

KloggrInterface.prototype.togglePaused = function() {
	if (this.state == Kloggr.State.Paused) {
		quitAnimation('.play');
		return Kloggr.State.Playing;
	}
	else {
		enterAnimation('.pause');
	}
};

KloggrInterface.prototype.toggleDead = function() {
	if (this.state == Kloggr.State.Dead) {
		quitAnimation('.lose');
		return Kloggr.State.Playing;
	}
	else {
		enterAnimation('.lose');
		setTimeout(scoreAnimation, 250);
	}
};

KloggrInterface.prototype.changeState = function(new_state) {
	if (new_state == this.state) {
		return this.toggle[this.state].call(this, this.state);
	}

	if (this.toggle[this.state]) {
		this.toggle[this.state].call(this, new_state);
	}

	if (this.toggle[new_state]) {
		this.toggle[new_state].call(this, this.state);
	}

	this.state = new_state;
};

KloggrInterface.prototype.setScore = function(score) {
	document.getElementById("score").innerHTML = score;
};

KloggrInterface.prototype.setTimer = function(time) {
	document.getElementById("timer").innerHTML = time;
}

