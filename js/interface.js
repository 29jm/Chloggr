function KloggrInterface() {
	this.state = Kloggr.State.MainMenu;
	this.toggle = {};
	
	this.toggle[Kloggr.State.MainMenu] = KloggrInterface.prototype.toggleMainMenu;
	this.toggle[Kloggr.State.Playing] = KloggrInterface.prototype.togglePlaying;
	this.toggle[Kloggr.State.Paused] = KloggrInterface.prototype.togglePaused;
	// Add the rest here
};

KloggrInterface.prototype.toggleMainMenu = function() {
	if (this.state == Kloggr.State.MainMenu) {
		document.getElementById("menuContainer").style.display = "none";
	}
	else {
		document.getElementById("menuContainer").style.display = "initial";
	}
}

KloggrInterface.prototype.togglePlaying = function() {
	if (this.state == Kloggr.State.Playing) {
		document.getElementById("gameContainer").style.display = "none";
	}
	else {
		document.getElementById("gameContainer").style.display = "initial";
	}
}

KloggrInterface.prototype.togglePaused = function() {
	if (this.state == Kloggr.State.Paused) {
		document.getElementById("menuPause").style.display = "none";
	}
	else {
		document.getElementById("menuPause").style.display = "initial";
	}
}
// Other toggle functions

KloggrInterface.prototype.changeState = function(new_state) {
	if (this.toggle[this.state]) {
		this.toggle[this.state].call(this);
	}

	if (this.toggle[new_state]) {
		this.toggle[new_state].call(this);
	}

	this.state = new_state;
};
