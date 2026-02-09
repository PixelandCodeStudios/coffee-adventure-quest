import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS } from '../utils/Constants.js';
import DialogueManager from '../systems/DialogueManager.js';
import TransitionManager from '../systems/TransitionManager.js';
import ParticleManager from '../systems/ParticleManager.js';

/**
 * CutsceneScene - Reusable cutscene with dialogue and animations
 * Handles story moments between mini-games
 */
export default class CutsceneScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.CUTSCENE });
  }

  init(data) {
    this.stateManager = data.stateManager;
    this.audioManager = data.audioManager;
    this.cutsceneId = data.cutsceneId || 'default';
    this.nextScene = data.nextScene || SCENES.COFFEE_BEAN;
  }

  create() {
    // Fade in
    TransitionManager.fadeIn(this);

    // Initialize managers
    this.dialogueManager = new DialogueManager(this);
    this.particleManager = new ParticleManager(this);

    // Create background based on cutscene
    this.createBackground();

    // Create any visual elements
    this.createVisuals();

    // Start dialogue sequence
    this.time.delayedCall(500, () => {
      this.playDialogue();
    });
  }

  createBackground() {
    const cutscenes = this.getCutsceneConfig();
    const config = cutscenes[this.cutsceneId] || cutscenes.default;

    // Background
    if (config.background === 'kitchen') {
      this.createKitchenBackground();
    } else if (config.background === 'beach') {
      this.createBeachBackground();
    } else {
      // Default gradient background
      this.add.rectangle(POSITIONS.CENTER_X, POSITIONS.CENTER_Y, 1920, 1080, COLORS.CREAM);
    }
  }

  createKitchenBackground() {
    // Soft morning kitchen background
    const bg = this.add.rectangle(POSITIONS.CENTER_X, POSITIONS.CENTER_Y, 1920, 1080, 0xFFF8E7);

    // Kitchen counter
    const counter = this.add.rectangle(POSITIONS.CENTER_X, 900, 1920, 400, 0xA0826D);

    // Window with morning light
    const window = this.add.rectangle(1400, 300, 300, 400, 0x87CEEB);
    window.setAlpha(0.3);

    // Warm glow effect
    const glow = this.add.circle(1400, 200, 150, 0xFFD700);
    glow.setAlpha(0.2);

    // Gentle pulse animation for morning light
    this.tweens.add({
      targets: glow,
      alpha: 0.3,
      scale: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createBeachBackground() {
    // Beach background
    const bg = this.add.image(POSITIONS.CENTER_X, POSITIONS.CENTER_Y, 'beach-background');
    bg.setDisplaySize(1920, 1080);

    // Add gentle wave animation effect
    this.tweens.add({
      targets: bg,
      y: POSITIONS.CENTER_Y + 5,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createVisuals() {
    const cutscenes = this.getCutsceneConfig();
    const config = cutscenes[this.cutsceneId] || cutscenes.default;

    // Add visual elements based on cutscene
    if (config.visuals) {
      config.visuals.forEach(visual => {
        if (visual.type === 'sparkle') {
          this.particleManager.createSparkleEmitter();
          this.particleManager.sparkleAt(visual.x, visual.y, visual.count || 20);
        } else if (visual.type === 'emoji') {
          this.createFloatingEmoji(visual.emoji, visual.x, visual.y);
        }
      });
    }
  }

  createFloatingEmoji(emoji, x, y) {
    const text = this.add.text(x, y, emoji, {
      fontSize: '64px'
    });
    text.setOrigin(0.5);
    text.setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: 1,
      y: y - 50,
      duration: 1000,
      ease: 'Power2'
    });

    this.tweens.add({
      targets: text,
      angle: { from: -10, to: 10 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  async playDialogue() {
    const cutscenes = this.getCutsceneConfig();
    const config = cutscenes[this.cutsceneId] || cutscenes.default;

    // Play dialogue sequence
    if (config.dialogue) {
      await this.dialogueManager.showSequence(config.dialogue);
    }

    // Transition to next scene
    this.time.delayedCall(500, () => {
      this.transitionToNext();
    });
  }

  transitionToNext() {
    TransitionManager.transitionTo(this, this.nextScene, {
      stateManager: this.stateManager,
      audioManager: this.audioManager
    });
  }

  getCutsceneConfig() {
    return {
      // Opening cutscene - Kitchen wake-up
      opening: {
        background: 'kitchen',
        visuals: [
          { type: 'emoji', emoji: '☀️', x: 1400, y: 200 }
        ],
        dialogue: [
          {
            text: 'Good morning, beautiful ☀️',
            options: { pauseAfter: 2000 }
          },
          {
            text: "Today feels special… the kind of day that starts with a *perfect* cup of coffee.",
            options: { pauseAfter: 2500 }
          },
          {
            text: 'Oh no! Some of the ingredients are missing!',
            options: { pauseAfter: 2000, textColor: '#FF6600' }
          },
          {
            text: "Don't worry — let's go on a tiny adventure and find them together 💛",
            options: { pauseAfter: 2000 }
          }
        ]
      },

      // Beach arrival cutscene
      beachArrival: {
        background: 'beach',
        visuals: [
          { type: 'emoji', emoji: '🌊', x: 300, y: 600 },
          { type: 'emoji', emoji: '🐚', x: 1600, y: 700 }
        ],
        dialogue: [
          {
            text: 'Hmm… I think the last ingredient drifted somewhere warm and sandy…',
            options: { pauseAfter: 2500 }
          },
          {
            text: 'Ahhh… the beach 🌊 Look at the shells!',
            options: { pauseAfter: 2000 }
          }
        ]
      },

      // After beans - transition to milk
      afterBeans: {
        background: 'kitchen',
        dialogue: [
          {
            text: 'Perfect! These beans smell amazing already!',
            options: { pauseAfter: 2000 }
          },
          {
            text: 'Now let\'s add some creamy goodness…',
            options: { pauseAfter: 1500 }
          }
        ]
      },

      // After milk - transition to beach
      afterMilk: {
        background: 'kitchen',
        dialogue: [
          {
            text: 'Just right! So smooth 💕',
            options: { pauseAfter: 2000 }
          },
          {
            text: 'But wait… we need that special ingredient!',
            options: { pauseAfter: 2000, textColor: '#FF6600' }
          }
        ]
      },

      // After finding shell - crab steals
      crabSteal: {
        background: 'beach',
        visuals: [
          { type: 'emoji', emoji: '🦀', x: POSITIONS.CENTER_X, y: POSITIONS.CENTER_Y }
        ],
        dialogue: [
          {
            text: 'Yes! Caramel pistachio!! That\'s the one!',
            options: { pauseAfter: 1500 }
          },
          {
            text: 'Hey!! Wait—!',
            options: { pauseAfter: 1000, textColor: '#FF0000', interrupt: true }
          },
          {
            text: 'Oh no! A sneaky little crab stole it! 🦀',
            options: { pauseAfter: 2000, textColor: '#FF6600' }
          },
          {
            text: 'Looks like it\'s time for a photo challenge 📸',
            options: { pauseAfter: 2000 }
          }
        ]
      },

      // After crab photo - heading back
      afterCrab: {
        background: 'beach',
        dialogue: [
          {
            text: 'Got him!! That\'s a perfect photo!',
            options: { pauseAfter: 2000 }
          },
          {
            text: 'Let\'s head back and make something wonderful.',
            options: { pauseAfter: 2000 }
          }
        ]
      },

      // Before brewing
      beforeBrewing: {
        background: 'kitchen',
        visuals: [
          { type: 'sparkle', x: POSITIONS.CENTER_X, y: POSITIONS.CENTER_Y, count: 30 }
        ],
        dialogue: [
          {
            text: 'Time to put it all together… just the way you like it ☕',
            options: { pauseAfter: 2500 }
          }
        ]
      },

      // Default fallback
      default: {
        background: 'kitchen',
        dialogue: [
          {
            text: 'Let\'s continue the adventure! 💛',
            options: { pauseAfter: 1500 }
          }
        ]
      }
    };
  }

  shutdown() {
    if (this.dialogueManager) {
      this.dialogueManager.destroy();
    }
  }
}
