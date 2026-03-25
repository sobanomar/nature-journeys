import { gameApi } from '../../api/gameApi';

function createButton(scene, x, y, label, onClick, bw) {
  const h = 52;
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

export default class CompleteScene extends Phaser.Scene {
  constructor() { super({ key: 'CompleteScene' }); }

  init(data) {
    this.patientName = data.patientName || 'Explorer';
    this.sessionId = data.sessionId || Date.now();
  }

  async create() {
    await gameApi.completeGame(this.sessionId);

    const W = this.scale.width;
    const H = this.scale.height;
    const s = Math.min(W / 800, H / 600);

    // Background
    this.add.graphics()
      .fillStyle(0x1a3a1a, 1).fillRect(0, 0, W, H)
      .fillStyle(0x2d6a2d, 0.6).fillRect(0, H * 0.4, W, H * 0.6);

    // Animated stars
    for (let i = 0; i < 12; i++) {
      const sx = Phaser.Math.Between(40, W - 40);
      const sy = Phaser.Math.Between(30, H - 100);
      const star = this.add.graphics()
        .fillStyle(0xffe082, 1)
        .fillCircle(sx, sy, Phaser.Math.Between(Math.round(5 * s), Math.round(13 * s)));
      this.tweens.add({
        targets: star, scaleX: 0.4 + Math.random() * 0.6, scaleY: 0.4 + Math.random() * 0.6,
        alpha: 0.4 + Math.random() * 0.6, yoyo: true, repeat: -1,
        duration: 500 + Math.random() * 800, delay: Math.random() * 600
      });
    }

    // Confetti
    const colors = [0xff9800, 0xf44336, 0x4caf50, 0xffe082, 0x9c27b0, 0x2196f3];
    for (let i = 0; i < 20; i++) {
      const conf = this.add.graphics()
        .fillStyle(Phaser.Math.RND.pick(colors), 1)
        .fillRect(
          Phaser.Math.Between(20, W - 20),
          Phaser.Math.Between(20, H - 20),
          Phaser.Math.Between(5, Math.round(12 * s)),
          Phaser.Math.Between(5, Math.round(12 * s))
        );
      this.tweens.add({
        targets: conf, y: `+=${Phaser.Math.Between(30, 80)}`, alpha: 0,
        duration: 1500 + Math.random() * 2000, delay: Math.random() * 1000,
        repeat: -1, repeatDelay: Math.random() * 500
      });
    }

    // Trophy
    const tx = W / 2, ty = H * 0.08;
    const tw = 55 * s, tBaseH = 45 * s;
    const trophy = this.add.graphics();
    trophy.fillStyle(0xffe082, 1)
      .fillRect(tx - tw / 2, ty, tw, tBaseH)
      .fillRect(tx - tw * 0.35, ty + tBaseH, tw * 0.7, 10 * s)
      .fillRect(tx - tw * 0.6, ty + tBaseH + 10 * s, tw * 1.2, 8 * s);
    trophy.fillStyle(0xffa000, 1).fillRect(tx - tw / 2, ty, 9 * s, tBaseH);
    this.tweens.add({ targets: trophy, scaleX: 1.08, scaleY: 1.08, yoyo: true, repeat: -1, duration: 800 });

    // Main text
    this.add.text(W / 2, H * 0.26, `Amazing Journey, ${this.patientName}!`, {
      fontSize: `${Math.round(30 * s)}px`, color: '#ffe082', fontStyle: 'bold',
      stroke: '#1a3a1a', strokeThickness: Math.round(4 * s)
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.36, '🎉', { fontSize: `${Math.round(36 * s)}px` }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.46, "You grew 12 plants and\nhelped 6 animals find a home!", {
      fontSize: `${Math.round(19 * s)}px`, color: '#f9fbe7', align: 'center',
      stroke: '#1a3a1a', strokeThickness: 2
    }).setOrigin(0.5);

    // Stats
    const statsW = Math.min(480, W * 0.88);
    const statsH = Math.max(70, H * 0.12);
    const statsY = H * 0.58;
    this.add.graphics()
      .fillStyle(0x000000, 0.35)
      .fillRoundedRect(W / 2 - statsW / 2, statsY, statsW, statsH, 14);

    const statFs = `${Math.round(14 * s)}px`;
    this.add.text(W / 2 - statsW * 0.3, statsY + statsH / 2, '🌱 12 Plants\nGrown',   { fontSize: statFs, color: '#8bc34a', align: 'center' }).setOrigin(0.5);
    this.add.text(W / 2,                statsY + statsH / 2, '🐾 6 Animals\nHelped',  { fontSize: statFs, color: '#ffe082', align: 'center' }).setOrigin(0.5);
    this.add.text(W / 2 + statsW * 0.3, statsY + statsH / 2, '⭐ 6 Years\nCompleted', { fontSize: statFs, color: '#b3e5fc', align: 'center' }).setOrigin(0.5);

    // Play again
    const btnW = Math.min(240, W * 0.65);
    createButton(this, W / 2, H * 0.88, '🌿 Play Again', () => {
      this.cameras.main.fadeOut(400);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('LoginScene'));
    }, btnW);

    this.cameras.main.fadeIn(500);
    this.scale.on('resize', () => {
      this.scene.restart({ patientName: this.patientName, sessionId: this.sessionId });
    }, this);
  }
}
