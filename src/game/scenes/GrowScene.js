function createButton(scene, x, y, label, onClick) {
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1);
  btn.fillRoundedRect(-130, -24, 260, 48, 12);

  const text = scene.add.text(0, 0, label, {
    fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
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

export default class GrowScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GrowScene' });
  }

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

    // Sky
    const bg = this.add.graphics();
    bg.fillStyle(0xb3e5fc, 1);
    bg.fillRect(0, 0, W, H * 0.65);

    // Ground / soil
    bg.fillStyle(0x5d4037, 1);
    bg.fillRect(0, H * 0.65, W, H * 0.35);
    bg.fillStyle(0x1a3a1a, 1);
    bg.fillRect(0, H * 0.72, W, H * 0.28);

    // Round badge
    this._drawRoundBadge(W - 20, 20, this.round);

    // Title
    this.add.text(W / 2, 40, 'Water Your Plants! 💧', {
      fontSize: '30px', color: '#1a3a1a', fontStyle: 'bold',
      stroke: '#ffffff', strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(W / 2, 80, 'Click each plant to water it', {
      fontSize: '16px', color: '#2d6a2d'
    }).setOrigin(0.5);

    // Draw 2 plants
    const plantX = [W * 0.3, W * 0.7];
    this.selectedPlants.forEach((name, i) => {
      const x = plantX[i];
      const baseY = H * 0.65;

      // Soil mound
      const soil = this.add.graphics();
      soil.fillStyle(0x5d4037, 1);
      soil.fillEllipse(x, baseY + 10, 80, 24);

      // Stem container (will scale)
      const stemContainer = this.add.container(x, baseY);
      const stemG = this.add.graphics();
      stemG.fillStyle(0x5d4037, 1);
      stemG.fillRect(-5, -60, 10, 60); // stem
      stemG.fillStyle(0x4caf50, 1);
      stemG.fillRect(-22, -80, 44, 40); // leaves

      stemContainer.add(stemG);
      stemContainer.setScale(1, 0.5); // start small

      const nameLabel = this.add.text(x, baseY - 95, name, {
        fontSize: '14px', color: '#f9fbe7', fontStyle: 'bold',
        stroke: '#1a3a1a', strokeThickness: 2
      }).setOrigin(0.5);

      // Water drops (hidden)
      const drops = this.add.text(x, baseY - 110, '💧', {
        fontSize: '20px'
      }).setOrigin(0.5).setVisible(false);

      // Hit zone
      const zone = this.add.zone(x, baseY - 40, 80, 100).setInteractive();
      const plantData = { watered: false, stemContainer, drops, nameLabel, zone };
      this.plantObjects.push(plantData);

      zone.on('pointerdown', () => this._waterPlant(i));
      zone.on('pointerover', () => { this.input.setDefaultCursor('pointer'); });
      zone.on('pointerout',  () => { this.input.setDefaultCursor('default'); });
    });

    // Water can follows mouse
    this.waterCan = this.add.graphics();
    this._drawWaterCan(this.waterCan, 0, 0);
    this.input.on('pointermove', (ptr) => {
      this.waterCan.setPosition(ptr.x + 20, ptr.y - 10);
    });

    // Status text
    this.statusText = this.add.text(W / 2, H - 110, 'Click a plant to water it! 🌿', {
      fontSize: '17px', color: '#f9fbe7'
    }).setOrigin(0.5);

    // Next button (hidden)
    this.nextBtn = createButton(this, W / 2, H - 55, 'Next: Watch for Animals →', () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('AnimalScene', {
          patientName: this.patientName,
          round: this.round,
          sessionId: this.sessionId,
          selectedPlants: this.selectedPlants
        });
      });
    });
    this.nextBtn.setVisible(false);

    this.cameras.main.fadeIn(400);
  }

  _waterPlant(i) {
    const p = this.plantObjects[i];
    if (p.watered) return;
    p.watered = true;
    p.drops.setVisible(true);

    // Grow tween
    this.tweens.add({
      targets: p.stemContainer,
      scaleY: 1.4,
      scaleX: 1.1,
      duration: 600,
      ease: 'Back.easeOut'
    });
    // Bounce drops
    this.tweens.add({
      targets: p.drops,
      y: p.drops.y - 20,
      alpha: 0,
      duration: 800,
      onComplete: () => p.drops.setVisible(false)
    });

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

    // Happy sun
    const sun = this.add.graphics();
    sun.fillStyle(0xffe082, 1);
    sun.fillCircle(W / 2, 130, 50);
    this.tweens.add({
      targets: sun,
      scaleX: 1.15, scaleY: 1.15,
      yoyo: true, repeat: -1, duration: 700
    });

    this.statusText.setText('Your plants are growing! 🌞');
    this.statusText.setStyle({ color: '#ffe082', fontSize: '20px' });
    this.nextBtn.setVisible(true);
  }

  _drawWaterCan(g, x, y) {
    g.fillStyle(0x00bcd4, 1);
    g.fillRect(x, y, 40, 28);
    g.fillStyle(0x0097a7, 1);
    g.fillRect(x + 40, y + 8, 18, 6); // spout
    g.fillRect(x - 8, y + 4, 8, 20); // handle
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
