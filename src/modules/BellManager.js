class bellManager {
	constructor() {
		// Initialize properties.
		this.bellIntervalTimeouts = [];
		this.bellRepeatedTimeouts = [];
		this.currentBell          = new Audio('src/audio/bell-01.wav');

		// Control elements.
		this.bellSwitch           = document.getElementById( 'bellSwitch' );

		this.soundRadios          = document.querySelectorAll('input[name="bell-sound"]');
		this.nextBellDisplay      = document.getElementById('next-bell');

		this.bellInterval	      = document.getElementById('bell-interval');
		this.bellNumber           = document.getElementById('bell-number');
		
		this.bellStart            = document.getElementById('bell-start');
		this.bellEnd              = document.getElementById('bell-end');

		this.bellVolume           = document.getElementById('bell-volume');
		this.volDisplay           = document.getElementById('bell-volume-display');

		this.bellBtn              = document.getElementById('invite-bell-btn');
		
		// Events.
		this.events();
	}

	events() {
		document.addEventListener('DOMContentLoaded', () => {
			// Load user settings from chrome storage.
			chrome.storage.local.get(['selectedBellId', 'bellInterval', 'bellNumber', 'bellStart', 'bellEnd', 'bellVolume'], (data) => {
				// Bell radio.
				if (data.selectedBellId) {
					this.soundRadios.forEach( radio => {
						if (radio.id === data.selectedBellId) {
							radio.checked = true;
						} else {
							radio.checked = false;
						}
					});
				}

				// Bell interval.
				this.bellInterval.value = data.bellInterval || 15;

				// Bell number.
				this.bellNumber.value = data.bellNumber || 1;

				// Bell start time.
				this.bellStart.value = data.bellStart || '07:00';

				// Bell end time.
				this.bellEnd.value = data.bellEnd || '22:00';

				// Bell volume.
				this.bellVolume.value = data.bellVolume || 50;
				this.volDisplay.textContent = this.bellVolume.value;

			});
			// Initialize bell sound.
			this.setBellIntervals();

			// Select bell sound.
			this.soundRadios.forEach( radio => {
				radio.addEventListener( 'change', () => {
					this.updateSelectedBell();
					this.playBellOnce();
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

			/**
			 * Save user settings on chrome storage.
			 */

			// Bell Radio.
			this.soundRadios.forEach( radio => {
				radio.addEventListener('change', () => {
					let radioChecked = '';
					this.soundRadios.forEach( r => {
						if ( r.checked ) {
							radioChecked = r.id;
						}
					});
					chrome.storage.local.set({ selectedBellId: radioChecked });
				});
			});

			// Bell interval.
			this.bellInterval.addEventListener('change', (e) => {
				chrome.storage.local.set({ bellInterval: parseInt(this.bellInterval.value) });
			});

			// Bell number.
			this.bellNumber.addEventListener('change', (e) => {
				chrome.storage.local.set({ bellNumber: parseInt(this.bellNumber.value) });
			});

			// Bell Start.
			this.bellStart.addEventListener('change', (e) => {
				chrome.storage.local.set({ bellStart: this.bellStart.value });
			});

			// Bell End.
			this.bellEnd.addEventListener('change', (e) => {
				chrome.storage.local.set({ bellEnd: this.bellEnd.value });
			});

			//Volume.
			this.bellVolume.addEventListener('change', (e) => {
				chrome.storage.local.set({ bellVolume: parseInt(this.bellVolume.value) });
			});
		});
	}

	setBellIntervals() {
		this.updateSelectedBell();

		// Interval
		this.bellIntervalMinutes      = this.bellInterval.value;
		this.bellIntervalMilliseconds = parseInt( this.bellIntervalMinutes  , 10 ) * 60 * 1000 ;

		// Set Dates.
		this.now     = new Date();
		[ this.startHour, this.startMinutes ] = this.bellStart.value.split( ':' ).map( Number );
		[ this.endHour, this.endMinutes ] = this.bellEnd.value.split( ':' ).map( Number );
		this.startDate = new Date( this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.startHour, this.startMinutes );
		this.endDate   = new Date( this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), this.endHour, this.endMinutes );
		// If the end time is before the start time, assume it is the next day.
		if ( this.endDate < this.startDate ) {
			this.endDate.setDate( this.endDate.getDate() + 1 );
		}

		// Check if the current time is within the start and end time.
		if ( this.now > this.startDate && this.now < this.endDate ) {
			this.msSinceStart = this.now - this.startDate;
			this.timeUntilNextInterval = this.bellIntervalMilliseconds - ( this.msSinceStart % this.bellIntervalMilliseconds );
			this.nextBellTime = new Date( this.now.getTime() + this.timeUntilNextInterval );
			
			while ( this.nextBellTime <= this.endDate ) {
				this.delay = this.nextBellTime.getTime() - this.now.getTime();

				const timeoutId = setTimeout( () => this.playBell(), this.delay );
				const scheduledTime = Date.now() + this.delay;
				this.bellIntervalTimeouts.push({ timeoutId, scheduledTime });

				this.nextBellTime = new Date(this.nextBellTime.getTime() + this.bellIntervalMilliseconds);
				
			}
		}  else if ( this.now <= this.startDate ) {
			this.nextBellTime = new Date( this.startDate );

			while ( this.nextBellTime <= this.endDate ) {
				this.delay = this.nextBellTime.getTime() - this.now.getTime();

				const timeoutId = setTimeout( () => this.playBell(), this.delay );
				const scheduledTime = Date.now() + this.delay;
				this.bellIntervalTimeouts.push({ timeoutId, scheduledTime });

				this.nextBellTime = new Date(this.nextBellTime.getTime() + this.bellIntervalMilliseconds);
			}
		}

		this.startCountdownDisplay();
	}

	startCountdownDisplay() {
		if ( this.countdownIntervalId ) {
			clearInterval( this.countdownIntervalId );
		}

		this.countdownIntervalId = setInterval(() => {
			if (!this.bellIntervalTimeouts.length) {
				this.nextBellDisplay.innerHTML = '<span class="text-muted text-small small">No bells scheduled</span>';
				clearInterval(this.countdownIntervalId);
				return;
			}

			const { scheduledTime } = this.bellIntervalTimeouts[0]; // Next bell
			const remaining = Math.max(0, scheduledTime - Date.now());

			const mins = Math.floor(remaining / 60000);
			const secs = Math.floor((remaining % 60000) / 1000);
			this.nextBellDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

			if (remaining <= 0) {
				this.nextBellDisplay.textContent = '00:00';
				clearInterval(this.countdownIntervalId);
				this.countdownIntervalId = null;

				// Remove expired bell
				this.bellIntervalTimeouts.shift();

				// If more bells are scheduled, start countdown to the next one
				if (this.bellIntervalTimeouts.length > 0) {
					this.startCountdownDisplay();
				}
				return;
			}
		}, 1000);

		
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
		this.resetRepeatedTimeout();
		this.updateVolume();

		const times = parseInt( this.bellNumber.value, 10 ) || 1;

		for ( let i = 0; i < times; i++ ) {
			const delay = i * 8000
			const timeoutId = setTimeout(() => {
				const bell = new Audio(this.currentBell.src);
				bell.volume = this.currentBell.volume;
				bell.play();
			}, delay);

			const scheduledTime = Date.now() + this.delay;
			this.bellRepeatedTimeouts.push( timeoutId );
		}
	}

	playBellOnce() {
		this.updateVolume();
		const bell = new Audio(this.currentBell.src);
		bell.volume = this.currentBell.volume;
		bell.play();
	}

	resetRepeatedTimeout() {
		this.bellRepeatedTimeouts.forEach( timeoutId => clearTimeout(timeoutId));
		this.bellRepeatedTimeouts = [];
	}

	updateVolume() {
		this.volDisplay.textContent = this.bellVolume.value;
		this.currentBell.volume = this.bellVolume.value / 100;
	}
}

export default bellManager;
