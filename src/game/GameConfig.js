import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import LoginScene from './scenes/LoginScene';
import HubScene from './scenes/HubScene';
import PlantScene from './scenes/PlantScene';
import GrowScene from './scenes/GrowScene';
import AnimalScene from './scenes/AnimalScene';
import CompleteScene from './scenes/CompleteScene';

export const GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1a3a1a',
  parent: 'game-container',
  dom: {
    createContainer: true
  },
  scene: [BootScene, LoginScene, HubScene, PlantScene, GrowScene, AnimalScene, CompleteScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
