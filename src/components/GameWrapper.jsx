import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameConfig } from '../game/GameConfig';

export default function GameWrapper() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;
    gameRef.current = new Phaser.Game(GameConfig);
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      id="game-container"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f2310'
      }}
    />
  );
}
