import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS, STICKER_KEYS, FONTS } from '../utils/Constants.js';
import ParticleManager from '../systems/ParticleManager.js';
import StickerManager from '../systems/StickerManager.js';
import TransitionManager from '../systems/TransitionManager.js';

/**
 * BrewingScene - Mini-game 5: Combine all ingredients to brew the perfect coffee
 */
export default class BrewingScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BREWING });
  }

  init(data) {
    this.stateManager = data.stateManager;
    this.audioManager = data.audioManager;
    this.ingredientsAdded = 0;
    this.totalIngredients = 3;
  }

  create() {
    TransitionManager.fadeIn(this);

    this.particleManager = new ParticleManager(this);
    this.particleManager.createSparkleEmitter();

    this.stickerManager = new StickerManager(this, this.stateManager);

    this.createBackground();
    this.createCoffeeCup();
    this.createIngredients();
    this.showInstructions();
  }

  createBackground() {
    const bg = this.add.rectangle(POSITIONS.CENTER_X, POSITIONS.CENTER_Y, 1920, 1080, COLORS.CREAM);
    const counter = this.add.rectangle(POSITIONS.CENTER_X, 900, 1920, 400, 0xA0826D);

    const title = this.add.text(POSITIONS.CENTER_X, 100, '☕ Brewing the Perfect Coffee', {
      fontSize: '48px',
      fontFamily: FONTS.TITLE,
      color: '#6F4E37',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
  }

  createCoffeeCup() {
    const cupX = POSITIONS.CENTER_X;
    const cupY = 600;

    // Cup body
    this.cupBody = this.add.rectangle(cupX, cupY, 200, 250, 0x8B4513);
    this.cupBody.setStrokeStyle(5, COLORS.BLACK);

    // Cup top
    this.cupTop = this.add.ellipse(cupX, cupY - 125, 210, 60, 0xA0522D);
    this.cupTop.setStrokeStyle(5, COLORS.BLACK);

    // Coffee fill (starts empty)
    this.coffeeFill = this.add.rectangle(cupX, cupY + 125, 190, 0, COLORS.COFFEE_BROWN);
    this.coffeeFill.setOrigin(0.5, 1);

    // Progress text
    this.progressText = this.add.text(cupX, cupY + 180, `0 / ${this.totalIngredients} ingredients`, {
      fontSize: '28px',
      fontFamily: FONTS.TITLE,
      color: '#333333',
      fontStyle: 'bold'
    });
    this.progressText.setOrigin(0.5);

    // Drop zone indicator
    this.dropZone = this.add.circle(cupX, cupY, 150);
    this.dropZone.setStrokeStyle(3, COLORS.GOLD, 0.5);
    this.dropZone.setFillStyle(COLORS.GOLD, 0.1);
  }

  createIngredients() {
    this.ingredients = [];

    // Coffee beans (already ground)
    const beans = this.createIngredient(300, 400, 'Coffee\nBeans', COLORS.COFFEE_BROWN);

    // Milk
    const milk = this.createIngredient(POSITIONS.CENTER_X, 350, 'Milk', COLORS.CREAM);

    // Caramel Pistachio
    const caramel = this.createIngredient(1600, 400, 'Caramel\nPistachio', 0xD2691E);

    this.ingredients.push(beans, milk, caramel);
  }

  createIngredient(x, y, label, color) {
    const container = this.add.container(x, y);

    // Ingredient visual
    const graphic = this.add.rectangle(0, 0, 120, 80, color);
    graphic.setStrokeStyle(4, COLORS.BLACK);
    container.add(graphic);

    // Label
    const text = this.add.text(0, 0, label, {
      fontSize: '18px',
      fontFamily: FONTS.TITLE,
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center'
    });
    text.setOrigin(0.5);
    container.add(text);

    // Make draggable
    container.setSize(120, 80);
    container.setInteractive({ draggable: true, useHandCursor: true });

    const startX = x;
    const startY = y;

    container.on('dragstart', () => {
      container.setScale(1.1);
      container.setAlpha(0.8);
      this.audioManager?.playSound('click');
    });

    container.on('drag', (pointer, dragX, dragY) => {
      container.x = dragX;
      container.y = dragY;
    });

    container.on('dragend', () => {
      container.setScale(1);
      container.setAlpha(1);

      // Check if dropped in cup
      const distance = Phaser.Math.Distance.Between(
        container.x, container.y,
        POSITIONS.CENTER_X, 600
      );

      if (distance < 150 && !container.getData('added')) {
        this.addIngredient(container);
      } else {
        // Return to start
        this.tweens.add({
          targets: container,
          x: startX,
          y: startY,
          duration: 300,
          ease: 'Back.easeOut'
        });
      }
    });

    // Float animation
    this.tweens.add({
      targets: container,
      y: y - 10,
      duration: 1200 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  addIngredient(ingredientContainer) {
    ingredientContainer.setData('added', true);
    ingredientContainer.removeInteractive();

    this.audioManager?.playSound('pour');

    // Shrink and move into cup
    this.tweens.add({
      targets: ingredientContainer,
      x: POSITIONS.CENTER_X,
      y: 600,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        ingredientContainer.destroy();
      }
    });

    this.ingredientsAdded++;
    this.progressText.setText(`${this.ingredientsAdded} / ${this.totalIngredients} ingredients`);

    // Fill cup progressively
    const fillHeight = (240 / this.totalIngredients) * this.ingredientsAdded;
    this.tweens.add({
      targets: this.coffeeFill,
      height: fillHeight,
      duration: 500,
      ease: 'Power2'
    });

    this.particleManager?.sparkleAt(POSITIONS.CENTER_X, 600, 15);

    // Check if all ingredients added
    if (this.ingredientsAdded >= this.totalIngredients) {
      this.time.delayedCall(800, () => {
        this.stirAndDecorate();
      });
    }
  }

  showInstructions() {
    const instructions = this.add.text(POSITIONS.CENTER_X, 250,
      'Drag all 3 ingredients into the cup to brew your coffee!', {
      fontSize: '28px',
      fontFamily: FONTS.TITLE,
      color: '#333333',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    this.tweens.add({
      targets: instructions,
      alpha: 0,
      duration: 1000,
      delay: 3500,
      onComplete: () => instructions.destroy()
    });
  }

  stirAndDecorate() {
    // Remove drop zone
    this.dropZone.destroy();

    // Stir animation
    const spoon = this.add.rectangle(POSITIONS.CENTER_X + 80, 550, 20, 120, COLORS.SILVER);
    spoon.setStrokeStyle(2, COLORS.BLACK);

    this.tweens.add({
      targets: spoon,
      angle: 360,
      duration: 2000,
      repeat: 2,
      onComplete: () => {
        spoon.destroy();
        this.addFoamArt();
      }
    });

    // Bubble effect
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 400, () => {
        const bubble = this.add.circle(
          POSITIONS.CENTER_X + Phaser.Math.Between(-60, 60),
          620,
          Phaser.Math.Between(5, 10),
          COLORS.CREAM,
          0.6
        );

        this.tweens.add({
          targets: bubble,
          y: 500,
          alpha: 0,
          duration: 1000,
          ease: 'Power1',
          onComplete: () => bubble.destroy()
        });
      });
    }
  }

  addFoamArt() {
    // Foam on top
    const foam = this.add.ellipse(POSITIONS.CENTER_X, 475, 190, 60, COLORS.CREAM);
    foam.setStrokeStyle(3, COLORS.BLACK);

    // Smiley face in foam
    const leftEye = this.add.circle(POSITIONS.CENTER_X - 30, 470, 5, COLORS.COFFEE_BROWN);
    const rightEye = this.add.circle(POSITIONS.CENTER_X + 30, 470, 5, COLORS.COFFEE_BROWN);

    const smile = this.add.graphics();
    smile.lineStyle(3, COLORS.COFFEE_BROWN);
    smile.arc(POSITIONS.CENTER_X, 475, 30, 0.2, Math.PI - 0.2, false);
    smile.strokePath();

    this.particleManager?.createHearts(POSITIONS.CENTER_X, 400);

    this.time.delayedCall(1500, () => {
      this.completeMiniGame();
    });
  }

  completeMiniGame() {
    this.stateManager.markMiniGameComplete('brewing', STICKER_KEYS.CUP);
    TransitionManager.flash(this, COLORS.GOLD);

    const msg = this.add.text(POSITIONS.CENTER_X, POSITIONS.CENTER_Y,
      '☕ Perfect Coffee! ✨\n🎉 Ready to celebrate!', {
      fontSize: '48px',
      fontFamily: FONTS.TITLE,
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    msg.setOrigin(0.5);
    msg.setAlpha(0);

    this.tweens.add({
      targets: msg,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      ease: 'Back.easeOut'
    });

    this.time.delayedCall(3000, () => {
      TransitionManager.transitionTo(this, SCENES.CELEBRATION, {
        stateManager: this.stateManager,
        audioManager: this.audioManager
      });
    });
  }
}
