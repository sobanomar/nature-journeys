import { gameApi } from '../../api/gameApi';

function createButton(scene, x, y, label, onClick) {
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1);
  btn.fillRoundedRect(-140, -24, 280, 48, 12);

  const text = scene.add.text(0, 0, label, {
    fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [btn, text]);
  container.setSize(280, 48);
  container.setInteractive();

  container.on('pointerover', () => {
    btn.clear(); btn.fillStyle(0x8bc34a, 1); btn.fillRoundedRect(-140, -24, 280, 48, 12);
  });
  container.on('pointerout', () => {
    btn.clear(); btn.fillStyle(0x4caf50, 1); btn.fillRoundedRect(-140, -24, 280, 48, 12);
  });
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
  constructor() {
    super({ key: 'AnimalScene' });
  }

  init(data) {
    this.patientName = data.patientName || 'Explorer';
    this.round = data.round || 1;
    this.sessionId = data.sessionId || Date.now();
    this.selectedPlants = data.selectedPlants || ['Fern', 'Oak Tree'];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Sky
    const bg = this.add.graphics();
    bg.fillStyle(0xb3e5fc, 1);
    bg.fillRect(0, 0, W, H * 0.65);

    // Ground
    bg.fillStyle(0x5d4037, 1);
    bg.fillRect(0, H * 0.65, W, H * 0.35);
    bg.fillStyle(0x1a3a1a, 1);
    bg.fillRect(0, H * 0.72, W, H * 0.28);

    // Round badge
    this._drawRoundBadge(W - 20, 20, this.round);

    // Title
    this.add.text(W / 2, 40, 'Watch Your Jungle! 🌿', {
      fontSize: '30px', color: '#1a3a1a', fontStyle: 'bold',
      stroke: '#ffffff', strokeThickness: 3
    }).setOrigin(0.5);

    // Draw grown plants
    const plantX = [W * 0.3, W * 0.7];
    this.selectedPlants.forEach((name, i) => {
      const x = plantX[i];
      const baseY = H * 0.65;

      const g = this.add.graphics();
      g.fillStyle(0x5d4037, 1);
      g.fillRect(x - 5, baseY - 90, 10, 90); // stem
      g.fillStyle(0x4caf50, 1);
      g.fillRect(x - 28, baseY - 120, 56, 50); // leaves
      g.fillStyle(0x8bc34a, 1);
      g.fillRect(x - 18, baseY - 140, 36, 30); // top leaves
      // Soil
      g.fillStyle(0x5d4037, 0.6);
      g.fillEllipse(x, baseY + 10, 80, 20);

      this.add.text(x, baseY - 150, name, {
        fontSize: '13px', color: '#f9fbe7', fontStyle: 'bold',
        stroke: '#1a3a1a', strokeThickness: 2
      }).setOrigin(0.5);
    });

    // Pick random animal
    const animalIndex = (this.round - 1) % ANIMALS.length;
    const animal = ANIMALS[animalIndex];
    const favPlant = this.selectedPlants[0];

    // Animal sprite (starts off-screen right)
    const animalG = this.add.graphics();
    animalG.fillStyle(animal.color, 1);
    animalG.fillCircle(0, 0, 22);
    animalG.fillStyle(0xffffff, 1);
    animalG.fillCircle(8, -8, 7); // eye highlight
    const animalContainer = this.add.container(W + 60, H * 0.45, [animalG]);

    const animalText = this.add.text(0, -38, animal.label, {
      fontSize: '14px', color: '#1a3a1a', fontStyle: 'bold',
      stroke: '#ffffff', strokeThickness: 2
    }).setOrigin(0.5);
    animalContainer.add(animalText);

    // Tween animal in after delay
    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: animalContainer,
        x: W * 0.5,
        duration: 1000,
        ease: 'Sine.easeOut',
        onComplete: () => {
          // Bounce
          this.tweens.add({
            targets: animalContainer,
            y: animalContainer.y - 15,
            yoyo: true, repeat: 2, duration: 250
          });
          this._showVisitText(W, H, animal.label, favPlant);
        }
      });
    });

    this.cameras.main.fadeIn(400);
  }

  _showVisitText(W, H, animalLabel, plantName) {
    const msgBg = this.add.graphics();
    msgBg.fillStyle(0x000000, 0.4);
    msgBg.fillRoundedRect(W / 2 - 280, H * 0.68 - 10, 560, 70, 12);

    const name = animalLabel.replace(/\s*[^\w\s].*/u, '').trim(); // strip emoji for grammar
    this.add.text(W / 2, H * 0.68 + 15, `A ${animalLabel} visited your jungle!\nIt loved your ${plantName}! 🌿`, {
      fontSize: '18px', color: '#f9fbe7', align: 'center'
    }).setOrigin(0.5);

    const nextLabel = this.round >= 6 ? 'See Your Results! 🎉' : 'Continue to Next Year →';
    const nextBtn = createButton(this, W / 2, H - 55, nextLabel, async () => {
      await gameApi.completeRound(this.sessionId, { round: this.round, plants: this.selectedPlants });
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (this.round >= 6) {
          this.scene.start('CompleteScene', {
            patientName: this.patientName,
            sessionId: this.sessionId
          });
        } else {
          this.scene.start('HubScene', {
            patientName: this.patientName,
            round: this.round + 1,
            sessionId: this.sessionId
          });
        }
      });
    });
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
