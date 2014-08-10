function KloggrInterface() {
	this.state = Kloggr.State.MainMenu;
	this.toggle = {};
	
	this.toggle[Kloggr.State.MainMenu] = Kloggr.prototype.toggleMainMenu;
	this.toggle[Kloggr.State.Playing] = Kloggr.prototype.togglePlaying;
	// Add the rest here
}

KloggrInterface.prototype.toggleMainMenu = function() {
	if (this.state == kloggr.State.MainMenu) {
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

// Other toggle functions

KloggrInterface.prototype.changeState = function(new_state) {
	if (this.toggle[this.state]) {
		this.toggle[this.state]();
	}

	if (this.toggle[new_state]) {
		this.toggle[new_state]();
	}

	this.state = new_state;
};
