import { gameApi } from "../../api/gameApi";

function createButton(scene, x, y, label, onClick, bw) {
  const h = 50;
  const btn = scene.add.graphics();
  btn.fillStyle(0x4caf50, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12);

  const text = scene.add
    .text(0, 0, label, {
      fontSize: `${Math.round(bw * 0.085)}px`,
      color: "#ffffff",
      fontStyle: "bold",
    })
    .setOrigin(0.5);

  const container = scene.add.container(x, y, [btn, text]);
  container.setSize(bw, h).setInteractive();

  container.on("pointerover", () => {
    btn.clear();
    btn.fillStyle(0x8bc34a, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12);
  });
  container.on("pointerout", () => {
    btn.clear();
    btn.fillStyle(0x4caf50, 1).fillRoundedRect(-bw / 2, -h / 2, bw, h, 12);
  });
  container.on("pointerdown", onClick);
  return container;
}

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoginScene" });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const s = Math.min(W / 800, H / 600);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2d6a2d, 1);
    bg.fillRect(0, 0, W, H * 0.45);
    bg.fillStyle(0x1a3a1a, 1);
    bg.fillRect(0, H * 0.45, W, H * 0.55);

    // Decorative trees
    const tw = 60 * s,
      th = 120 * s;
    this._drawTree(tw, H - tw * 0.5, tw, th);
    this._drawTree(W - tw, H - tw * 0.5, tw, th);
    this._drawTree(tw * 0.5, H - tw * 0.3, tw * 0.7, th * 0.7);
    this._drawTree(W - tw * 0.5, H - tw * 0.3, tw * 0.7, th * 0.7);

    // Sun
    const sun = this.add.graphics();
    sun.fillStyle(0xffe082, 1);
    sun.fillCircle(W - 60 * s, 55 * s, 30 * s);

    // Title
    this.add
      .text(W / 2, H * 0.14, "Nature Journeys 🌿", {
        fontSize: `${Math.round(40 * s)}px`,
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#1a3a1a",
        strokeThickness: Math.round(4 * s),
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, H * 0.23, "A Therapeutic Jungle Adventure", {
        fontSize: `${Math.round(16 * s)}px`,
        color: "#b3e5fc",
      })
      .setOrigin(0.5);

    // Card
    const cardW = Math.min(400, W * 0.88);
    const cardH = H * 0.44;
    const cardX = W / 2 - cardW / 2;
    const cardY = H * 0.29;
    this.add
      .graphics()
      .fillStyle(0x000000, 0.3)
      .fillRoundedRect(cardX, cardY, cardW, cardH, 16);

    this.add
      .text(W / 2, cardY + cardH * 0.16, "What is your name?", {
        fontSize: `${Math.round(20 * s)}px`,
        color: "#f9fbe7",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // DOM input
    const inputW = Math.min(260, cardW * 0.8);
    const inputEl = this.add
      .dom(W / 2, cardY + cardH * 0.4)
      .createElement("input");
    inputEl.node.type = "text";
    inputEl.node.placeholder = "Enter your name...";
    inputEl.node.maxLength = 20;
    Object.assign(inputEl.node.style, {
      width: `${inputW}px`,
      height: `${Math.round(44 * s)}px`,
      fontSize: `${Math.round(18 * s)}px`,
      borderRadius: "10px",
      border: "2px solid #4caf50",
      padding: "0 12px",
      background: "#f9fbe7",
      color: "#1a3a1a",
      outline: "none",
      textAlign: "center",
    });

    this.add
      .text(W / 2, cardY + cardH * 0.62, "Round 1 of 6", {
        fontSize: `${Math.round(14 * s)}px`,
        color: "#8bc34a",
      })
      .setOrigin(0.5);

    const btnW = Math.min(240, cardW * 0.75);
    createButton(
      this,
      W / 2,
      cardY + cardH * 0.82,
      "Start Adventure 🌱",
      async () => {
        const name = inputEl.node.value.trim() || "Explorer";
        await gameApi.startSession(name);
        this.cameras.main.fadeOut(300);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("HubScene", {
            patientName: name,
            round: 1,
            sessionId: Date.now(),
          });
        });
      },
      btnW,
    );

    this.cameras.main.fadeIn(400);
    this.scale.on("resize", () => this.scene.restart(), this);
  }

  _drawTree(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x5d4037, 1).fillRect(
      x - w * 0.1,
      y - h * 0.4,
      w * 0.2,
      h * 0.4,
    );
    g.fillStyle(0x2d6a2d, 1).fillTriangle(
      x,
      y - h,
      x - w / 2,
      y - h * 0.45,
      x + w / 2,
      y - h * 0.45,
    );
    g.fillStyle(0x4caf50, 1).fillTriangle(
      x,
      y - h * 0.85,
      x - w * 0.55,
      y - h * 0.35,
      x + w * 0.55,
      y - h * 0.35,
    );
    g.fillStyle(0x8bc34a, 1).fillTriangle(
      x,
      y - h * 0.7,
      x - w * 0.6,
      y - h * 0.25,
      x + w * 0.6,
      y - h * 0.25,
    );
  }
}
