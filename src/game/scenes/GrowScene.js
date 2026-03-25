function createButton(scene, x, y, label, onClick, bw) {
  const h = 50;
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12);

  const text = scene.add.text(0, 0, label, {
    fontSize: `${Math.round(bw * 0.075)}px`, color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [btn, text]);
  container.setSize(bw, h).setInteractive();

  container.on('pointerover', () => { btn.clear(); btn.fillStyle(0x8bc34a, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12); });
  container.on('pointerout',  () => { btn.clear(); btn.fillStyle(0x4caf50, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12); });
  container.on('pointerdown', onClick);
  return container;
}

export default class GrowScene extends Phaser.Scene {
  constructor() { super({ key: 'GrowScene' }); }

  init(data) {
    this.patientName = data.patientName || 'Explorer';
    this.round = data.round || 1;
    this.sessionId = data.sessionId || Date.now();
    this.selectedPlants = data.selectedPlants || ['Fern', 'Oak Tree'];
    this.wateredCount = 0;
    this.plantObjects = [];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const s = Math.min(W / 800, H / 600);

    // Sky + soil + ground
    const bg = this.add.graphics();
    bg.fillStyle(0xb3e5fc, 1).fillRect(0, 0, W, H * 0.65);
    bg.fillStyle(0x5d4037, 1).fillRect(0, H * 0.65, W, H * 0.1);
    bg.fillStyle(0x1a3a1a, 1).fillRect(0, H * 0.75, W, H * 0.25);

    // Round badge
    const bw = Math.round(110 * s), bh = Math.round(36 * s);
    this.add.graphics().fillStyle(0x4caf50, 0.9).fillRoundedRect(W - bw - 10, 10, bw, bh, 8);
    this.add.text(W - bw / 2 - 10, 10 + bh / 2, `Year ${this.round} of 6`, {
      fontSize: `${Math.round(13 * s)}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Title
    this.add.text(W / 2, H * 0.07, 'Water Your Plants! 💧', {
      fontSize: `${Math.round(28 * s)}px`, color: '#1a3a1a', fontStyle: 'bold',
      stroke: '#ffffff', strokeThickness: Math.round(3 * s)
    }).setOrigin(0.5);
    this.add.text(W / 2, H * 0.14, 'Tap each plant to water it', {
      fontSize: `${Math.round(15 * s)}px`, color: '#2d6a2d'
    }).setOrigin(0.5);

    // Plants
    const plantX = [W * 0.3, W * 0.7];
    const baseY = H * 0.65;
    const stemH = Math.max(50, H * 0.12);
    const leafW = Math.max(40, W * 0.09);
    const leafH = stemH * 0.7;

    this.selectedPlants.forEach((name, i) => {
      const x = plantX[i];

      // Soil mound
      this.add.graphics().fillStyle(0x5d4037, 1).fillEllipse(x, baseY + 10, leafW * 2, leafW * 0.4);

      // Stem container
      const stemContainer = this.add.container(x, baseY);
      const stemG = this.add.graphics();
      stemG.fillStyle(0x5d4037, 1).fillRect(-4, -stemH, 8, stemH);
      stemG.fillStyle(0x4caf50, 1).fillRect(-leafW / 2, -stemH - leafH, leafW, leafH);
      stemContainer.add(stemG);
      stemContainer.setScale(1, 0.5);

      const nameLabel = this.add.text(x, baseY - stemH - leafH - 15, name, {
        fontSize: `${Math.round(13 * s)}px`, color: '#f9fbe7', fontStyle: 'bold',
        stroke: '#1a3a1a', strokeThickness: 2
      }).setOrigin(0.5);

      const drops = this.add.text(x, baseY - stemH - leafH - 30, '💧', {
        fontSize: `${Math.round(20 * s)}px`
      }).setOrigin(0.5).setVisible(false);

      const zone = this.add.zone(x, baseY - stemH / 2, leafW * 1.5, stemH + leafH).setInteractive();
      this.plantObjects.push({ watered: false, stemContainer, drops, nameLabel, zone });

      zone.on('pointerdown', () => this._waterPlant(i));
    });

    // Water can follows pointer
    this.waterCan = this.add.graphics();
    this._drawWaterCan(this.waterCan);
    this.input.on('pointermove', (ptr) => {
      this.waterCan.setPosition(ptr.x + 15, ptr.y - 10);
    });

    // Status
    this.statusText = this.add.text(W / 2, H * 0.82, 'Tap a plant to water it! 🌿', {
      fontSize: `${Math.round(16 * s)}px`, color: '#f9fbe7'
    }).setOrigin(0.5);

    const btnW = Math.min(300, W * 0.75);
    this.nextBtn = createButton(this, W / 2, H * 0.93, 'Next: Watch for Animals →', () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('AnimalScene', {
          patientName: this.patientName, round: this.round,
          sessionId: this.sessionId, selectedPlants: this.selectedPlants
        });
      });
    }, btnW);
    this.nextBtn.setVisible(false);

    this.cameras.main.fadeIn(400);
    this.scale.on('resize', () => {
      this.scene.restart({
        patientName: this.patientName, round: this.round,
        sessionId: this.sessionId, selectedPlants: this.selectedPlants
      });
    }, this);
  }

  _waterPlant(i) {
    const p = this.plantObjects[i];
    if (p.watered) return;
    p.watered = true;
    p.drops.setVisible(true);

    this.tweens.add({ targets: p.stemContainer, scaleY: 1.4, scaleX: 1.1, duration: 600, ease: 'Back.easeOut' });
    this.tweens.add({ targets: p.drops, y: p.drops.y - 20, alpha: 0, duration: 800, onComplete: () => p.drops.setVisible(false) });

    this.wateredCount++;
    if (this.wateredCount === 2) {
      this._onAllWatered();
    } else {
      this.statusText.setText('Great! Now water the other plant! 🌱');
    }
  }

  _onAllWatered() {
    const W = this.scale.width;
    const H = this.scale.height;
    const s = Math.min(W / 800, H / 600);
    const sun = this.add.graphics().fillStyle(0xffe082, 1).fillCircle(W / 2, H * 0.22, 45 * s);
    this.tweens.add({ targets: sun, scaleX: 1.15, scaleY: 1.15, yoyo: true, repeat: -1, duration: 700 });
    this.statusText.setText('Your plants are growing! 🌞');
    this.statusText.setStyle({ color: '#ffe082', fontSize: `${Math.round(18 * Math.min(W / 800, H / 600))}px` });
    this.nextBtn.setVisible(true);
  }

  _drawWaterCan(g) {
    g.fillStyle(0x00bcd4, 1).fillRect(0, 0, 36, 24);
    g.fillStyle(0x0097a7, 1).fillRect(36, 7, 14, 5);
    g.fillRect(-7, 3, 7, 18);
  }
}
