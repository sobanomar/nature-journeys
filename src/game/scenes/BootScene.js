export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // No assets to load — using Graphics API throughout
  }

  create() {
    this.scene.start('LoginScene');
  }
}
