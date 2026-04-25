import Phaser from 'phaser';
import { gameConfig } from './game/config';
import { eventBus, type GameEventMap } from './game/events';
import './styles/global.css';

declare global {
  interface Window {
    __BREACH_VECTOR_GAME__?: Phaser.Game;
    __BREACH_VECTOR_DIAGNOSTICS__?: {
      eventListenerCount(event: keyof GameEventMap): number;
    };
  }
}

const game = new Phaser.Game(gameConfig);
window.__BREACH_VECTOR_GAME__ = game;
window.__BREACH_VECTOR_DIAGNOSTICS__ = {
  eventListenerCount: (event) => eventBus.listenerCount(event)
};
