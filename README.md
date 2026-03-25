# 🌿 Nature Journeys

A therapeutic jungle-themed 2D browser game built for kid patients using **Phaser 3**, **React**, and a **Django DRF + PostgreSQL** backend.

---

## Tech Stack

| Layer       | Technology            |
| ----------- | --------------------- |
| Game Engine | Phaser 3              |
| Frontend    | React + Vite          |
| Backend     | Django REST Framework |
| Database    | PostgreSQL            |
| HTTP Client | Axios                 |

---

## Game Flow

```
Patient Login → Start Round → Choose Plants → Water Plants → Animal Appears → Next Year (x6) → Game Complete
```

6 rounds total, each representing one "jungle year." Progress is saved to the backend at each round.

---

## Project Structure

```
nature-journeys/
├── src/
│   ├── game/
│   │   ├── scenes/          # All Phaser scenes
│   │   │   ├── LoginScene.js
│   │   │   ├── HubScene.js
│   │   │   ├── PlantScene.js
│   │   │   ├── GrowScene.js
│   │   │   ├── AnimalScene.js
│   │   │   └── CompleteScene.js
│   │   └── GameConfig.js
│   ├── components/
│   │   └── GameWrapper.jsx  # Mounts Phaser inside React
│   ├── api/
│   │   └── gameApi.js       # API stubs (ready for Django wiring)
│   └── App.jsx
└── public/
    └── assets/              # Drop real sprites here later
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Game runs at `http://localhost:5173`

---

## Environment Variables

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8000/api
```

---

## Assets

Currently uses **Phaser Graphics API** (colored shapes) as placeholders — no image files required to run.

Real sprites will come from:

- [2D Forest Assets Pack — itch.io](https://olanartworks.itch.io/2d-forest-assets-pack)
- [Kenney.nl](https://kenney.nl) — free nature/jungle packs
- [OpenGameArt.org](https://opengameart.org) — CC0 licensed sprites

To swap in real sprites, replace the `Graphics` drawing calls in each scene's `create()` with `this.load.image()` in `preload()`.

---

## Backend API (Planned)

The `src/api/gameApi.js` file contains stubs ready to wire up:

| Method | Endpoint                      | When Called          |
| ------ | ----------------------------- | -------------------- |
| `POST` | `/api/sessions/`              | Patient logs in      |
| `POST` | `/api/rounds/`                | Each round completes |
| `POST` | `/api/sessions/:id/complete/` | Round 6 finishes     |

Until the backend is ready, data is saved to `localStorage`.

---

## Color Palette

| Name         | Hex       |
| ------------ | --------- |
| Dark Green   | `#1a3a1a` |
| Mid Green    | `#2d6a2d` |
| Light Green  | `#4caf50` |
| Accent Green | `#8bc34a` |
| Soil Brown   | `#5d4037` |

---

<!-- ## Notes for Developers

- Game canvas is **800×600**, auto-scaled with `Phaser.Scale.FIT`
- `dom: { createContainer: true }` is required in GameConfig for the HTML login input
- Scene keys must match exactly: `LoginScene`, `HubScene`, `PlantScene`, `GrowScene`, `AnimalScene`, `CompleteScene`
- Data is passed between scenes via `this.scene.start('SceneName', { data })` -->
