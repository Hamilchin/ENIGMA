//////////////////////////////
// Create pre rendered sounds
//////////////////////////////
// Pre rendered sounds
game.instruments.preRenderedSounds = new Map()
// Standard oscillator configuration
game.instruments.standardOsc = {
    type: 'sawtooth', octave: 0, 
    volumeADSR: {a:0, d:0, s:0, r:0, minValue: 0, maxValue: 0},
    detuneADSR: {a:0, d:0, s:1, r:0, minValue: 0, maxValue: 0},
    filterType: 'lowpass', filterQ:1,
    filterADSR: {a:0, d:0, s:1, r:0, minValue: 10000, maxValue: 10000},
    reverb: {delay: 0, feedbackLevel: 0},
    play: function (_ctx, _frequency, _startTime, _duration, _destination) {
        let osc = _ctx.createOscillator()
        osc.type = this.type
        // Frequency
        osc.frequency.setValueAtTime(_frequency, _startTime)
        if (this.octave == -1) {
            osc.frequency.setValueAtTime(_frequency / 2, _startTime)
        }
        if (this.octave == 1) {
            osc.frequency.setValueAtTime(_frequency * 2, _startTime)
        }
        // Detune
        mge._audio._applyADSR(this.detuneADSR, osc.detune, _startTime, _duration)
        // Volume
        let oscGain = _ctx.createGain()
        mge._audio._applyADSR (this.volumeADSR, oscGain.gain, _startTime, _duration)
        // Filter
        let oscFilter = _ctx.createBiquadFilter()
        oscFilter.type = this.filterType
        oscFilter.Q.value = this.filterQ
        mge._audio._applyADSR (this.filterADSR, oscFilter.frequency, _startTime, _duration)
        // Reverb
        let _delay = new DelayNode(_ctx, {delayTime: this.reverb.delay})
        let _feedbackGain = _ctx.createGain()
        _feedbackGain.gain.value = this.reverb.feedbackLevel
        // Connections
        osc.connect(oscFilter)
        oscFilter.connect(oscGain)
        oscGain.connect(_destination)
        // Connections delay
        oscGain.connect(_delay)
        _delay.connect(_feedbackGain)
        _feedbackGain.connect(_delay)
        _feedbackGain.connect(_destination)
            // Play
        osc.start(_startTime)
        osc.stop(_startTime + _duration + this.volumeADSR.r)
    }
}
// Instrument constructor
game.instruments.newInstrument = {
    name: 'newInstrument',
    osc1: {},
    osc2: {},
    osc3: {},
    init: function () {
        this.osc1 = Object.create(game.instruments.standardOsc)
        this.osc2 = Object.create(game.instruments.standardOsc) 
        this.osc3 = Object.create(game.instruments.standardOsc)
    },
    getBufferId: function (_frequency, _duration) {
        return this.name + '-' + (Math.round(_frequency*100)/100).toString() + '-' + (Math.round(_duration*100)/100).toString()
    },
    preRender: function (_frequency, _duration) {
        // Create offline context   
        let  offlineContext = new OfflineAudioContext(2, _duration * 1.5 * 44100, 44100)
        // Create an play oscillators
        this.osc1.play(offlineContext, _frequency, 0, _duration, offlineContext.destination)
        this.osc2.play(offlineContext, _frequency, 0, _duration, offlineContext.destination)
        this.osc3.play(offlineContext, _frequency, 0, _duration, offlineContext.destination)
        // Prerender
        offlineContext.startRendering().then(renderedBuffer => {
                game.instruments.preRenderedSounds.set(this.getBufferId(_frequency, _duration),renderedBuffer)
            })
    },
    playLive: function (_frequency, _startTime, _duration, _volume) {
        let _ctx = mge._audio._audioContext
        // Create a gain node for volume
        let _volumeGain = _ctx.createGain()
        _volumeGain.gain.setValueAtTime(_volume, _startTime)
        _volumeGain.connect(mge._audio._audioGain)
        // Create an play oscillators
        this.osc1.play(_ctx, _frequency, _startTime, _duration, _volumeGain)
        this.osc2.play(_ctx, _frequency, _startTime, _duration, _volumeGain)
        this.osc3.play(_ctx, _frequency, _startTime, _duration, _volumeGain)
    },
    playPreRendered: function (_frequency, _startTime, _duration, _volume) {
        let ctx = mge._audio._audioContext
        // Get prerendered buffer
        let source = ctx.createBufferSource()
        source.buffer = game.instruments.preRenderedSounds.get(this.getBufferId(_frequency, _duration))
        // Volume
        let soundGain = ctx.createGain()
        soundGain.gain.setValueAtTime(_volume, _startTime)
        // Connect and play
        source.connect(soundGain)
        soundGain.connect(mge._audio._audioGain)
        source.start(_startTime)
        source.stop(_startTime + _duration * 1.5)
    },
    play: function (_frequency, _startTime, _duration, _volume) {
        if (!isNaN(_frequency)) {
            // Check if the sound is already pre-rendered
            if (game.instruments.preRenderedSounds.get (this.getBufferId(_frequency, _duration)) == undefined) {
                //console.log('Real time')
                this.playLive(_frequency, _startTime, _duration, _volume)
                this.preRender(_frequency, _duration)
            } else {
                //console.log('Pre rendered')
                this.playPreRendered(_frequency, _startTime, _duration, _volume)
            }
        }
    }
}

