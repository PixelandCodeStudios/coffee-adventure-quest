// Game Constants and Configuration Values
export const COLORS = {
  // Pastel color palette
  COFFEE_BROWN: 0x6F4E37,
  CREAM: 0xFFFDD0,
  PINK: 0xFFB6C1,
  SKY_BLUE: 0x87CEEB,
  SAND: 0xF4A460,
  OCEAN_BLUE: 0x4A90E2,
  GRASS_GREEN: 0x90EE90,
  SUNSET_ORANGE: 0xFFB347,
  LAVENDER: 0xE6E6FA,
  MINT: 0x98FF98,

  // UI colors
  WHITE: 0xFFFFFF,
  BLACK: 0x000000,
  GOLD: 0xFFD700,
  SILVER: 0xC0C0C0,
  SUCCESS_GREEN: 0x00FF00,
  ERROR_RED: 0xFF0000,
  WARNING_YELLOW: 0xFFFF00
};

export const GAME_CONFIG = {
  WIDTH: 1920,
  HEIGHT: 1080,
  MIN_WIDTH: 375,
  MIN_HEIGHT: 667,
  BACKGROUND_COLOR: '#87CEEB'
};

export const SCENES = {
  BOOT: 'BootScene',
  COFFEE_BEAN: 'CoffeeBeanScene',
  MILK_POUR: 'MilkPourScene',
  BEACH_DISCOVERY: 'BeachDiscoveryScene',
  CRAB_PHOTOGRAPHY: 'CrabPhotographyScene',
  BREWING: 'BrewingScene',
  CELEBRATION: 'CelebrationScene'
};

export const TIMING = {
  SCENE_TRANSITION: 800,
  FADE_DURATION: 500,
  STICKER_POPUP: 1500,
  SPARKLE_INTERVAL: 1000,
  DANCE_CYCLE: 2000,
  ORBIT_SPEED: 0.02
};

export const POSITIONS = {
  CENTER_X: 960,
  CENTER_Y: 540,
  GROUND_Y: 850,
  SAND_Y: 900
};

export const AUDIO_KEYS = {
  GRIND: 'grind',
  POUR: 'pour',
  CLICK: 'click',
  CAMERA: 'camera',
  CRAB_SCUTTLE: 'crab-scuttle',
  SIP: 'sip',
  SPARKLE: 'sparkle',
  BEACH_WAVES: 'beach-waves',
  CELEBRATION: 'celebration'
};

export const STICKER_KEYS = {
  BEAN: 'sticker-bean',
  MILK: 'sticker-milk',
  SHELL: 'sticker-shell',
  CRAB: 'sticker-crab',
  CUP: 'sticker-cup'
};
