import { gameApi } from '../../api/gameApi';

function createButton(scene, x, y, label, onClick) {
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1);
  btn.fillRoundedRect(-130, -24, 260, 48, 12);

  const text = scene.add.text(0, 0, label, {
    fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
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

export default class CompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CompleteScene' });
  }

  init(data) {
    this.patientName = data.patientName || 'Explorer';
    this.sessionId = data.sessionId || Date.now();
  }

  async create() {
    await gameApi.completeGame(this.sessionId);

    const W = this.scale.width;
    const H = this.scale.height;

    // Background gradient layers
    const bg = this.add.graphics();
    bg.fillStyle(0x1a3a1a, 1);
    bg.fillRect(0, 0, W, H);
    bg.fillStyle(0x2d6a2d, 0.6);
    bg.fillRect(0, H * 0.4, W, H * 0.6);

    // Animated stars
    for (let i = 0; i < 12; i++) {
      const sx = Phaser.Math.Between(40, W - 40);
      const sy = Phaser.Math.Between(30, H - 120);
      const star = this.add.graphics();
      star.fillStyle(0xffe082, 1);
      star.fillCircle(sx, sy, Phaser.Math.Between(6, 14));
      this.tweens.add({
        targets: star,
        scaleX: 0.4 + Math.random() * 0.6,
        scaleY: 0.4 + Math.random() * 0.6,
        alpha: 0.4 + Math.random() * 0.6,
        yoyo: true,
        repeat: -1,
        duration: 500 + Math.random() * 800,
        delay: Math.random() * 600
      });
    }

    // Particle-like confetti squares
    for (let i = 0; i < 20; i++) {
      const px = Phaser.Math.Between(20, W - 20);
      const py = Phaser.Math.Between(20, H - 20);
      const colors = [0xff9800, 0xf44336, 0x4caf50, 0xffe082, 0x9c27b0, 0x2196f3];
      const conf = this.add.graphics();
      conf.fillStyle(Phaser.Math.RND.pick(colors), 1);
      conf.fillRect(px, py, Phaser.Math.Between(6, 14), Phaser.Math.Between(6, 14));
      this.tweens.add({
        targets: conf,
        y: conf.y + Phaser.Math.Between(30, 80),
        alpha: 0,
        duration: 1500 + Math.random() * 2000,
        delay: Math.random() * 1000,
        repeat: -1,
        repeatDelay: Math.random() * 500
      });
    }

    // Trophy icon (drawn)
    const trophy = this.add.graphics();
    trophy.fillStyle(0xffe082, 1);
    trophy.fillRect(W / 2 - 30, 60, 60, 50);
    trophy.fillRect(W / 2 - 20, 110, 40, 12);
    trophy.fillRect(W / 2 - 35, 122, 70, 10);
    trophy.fillStyle(0xffa000, 1);
    trophy.fillRect(W / 2 - 30, 60, 10, 50); // left shadow
    this.tweens.add({
      targets: trophy,
      scaleX: 1.08, scaleY: 1.08,
      yoyo: true, repeat: -1, duration: 800
    });

    // Main text
    this.add.text(W / 2, 175, `Amazing Journey, ${this.patientName}!`, {
      fontSize: '34px', color: '#ffe082', fontStyle: 'bold',
      stroke: '#1a3a1a', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(W / 2, 225, '🎉', { fontSize: '40px' }).setOrigin(0.5);

    this.add.text(W / 2, 285, "You grew 12 plants and\nhelped 6 animals find a home!", {
      fontSize: '22px', color: '#f9fbe7', align: 'center',
      stroke: '#1a3a1a', strokeThickness: 2
    }).setOrigin(0.5);

    // Stats row
    const statsY = 370;
    const statsBg = this.add.graphics();
    statsBg.fillStyle(0x000000, 0.35);
    statsBg.fillRoundedRect(W / 2 - 240, statsY - 20, 480, 80, 14);

    this.add.text(W / 2 - 130, statsY + 20, '🌱 12 Plants\nGrown', {
      fontSize: '16px', color: '#8bc34a', align: 'center'
    }).setOrigin(0.5);
    this.add.text(W / 2, statsY + 20, '🐾 6 Animals\nHelped', {
      fontSize: '16px', color: '#ffe082', align: 'center'
    }).setOrigin(0.5);
    this.add.text(W / 2 + 130, statsY + 20, '⭐ 6 Years\nCompleted', {
      fontSize: '16px', color: '#b3e5fc', align: 'center'
    }).setOrigin(0.5);

    // Play again button
    createButton(this, W / 2, H - 65, '🌿 Play Again', () => {
      this.cameras.main.fadeOut(400);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LoginScene');
      });
    });

    this.cameras.main.fadeIn(500);
  }
}