game.instruments.init = function () {
    /////////////////////////////
    // Bass
    /////////////////////////////
    game.instruments.bass = Object.create(game.instruments.newInstrument)
    game.instruments.bass.init()
    game.instruments.bass.name = 'bass'
    // osc1
    game.instruments.bass.osc1.type = 'sawtooth'
    game.instruments.bass.osc1.volumeADSR = {a:0.02, d:0.3, s:0.8, r:0.1, minValue: 0, maxValue: 1}
    game.instruments.bass.osc1.filterType = 'lowpass'
    game.instruments.bass.osc1.filterADSR = {a:0.1, d:0.1, s:0.8, r:0.1, minValue: 1000, maxValue: 2000}
    game.instruments.bass.osc1.reverb = {delay: 0.1, feedbackLevel: 0.4}
    // osc2 (1 octave down)
    game.instruments.bass.osc2.type = 'sawtooth'
    game.instruments.bass.osc2.octave = -1
    game.instruments.bass.osc2.volumeADSR = {a:0.02, d:0.3, s:0.8, r:0.1, minValue: 0, maxValue: 0.8}
    game.instruments.bass.osc2.filterType = 'lowpass'
    game.instruments.bass.osc2.filterADSR = {a:0.1, d:0.1, s:0.8, r:0.1, minValue: 1000, maxValue: 2000}
    game.instruments.bass.osc2.reverb = {delay: 0.1, feedbackLevel: 0.4}
    // osc3 (detune)
    game.instruments.bass.osc3.type = 'sawtooth'
    game.instruments.bass.osc3.volumeADSR = {a:0.02, d:0.3, s:0.8, r:0.1, minValue: 0, maxValue: 1}
    game.instruments.bass.osc3.filterType = 'lowpass'
    game.instruments.bass.osc3.filterADSR = {a:0.1, d:0.1, s:0.8, r:0.1, minValue: 1000, maxValue: 2000}
    game.instruments.bass.osc3.detuneADSR = {a:0.02, d:0.3, s:0.8, r:0.1, minValue:-4, maxValue: 4}
    game.instruments.bass.osc3.reverb = {delay: 0.1, feedbackLevel: 0.4}
    /////////////////////////////
    // Arpege
    /////////////////////////////
    game.instruments.arpege = Object.create(game.instruments.newInstrument)
    game.instruments.arpege.name = 'arpege'
    game.instruments.arpege.init()
    // osc1
    game.instruments.arpege.osc1.type = 'sawtooth'
    game.instruments.arpege.osc1.volumeADSR = {a:0.005, d:0.15, s:0.3, r:0.1, minValue:0, maxValue: 1}
    game.instruments.arpege.osc1.filterType = 'lowpass'
    game.instruments.arpege.osc1.filterADSR = {a:0.02, d:0.12, s:0.25, r:0.08, minValue:1800, maxValue: 2200}
    game.instruments.arpege.osc1.reverb = {delay: 0.1, feedbackLevel: 0.5}
    // osc2 (1 octave down)
    game.instruments.arpege.osc2.type = 'sawtooth'
    game.instruments.arpege.osc2.octave = 0
    game.instruments.arpege.osc2.volumeADSR = {a:0.005, d:0.15, s:0.3, r:0.1, minValue:0, maxValue: 0.7}
    game.instruments.arpege.osc2.detuneADSR = {a:0, d:0, s:1, r:0, minValue:3, maxValue: 3}
    game.instruments.arpege.osc2.filterType = 'lowpass'
    game.instruments.arpege.osc2.filterADSR = {a:0.02, d:0.12, s:0.25, r:0.08, minValue:1800, maxValue: 2200}
    game.instruments.arpege.osc2.reverb = {delay: 0.1, feedbackLevel: 0.5}
    // osc3 (not used)
    /////////////////////////////
    // Lead
    /////////////////////////////
    game.instruments.lead = Object.create(game.instruments.newInstrument)
    game.instruments.lead.name = 'lead'
    game.instruments.lead.init()
    // osc1
    game.instruments.lead.osc1.type = 'sawtooth'
    game.instruments.lead.osc1.volumeADSR = {a:0.01, d:0.2, s:0.7, r:0.5, minValue:0, maxValue: 1}
    game.instruments.lead.osc1.filterType = 'lowpass'
    game.instruments.lead.osc1.filterADSR = {a:0.005, d:0.3, s:0.4, r:0.8, minValue:3500, maxValue: 4900}
    game.instruments.lead.osc1.filterQ = 8
    game.instruments.lead.osc1.reverb = {delay: 0.1, feedbackLevel: 0.5}
    // osc2 (1 octave down)
    game.instruments.lead.osc2.type = 'sawtooth'
    game.instruments.lead.osc2.octave = 0
    game.instruments.lead.osc2.volumeADSR = {a:0.01, d:0.2, s:0.7, r:0.5, minValue:0, maxValue: 1}
    game.instruments.lead.osc2.filterType = 'lowpass'
    game.instruments.lead.osc2.filterADSR = {a:0.005, d:0.3, s:0.4, r:0.8, minValue:3500, maxValue: 4900}
    game.instruments.lead.osc2.detuneADSR = {a:0, d:0, s:1, r:0, minValue:7, maxValue: 7}
    game.instruments.lead.osc2.filterQ = 8
    game.instruments.lead.osc2.reverb = {delay: 0.1, feedbackLevel: 0.5}
    // osc3 (not used)
    /////////////////////////////
    // cat
    /////////////////////////////
    game.instruments.cat = Object.create(game.instruments.newInstrument)
    game.instruments.cat.name = 'cat'
    game.instruments.cat.init()
    // osc1
    game.instruments.cat.osc1.type = 'sawtooth'
    game.instruments.cat.osc1.volumeADSR = {a:0.05, d:0.1, s:0.5, r:0.2, minValue:0, maxValue: 1}
    game.instruments.cat.osc1.filterType = 'lowpass'
    game.instruments.cat.osc1.filterADSR = {a:0.1, d:0.1, s:0.5, r:0.2, minValue:500, maxValue: 2000}
    game.instruments.cat.osc1.detuneADSR = {a:0.05, d:0.1, s:0.5, r:0.2, minValue:0, maxValue: 100}
    //game.instruments.cat.osc1.filterQ = 12
    game.instruments.cat.osc1.reverb = {delay: 0.1, feedbackLevel: 0.2}
    // osc2 (1 octave down)
    //game.instruments.cat.osc2.type = 'sawtooth'
    //game.instruments.arpege.osc2.octave = 1
    //game.instruments.cat.osc2.volumeADSR = {a:0.1, d:0.2, s:0.7, r:0.5, minValue:0, maxValue: 0.8}
    //game.instruments.cat.osc2.filterType = 'lowpass'
    //game.instruments.cat.osc2.filterADSR = {a:0.005, d:0.3, s:0.4, r:0.8, minValue:3500, maxValue: 4900}
    //game.instruments.cat.osc2.detuneADSR = {a:0.1, d:0, s:0.6, r:0.5, minValue:0, maxValue: 70}
    //game.instruments.cat.osc2.filterQ = 12
    //game.instruments.cat.osc2.reverb = {delay: 0.1, feedbackLevel: 0.5}
    // osc3 (not used)
}







