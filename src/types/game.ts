/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_CLEARED'
  | 'GAME_OVER'
  | 'VICTORY';

export type BrickType = 'normal' | 'armored' | 'bomb' | 'mystery';

export type PowerUpType =
  | 'multiball'
  | 'laser'
  | 'expand'
  | 'shield'
  | 'slow'
  | 'life';

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  type: PowerUpType;
  color: string;
  label: string;
  iconName: string;
}

export interface ActiveEffect {
  type: PowerUpType;
  endTime: number;
  duration: number;
}

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickType;
  hitsLeft: number;
  maxHits: number;
  color: string;
  borderColor: string;
  points: number;
  hasPowerUp?: boolean;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
  baseSpeed: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  baseWidth: number;
  height: number;
  speed: number;
  color: string;
  hasLaser: boolean;
  laserCharges: number;
}

export interface LaserBullet {
  id: string;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  color: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  scale: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  layout: number[][]; // 0: empty, 1: normal-cyan, 2: normal-magenta, 3: normal-amber, 4: armored-2hit, 5: armored-3hit, 6: bomb, 7: mystery
  targetSpeed: number;
}
