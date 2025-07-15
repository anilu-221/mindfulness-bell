class bellManager{
	constructor() {
		this.currentBell = new Audio('src/audio/bell-01.wav');
		this.bellBtn = document.getElementById('invite-bell-btn');
		this.events();
	}

	events() {
		document.addEventListener('DOMContentLoaded', () => {
			this.bellBtn.addEventListener('click', this.playBell.bind(this) );
		});
	}

	playBell() {
		this.currentBell.volume = 0.5;
		this.currentBell.play();
	}

}

export default bellManager;