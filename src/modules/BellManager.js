class bellManager {
	constructor() {
		this.bellTimeouts       = [];
		this.bellStartTimeoutId = null;
		this.bellSwitch         = document.getElementById( 'bellSwitch' );
		this.bellStart          = document.getElementById('bell-start');
		this.bellBtn            = document.getElementById('invite-bell-btn');
		this.bellVolume         = document.getElementById('bell-volume');
		this.volDisplay         = document.getElementById('bell-volume-display');
		this.bellNumber         = document.getElementById('bell-number');
		this.soundRadios        = document.querySelectorAll('input[name="bell-sound"]');
		this.bellInterval	    = document.getElementById('bell-interval');
		this.bellLoopIntervalId = null;
		this.currentBell        = new Audio('src/audio/bell-01.wav');
		this.events();
	}

	events() {
		document.addEventListener('DOMContentLoaded', () => {
			// Invite bell.
			this.bellBtn.addEventListener('click', () => {
				this.updateSelectedBell();
				this.playBell();
			});
			// Volume control.
			this.bellVolume.addEventListener('input', this.updateVolume.bind(this));
			// Select bell sound.
			this.soundRadios.forEach( radio => {
				radio.addEventListener( 'change', () => {
					this.updateSelectedBell();
					this.playBell();
				} );
			} );
			// Time interval bell.
			if (this.bellSwitch.checked) {
				this.startFixedIntervalBells();
			}
			this.bellSwitch.addEventListener('change', () => {
				this.updateSelectedBell();
				if ( this.bellSwitch.checked ) {
					this.startFixedIntervalBells();
				} else {
					this.stopRepeatingBells();
				}
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
		this.updateVolume(); // Set volume before playing

		const times = parseInt( this.bellNumber.value, 10 ) || 1;

		for ( let i = 0; i < times; i++ ) {
			const timeoutId = setTimeout(() => {
				const bell = new Audio(this.currentBell.src);
				bell.volume = this.currentBell.volume;
				bell.play();
			}, i * 8000);

			this.bellTimeouts.push(timeoutId);
		}
	}

	resetBell() {
		// Clear all scheduled timeouts
		this.bellTimeouts.forEach( timeoutId => clearTimeout( timeoutId ) );
		this.bellTimeouts = [];
	}

	updateVolume() {
		this.volDisplay.textContent = this.bellVolume.value;
		this.currentBell.volume = this.bellVolume.value / 100;
	}

	startFixedIntervalBells() {
		this.stopRepeatingBells(); // Clear any previous loop
		const minutes = parseInt(this.bellInterval.value, 10) || 15;
		const intervalMs = minutes * 60 * 1000;

		// First bell immediately
		this.playBell();

		// Then repeat every X minutes
		this.bellLoopIntervalId = setInterval(() => {
			this.playBell();
		}, intervalMs);
	}

	stopRepeatingBells() {
		if (this.bellLoopIntervalId) {
			clearInterval(this.bellLoopIntervalId);
			this.bellLoopIntervalId = null;
		}
		this.resetBell(); // Optional: also cancel any scheduled `setTimeout`s
	}
	
}

export default bellManager;
