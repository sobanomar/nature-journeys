import { gameApi } from '../../api/gameApi';

function createButton(scene, x, y, label, onClick) {
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1);
  btn.fillRoundedRect(-120, -24, 240, 48, 12);

  const text = scene.add.text(0, 0, label, {
    fontSize: '20px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [btn, text]);
  container.setSize(240, 48);
  container.setInteractive();

  container.on('pointerover', () => {
    btn.clear();
    btn.fillStyle(0x8bc34a, 1);
    btn.fillRoundedRect(-120, -24, 240, 48, 12);
  });
  container.on('pointerout', () => {
    btn.clear();
    btn.fillStyle(0x4caf50, 1);
    btn.fillRoundedRect(-120, -24, 240, 48, 12);
  });
  container.on('pointerdown', onClick);
  return container;
}

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoginScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background layers
    const bg = this.add.graphics();
    bg.fillStyle(0x1a3a1a, 1);
    bg.fillRect(0, 0, W, H);

    // Sky strip
    bg.fillStyle(0x2d6a2d, 1);
    bg.fillRect(0, 0, W, H * 0.4);

    // Ground strip
    bg.fillStyle(0x1a3a1a, 1);
    bg.fillRect(0, H * 0.4, W, H * 0.6);

    // Decorative trees (left & right)
    this._drawTree(120, H - 60, 60, 120);
    this._drawTree(W - 120, H - 60, 60, 120);
    this._drawTree(60, H - 40, 40, 80);
    this._drawTree(W - 60, H - 40, 40, 80);

    // Sun
    const sun = this.add.graphics();
    sun.fillStyle(0xffe082, 1);
    sun.fillCircle(W - 80, 70, 35);

    // Title
    this.add.text(W / 2, 110, 'Nature Journeys 🌿', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#1a3a1a',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(W / 2, 165, 'A Therapeutic Jungle Adventure', {
      fontSize: '18px',
      color: '#b3e5fc'
    }).setOrigin(0.5);

    // Card background
    const card = this.add.graphics();
    card.fillStyle(0x000000, 0.3);
    card.fillRoundedRect(W / 2 - 200, 210, 400, 240, 16);

    this.add.text(W / 2, 250, 'What is your name?', {
      fontSize: '20px',
      color: '#f9fbe7',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // DOM input
    const inputEl = this.add.dom(W / 2, 305).createElement('input');
    inputEl.node.type = 'text';
    inputEl.node.placeholder = 'Enter your name...';
    inputEl.node.maxLength = 20;
    Object.assign(inputEl.node.style, {
      width: '260px',
      height: '44px',
      fontSize: '18px',
      borderRadius: '10px',
      border: '2px solid #4caf50',
      padding: '0 12px',
      background: '#f9fbe7',
      color: '#1a3a1a',
      outline: 'none',
      textAlign: 'center'
    });

    // Round indicator
    this.add.text(W / 2, 370, 'Round 1 of 6', {
      fontSize: '15px',
      color: '#8bc34a'
    }).setOrigin(0.5);

    // Start button
    createButton(this, W / 2, 420, 'Start Adventure 🌱', async () => {
      const name = inputEl.node.value.trim() || 'Explorer';
      await gameApi.startSession(name);
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('HubScene', { patientName: name, round: 1, sessionId: Date.now() });
      });
    });

    this.cameras.main.fadeIn(400);
  }

  _drawTree(x, y, w, h) {
    const g = this.add.graphics();
    // Trunk
    g.fillStyle(0x5d4037, 1);
    g.fillRect(x - w * 0.1, y - h * 0.4, w * 0.2, h * 0.4);
    // Canopy layers
    g.fillStyle(0x2d6a2d, 1);
    g.fillTriangle(x, y - h, x - w / 2, y - h * 0.45, x + w / 2, y - h * 0.45);
    g.fillStyle(0x4caf50, 1);
    g.fillTriangle(x, y - h * 0.85, x - w * 0.55, y - h * 0.35, x + w * 0.55, y - h * 0.35);
    g.fillStyle(0x8bc34a, 1);
    g.fillTriangle(x, y - h * 0.7, x - w * 0.6, y - h * 0.25, x + w * 0.6, y - h * 0.25);
  }
}
