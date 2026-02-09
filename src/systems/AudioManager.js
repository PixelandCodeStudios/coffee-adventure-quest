import { AUDIO_KEYS } from '../utils/Constants.js';

/**
 * AudioManager - Centralized audio control system
 * Manages all sound effects and music playback with Web Audio API fallbacks
 */
export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.music = {};
    this.musicVolume = 0.4;
    this.sfxVolume = 0.6;
    this.enabled = true;
  }

  /**
   * Create all sound instances (called after assets are loaded)
   */
  createSounds() {
    // For now, we'll use placeholder beep sounds generated with Web Audio API
    // These will be replaced when real audio files are added
    this.createPlaceholderSounds();
  }

  /**
   * Generate placeholder beep sounds using Web Audio API
   */
  createPlaceholderSounds() {
    // Placeholder approach: Store audio keys for later real asset integration
    Object.values(AUDIO_KEYS).forEach(key => {
      this.sounds[key] = { placeholder: true, key };
    });

    console.log('🎵 AudioManager initialized with placeholder sounds');
  }

  /**
   * Play a sound effect
   */
  playSound(key, config = {}) {
    if (!this.enabled) return;

    if (this.sounds[key]) {
      // If real Phaser sound exists, play it
      if (!this.sounds[key].placeholder) {
        this.sounds[key].play({ volume: this.sfxVolume, ...config });
      } else {
        // Generate simple beep as placeholder
        this.generateBeep(key);
      }
    }
  }

  /**
   * Play background music
   */
  playMusic(key, loop = true) {
    if (!this.enabled) return;

    this.stopAllMusic();

    if (this.music[key]) {
      this.music[key].play({ loop, volume: this.musicVolume });
    } else if (this.sounds[key]) {
      // Fallback: treat sound as music
      if (!this.sounds[key].placeholder) {
        this.sounds[key].play({ loop, volume: this.musicVolume });
      }
    }
  }

  /**
   * Stop all music
   */
  stopAllMusic() {
    Object.values(this.music).forEach(m => {
      if (m && m.stop) m.stop();
    });
  }

  /**
   * Stop a specific sound
   */
  stopSound(key) {
    if (this.sounds[key] && this.sounds[key].stop) {
      this.sounds[key].stop();
    }
  }

  /**
   * Generate a simple beep sound (placeholder)
   */
  generateBeep(key) {
    if (typeof window === 'undefined' || !window.AudioContext) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Different frequencies for different sounds
      const frequencies = {
        [AUDIO_KEYS.GRIND]: 220,
        [AUDIO_KEYS.POUR]: 330,
        [AUDIO_KEYS.CLICK]: 440,
        [AUDIO_KEYS.CAMERA]: 500,
        [AUDIO_KEYS.CRAB_SCUTTLE]: 280,
        [AUDIO_KEYS.SIP]: 350,
        [AUDIO_KEYS.SPARKLE]: 660
      };

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequencies[key] || 440;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  }

  /**
   * Set master volume
   */
  setVolume(sfx, music) {
    if (sfx !== undefined) this.sfxVolume = Math.max(0, Math.min(1, sfx));
    if (music !== undefined) this.musicVolume = Math.max(0, Math.min(1, music));
  }

  /**
   * Toggle audio on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopAllMusic();
    }
    return this.enabled;
  }

  /**
   * Clean up (called when scene shuts down)
   */
  destroy() {
    this.stopAllMusic();
    this.sounds = {};
    this.music = {};
  }
}
