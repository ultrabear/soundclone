// src/services/AudioService.ts

type AudioCallback = (time: number) => void;
type DurationCallback = (duration: number) => void;
type VolumeCallback = (volume: number) => void;

class AudioService {
	private static instance: AudioService;
	private volumeCallbacks: Set<VolumeCallback>;
	private audio: HTMLAudioElement;
	private timeUpdateCallbacks: Set<AudioCallback>;
	private durationCallbacks: Set<DurationCallback>;

	private constructor() {
		this.audio = new Audio();
		this.timeUpdateCallbacks = new Set();
		this.durationCallbacks = new Set();
		this.volumeCallbacks = new Set();
		this.audio.volume = 1;
		this.audio.addEventListener("timeupdate", () => {
			this.timeUpdateCallbacks.forEach((cb) => cb(this.audio.currentTime));
		});

		this.audio.addEventListener("loadedmetadata", () => {
			this.durationCallbacks.forEach((cb) => cb(this.audio.duration));
		});
	}

	static getInstance(): AudioService {
		if (!AudioService.instance) {
			AudioService.instance = new AudioService();
		}
		return AudioService.instance;
	}

	play() {
		return this.audio.play();
	}

	pause() {
		this.audio.pause();
	}

	setSource(url: string) {
		if (this.audio.src !== url) {
			this.audio.src = url;
			this.audio.load();
			return new Promise((resolve) => {
				this.audio.addEventListener(
					"canplay",
					() => {
						resolve(true);
					},
					{ once: true },
				);
			});
		}
		return Promise.resolve(true);
	}

	setCurrentTime(time: number) {
		this.audio.currentTime = time;
	}

	getCurrentTime(): number {
		return this.audio.currentTime;
	}

	getDuration(): number {
		return this.audio.duration;
	}

	onTimeUpdate(callback: AudioCallback) {
		this.timeUpdateCallbacks.add(callback);
		return () => this.timeUpdateCallbacks.delete(callback);
	}

	onDurationChange(callback: DurationCallback) {
		this.durationCallbacks.add(callback);
		return () => this.durationCallbacks.delete(callback);
	}
	getVolume(): number {
		return this.audio.volume;
	}

	setVolume(volume: number) {
		const normalizedVolume = Math.max(0, Math.min(1, volume));
		this.audio.volume = normalizedVolume;
		this.volumeCallbacks.forEach((cb) => cb(normalizedVolume));
	}

	onVolumeChange(callback: VolumeCallback) {
		this.volumeCallbacks.add(callback);
		return () => this.volumeCallbacks.delete(callback);
	}
}

export default AudioService.getInstance();
