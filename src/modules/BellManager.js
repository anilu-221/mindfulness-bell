class bellManager {
	constructor() {
		// Initialize properties.
		this.bellTimeouts        = [];
		this.currentBell         = new Audio('src/audio/bell-01.wav');

		// Control elements.
		this.bellSwitch          = document.getElementById( 'bellSwitch' );

		this.soundRadios         = document.querySelectorAll('input[name="bell-sound"]');
		this.nextBellDisplay     = document.getElementById('next-bell');

		this.bellInterval	     = document.getElementById('bell-interval');
		this.bellNumber          = document.getElementById('bell-number');
		
		this.bellStart           = document.getElementById('bell-start');
		this.bellEnd             = document.getElementById('bell-end');

		this.bellVolume          = document.getElementById('bell-volume');
		this.volDisplay          = document.getElementById('bell-volume-display');

		this.bellBtn             = document.getElementById('invite-bell-btn');
		
		// Events.
		this.events();
	}

	events() {
		document.addEventListener('DOMContentLoaded', () => {
			// Select bell sound.
			this.soundRadios.forEach( radio => {
				radio.addEventListener( 'change', () => {
					this.updateSelectedBell();
					this.playBell();
				} );
			} );
			this.bellSwitch.addEventListener('change', () => {
				this.updateSelectedBell();
			});

			// Volume control.
			this.bellVolume.addEventListener('input', this.updateVolume.bind(this));

			// Invite bell.
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
		this.resetBell();
		this.updateVolume();

		const times = parseInt( this.bellNumber.value, 10 ) || 1;

		for ( let i = 0; i < times; i++ ) {
			const timeoutId = setTimeout(() => {
				const bell = new Audio(this.currentBell.src);
				bell.volume = this.currentBell.volume;
				bell.play();
			}, i * 8000);
			this.bellTimeouts.push( timeoutId );
		}
	}

	resetBell() {
		this.bellTimeouts.forEach( timeoutId => clearTimeout( timeoutId ) );
		this.bellTimeouts = [];
	}

	updateVolume() {
		this.volDisplay.textContent = this.bellVolume.value;
		this.currentBell.volume = this.bellVolume.value / 100;
	}


}

export default bellManager;
