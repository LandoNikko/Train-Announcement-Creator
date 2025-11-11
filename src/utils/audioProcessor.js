export class AudioProcessor {
  constructor() {
    this.audioContext = null
    this.sourceNode = null
    this.gainNode = null
    this.dryGain = null
    this.wetGain = null
    this.makeupGain = null
    this.compressor = null
    this.lowShelf = null
    this.midPeak = null
    this.highShelf = null
    this.convolver = null
    this.lowpassFilter = null
    this.highpassFilter = null
    this.waveshaper = null
    this.noiseGain = null
    this.noiseSource = null
    this.currentPreset = 'standard'
    this.targetNoiseLevel = 0
    this.isAudioPlaying = false
  }

  initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this.audioContext
  }

  createEffectsChain(audioElement) {
    if (!this.audioContext) {
      this.initialize()
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    this.sourceNode = this.audioContext.createMediaElementSource(audioElement)
    this.gainNode = this.audioContext.createGain()
    this.dryGain = this.audioContext.createGain()
    this.wetGain = this.audioContext.createGain()
    this.makeupGain = this.audioContext.createGain()
    this.compressor = this.audioContext.createDynamicsCompressor()
    
    this.lowShelf = this.audioContext.createBiquadFilter()
    this.lowShelf.type = 'lowshelf'
    this.lowShelf.frequency.value = 200
    
    this.midPeak = this.audioContext.createBiquadFilter()
    this.midPeak.type = 'peaking'
    this.midPeak.frequency.value = 2500
    this.midPeak.Q.value = 1
    
    this.highShelf = this.audioContext.createBiquadFilter()
    this.highShelf.type = 'highshelf'
    this.highShelf.frequency.value = 6000
    
    this.lowpassFilter = this.audioContext.createBiquadFilter()
    this.lowpassFilter.type = 'lowpass'
    this.lowpassFilter.frequency.value = 20000
    
    this.highpassFilter = this.audioContext.createBiquadFilter()
    this.highpassFilter.type = 'highpass'
    this.highpassFilter.frequency.value = 20
    
    this.convolver = this.audioContext.createConvolver()
    this.createReverbImpulse(0.001, 1)
    
    this.waveshaper = this.audioContext.createWaveShaper()
    this.waveshaper.curve = this.createDistortionCurve(0)
    this.waveshaper.oversample = '4x'
    
    this.noiseGain = this.audioContext.createGain()
    this.noiseGain.gain.value = 0
    
    // Create continuous noise source
    const noiseBuffer = this.createNoise(2)
    this.noiseSource = this.audioContext.createBufferSource()
    this.noiseSource.buffer = noiseBuffer
    this.noiseSource.loop = true
    this.noiseSource.connect(this.noiseGain)
    this.noiseSource.start(0)
    
    // Dry signal path (bypasses all effects)
    this.sourceNode.connect(this.dryGain)
    this.dryGain.connect(this.gainNode)
    
    // Wet signal path (through all effects)
    this.sourceNode.connect(this.highpassFilter)
    this.noiseGain.connect(this.highpassFilter)
    
    this.highpassFilter.connect(this.lowpassFilter)
    this.lowpassFilter.connect(this.lowShelf)
    this.lowShelf.connect(this.midPeak)
    this.midPeak.connect(this.highShelf)
    this.highShelf.connect(this.compressor)
    this.compressor.connect(this.waveshaper)
    this.waveshaper.connect(this.convolver)
    this.convolver.connect(this.makeupGain)
    this.makeupGain.connect(this.wetGain)
    this.wetGain.connect(this.gainNode)
    
    this.gainNode.connect(this.audioContext.destination)
    
    return this.gainNode
  }

  createReverbImpulse(duration = 0.5, decay = 2) {
    const sampleRate = this.audioContext.sampleRate
    const length = Math.max(1, Math.floor(sampleRate * duration))
    const impulse = this.audioContext.createBuffer(2, length, sampleRate)
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
      }
    }
    
    this.convolver.buffer = impulse
  }

  createDistortionCurve(amount = 0) {
    const samples = 44100
    const curve = new Float32Array(samples)
    const deg = Math.PI / 180
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1
      if (amount === 0) {
        curve[i] = x
      } else {
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
      }
    }
    
    return curve
  }

  createNoise(duration = 0.1) {
    const sampleRate = this.audioContext.sampleRate
    const length = Math.floor(sampleRate * duration)
    const buffer = this.audioContext.createBuffer(2, length, sampleRate)
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        channelData[i] = Math.random() * 2 - 1
      }
    }
    
    return buffer
  }

  applyPreset(preset) {
    if (!this.compressor) return
    
    this.currentPreset = preset
    
    switch (preset) {
      case 'standard':
        this.dryGain.gain.value = 1
        this.wetGain.gain.value = 0
        this.makeupGain.gain.value = 1
        this.waveshaper.curve = this.createDistortionCurve(0)
        this.targetNoiseLevel = 0
        this.noiseGain.gain.value = 0
        break
        
      case 'vacant':
        this.dryGain.gain.value = 0
        this.wetGain.gain.value = 1
        
        this.compressor.threshold.value = -30
        this.compressor.knee.value = 30
        this.compressor.ratio.value = 12
        this.compressor.attack.value = 0.003
        this.compressor.release.value = 0.25
        
        this.lowShelf.gain.value = -8
        this.midPeak.gain.value = 4
        this.highShelf.gain.value = -6
        
        this.lowpassFilter.frequency.value = 4000
        this.highpassFilter.frequency.value = 300
        
        this.waveshaper.curve = this.createDistortionCurve(0)
        this.targetNoiseLevel = 0
        this.noiseGain.gain.value = 0
        this.makeupGain.gain.value = 6
        this.createReverbImpulse(0.3, 3)
        break
        
      case 'underground':
        this.dryGain.gain.value = 0
        this.wetGain.gain.value = 1
        
        this.compressor.threshold.value = -30
        this.compressor.knee.value = 25
        this.compressor.ratio.value = 5
        this.compressor.attack.value = 0.005
        this.compressor.release.value = 0.3
        
        this.lowShelf.gain.value = -2
        this.midPeak.gain.value = 3
        this.highShelf.gain.value = -4
        
        this.lowpassFilter.frequency.value = 10000
        this.highpassFilter.frequency.value = 150
        
        this.waveshaper.curve = this.createDistortionCurve(0)
        this.targetNoiseLevel = 0
        this.noiseGain.gain.value = 0
        this.makeupGain.gain.value = 4
        this.createReverbImpulse(0.8, 2)
        break
        
      case 'express':
        this.dryGain.gain.value = 0
        this.wetGain.gain.value = 1
        
        this.compressor.threshold.value = -25
        this.compressor.knee.value = 20
        this.compressor.ratio.value = 8
        this.compressor.attack.value = 0.001
        this.compressor.release.value = 0.1
        
        this.lowShelf.gain.value = 2
        this.midPeak.gain.value = 5
        this.highShelf.gain.value = 3
        
        this.lowpassFilter.frequency.value = 12000
        this.highpassFilter.frequency.value = 80
        
        this.waveshaper.curve = this.createDistortionCurve(0)
        this.targetNoiseLevel = 0
        this.noiseGain.gain.value = 0
        this.makeupGain.gain.value = 6
        this.createReverbImpulse(0.2, 4)
        break
        
      case 'platform':
        this.dryGain.gain.value = 0
        this.wetGain.gain.value = 1
        
        this.compressor.threshold.value = -35
        this.compressor.knee.value = 30
        this.compressor.ratio.value = 6
        this.compressor.attack.value = 0.003
        this.compressor.release.value = 0.25
        
        this.lowShelf.gain.value = -8
        this.midPeak.gain.value = 3
        this.highShelf.gain.value = 1
        
        this.lowpassFilter.frequency.value = 8000
        this.highpassFilter.frequency.value = 250
        
        this.waveshaper.curve = this.createDistortionCurve(0)
        this.targetNoiseLevel = 0
        this.noiseGain.gain.value = 0
        this.makeupGain.gain.value = 3
        this.createReverbImpulse(1, 5)
        break
        
      case 'radio':
        this.dryGain.gain.value = 0
        this.wetGain.gain.value = 1
        
        this.compressor.threshold.value = -8
        this.compressor.knee.value = 2
        this.compressor.ratio.value = 20
        this.compressor.attack.value = 0.00005
        this.compressor.release.value = 0.015
        
        this.lowShelf.gain.value = -15
        this.midPeak.gain.value = 12
        this.highShelf.gain.value = -12
        
        this.lowpassFilter.frequency.value = 2200
        this.highpassFilter.frequency.value = 700
        
        this.waveshaper.curve = this.createDistortionCurve(80)
        this.targetNoiseLevel = 0.0
        this.noiseGain.gain.value = this.isAudioPlaying ? this.targetNoiseLevel : 0
        this.makeupGain.gain.value = 4
        this.createReverbImpulse(0.5, 2.5)
        break
        
      case 'tunnel':
        this.dryGain.gain.value = 0
        this.wetGain.gain.value = 1
        
        this.compressor.threshold.value = -32
        this.compressor.knee.value = 40
        this.compressor.ratio.value = 8
        this.compressor.attack.value = 0.005
        this.compressor.release.value = 0.3
        
        this.lowShelf.gain.value = 8
        this.midPeak.gain.value = -2
        this.highShelf.gain.value = -8
        
        this.lowpassFilter.frequency.value = 4500
        this.highpassFilter.frequency.value = 150
        
        this.waveshaper.curve = this.createDistortionCurve(0)
        this.targetNoiseLevel = 0
        this.noiseGain.gain.value = 0
        this.makeupGain.gain.value = 4
        this.createReverbImpulse(2.0, 1.5)
        break
        
      case 'commuter':
        this.dryGain.gain.value = 0
        this.wetGain.gain.value = 1
        
        this.compressor.threshold.value = -20
        this.compressor.knee.value = 15
        this.compressor.ratio.value = 10
        this.compressor.attack.value = 0.001
        this.compressor.release.value = 0.05
        
        this.lowShelf.gain.value = -10
        this.midPeak.gain.value = 6
        this.highShelf.gain.value = -8
        
        this.lowpassFilter.frequency.value = 3500
        this.highpassFilter.frequency.value = 400
        
        this.waveshaper.curve = this.createDistortionCurve(0)
        this.targetNoiseLevel = 0
        this.noiseGain.gain.value = 0
        this.makeupGain.gain.value = 9
        this.createReverbImpulse(0.1, 5)
        break
        
      case 'firstClass':
        this.dryGain.gain.value = 0
        this.wetGain.gain.value = 1
        
        this.compressor.threshold.value = -22
        this.compressor.knee.value = 18
        this.compressor.ratio.value = 6
        this.compressor.attack.value = 0.001
        this.compressor.release.value = 0.08
        
        this.lowShelf.gain.value = 1
        this.midPeak.gain.value = 4
        this.highShelf.gain.value = 5
        
        this.lowpassFilter.frequency.value = 15000
        this.highpassFilter.frequency.value = 60
        
        this.waveshaper.curve = this.createDistortionCurve(0)
        this.targetNoiseLevel = 0
        this.noiseGain.gain.value = 0
        this.makeupGain.gain.value = 7
        this.createReverbImpulse(0.15, 4)
        break
        
      default:
        this.applyPreset('standard')
    }
  }

  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume
    }
  }

  setPlaybackState(isPlaying) {
    this.isAudioPlaying = isPlaying
    if (this.noiseGain) {
      this.noiseGain.gain.value = isPlaying ? this.targetNoiseLevel : 0
    }
  }

  disconnect() {
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect()
      } catch (e) {}
    }
    if (this.noiseSource) {
      try {
        this.noiseSource.stop()
        this.noiseSource.disconnect()
      } catch (e) {}
    }
    this.sourceNode = null
    this.noiseSource = null
  }

  getCurrentPreset() {
    return this.currentPreset
  }

  isAvailable() {
    return !!(window.AudioContext || window.webkitAudioContext)
  }
}

let processorInstance = null

export const getAudioProcessor = () => {
  if (!processorInstance) {
    processorInstance = new AudioProcessor()
  }
  return processorInstance
}

