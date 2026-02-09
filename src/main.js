import Phaser from 'phaser';
import config from './config.js';

/**
 * Coffee Adventure Quest - Main Entry Point
 * A birthday game for Jessi ☕🎉
 */

console.log('🎮 Starting Coffee Adventure Quest...');
console.log('💖 Made with love for Jessi\'s birthday!');

// Initialize Phaser game
const game = new Phaser.Game(config);

// Export for debugging (optional)
window.game = game;

console.log('✨ Game initialized! Enjoy the adventure!');
