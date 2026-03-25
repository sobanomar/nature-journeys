import { gameApi } from '../../api/gameApi';

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

const ANIMALS = [
  { label: 'Butterfly 🦋', color: 0xff9800 },
  { label: 'Bird 🐦',      color: 0xf44336 },
  { label: 'Frog 🐸',      color: 0x66bb6a },
  { label: 'Bee 🐝',       color: 0xfdd835 },
  { label: 'Ladybug 🐞',   color: 0xe53935 },
  { label: 'Rabbit 🐇',    color: 0xbdbdbd },
];

export default class AnimalScene extends Phaser.Scene {
  constructor() { super({ key: 'AnimalScene' }); }

  init(data) {
    this.patientName = data.patientName || 'Explorer';
    this.round = data.round || 1;
    this.sessionId = data.sessionId || Date.now();
    this.selectedPlants = data.selectedPlants || ['Fern', 'Oak Tree'];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const s = Math.min(W / 800, H / 600);

    // Sky + ground
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
    this.add.text(W / 2, H * 0.07, 'Watch Your Jungle! 🌿', {
      fontSize: `${Math.round(28 * s)}px`, color: '#1a3a1a', fontStyle: 'bold',
      stroke: '#ffffff', strokeThickness: Math.round(3 * s)
    }).setOrigin(0.5);

    // Grown plants
    const baseY = H * 0.65;
    const stemH = Math.max(70, H * 0.16);
    const leafW = Math.max(40, W * 0.09);
    const leafH = stemH * 0.55;

    [W * 0.3, W * 0.7].forEach((x, i) => {
      const g = this.add.graphics();
      g.fillStyle(0x5d4037, 1).fillRect(x - 5, baseY - stemH, 10, stemH);
      g.fillStyle(0x4caf50, 1).fillRect(x - leafW / 2, baseY - stemH - leafH, leafW, leafH);
      g.fillStyle(0x8bc34a, 1).fillRect(x - leafW * 0.35, baseY - stemH - leafH * 1.4, leafW * 0.7, leafH * 0.5);
      g.fillStyle(0x5d4037, 0.5).fillEllipse(x, baseY + 10, leafW * 1.8, leafW * 0.3);
      this.add.text(x, baseY - stemH - leafH * 1.55, this.selectedPlants[i] || '', {
        fontSize: `${Math.round(12 * s)}px`, color: '#f9fbe7', fontStyle: 'bold',
        stroke: '#1a3a1a', strokeThickness: 2
      }).setOrigin(0.5);
    });

    // Animal
    const animalDef = ANIMALS[(this.round - 1) % ANIMALS.length];
    const animalR = Math.max(18, 22 * s);
    const animalG = this.add.graphics();
    animalG.fillStyle(animalDef.color, 1).fillCircle(0, 0, animalR);
    animalG.fillStyle(0xffffff, 1).fillCircle(animalR * 0.35, -animalR * 0.35, animalR * 0.3);
    const animalLabel = this.add.text(0, -animalR - 14, animalDef.label, {
      fontSize: `${Math.round(13 * s)}px`, color: '#1a3a1a', fontStyle: 'bold',
      stroke: '#ffffff', strokeThickness: 2
    }).setOrigin(0.5);

    const animalContainer = this.add.container(W + 60, H * 0.45, [animalG, animalLabel]);

    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: animalContainer, x: W * 0.5, duration: 1000, ease: 'Sine.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: animalContainer, y: animalContainer.y - 15,
            yoyo: true, repeat: 2, duration: 250
          });
          this._showVisitText(W, H, s, animalDef.label);
        }
      });
    });

    this.cameras.main.fadeIn(400);
    this.scale.on('resize', () => {
      this.scene.restart({
        patientName: this.patientName, round: this.round,
        sessionId: this.sessionId, selectedPlants: this.selectedPlants
      });
    }, this);
  }

  _showVisitText(W, H, s, animalLabel) {
    const msgW = Math.min(560, W * 0.9);
    const msgH = Math.max(60, H * 0.11);
    const msgY = H * 0.68;
    this.add.graphics()
      .fillStyle(0x000000, 0.4)
      .fillRoundedRect(W / 2 - msgW / 2, msgY, msgW, msgH, 12);

    this.add.text(W / 2, msgY + msgH / 2,
      `A ${animalLabel} visited your jungle!\nIt loved your ${this.selectedPlants[0]}! 🌿`, {
      fontSize: `${Math.round(16 * s)}px`, color: '#f9fbe7', align: 'center'
    }).setOrigin(0.5);

    const nextLabel = this.round >= 6 ? 'See Your Results! 🎉' : 'Continue to Next Year →';
    const btnW = Math.min(300, W * 0.78);
    createButton(this, W / 2, H * 0.9, nextLabel, async () => {
      await gameApi.completeRound(this.sessionId, { round: this.round, plants: this.selectedPlants });
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (this.round >= 6) {
          this.scene.start('CompleteScene', { patientName: this.patientName, sessionId: this.sessionId });
        } else {
          this.scene.start('HubScene', {
            patientName: this.patientName, round: this.round + 1, sessionId: this.sessionId
          });
        }
      });
    }, btnW);
  }
}
