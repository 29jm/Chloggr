function KloggrInterface() {
	this.state = Kloggr.State.MainMenu;
	this.toggle = {};
	
	this.toggle[Kloggr.State.MainMenu] = this.toggleMainMenu;
	this.toggle[Kloggr.State.Playing] = this.togglePlaying;
	this.toggle[Kloggr.State.Paused] = this.togglePaused;
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

KloggrInterface.prototype.togglePlaying = function(other) {
	if (this.state == Kloggr.State.Playing) {
		if (other == Kloggr.State.MainMenu) {
			document.getElementById("gameContainer").style.display = "none";
		}
	}
	else {
		document.getElementById("gameContainer").style.display = "initial";
	}
}

KloggrInterface.prototype.togglePaused = function() {
	if (this.state == Kloggr.State.Paused) {
		document.getElementById("menuPause").style.display = "none";
		return Kloggr.State.Playing;
	}
	else {
		document.getElementById("menuPause").style.display = "initial";
	}
}

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
