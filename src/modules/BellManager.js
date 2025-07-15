export default class BellManager {
	constructor(audioBasePath = '../dist/audio/') {
		this.audioBasePath = audioBasePath;
		this.currentSound = 'bell-01.wav';
		this.volume = 0.5;
	}

	setSound(soundId) {
		const soundMap = {
			'bell-sound-1': 'bell-01.wav',
			'bell-sound-2': 'bell-02.wav',
			'bell-sound-3': 'bell-03.wav'
		};
		this.currentSound = soundMap[soundId] || 'bell-01.wav';
	}

	setVolume(volumePercent) {
		this.volume = Math.min(Math.max(volumePercent / 100, 0), 1);
	}

	play(times = 1) {
		for (let i = 0; i < times; i++) {
			setTimeout(() => {
				const audio = new Audio(`${this.audioBasePath}${this.currentSound}`);
				audio.volume = this.volume;
				audio.play();
			}, i * 1500);
		}
	}
}
