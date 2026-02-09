import Phaser from 'phaser';
import { SCENES, COLORS, POSITIONS, STICKER_KEYS, FONTS } from '../utils/Constants.js';
import PourMeter from '../game-objects/PourMeter.js';
import ParticleManager from '../systems/ParticleManager.js';
import StickerManager from '../systems/StickerManager.js';
import TransitionManager from '../systems/TransitionManager.js';

/**
 * MilkPourScene - Mini-game 2: Timing-based milk pouring
 */
export default class MilkPourScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MILK_POUR });
  }

  init(data) {
    this.stateManager = data.stateManager;
    this.audioManager = data.audioManager;
    this.pouring = false;
    this.currentRound = 0;
    this.totalRounds = 5; // Need to pour 5 times to fill the glass
    this.glassFullness = 0; // Track how full the glass is (0 to 1)
  }

  create() {
    // Fade in
    TransitionManager.fadeIn(this);

    // Initialize managers
    this.particleManager = new ParticleManager(this);
    this.particleManager.createSparkleEmitter();

    this.stickerManager = new StickerManager(this, this.stateManager);

    // Create background
    this.createBackground();

    // Create milk bottle and cup
    this.createMilkAndCup();

    // Create pour meter
    this.createPourMeter();

    // Show instructions
    this.showInstructions();
  }

  createBackground() {
    const bg = this.add.rectangle(POSITIONS.CENTER_X, POSITIONS.CENTER_Y, 1920, 1080, COLORS.CREAM);

    const counter = this.add.rectangle(POSITIONS.CENTER_X, 900, 1920, 400, 0xA0826D);

    const title = this.add.text(POSITIONS.CENTER_X, 100, 'Perfect Milk Pour', {
      fontSize: '48px',
      fontFamily: FONTS.TITLE,
      color: '#6F4E37',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
  }

  createMilkAndCup() {
    // Milk bottle sprite (cute pixel art!) - positioned on the counter
    this.milkBottle = this.add.image(400, 820, 'milk-bottle-sprite');
    this.milkBottle.setScale(0.2); // Scale to appropriate size

    // Coffee cup - clear glass positioned on the counter
    this.cupX = 1520;
    this.cupY = 825;

    // Glass cup body (clear/translucent)
    const cupBody = this.add.rectangle(this.cupX, this.cupY, 120, 150, 0xFFFFFF, 0.3);
    cupBody.setStrokeStyle(4, 0xCCCCCC);

    // Glass rim
    const cupTop = this.add.ellipse(this.cupX, this.cupY - 75, 130, 40, 0xFFFFFF, 0.4);
    cupTop.setStrokeStyle(4, 0xCCCCCC);

    // Cup fill level (will fill progressively with milk)
    // Position at bottom of cup, anchor at bottom, grows upward
    this.cupFill = this.add.rectangle(this.cupX, this.cupY + 75, 110, 0, COLORS.CREAM);
    this.cupFill.setOrigin(0.5, 1); // Anchor at bottom center

    // Round counter text
    this.roundText = this.add.text(this.cupX, this.cupY - 150, `Pour ${this.currentRound + 1}/${this.totalRounds}`, {
      fontSize: '24px',
      fontFamily: FONTS.TITLE,
      color: '#333333',
      fontStyle: 'bold'
    });
    this.roundText.setOrigin(0.5);
  }

  createPourMeter() {
    // Start with round 1 difficulty
    this.pourMeter = new PourMeter(this, POSITIONS.CENTER_X, 550, this.getDifficulty(0));

    // Make the whole scene clickable
    this.input.on('pointerdown', () => {
      this.handleClick();
    });
  }

  getDifficulty(round) {
    // Progressively shrink the target zone each round
    // Balanced difficulty that's challenging but fair
    const difficulties = [
      { min: 0.35, max: 0.65 }, // Round 1 - Easy (30% window)
      { min: 0.38, max: 0.62 }, // Round 2 - Medium (24% window)
      { min: 0.41, max: 0.59 }, // Round 3 - Medium-Hard (18% window)
      { min: 0.43, max: 0.57 }, // Round 4 - Hard (14% window)
      { min: 0.45, max: 0.55 }  // Round 5 - Challenging (10% window)
    ];
    return difficulties[round];
  }

  showInstructions() {
    const instructions = this.add.text(POSITIONS.CENTER_X, 250,
      'Click to start pouring, then click again when the meter is in the yellow zone!', {
      fontSize: '26px',
      fontFamily: FONTS.TITLE,
      color: '#333333',
      align: 'center',
      wordWrap: { width: 800 }
    });
    instructions.setOrigin(0.5);

    this.tweens.add({
      targets: instructions,
      alpha: 0,
      duration: 1000,
      delay: 4000,
      onComplete: () => instructions.destroy()
    });
  }

  handleClick() {
    if (!this.pouring && this.pourMeter.currentFill === 0) {
      // Start pouring
      this.pouring = true;
      this.pourMeter.startPouring();
    } else if (this.pouring) {
      // Stop pouring
      this.pouring = false;
      const success = this.pourMeter.stopPouring();

      if (success) {
        this.onPourSuccess();
      } else {
        this.onPourFail();
      }
    }
  }

  update(time, delta) {
    if (this.pourMeter) {
      this.pourMeter.update(delta);

      // Animate cup filling based on current round progress plus previous rounds
      // Fill upward from bottom - height increases as we pour
      const currentRoundProgress = this.pourMeter.currentFill / this.totalRounds;
      const totalProgress = this.glassFullness + currentRoundProgress;
      const maxFillHeight = 140; // Maximum fill height (cup is 150px tall)
      const fillHeight = maxFillHeight * totalProgress;

      // Set height to grow upward from bottom
      this.cupFill.height = fillHeight;
    }
  }

  onPourSuccess() {
    this.particleManager.sparkleAt(this.cupX, this.cupY, 20);
    TransitionManager.flash(this, COLORS.SUCCESS_GREEN);

    // Increment round and update glass fullness
    this.currentRound++;
    this.glassFullness = this.currentRound / this.totalRounds;

    this.time.delayedCall(1500, () => {
      if (this.currentRound >= this.totalRounds) {
        // All rounds complete - glass is full!
        this.completeMiniGame();
      } else {
        // More rounds needed - reset for next pour
        this.resetForNextRound();
      }
    });
  }

  onPourFail() {
    TransitionManager.shake(this, 0.005);

    this.time.delayedCall(1500, () => {
      // Reset for retry (same round)
      this.pourMeter.reset();
      this.pourMeter.setDifficulty(this.getDifficulty(this.currentRound));
      // Keep the glass at its current fullness from previous successful rounds
      const maxFillHeight = 140;
      this.cupFill.height = maxFillHeight * this.glassFullness;
    });
  }

  resetForNextRound() {
    // Show encouragement message with difficulty hint
    let encouragement = `Great! Pour ${this.currentRound + 1} of ${this.totalRounds}`;
    if (this.currentRound >= 4) {
      encouragement += '\nFinal pour! You got this! 🔥';
    } else if (this.currentRound >= 3) {
      encouragement += '\nGetting tricky now! 💪';
    }

    const msg = this.add.text(POSITIONS.CENTER_X, POSITIONS.CENTER_Y,
      encouragement, {
      fontSize: '32px',
      fontFamily: FONTS.TITLE,
      color: '#6F4E37',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4,
      align: 'center'
    });
    msg.setOrigin(0.5);
    msg.setAlpha(0);

    this.tweens.add({
      targets: msg,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 800,
      onComplete: () => msg.destroy()
    });

    // Update round counter
    this.roundText.setText(`Pour ${this.currentRound + 1}/${this.totalRounds}`);

    // Reset pour meter for next round with increased difficulty
    this.pourMeter.reset();
    this.pourMeter.setDifficulty(this.getDifficulty(this.currentRound));
  }

  completeMiniGame() {
    this.stateManager.markMiniGameComplete('milkPour', STICKER_KEYS.MILK);

    const successMsg = this.add.text(POSITIONS.CENTER_X, POSITIONS.CENTER_Y,
      '✨ Glass is Full! ✨\nPerfect milk pour!\nMilk added to coffee!', {
      fontSize: '42px',
      fontFamily: FONTS.TITLE,
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    successMsg.setOrigin(0.5);
    successMsg.setAlpha(0);

    this.tweens.add({
      targets: successMsg,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Extra sparkles for completing all rounds
    this.particleManager.sparkleAt(this.cupX, this.cupY, 40);

    this.time.delayedCall(2500, () => {
      TransitionManager.transitionTo(this, SCENES.CUTSCENE, {
        stateManager: this.stateManager,
        audioManager: this.audioManager,
        cutsceneId: 'beachArrival',
        nextScene: SCENES.BEACH_DISCOVERY
      });
    });
  }
}
