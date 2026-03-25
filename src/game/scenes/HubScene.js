function createButton(scene, x, y, label, onClick, bw) {
  const h = 52;
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12);

  const text = scene.add.text(0, 0, label, {
    fontSize: `${Math.round(bw * 0.08)}px`, color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [btn, text]);
  container.setSize(bw, h).setInteractive();

  container.on('pointerover', () => { btn.clear(); btn.fillStyle(0x8bc34a, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12); });
  container.on('pointerout',  () => { btn.clear(); btn.fillStyle(0x4caf50, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12); });
  container.on('pointerdown', onClick);
  return container;
}

export default class HubScene extends Phaser.Scene {
  constructor() { super({ key: 'HubScene' }); }

  init(data) {
    this.patientName = data.patientName || 'Explorer';
    this.round = data.round || 1;
    this.sessionId = data.sessionId || Date.now();
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const s = Math.min(W / 800, H / 600);

    // Sky + ground
    const bg = this.add.graphics();
    bg.fillStyle(0xb3e5fc, 1).fillRect(0, 0, W, H * 0.55);
    bg.fillStyle(0x1a3a1a, 1).fillRect(0, H * 0.55, W, H * 0.45);

    // Hills
    bg.fillStyle(0x4caf50, 1);
    bg.fillEllipse(W * 0.2, H * 0.58, W * 0.38, H * 0.24);
    bg.fillEllipse(W * 0.72, H * 0.58, W * 0.44, H * 0.26);
    bg.fillStyle(0x2d6a2d, 1);
    bg.fillEllipse(W * 0.5, H * 0.62, W * 0.4, H * 0.22);

    // Trees
    const tw = 50 * s, th = 100 * s;
    this._drawTree(W * 0.1,  H * 0.55, tw, th);
    this._drawTree(W * 0.24, H * 0.52, tw * 0.9, th * 0.9);
    this._drawTree(W * 0.9,  H * 0.52, tw, th);
    this._drawTree(W * 0.76, H * 0.55, tw * 0.9, th * 0.9);

    // Sun
    this.add.graphics().fillStyle(0xffe082, 1).fillCircle(W - 60 * s, 55 * s, 38 * s);

    // Round badge
    const bw = Math.round(110 * s), bh = Math.round(36 * s);
    this.add.graphics().fillStyle(0x4caf50, 0.9).fillRoundedRect(W - bw - 10, 10, bw, bh, 8);
    this.add.text(W - bw / 2 - 10, 10 + bh / 2, `Year ${this.round} of 6`, {
      fontSize: `${Math.round(13 * s)}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Title
    this.add.text(W / 2, H * 0.08, 'Your Jungle Journey', {
      fontSize: `${Math.round(30 * s)}px`, color: '#1a3a1a', fontStyle: 'bold',
      stroke: '#ffffff', strokeThickness: Math.round(3 * s)
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.16, `Year ${this.round} of 6 — ${this.patientName}'s Garden`, {
      fontSize: `${Math.round(17 * s)}px`, color: '#2d6a2d'
    }).setOrigin(0.5);

    // Info card
    const cardW = Math.min(440, W * 0.88);
    const cardH = Math.max(70, H * 0.16);
    const cardY = H * 0.22;
    this.add.graphics()
      .fillStyle(0x000000, 0.25)
      .fillRoundedRect(W / 2 - cardW / 2, cardY, cardW, cardH, 14);

    this.add.text(W / 2, cardY + cardH * 0.32, '🌿 Choose plants to grow in your jungle!', {
      fontSize: `${Math.round(15 * s)}px`, color: '#f9fbe7'
    }).setOrigin(0.5);
    this.add.text(W / 2, cardY + cardH * 0.68, 'Water them and watch animals visit 🦋', {
      fontSize: `${Math.round(13 * s)}px`, color: '#8bc34a'
    }).setOrigin(0.5);

    // Main button
    const btnW = Math.min(280, W * 0.7);
    createButton(this, W / 2, H * 0.52, 'Choose Your Plants →', () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('PlantScene', {
          patientName: this.patientName, round: this.round, sessionId: this.sessionId
        });
      });
    }, btnW);

    // Progress dots
    const dotY = H - Math.max(30, 35 * s);
    const dotR = Math.max(6, 10 * s);
    for (let i = 0; i < 6; i++) {
      const dotX = W / 2 + (i - 2.5) * dotR * 3;
      const dg = this.add.graphics();
      if (i < this.round) {
        dg.fillStyle(0x4caf50, 1).fillCircle(dotX, dotY, dotR);
      } else {
        dg.lineStyle(2, 0x4caf50, 1).strokeCircle(dotX, dotY, dotR);
      }
      if (i + 1 === this.round) {
        dg.lineStyle(3, 0xffe082, 1).strokeCircle(dotX, dotY, dotR + 3);
      }
    }
    this.add.text(W / 2, H - 10, 'Your Journey Progress', {
      fontSize: `${Math.round(11 * s)}px`, color: '#8bc34a'
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(400);
    this.scale.on('resize', () => {
      this.scene.restart({ patientName: this.patientName, round: this.round, sessionId: this.sessionId });
    }, this);
  }

  _drawTree(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x5d4037, 1).fillRect(x - w * 0.1, y - h * 0.4, w * 0.2, h * 0.4);
    g.fillStyle(0x2d6a2d, 1).fillTriangle(x, y - h, x - w / 2, y - h * 0.45, x + w / 2, y - h * 0.45);
    g.fillStyle(0x4caf50, 1).fillTriangle(x, y - h * 0.85, x - w * 0.55, y - h * 0.35, x + w * 0.55, y - h * 0.35);
    g.fillStyle(0x8bc34a, 1).fillTriangle(x, y - h * 0.7, x - w * 0.6, y - h * 0.25, x + w * 0.6, y - h * 0.25);
  }
}
