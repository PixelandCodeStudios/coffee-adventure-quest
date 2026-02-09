import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS, FONTS } from '../utils/Constants.js';
import StateManager from '../systems/StateManager.js';
import AudioManager from '../systems/AudioManager.js';
import ParticleManager from '../systems/ParticleManager.js';
import StickerManager from '../systems/StickerManager.js';
import TransitionManager from '../systems/TransitionManager.js';

/**
 * BootScene - Asset loading and initialization
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Create loading bar
    this.createLoadingBar();

    // Load sprite images
    this.load.image('coffee-bean-sprite', '/assets/sprites/Coffee-Bean-Sprite.png');
    this.load.image('milk-bottle-sprite', '/assets/sprites/milk-bottle-sprite.png');
    this.load.image('birthday-avatar', '/assets/sprites/birthday-avatar.png');
    this.load.image('beach-background', '/assets/backgrounds/beach-background.png');

    // Load crab animation spritesheet (4 frames in a row)
    this.load.spritesheet('crab-sprite', '/assets/sprites/crab-animation-sheet.png', {
      frameWidth: 512,  // Adjust based on actual image dimensions
      frameHeight: 512
    });

    console.log('🎮 Loading Coffee Adventure Quest...');
  }

  create() {
    console.log('✨ Game initialized!');

    // Initialize singleton managers
    this.registry.set('stateManager', new StateManager());
    this.registry.set('audioManager', new AudioManager(this));

    const stateManager = this.registry.get('stateManager');
    const audioManager = this.registry.get('audioManager');

    // Create audio system
    audioManager.createSounds();

    // Create shared graphics textures (placeholders)
    this.createPlaceholderGraphics();

    // Create crab walk animation from spritesheet
    this.anims.create({
      key: 'crab-walk',
      frames: this.anims.generateFrameNumbers('crab-sprite', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    // Show welcome message
    this.showWelcomeScreen();
  }

  /**
   * Create loading bar UI
   */
  createLoadingBar() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Title
    const title = this.add.text(centerX, centerY - 100, '☕ Coffee Adventure Quest', {
      fontSize: '48px',
      fontFamily: FONTS.TITLE,
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#6F4E37',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // Loading text
    const loadingText = this.add.text(centerX, centerY + 50, 'Loading...', {
      fontSize: '24px',
      fontFamily: FONTS.TITLE,
      color: '#FFFFFF'
    });
    loadingText.setOrigin(0.5);

    // Progress bar background
    const barWidth = 400;
    const barHeight = 30;
    const barBg = this.add.rectangle(centerX, centerY, barWidth, barHeight, 0x333333);

    // Progress bar fill
    const barFill = this.add.rectangle(
      centerX - barWidth / 2,
      centerY,
      0,
      barHeight,
      0xFFD700
    );
    barFill.setOrigin(0, 0.5);

    // Update progress bar
    this.load.on('progress', (value) => {
      barFill.width = barWidth * value;
    });

    this.load.on('complete', () => {
      this.tweens.add({
        targets: [title, loadingText, barBg, barFill],
        alpha: 0,
        duration: 500
      });
    });
  }

  /**
   * Create placeholder graphics for the game
   */
  createPlaceholderGraphics() {
    // We'll create simple textures that scenes can use
    // These would normally be loaded as images

    // Coffee bean
    const beanGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    beanGraphics.fillStyle(COLORS.COFFEE_BROWN);
    beanGraphics.fillEllipse(30, 20, 30, 20);
    beanGraphics.lineStyle(2, 0x000000);
    beanGraphics.strokeEllipse(30, 20, 30, 20);
    beanGraphics.generateTexture('coffee-bean', 60, 40);
    beanGraphics.destroy();

    console.log('🎨 Placeholder graphics created');
  }

  /**
   * Show welcome screen before starting the game
   */
  showWelcomeScreen() {
    const centerX = POSITIONS.CENTER_X;
    const centerY = POSITIONS.CENTER_Y;

    // Background
    const bg = this.add.rectangle(centerX, centerY, 1920, 1080, COLORS.SKY_BLUE);

    // Title
    const title = this.add.text(centerX, centerY - 200, '☕ Coffee Adventure Quest 🎉', {
      fontSize: '64px',
      fontFamily: FONTS.TITLE,
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#6F4E37',
      strokeThickness: 8
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(centerX, centerY - 100, 'A Birthday Game for Jessi', {
      fontSize: '36px',
      fontFamily: FONTS.TITLE,
      color: '#FFFFFF',
      fontStyle: 'italic',
      stroke: '#000000',
      strokeThickness: 4
    });
    subtitle.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(centerX, centerY + 50,
      'Help brew the perfect caramel pistachio coffee!\n\n' +
      'Collect ingredients through fun mini-games,\n' +
      'then celebrate with dancing and sparkles! ✨', {
      fontSize: '24px',
      fontFamily: FONTS.TITLE,
      color: '#333333',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    // Start button
    const buttonBg = this.add.rectangle(centerX, centerY + 250, 300, 80, COLORS.PINK);
    buttonBg.setStrokeStyle(4, COLORS.GOLD);
    buttonBg.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(centerX, centerY + 250, 'Start Game! ☕', {
      fontSize: '32px',
      fontFamily: FONTS.TITLE,
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // Button hover effect
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(COLORS.SUNSET_ORANGE);
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(COLORS.PINK);
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scaleX: 1,
        scaleY: 1,
        duration: 200
      });
    });

    // Start game on click
    buttonBg.on('pointerdown', () => {
      this.audioManager = this.registry.get('audioManager');
      this.audioManager.playSound('click');

      TransitionManager.fadeOut(this).then(() => {
        this.scene.start(SCENES.COFFEE_BEAN, {
          stateManager: this.registry.get('stateManager'),
          audioManager: this.registry.get('audioManager')
        });
      });
    });

    // Pulse title animation
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
