import { STICKER_KEYS } from '../utils/Constants.js';

/**
 * StateManager - Centralized game state management
 * Tracks progress through mini-games, unlocked stickers, and completion state
 */
export default class StateManager {
  constructor() {
    this.state = {
      currentScene: 'boot',
      progress: {
        beansCollected: 0,
        beansRequired: 5,
        milkPoured: false,
        ingredientFound: false,
        crabPhotographed: false,
        coffeeBrewedComplete: false
      },
      unlockedStickers: [],
      totalPlayTime: 0,
      completedMiniGames: []
    };

    this.eventEmitter = new Phaser.Events.EventEmitter();
  }

  /**
   * Unlock a sticker and emit event
   */
  unlockSticker(stickerKey) {
    if (!this.state.unlockedStickers.includes(stickerKey)) {
      this.state.unlockedStickers.push(stickerKey);
      this.eventEmitter.emit('sticker-unlocked', stickerKey);
      console.log(`✨ Sticker unlocked: ${stickerKey}`);
    }
  }

  /**
   * Mark a mini-game as complete and unlock its sticker
   */
  markMiniGameComplete(gameName, stickerKey) {
    if (!this.state.completedMiniGames.includes(gameName)) {
      this.state.completedMiniGames.push(gameName);
      this.unlockSticker(stickerKey);
      console.log(`🎮 Mini-game completed: ${gameName}`);
    }
  }

  /**
   * Update beans collected
   */
  collectBean() {
    this.state.progress.beansCollected++;
    return this.state.progress.beansCollected >= this.state.progress.beansRequired;
  }

  /**
   * Check if all beans are collected
   */
  areAllBeansCollected() {
    return this.state.progress.beansCollected >= this.state.progress.beansRequired;
  }

  /**
   * Get current state (immutable copy)
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Get unlocked stickers
   */
  getUnlockedStickers() {
    return [...this.state.unlockedStickers];
  }

  /**
   * Subscribe to state events
   */
  on(event, callback) {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Reset state (for replay)
   */
  reset() {
    this.state.progress = {
      beansCollected: 0,
      beansRequired: 5,
      milkPoured: false,
      ingredientFound: false,
      crabPhotographed: false,
      coffeeBrewedComplete: false
    };
    this.state.unlockedStickers = [];
    this.state.completedMiniGames = [];
    this.state.totalPlayTime = 0;
  }
}
