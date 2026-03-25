function createButton(scene, x, y, label, onClick, bw) {
  const h = 50;
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12);

  const text = scene.add.text(0, 0, label, {
    fontSize: `${Math.round(bw * 0.085)}px`, color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [btn, text]);
  container.setSize(bw, h).setInteractive();

  container.on('pointerover', () => { btn.clear(); btn.fillStyle(0x8bc34a, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12); });
  container.on('pointerout',  () => { btn.clear(); btn.fillStyle(0x4caf50, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12); });
  container.on('pointerdown', onClick);
  return container;
}

const PLANTS = [
  { name: 'Fern',      desc: 'Loves shade & moisture', color: 0x4caf50 },
  { name: 'Oak Tree',  desc: 'Strong & long-lasting',  color: 0x2d6a2d },
  { name: 'Bamboo',    desc: 'Grows tall & fast',      color: 0x8bc34a },
  { name: 'Sunflower', desc: 'Follows the sun 🌻',     color: 0xffe082 },
];

export default class PlantScene extends Phaser.Scene {
  constructor() { super({ key: 'PlantScene' }); }

  init(data) {
    this.patientName = data.patientName || 'Explorer';
    this.round = data.round || 1;
    this.sessionId = data.sessionId || Date.now();
    this.selected = [];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const s = Math.min(W / 800, H / 600);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a3a1a, 1).fillRect(0, 0, W, H);
    bg.fillStyle(0x2d6a2d, 0.5).fillRect(0, H * 0.6, W, H * 0.4);

    // Round badge
    const bw = Math.round(110 * s), bh = Math.round(36 * s);
    this.add.graphics().fillStyle(0x4caf50, 0.9).fillRoundedRect(W - bw - 10, 10, bw, bh, 8);
    this.add.text(W - bw / 2 - 10, 10 + bh / 2, `Year ${this.round} of 6`, {
      fontSize: `${Math.round(13 * s)}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Title
    this.add.text(W / 2, H * 0.07, 'Choose 2 Plants 🌱', {
      fontSize: `${Math.round(28 * s)}px`, color: '#ffffff', fontStyle: 'bold',
      stroke: '#1a3a1a', strokeThickness: Math.round(3 * s)
    }).setOrigin(0.5);
    this.add.text(W / 2, H * 0.14, 'Tap two plants to grow in your jungle', {
      fontSize: `${Math.round(14 * s)}px`, color: '#8bc34a'
    }).setOrigin(0.5);

    // Card grid — 2 columns always, sizes adapt to screen
    const cols = 2;
    const padding = Math.max(12, W * 0.04);
    const gapX = Math.max(8, W * 0.02);
    const gapY = Math.max(8, H * 0.015);
    const cardW = (W - padding * 2 - gapX) / cols;
    const cardH = Math.min(cardW * 1.1, (H * 0.62) / 2 - gapY);
    const gridTop = H * 0.18;

    this.plantCards = [];

    PLANTS.forEach((plant, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = padding + col * (cardW + gapX) + cardW / 2;
      const cy = gridTop + row * (cardH + gapY) + cardH / 2;

      // Card BG
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x000000, 0.3).fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);

      // Plant sprite
      const pg = this.add.graphics();
      const sh = cardH * 0.22, sw = cardW * 0.08;
      const leafH = cardH * 0.22, leafW = cardW * 0.38;
      pg.fillStyle(0x5d4037, 1).fillRect(cx - sw / 2, cy - sh, sw, sh);
      pg.fillStyle(plant.color, 1).fillRect(cx - leafW / 2, cy - sh - leafH, leafW, leafH);

      // Labels
      this.add.text(cx, cy + cardH * 0.2, plant.name, {
        fontSize: `${Math.round(13 * s)}px`, color: '#f9fbe7', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(cx, cy + cardH * 0.34, plant.desc, {
        fontSize: `${Math.round(10 * s)}px`, color: '#8bc34a', wordWrap: { width: cardW - 8 }
      }).setOrigin(0.5);

      // Selection highlight
      const highlight = this.add.graphics();
      highlight.lineStyle(3, 0x8bc34a, 1)
        .strokeRoundedRect(cx - cardW / 2 - 3, cy - cardH / 2 - 3, cardW + 6, cardH + 6, 12);
      highlight.setVisible(false);

      // Hit zone
      const zone = this.add.zone(cx, cy, cardW, cardH).setInteractive();
      zone.on('pointerdown', () => this._selectPlant(i, highlight));
      zone.on('pointerover', () => {
        if (!this.selected.includes(i)) {
          cardBg.clear(); cardBg.fillStyle(0x4caf50, 0.2).fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
        }
      });
      zone.on('pointerout', () => {
        if (!this.selected.includes(i)) {
          cardBg.clear(); cardBg.fillStyle(0x000000, 0.3).fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
        }
      });

      this.plantCards.push({ highlight, cardBg, cx, cy, cardW, cardH });
    });

    // Counter + button at bottom
    this.counterText = this.add.text(W / 2, H * 0.86, 'Select 2 plants (0/2)', {
      fontSize: `${Math.round(14 * s)}px`, color: '#b3e5fc'
    }).setOrigin(0.5);

    const btnW = Math.min(240, W * 0.7);
    this.plantBtn = createButton(this, W / 2, H * 0.93, 'Plant Them! 🌱', () => {
      const chosenPlants = this.selected.map(idx => PLANTS[idx].name);
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GrowScene', {
          patientName: this.patientName, round: this.round,
          sessionId: this.sessionId, selectedPlants: chosenPlants
        });
      });
    }, btnW);
    this.plantBtn.setVisible(false);

    this.cameras.main.fadeIn(400);
    this.scale.on('resize', () => {
      this.scene.restart({ patientName: this.patientName, round: this.round, sessionId: this.sessionId });
    }, this);
  }

  _selectPlant(index, highlight) {
    if (this.selected.includes(index)) {
      this.selected = this.selected.filter(i => i !== index);
      highlight.setVisible(false);
      const { cardBg, cx, cy, cardW, cardH } = this.plantCards[index];
      cardBg.clear(); cardBg.fillStyle(0x000000, 0.3).fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
    } else if (this.selected.length < 2) {
      this.selected.push(index);
      highlight.setVisible(true);
    }
    this.counterText.setText(`Select 2 plants (${this.selected.length}/2)`);
    this.plantBtn.setVisible(this.selected.length === 2);
  }
}
