import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS, TIMING } from '../utils/Constants.js';
import Avatar from '../game-objects/Avatar.js';
import CoffeeCup from '../game-objects/CoffeeCup.js';
import StickerOrbit from '../game-objects/StickerOrbit.js';
import Butterfly from '../game-objects/Butterfly.js';
import Crab from '../game-objects/Crab.js';
import ParticleManager from '../systems/ParticleManager.js';
import TransitionManager from '../systems/TransitionManager.js';

/**
 * CelebrationScene - Final birthday celebration with all the magic!
 */
export default class CelebrationScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.CELEBRATION });
  }

  init(data) {
    this.stateManager = data.stateManager;
    this.audioManager = data.audioManager;
  }

  create() {
    TransitionManager.fadeIn(this);

    this.particleManager = new ParticleManager(this);
    this.particleManager.createSparkleEmitter();

    this.createBeachBackground();
    this.createAvatar();
    this.createCoffeeCup();
    this.createStickers();
    this.createCrabs();
    this.createButterflies();
    this.startContinuousSparkles();
    this.showBirthdayMessage();

    // Play celebration audio
    // (Would play actual beach waves and celebration music here)
    this.audioManager?.playSound('celebration');
  }

  createBeachBackground() {
    // Sky gradient
    const sky = this.add.rectangle(POSITIONS.CENTER_X, 300, 1920, 600, COLORS.SKY_BLUE);

    // Ocean
    const ocean = this.add.rectangle(POSITIONS.CENTER_X, 700, 1920, 400, COLORS.OCEAN_BLUE);

    // Sand
    const sand = this.add.rectangle(POSITIONS.CENTER_X, 950, 1920, 260, COLORS.SAND);

    // Animated waves
    this.createWaves();

    // Sun
    const sun = this.add.circle(300, 200, 80, COLORS.SUNSET_ORANGE);
    sun.setStrokeStyle(5, COLORS.GOLD);

    // Sun rays animation
    this.tweens.add({
      targets: sun,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createWaves() {
    // Multiple wave layers for depth
    for (let layer = 0; layer < 3; layer++) {
      const waveGraphics = this.add.graphics();
      waveGraphics.fillStyle(COLORS.WHITE, 0.2 - layer * 0.05);

      for (let i = 0; i < 12; i++) {
        waveGraphics.fillEllipse(i * 180, 620 + layer * 30, 160, 25);
      }

      // Animate waves at different speeds
      this.tweens.add({
        targets: waveGraphics,
        x: -180,
        duration: 4000 - layer * 500,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }

  createAvatar() {
    this.avatar = new Avatar(this, POSITIONS.CENTER_X - 200, POSITIONS.GROUND_Y);
    this.avatar.startDancing();
  }

  createCoffeeCup() {
    this.coffeeCup = new CoffeeCup(this, POSITIONS.CENTER_X + 200, POSITIONS.GROUND_Y - 50);

    this.coffeeCup.on('sip', () => {
      this.onCoffeeSip();
    });
  }

  createStickers() {
    const unlockedStickers = this.stateManager.getUnlockedStickers();

    this.stickerOrbit = new StickerOrbit(
      this,
      this.avatar.x,
      this.avatar.y - 80,
      120
    );

    if (unlockedStickers.length > 0) {
      this.stickerOrbit.addStickers(unlockedStickers);
      this.stickerOrbit.startOrbiting(0.015);
    }
  }

  createCrabs() {
    this.crabs = [];

    // Create 3 happy crabs scuttling on the beach
    for (let i = 0; i < 3; i++) {
      const crab = new Crab(this, -100, POSITIONS.SAND_Y + i * 30);
      this.crabs.push(crab);

      // Scuttle across the screen
      this.time.delayedCall(i * 1500, () => {
        this.tweens.add({
          targets: crab,
          x: 2000,
          duration: 8000,
          ease: 'Linear',
          repeat: -1,
          delay: Phaser.Math.Between(0, 3000)
        });

        // Wiggle as they move
        this.tweens.add({
          targets: crab,
          angle: Phaser.Math.Between(-5, 5),
          duration: 300,
          yoyo: true,
          repeat: -1
        });
      });
    }
  }

  createButterflies() {
    this.butterflies = [];

    for (let i = 0; i < 5; i++) {
      const butterfly = new Butterfly(
        this,
        Phaser.Math.Between(200, 1720),
        Phaser.Math.Between(100, 400)
      );

      butterfly.startFluttering();
      this.butterflies.push(butterfly);
    }
  }

  startContinuousSparkles() {
    // Random sparkles across the scene
    this.time.addEvent({
      delay: TIMING.SPARKLE_INTERVAL,
      callback: () => {
        const x = Phaser.Math.Between(200, 1720);
        const y = Phaser.Math.Between(100, 900);
        this.particleManager.sparkleAt(x, y, 8);
      },
      loop: true
    });
  }

  showBirthdayMessage() {
    const centerX = POSITIONS.CENTER_X;

    // Main title
    const title = this.add.text(centerX, 80, '✨ Happy Birthday, Jessi! ✨', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#FF1493',
      strokeThickness: 8
    });
    title.setOrigin(0.5);

    // Heartfelt message
    const message = this.add.text(centerX, 180,
      'You did it! The perfect caramel pistachio coffee is ready.\n' +
      'The sweet aroma fills the air, and the beach sparkles in celebration just for you.\n\n' +
      'Tiny crabs scuttle happily across the sand.\n' +
      'Butterflies dance in the warm breeze.\n' +
      'Your stickers float around like birthday stars.\n\n' +
      'Take a sip—the world feels brighter, lighter, full of joy.\n\n' +
      '🎉 Today is all about YOU! ☕💖', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: 900 }
    });
    message.setOrigin(0.5);
    message.setAlpha(0);

    // Fade in message
    this.tweens.add({
      targets: message,
      alpha: 1,
      duration: 2000,
      delay: 1000,
      ease: 'Power2'
    });

    // Title pulse animation
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Confetti explosion
    this.time.delayedCall(1500, () => {
      this.particleManager.createConfettiExplosion(centerX, 400);
    });
  }

  onCoffeeSip() {
    // Sparkle effect around avatar
    this.particleManager.sparkleAt(this.avatar.x, this.avatar.y - 50, 30);
    this.particleManager.createHearts(this.avatar.x, this.avatar.y - 100);

    // Avatar happy animation
    this.avatar.playHappyAnimation();

    // Flash effect
    TransitionManager.flash(this, COLORS.GOLD, 200);

    // Random extra sparkles
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 200, () => {
        const x = this.avatar.x + Phaser.Math.Between(-150, 150);
        const y = this.avatar.y + Phaser.Math.Between(-150, 50);
        this.particleManager.sparkleAt(x, y, 10);
      });
    }
  }

  update(time, delta) {
    // Update orbiting stickers
    if (this.stickerOrbit) {
      this.stickerOrbit.update(delta);
    }
  }
}
