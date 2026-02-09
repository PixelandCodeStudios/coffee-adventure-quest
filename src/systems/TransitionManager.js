import { TIMING } from '../utils/Constants.js';

/**
 * TransitionManager - Handles smooth scene transitions with fade effects
 */
export default class TransitionManager {
  /**
   * Fade out the current scene
   */
  static fadeOut(scene, duration = TIMING.FADE_DURATION) {
    return new Promise((resolve) => {
      const camera = scene.cameras.main;

      camera.fadeOut(duration, 0, 0, 0);

      camera.once('camerafadeoutcomplete', () => {
        resolve();
      });
    });
  }

  /**
   * Fade in the current scene
   */
  static fadeIn(scene, duration = TIMING.FADE_DURATION) {
    return new Promise((resolve) => {
      const camera = scene.cameras.main;

      camera.fadeIn(duration, 0, 0, 0);

      camera.once('camerafadeincomplete', () => {
        resolve();
      });
    });
  }

  /**
   * Transition to a new scene with fade effect
   */
  static async transitionTo(currentScene, nextSceneKey, data = {}) {
    await this.fadeOut(currentScene);
    currentScene.scene.start(nextSceneKey, data);
  }

  /**
   * Crossfade between scenes
   */
  static crossfade(currentScene, nextSceneKey, data = {}, duration = TIMING.FADE_DURATION) {
    // Start the new scene in parallel
    currentScene.scene.launch(nextSceneKey, data);

    // Get the next scene
    const nextScene = currentScene.scene.get(nextSceneKey);

    // Fade out current, fade in next
    this.fadeOut(currentScene, duration);

    setTimeout(() => {
      this.fadeIn(nextScene, duration);
      currentScene.scene.stop();
    }, duration / 2);
  }

  /**
   * Flash effect (for success moments)
   */
  static flash(scene, color = 0xFFFFFF, duration = 300) {
    return new Promise((resolve) => {
      const camera = scene.cameras.main;

      camera.flash(duration,
        (color >> 16) & 255,  // R
        (color >> 8) & 255,   // G
        color & 255           // B
      );

      camera.once('cameraflashcomplete', () => {
        resolve();
      });
    });
  }

  /**
   * Shake effect (for errors or impacts)
   */
  static shake(scene, intensity = 0.01, duration = 300) {
    return new Promise((resolve) => {
      const camera = scene.cameras.main;

      camera.shake(duration, intensity);

      camera.once('camerashakecomplete', () => {
        resolve();
      });
    });
  }

  /**
   * Zoom transition
   */
  static zoomTransition(scene, zoomLevel = 1.5, duration = 800) {
    return new Promise((resolve) => {
      const camera = scene.cameras.main;
      const originalZoom = camera.zoom;

      scene.tweens.add({
        targets: camera,
        zoom: zoomLevel,
        duration: duration / 2,
        ease: 'Power2',
        yoyo: true,
        onComplete: () => {
          camera.zoom = originalZoom;
          resolve();
        }
      });
    });
  }
}
