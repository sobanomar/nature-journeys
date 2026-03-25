function createButton(scene, x, y, label, onClick) {
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1);
  btn.fillRoundedRect(-130, -24, 260, 48, 12);

  const text = scene.add.text(0, 0, label, {
    fontSize: '20px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [btn, text]);
  container.setSize(260, 48);
  container.setInteractive();

  container.on('pointerover', () => {
    btn.clear(); btn.fillStyle(0x8bc34a, 1); btn.fillRoundedRect(-130, -24, 260, 48, 12);
  });
  container.on('pointerout', () => {
    btn.clear(); btn.fillStyle(0x4caf50, 1); btn.fillRoundedRect(-130, -24, 260, 48, 12);
  });
  container.on('pointerdown', onClick);
  return container;
}

export default class HubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HubScene' });
  }

  init(data) {
    this.patientName = data.patientName || 'Explorer';
    this.round = data.round || 1;
    this.sessionId = data.sessionId || Date.now();
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Sky
    const bg = this.add.graphics();
    bg.fillStyle(0xb3e5fc, 1);
    bg.fillRect(0, 0, W, H * 0.55);

    // Ground
    bg.fillStyle(0x1a3a1a, 1);
    bg.fillRect(0, H * 0.55, W, H * 0.45);

    // Rolling hills
    bg.fillStyle(0x4caf50, 1);
    bg.fillEllipse(W * 0.2, H * 0.58, 320, 140);
    bg.fillEllipse(W * 0.7, H * 0.58, 380, 160);
    bg.fillStyle(0x2d6a2d, 1);
    bg.fillEllipse(W * 0.5, H * 0.62, 340, 130);

    // Trees on hills
    this._drawTree(100, H * 0.55, 50, 100);
    this._drawTree(220, H * 0.52, 45, 90);
    this._drawTree(W - 100, H * 0.52, 50, 100);
    this._drawTree(W - 220, H * 0.55, 45, 90);

    // Sun
    const sun = this.add.graphics();
    sun.fillStyle(0xffe082, 1);
    sun.fillCircle(W - 80, 60, 40);

    // Round badge (top-right)
    this._drawRoundBadge(W - 20, 20, this.round);

    // Title
    this.add.text(W / 2, 55, `Your Jungle Journey`, {
      fontSize: '32px', color: '#1a3a1a', fontStyle: 'bold',
      stroke: '#ffffff', strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(W / 2, 100, `Year ${this.round} of 6 — ${this.patientName}'s Garden`, {
      fontSize: '20px', color: '#2d6a2d'
    }).setOrigin(0.5);

    // Info card
    const card = this.add.graphics();
    card.fillStyle(0x000000, 0.25);
    card.fillRoundedRect(W / 2 - 220, 140, 440, 100, 14);

    this.add.text(W / 2, 165, '🌿 Choose plants to grow in your jungle!', {
      fontSize: '17px', color: '#f9fbe7'
    }).setOrigin(0.5);

    this.add.text(W / 2, 198, 'Water them and watch animals visit 🦋', {
      fontSize: '15px', color: '#8bc34a'
    }).setOrigin(0.5);

    // Main button
    createButton(this, W / 2, 310, 'Choose Your Plants →', () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('PlantScene', {
          patientName: this.patientName,
          round: this.round,
          sessionId: this.sessionId
        });
      });
    });

    // Year indicator dots
    const dotY = H - 40;
    for (let i = 0; i < 6; i++) {
      const dotX = W / 2 - 75 + i * 30;
      const dotG = this.add.graphics();
      if (i < this.round) {
        dotG.fillStyle(0x4caf50, 1);
        dotG.fillCircle(dotX, dotY, 10);
      } else {
        dotG.lineStyle(2, 0x4caf50, 1);
        dotG.strokeCircle(dotX, dotY, 10);
      }
      if (i + 1 === this.round) {
        dotG.lineStyle(3, 0xffe082, 1);
        dotG.strokeCircle(dotX, dotY, 12);
      }
    }

    this.add.text(W / 2, H - 15, 'Your Journey Progress', {
      fontSize: '12px', color: '#8bc34a'
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(400);
  }

  _drawRoundBadge(x, y, round) {
    const g = this.add.graphics();
    g.fillStyle(0x4caf50, 0.9);
    g.fillRoundedRect(x - 110, y, 110, 36, 8);
    this.add.text(x - 55, y + 18, `Year ${round} of 6`, {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  _drawTree(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x5d4037, 1);
    g.fillRect(x - w * 0.1, y - h * 0.4, w * 0.2, h * 0.4);
    g.fillStyle(0x2d6a2d, 1);
    g.fillTriangle(x, y - h, x - w / 2, y - h * 0.45, x + w / 2, y - h * 0.45);
    g.fillStyle(0x4caf50, 1);
    g.fillTriangle(x, y - h * 0.85, x - w * 0.55, y - h * 0.35, x + w * 0.55, y - h * 0.35);
    g.fillStyle(0x8bc34a, 1);
    g.fillTriangle(x, y - h * 0.7, x - w * 0.6, y - h * 0.25, x + w * 0.6, y - h * 0.25);
  }
}
