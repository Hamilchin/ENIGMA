/**
 * SoundBox API to be used for this game.
 * The game muisc is created using musicEditor: https://xem.github.io/miniOrchestra/
 * And, all other sound-FX are generated from https://xem.github.io/MiniSoundEditor/ 
 */

// Game Music made using miniOrchestra.
// in miniOrchestra > load > paste the following:
//
// [{"octave":"100","duration":".1","decaystart":".005","decayduration":".2","interval":".18","volume":".03","wave":"sawtooth","data":[[0,14],[1,14],[2,11],[3,9],[4,14],[5,14],[6,11],[7,9],[8,14],[9,14],[10,11],[11,9],[12,9],[13,9],[14,14],[15,16],[16,6],[17,11],[18,11],[19,14],[20,14],[21,9],[22,14],[23,9],[24,16],[25,6],[26,14],[27,11],[28,9],[29,6],[30,16],[31,6],[32,6],[33,9],[34,14],[35,14],[36,9],[37,11],[38,11],[39,14]]}]

export const Sound = (() =>{
	let isMusicPlaying = false;
	const A = new AudioContext();
	const G = A.createGain();
	/**
	 * @type {AudioContext[]}
	 */
	const musicAudioContexts = [];
	const musicTimers = [];
	let focused = true;

	['focus', 'blur'].map(id => {
		window.addEventListener(id, () => {
			focused = id.includes('f');
			pauseMusic(!focused);
		});
	});

	function t(i,n) {
		return (n-i)/n;
	}

	/**
	 * @param {Function} soundFx
	 * @param {number} volume
	 */
	function _audio(soundFx, volume) {
		G.gain.value = volume || 1;
		G.connect(A.destination);
		const m = A.createBuffer(1,96e3,48e3);
		const b = m.getChannelData(0);
		for(var i = 96e3; i--;)b[i] = soundFx(i);
		const s = A.createBufferSource();
		s.buffer = m;
		s.connect(G);
		s.start();
	}

	const sfx = {
		punch(i) {
			var n=2e4;
			if (i > n) return null;
			var q = t(i,n);
			return (Math.pow(i*30,0.3)&33)?q:-q;
		},
		lash(i) {
			return (Math.random() * 2 - 1) * Math.sin(i/50) * Math.exp(-i/5000);
		},
		landed(i) {
			return 0.8 * (Math.random() * 2 - 1) * Math.exp(-i/800);
		}
	};

	function createMusic(notes,center,duration,decaystart,decayduration,interval,volume,waveform,i) {
		const musicAC=new AudioContext();
		const musicGain=musicAC.createGain();
		notes.forEach(function(note){
			var O = musicAC.createOscillator();
			if ( O ){
				O.connect(musicGain);
				musicGain.connect(musicAC.destination);
				O.start(note[0]*interval);
				O.frequency.setValueAtTime(center*1.06**(13-note[1]),note[0]*interval);
				O.type=waveform;
				musicGain.gain.setValueAtTime(volume,note[0]*interval);
				musicGain.gain.setTargetAtTime(1e-5,note[0]*interval+decaystart,decayduration);
				O.stop(note[0]*interval+duration);
			}
		});
		musicAudioContexts.push(musicAC);
	}

	/**
	 * @param {string} name
	 * @returns {void}
	 */
	function play(name) {
		var soundFx = sfx[name];

		if (!soundFx) { return; }
		var volume = name === 'punch' ? 0.05 : 0.1;
		_audio(soundFx, volume);
	}

	function music() {
		if (isMusicPlaying) { return; }
		isMusicPlaying = true;
		startMusic();
		pauseMusic(false);
	}

	function startMusic() {
		const timer = setTimeout(() => loopMusic(7000), 1000);
		musicTimers.push(timer);
	}

	function killMusic() {
		musicAudioContexts.forEach(a => a.close());
		musicAudioContexts.length = 0;
		musicTimers.forEach(a => clearTimeout(a));
		musicTimers.length = 0;
		isMusicPlaying = false;
	}

	function pauseMusic(pause=true) {
		musicAudioContexts.forEach(a => pause ? a.suspend() : a.resume());
	}

	/**
	 * @param {number} loopInterval
	 */
	function loopMusic(loopInterval) {
		killMusic();
		createMusic([[0,14],[1,14],[2,11],[3,9],[4,14],[5,14],[6,11],[7,9],[8,14],[9,14],[10,11],[11,9],[12,9],[13,9],[14,14],[15,16],[16,6],[17,11],[18,11],[19,14],[20,14],[21,9],[22,14],[23,9],[24,16],[25,6],[26,14],[27,11],[28,9],[29,6],[30,16],[31,6],[32,6],[33,9],[34,14],[35,14],[36,9],[37,11],[38,11],[39,14]],100,.1,.005,.2,.18,.008,'sawtooth');

		if (!focused) pauseMusic();

		const loopTimer = setTimeout(()=> loopMusic(loopInterval), loopInterval);
		musicTimers.push(loopTimer);
	}

	return {
		play,
		music,
		killMusic,
	};
})();

