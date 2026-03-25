function createButton(scene, x, y, label, onClick, w = 240) {
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1);
  btn.fillRoundedRect(-w / 2, -24, w, 48, 12);

  const text = scene.add.text(0, 0, label, {
    fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [btn, text]);
  container.setSize(w, 48);
  container.setInteractive();

  container.on('pointerover', () => {
    btn.clear(); btn.fillStyle(0x8bc34a, 1); btn.fillRoundedRect(-w / 2, -24, w, 48, 12);
  });
  container.on('pointerout', () => {
    btn.clear(); btn.fillStyle(0x4caf50, 1); btn.fillRoundedRect(-w / 2, -24, w, 48, 12);
  });
  container.on('pointerdown', onClick);
  return container;
}

const PLANTS = [
  { name: 'Fern', desc: 'Loves shade & moisture', color: 0x4caf50 },
  { name: 'Oak Tree', desc: 'Strong & long-lasting', color: 0x2d6a2d },
  { name: 'Bamboo', desc: 'Grows tall & fast', color: 0x8bc34a },
  { name: 'Sunflower', desc: 'Follows the sun 🌻', color: 0xffe082 },
];

export default class PlantScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlantScene' });
  }

  init(data) {
    this.patientName = data.patientName || 'Explorer';
    this.round = data.round || 1;
    this.sessionId = data.sessionId || Date.now();
    this.selected = [];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a3a1a, 1);
    bg.fillRect(0, 0, W, H);
    bg.fillStyle(0x2d6a2d, 0.5);
    bg.fillRect(0, H * 0.6, W, H * 0.4);

    // Round badge
    this._drawRoundBadge(W - 20, 20, this.round);

    // Title
    this.add.text(W / 2, 50, 'Choose 2 Plants 🌱', {
      fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#1a3a1a', strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(W / 2, 90, 'Click on two plants to grow in your jungle', {
      fontSize: '16px', color: '#8bc34a'
    }).setOrigin(0.5);

    // Plant grid: 2x2
    const cols = 2, rows = 2;
    const cardW = 160, cardH = 180;
    const startX = W / 2 - (cols * cardW) / 2 - 20;
    const startY = 130;
    const gapX = 200, gapY = 200;

    this.plantCards = [];
    this.plantGraphics = [];

    PLANTS.forEach((plant, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * gapX + cardW / 2 + 20;
      const cy = startY + row * gapY + cardH / 2;

      // Card BG
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x000000, 0.3);
      cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);

      // Plant sprite (colored rectangle + stem)
      const plantG = this.add.graphics();
      plantG.fillStyle(0x5d4037, 1);
      plantG.fillRect(cx - 6, cy + 20, 12, 40); // stem
      plantG.fillStyle(plant.color, 1);
      plantG.fillRect(cx - 28, cy - 20, 56, 50); // leaves

      // Name & desc
      this.add.text(cx, cy + 68, plant.name, {
        fontSize: '16px', color: '#f9fbe7', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(cx, cy + 88, plant.desc, {
        fontSize: '11px', color: '#8bc34a', wordWrap: { width: cardW - 10 }
      }).setOrigin(0.5);

      // Selection highlight (hidden initially)
      const highlight = this.add.graphics();
      highlight.lineStyle(3, 0x8bc34a, 1);
      highlight.strokeRoundedRect(cx - cardW / 2 - 3, cy - cardH / 2 - 3, cardW + 6, cardH + 6, 14);
      highlight.setVisible(false);

      // Hit zone
      const zone = this.add.zone(cx, cy, cardW, cardH).setInteractive();
      zone.on('pointerdown', () => this._selectPlant(i, highlight));
      zone.on('pointerover', () => { if (!this.selected.includes(i)) { cardBg.clear(); cardBg.fillStyle(0x4caf50, 0.2); cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12); } });
      zone.on('pointerout',  () => { if (!this.selected.includes(i)) { cardBg.clear(); cardBg.fillStyle(0x000000, 0.3); cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12); } });

      this.plantCards.push({ highlight, cardBg, cx, cy, cardW, cardH });
    });

    // Plant button (hidden until 2 selected)
    this.plantBtn = createButton(this, W / 2, H - 50, 'Plant Them! 🌱', () => {
      const chosenPlants = this.selected.map(i => PLANTS[i].name);
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GrowScene', {
          patientName: this.patientName,
          round: this.round,
          sessionId: this.sessionId,
          selectedPlants: chosenPlants
        });
      });
    }, 220);
    this.plantBtn.setVisible(false);

    // Selection counter
    this.counterText = this.add.text(W / 2, H - 100, 'Select 2 plants (0/2)', {
      fontSize: '15px', color: '#b3e5fc'
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(400);
  }

  _selectPlant(index, highlight) {
    if (this.selected.includes(index)) {
      this.selected = this.selected.filter(i => i !== index);
      highlight.setVisible(false);
      const { cardBg, cx, cy, cardW, cardH } = this.plantCards[index];
      cardBg.clear(); cardBg.fillStyle(0x000000, 0.3); cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
    } else if (this.selected.length < 2) {
      this.selected.push(index);
      highlight.setVisible(true);
    }
    this.counterText.setText(`Select 2 plants (${this.selected.length}/2)`);
    this.plantBtn.setVisible(this.selected.length === 2);
  }

  _drawRoundBadge(x, y, round) {
    const g = this.add.graphics();
    g.fillStyle(0x4caf50, 0.9);
    g.fillRoundedRect(x - 110, y, 110, 36, 8);
    this.add.text(x - 55, y + 18, `Year ${round} of 6`, {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
  }
}
