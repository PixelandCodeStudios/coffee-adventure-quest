import { FONTS, COLORS, POSITIONS } from '../utils/Constants.js';

/**
 * DialogueManager - Handles chat bubbles with typewriter effect
 * Creates cute, emotionally warm dialogue for cutscenes
 */
export default class DialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.currentBubble = null;
    this.currentText = null;
    this.isTyping = false;
    this.skipRequested = false;
  }

  /**
   * Show a dialogue bubble with typewriter effect
   * @param {string} text - The text to display
   * @param {object} options - Configuration options
   * @returns {Promise} - Resolves when dialogue is complete
   */
  async showDialogue(text, options = {}) {
    const config = {
      speaker: options.speaker || 'narrator',
      duration: options.duration || null, // Auto-calculate if null
      position: options.position || 'bottom', // 'top', 'bottom', 'center'
      interrupt: options.interrupt || false,
      typeSpeed: options.typeSpeed || 40, // ms per character
      pauseAfter: options.pauseAfter || 1500, // ms to wait after typing complete
      backgroundColor: options.backgroundColor || 0xFFFFFF,
      textColor: options.textColor || '#333333',
      fontSize: options.fontSize || '28px',
      maxWidth: options.maxWidth || 800,
      ...options
    };

    // Interrupt existing dialogue if requested
    if (config.interrupt && this.currentBubble) {
      this.clearDialogue();
    }

    // Wait for existing dialogue to finish if not interrupting
    if (this.isTyping && !config.interrupt) {
      await this.waitForTyping();
    }

    this.isTyping = true;
    this.skipRequested = false;

    // Create bubble container
    const bubbleY = this.getBubbleY(config.position);
    const container = this.scene.add.container(POSITIONS.CENTER_X, bubbleY);
    container.setAlpha(0);
    container.setDepth(1000); // Always on top

    // Create bubble background
    const bubble = this.createBubble(text, config);
    container.add(bubble.background);

    // Create text object
    const textObj = this.scene.add.text(0, 0, '', {
      fontSize: config.fontSize,
      fontFamily: FONTS.TITLE,
      color: config.textColor,
      align: 'center',
      wordWrap: { width: config.maxWidth - 60 }
    });
    textObj.setOrigin(0.5);
    container.add(textObj);

    this.currentBubble = container;
    this.currentText = textObj;

    // Fade in bubble
    await this.fadeInBubble(container);

    // Add click to skip functionality
    const skipHandler = () => {
      this.skipRequested = true;
    };
    this.scene.input.once('pointerdown', skipHandler);

    // Typewriter effect
    await this.typeText(textObj, text, config.typeSpeed);

    // Remove skip handler if still active
    this.scene.input.off('pointerdown', skipHandler);

    // Pause after typing
    if (!this.skipRequested) {
      await this.delay(config.pauseAfter);
    }

    // Fade out and cleanup
    await this.fadeOutBubble(container);
    container.destroy();

    this.currentBubble = null;
    this.currentText = null;
    this.isTyping = false;

    return Promise.resolve();
  }

  /**
   * Show multiple dialogue bubbles in sequence
   * @param {Array} dialogues - Array of {text, options} objects
   */
  async showSequence(dialogues) {
    for (const dialogue of dialogues) {
      await this.showDialogue(dialogue.text, dialogue.options || {});
    }
  }

  /**
   * Create bubble background with proper sizing
   */
  createBubble(text, config) {
    // Create temporary text to measure size
    const tempText = this.scene.add.text(0, 0, text, {
      fontSize: config.fontSize,
      fontFamily: FONTS.TITLE,
      wordWrap: { width: config.maxWidth - 60 }
    });

    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy();

    const padding = 30;
    const bubbleWidth = Math.min(textWidth + padding * 2, config.maxWidth);
    const bubbleHeight = textHeight + padding * 2;

    // Create rounded rectangle bubble
    const background = this.scene.add.graphics();
    background.fillStyle(config.backgroundColor, 0.95);
    background.lineStyle(4, 0xE0E0E0, 1);

    // Draw rounded rectangle
    const radius = 20;
    const x = -bubbleWidth / 2;
    const y = -bubbleHeight / 2;

    background.beginPath();
    background.moveTo(x + radius, y);
    background.lineTo(x + bubbleWidth - radius, y);
    background.arc(x + bubbleWidth - radius, y + radius, radius, -Math.PI / 2, 0);
    background.lineTo(x + bubbleWidth, y + bubbleHeight - radius);
    background.arc(x + bubbleWidth - radius, y + bubbleHeight - radius, radius, 0, Math.PI / 2);
    background.lineTo(x + radius, y + bubbleHeight);
    background.arc(x + radius, y + bubbleHeight - radius, radius, Math.PI / 2, Math.PI);
    background.lineTo(x, y + radius);
    background.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
    background.closePath();
    background.fillPath();
    background.strokePath();

    return { background, width: bubbleWidth, height: bubbleHeight };
  }

  /**
   * Get Y position for bubble based on position setting
   */
  getBubbleY(position) {
    switch (position) {
      case 'top':
        return 200;
      case 'center':
        return POSITIONS.CENTER_Y;
      case 'bottom':
      default:
        return 900;
    }
  }

  /**
   * Fade in bubble animation
   */
  fadeInBubble(bubble) {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: bubble,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => resolve()
      });
    });
  }

  /**
   * Fade out bubble animation
   */
  fadeOutBubble(bubble) {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: bubble,
        alpha: 0,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 250,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });
  }

  /**
   * Typewriter effect for text
   */
  typeText(textObj, fullText, speed) {
    return new Promise((resolve) => {
      let currentIndex = 0;
      const totalLength = fullText.length;

      const typeTimer = this.scene.time.addEvent({
        delay: speed,
        repeat: totalLength - 1,
        callback: () => {
          if (this.skipRequested) {
            // Skip to end
            textObj.setText(fullText);
            typeTimer.remove();
            resolve();
            return;
          }

          currentIndex++;
          textObj.setText(fullText.substring(0, currentIndex));

          if (currentIndex >= totalLength) {
            resolve();
          }
        }
      });
    });
  }

  /**
   * Wait for current typing to finish
   */
  waitForTyping() {
    return new Promise((resolve) => {
      const checkInterval = this.scene.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
          if (!this.isTyping) {
            checkInterval.remove();
            resolve();
          }
        }
      });
    });
  }

  /**
   * Clear current dialogue immediately
   */
  clearDialogue() {
    if (this.currentBubble) {
      this.currentBubble.destroy();
      this.currentBubble = null;
      this.currentText = null;
    }
    this.isTyping = false;
  }

  /**
   * Helper delay function
   */
  delay(ms) {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(ms, () => resolve());
    });
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.clearDialogue();
  }
}
