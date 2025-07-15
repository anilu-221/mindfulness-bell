class bellManager {
	constructor() {
		this.bellBtn = document.getElementById('invite-bell-btn');
		this.bellVolume = document.getElementById('bell-volume');
		this.bellNumber = document.getElementById('bell-number');
		this.soundRadios = document.querySelectorAll('input[name="bell-sound"]');
		this.currentBell = new Audio('src/audio/bell-01.wav');
		this.events();
	}

	events() {
		document.addEventListener('DOMContentLoaded', () => {
			this.bellBtn.addEventListener('click', () => {
				this.updateSelectedBell();
				this.playBell();
			});
		});
	}

	updateSelectedBell() {
		let selectedId = 'bell-sound-1';
		this.soundRadios.forEach((radio) => {
			if (radio.checked) {
				selectedId = radio.id;
			}
		});

		const soundMap = {
			'bell-sound-1': 'src/audio/bell-01.wav',
			'bell-sound-2': 'src/audio/bell-02.wav',
			'bell-sound-3': 'src/audio/bell-03.wav'
		};

		this.currentBell = new Audio(soundMap[selectedId] || soundMap['bell-sound-1']);
	}

	playBell() {
		const volume = parseInt(this.bellVolume.value, 10) || 50;
		const times = parseInt(this.bellNumber.value, 10) || 1;

		this.currentBell.volume = Math.min(Math.max(volume / 100, 0), 1);

		for (let i = 0; i < times; i++) {
			setTimeout(() => {
				this.currentBell.currentTime = 0;
				this.currentBell.play();
			}, i * 1500);
		}
	}
}

export default bellManager;
