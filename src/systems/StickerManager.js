import { STICKER_KEYS, TIMING, COLORS } from '../utils/Constants.js';

/**
 * StickerManager - Handles sticker unlock animations and display
 */
export default class StickerManager {
  constructor(scene, stateManager) {
    this.scene = scene;
    this.stateManager = stateManager;

    // Subscribe to sticker unlock events
    this.stateManager.on('sticker-unlocked', (stickerKey) => {
      this.showStickerPopup(stickerKey);
    });
  }

  /**
   * Show sticker unlock popup animation
   */
  showStickerPopup(stickerKey) {
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // Create background overlay
    const overlay = this.scene.add.rectangle(
      centerX, centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000, 0.7
    );
    overlay.setDepth(900);

    // Create sticker display card
    const card = this.scene.add.container(centerX, centerY - 1000);
    card.setDepth(950);

    // Card background
    const cardBg = this.scene.add.rectangle(0, 0, 400, 300, COLORS.WHITE);
    cardBg.setStrokeStyle(8, COLORS.GOLD);
    card.add(cardBg);

    // Sticker graphic (placeholder for now)
    const stickerGraphic = this.createStickerGraphic(stickerKey);
    card.add(stickerGraphic);

    // "Sticker Unlocked!" text
    const unlockedText = this.scene.add.text(0, -100, 'Sticker Unlocked!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    unlockedText.setOrigin(0.5);
    card.add(unlockedText);

    // Sticker name
    const nameText = this.scene.add.text(0, 100, this.getStickerName(stickerKey), {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#333333',
      fontStyle: 'bold'
    });
    nameText.setOrigin(0.5);
    card.add(nameText);

    // Animate card sliding in
    this.scene.tweens.add({
      targets: card,
      y: centerY,
      duration: 600,
      ease: 'Back.easeOut'
    });

    // Add sparkle effects around the card
    this.scene.time.delayedCall(600, () => {
      this.scene.particleManager?.sparkleAt(centerX - 150, centerY, 10);
      this.scene.particleManager?.sparkleAt(centerX + 150, centerY, 10);
    });

    // Play sound
    this.scene.audioManager?.playSound('sparkle');

    // Auto-dismiss after delay
    this.scene.time.delayedCall(TIMING.STICKER_POPUP, () => {
      this.dismissPopup(overlay, card);
    });

    // Click to dismiss
    overlay.setInteractive();
    overlay.on('pointerdown', () => {
      this.dismissPopup(overlay, card);
    });
  }

  /**
   * Dismiss the popup
   */
  dismissPopup(overlay, card) {
    // Prevent multiple dismissals
    if (overlay.getData('dismissing')) return;
    overlay.setData('dismissing', true);

    this.scene.tweens.add({
      targets: card,
      y: -1000,
      alpha: 0,
      duration: 400,
      ease: 'Back.easeIn'
    });

    this.scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        overlay.destroy();
        card.destroy();
      }
    });
  }

  /**
   * Create a placeholder sticker graphic
   */
  createStickerGraphic(stickerKey) {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(4, COLORS.BLACK);

    switch (stickerKey) {
      case STICKER_KEYS.BEAN:
        graphics.fillStyle(COLORS.COFFEE_BROWN);
        graphics.fillEllipse(0, 0, 60, 40);
        graphics.strokeEllipse(0, 0, 60, 40);
        break;

      case STICKER_KEYS.MILK:
        graphics.fillStyle(COLORS.CREAM);
        graphics.fillRoundedRect(-30, -40, 60, 80, 10);
        graphics.strokeRoundedRect(-30, -40, 60, 80, 10);
        break;

      case STICKER_KEYS.SHELL:
        graphics.fillStyle(COLORS.PINK);
        graphics.fillCircle(0, 0, 35);
        graphics.strokeCircle(0, 0, 35);
        // Shell ridges
        for (let i = 0; i < 5; i++) {
          graphics.lineStyle(2, COLORS.BLACK);
          graphics.lineBetween(-30, -20 + i * 10, 30, -20 + i * 10);
        }
        break;

      case STICKER_KEYS.CRAB:
        graphics.fillStyle(COLORS.SUNSET_ORANGE);
        graphics.fillEllipse(0, 0, 50, 30);
        graphics.strokeEllipse(0, 0, 50, 30);
        // Eyes
        graphics.fillStyle(COLORS.BLACK);
        graphics.fillCircle(-10, -5, 4);
        graphics.fillCircle(10, -5, 4);
        break;

      case STICKER_KEYS.CUP:
        graphics.fillStyle(COLORS.COFFEE_BROWN);
        graphics.fillRoundedRect(-25, -30, 50, 60, 8);
        graphics.strokeRoundedRect(-25, -30, 50, 60, 8);
        // Foam
        graphics.fillStyle(COLORS.CREAM);
        graphics.fillCircle(0, -30, 28);
        graphics.strokeCircle(0, -30, 28);
        break;

      default:
        graphics.fillStyle(COLORS.GOLD);
        graphics.fillStar(0, 0, 5, 40, 20, 0);
        graphics.strokeStar(0, 0, 5, 40, 20, 0);
    }

    return graphics;
  }

  /**
   * Get display name for sticker
   */
  getStickerName(stickerKey) {
    const names = {
      [STICKER_KEYS.BEAN]: '☕ Coffee Bean',
      [STICKER_KEYS.MILK]: '🥛 Fresh Milk',
      [STICKER_KEYS.SHELL]: '🐚 Beach Shell',
      [STICKER_KEYS.CRAB]: '🦀 Happy Crab',
      [STICKER_KEYS.CUP]: '🎉 Perfect Coffee'
    };
    return names[stickerKey] || '⭐ Special Sticker';
  }

  /**
   * Clean up
   */
  destroy() {
    // Nothing to clean up currently
  }
}
