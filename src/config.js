import Phaser from 'phaser';
import { GAME_CONFIG } from './utils/Constants.js';
import BootScene from './scenes/BootScene.js';
import CutsceneScene from './scenes/CutsceneScene.js';
import CoffeeBeanScene from './scenes/CoffeeBeanScene.js';
import MilkPourScene from './scenes/MilkPourScene.js';
import BeachDiscoveryScene from './scenes/BeachDiscoveryScene.js';
import CrabPhotographyScene from './scenes/CrabPhotographyScene.js';
import BrewingScene from './scenes/BrewingScene.js';
import CelebrationScene from './scenes/CelebrationScene.js';

/**
 * Phaser Game Configuration
 * Sets up responsive scaling, physics, and scene management
 */
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    min: {
      width: GAME_CONFIG.MIN_WIDTH,
      height: GAME_CONFIG.MIN_HEIGHT
    },
    max: {
      width: GAME_CONFIG.WIDTH,
      height: GAME_CONFIG.HEIGHT
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    CutsceneScene,
    CoffeeBeanScene,
    MilkPourScene,
    BeachDiscoveryScene,
    CrabPhotographyScene,
    BrewingScene,
    CelebrationScene
  ],
  input: {
    activePointers: 3  // Support multi-touch
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false
  }
};

export default config;
