/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  Zap,
  Shield,
  Layers,
  Heart,
  Trophy,
  Flame,
  ArrowRight,
  Maximize2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  GameState,
  Brick,
  Ball,
  Paddle,
  PowerUp,
  PowerUpType,
  LaserBullet,
  Particle,
  FloatingText,
  ActiveEffect,
} from '../types/game';
import { soundFx } from '../utils/audio';
import { GAME_LEVELS, createBricksForLevel } from '../utils/levels';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 560;

const POWERUP_DEFS: Record<
  PowerUpType,
  { label: string; color: string; duration: number }
> = {
  multiball: { label: '三球分裂', color: '#38BDF8', duration: 0 },
  laser: { label: '雷射砲', color: '#F43F5E', duration: 12000 },
  expand: { label: '加寬球拍', color: '#10B981', duration: 12000 },
  shield: { label: '安全底網', color: '#8B5CF6', duration: 14000 },
  slow: { label: '時光減速', color: '#F59E0B', duration: 10000 },
  life: { label: '+1 生命', color: '#EC4899', duration: 0 },
};

interface BreakoutGameProps {
  onViewGuide?: () => void;
}

export const BreakoutGame: React.FC<BreakoutGameProps> = ({
  onViewGuide,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High score in local storage
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('neon_breakout_highscore') || 0);
    } catch {
      return 0;
    }
  });

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.isMuted());
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [laserCharges, setLaserCharges] = useState<number>(0);

  // Refs for real-time game loop avoiding stale closures
  const stateRef = useRef<{
    gameState: GameState;
    levelIndex: number;
    score: number;
    lives: number;
    combo: number;
    maxCombo: number;
    paddle: Paddle;
    balls: Ball[];
    bricks: Brick[];
    powerUps: PowerUp[];
    lasers: LaserBullet[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    activeEffects: ActiveEffect[];
    isBallAttached: boolean;
    screenShake: number;
    keys: { left: boolean; right: boolean; space: boolean };
    lastFrameTime: number;
  }>({
    gameState: 'MENU',
    levelIndex: 0,
    score: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    paddle: {
      x: CANVAS_WIDTH / 2 - 60,
      y: CANVAS_HEIGHT - 32,
      width: 120,
      baseWidth: 120,
      height: 14,
      speed: 8.5,
      color: '#06B6D4',
      hasLaser: false,
      laserCharges: 0,
    },
    balls: [],
    bricks: [],
    powerUps: [],
    lasers: [],
    particles: [],
    floatingTexts: [],
    activeEffects: [],
    isBallAttached: true,
    screenShake: 0,
    keys: { left: false, right: false, space: false },
    lastFrameTime: performance.now(),
  });

  // Sync state to ref
  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);

  const updateHighScore = useCallback(
    (newScore: number) => {
      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('neon_breakout_highscore', String(newScore));
        } catch {
          // Ignore
        }
      }
    },
    [highScore]
  );

  // Initialize a new ball attached to paddle
  const createBall = useCallback(
    (speed = 6.4, attached = true): Ball => {
      const p = stateRef.current.paddle;
      const x = p.x + p.width / 2;
      const y = p.y - 10;
      return {
        id: Math.random().toString(),
        x,
        y,
        dx: speed * 0.707 * (Math.random() > 0.5 ? 1 : -1),
        dy: -speed * 0.707,
        radius: 7,
        speed,
        baseSpeed: speed,
        color: '#FFFFFF',
        trail: [],
      };
    },
    []
  );

  // Setup Level
  const initLevel = useCallback(
    (levelIdx: number, keepScore = true) => {
      const cfg = GAME_LEVELS[levelIdx] || GAME_LEVELS[0];
      const bricks = createBricksForLevel(levelIdx, CANVAS_WIDTH, CANVAS_HEIGHT);

      stateRef.current.levelIndex = levelIdx;
      stateRef.current.bricks = bricks;
      stateRef.current.powerUps = [];
      stateRef.current.lasers = [];
      stateRef.current.particles = [];
      stateRef.current.floatingTexts = [];
      stateRef.current.activeEffects = [];
      stateRef.current.combo = 0;
      stateRef.current.paddle.width = stateRef.current.paddle.baseWidth;
      stateRef.current.paddle.hasLaser = false;
      stateRef.current.paddle.laserCharges = 0;
      stateRef.current.paddle.x = CANVAS_WIDTH / 2 - stateRef.current.paddle.width / 2;

      const initialBall = createBall(cfg.targetSpeed, true);
      stateRef.current.balls = [initialBall];
      stateRef.current.isBallAttached = true;

      if (!keepScore) {
        stateRef.current.score = 0;
        stateRef.current.lives = 3;
        stateRef.current.maxCombo = 0;
        setScore(0);
        setLives(3);
        setMaxCombo(0);
      }

      setCurrentLevelIndex(levelIdx);
      setCombo(0);
      setActiveEffects([]);
      setLaserCharges(0);
    },
    [createBall]
  );

  // Launch attached ball
  const launchBall = useCallback(() => {
    if (stateRef.current.isBallAttached && stateRef.current.balls.length > 0) {
      stateRef.current.isBallAttached = false;
      const b = stateRef.current.balls[0];
      const cfg = GAME_LEVELS[stateRef.current.levelIndex] || GAME_LEVELS[0];
      const launchAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      b.dx = cfg.targetSpeed * Math.sin(launchAngle);
      b.dy = cfg.targetSpeed * Math.cos(launchAngle);
      soundFx.playPaddleHit();
    }
  }, []);

  // Fire laser if active
  const fireLaser = useCallback(() => {
    const p = stateRef.current.paddle;
    if (p.hasLaser && p.laserCharges > 0) {
      p.laserCharges -= 1;
      setLaserCharges(p.laserCharges);
      if (p.laserCharges <= 0) {
        p.hasLaser = false;
      }

      // Fire 2 lasers from paddle ends
      const leftLaser: LaserBullet = {
        id: Math.random().toString(),
        x: p.x + 8,
        y: p.y - 12,
        vy: -11,
        width: 4,
        height: 14,
        color: '#F43F5E',
      };
      const rightLaser: LaserBullet = {
        id: Math.random().toString(),
        x: p.x + p.width - 12,
        y: p.y - 12,
        vy: -11,
        width: 4,
        height: 14,
        color: '#F43F5E',
      };

      stateRef.current.lasers.push(leftLaser, rightLaser);
      soundFx.playLaser();
    }
  }, []);

  // Start new game from menu
  const handleStartGame = (startLevel = 0) => {
    initLevel(startLevel, false);
    setGameState('PLAYING');
  };

  // Trigger floating score text
  const addFloatingText = (text: string, x: number, y: number, color = '#38BDF8') => {
    stateRef.current.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      vy: -1.2,
      alpha: 1,
      color,
      scale: 1,
    });
  };

  // Trigger particles
  const addParticles = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      stateRef.current.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: Math.random() * 3 + 2,
        decay: Math.random() * 0.025 + 0.02,
      });
    }
  };

  // Drop power-up capsule
  const spawnPowerUp = (x: number, y: number) => {
    const types: PowerUpType[] = ['multiball', 'laser', 'expand', 'shield', 'slow', 'life'];
    // Weighted random
    const rand = Math.random();
    let type: PowerUpType = 'multiball';
    if (rand < 0.22) type = 'multiball';
    else if (rand < 0.42) type = 'expand';
    else if (rand < 0.6) type = 'laser';
    else if (rand < 0.78) type = 'shield';
    else if (rand < 0.92) type = 'slow';
    else type = 'life';

    const def = POWERUP_DEFS[type];
    stateRef.current.powerUps.push({
      id: Math.random().toString(),
      x: x - 15,
      y,
      width: 32,
      height: 16,
      vy: 2.2,
      type,
      color: def.color,
      label: def.label,
      iconName: type,
    });
  };

  // Apply power-up effect
  const applyPowerUp = useCallback((type: PowerUpType) => {
    soundFx.playPowerUpCollect();
    const p = stateRef.current.paddle;

    switch (type) {
      case 'multiball': {
        const currentBalls = [...stateRef.current.balls];
        currentBalls.forEach((b) => {
          const speed = b.speed;
          const ball1: Ball = {
            id: Math.random().toString(),
            x: b.x,
            y: b.y,
            dx: speed * Math.sin(-0.5),
            dy: -speed * Math.cos(-0.5),
            radius: b.radius,
            speed: b.speed,
            baseSpeed: b.baseSpeed,
            color: '#38BDF8',
            trail: [],
          };
          const ball2: Ball = {
            id: Math.random().toString(),
            x: b.x,
            y: b.y,
            dx: speed * Math.sin(0.5),
            dy: -speed * Math.cos(0.5),
            radius: b.radius,
            speed: b.speed,
            baseSpeed: b.baseSpeed,
            color: '#38BDF8',
            trail: [],
          };
          stateRef.current.balls.push(ball1, ball2);
        });
        addFloatingText('三球連發！', p.x + p.width / 2, p.y - 20, '#38BDF8');
        break;
      }
      case 'expand': {
        p.width = Math.min(200, p.baseWidth * 1.5);
        const end = Date.now() + POWERUP_DEFS.expand.duration;
        stateRef.current.activeEffects = stateRef.current.activeEffects
          .filter((e) => e.type !== 'expand')
          .concat({ type: 'expand', endTime: end, duration: POWERUP_DEFS.expand.duration });
        setActiveEffects([...stateRef.current.activeEffects]);
        addFloatingText('球拍加寬！', p.x + p.width / 2, p.y - 20, '#10B981');
        break;
      }
      case 'laser': {
        p.hasLaser = true;
        p.laserCharges = 16;
        setLaserCharges(16);
        const end = Date.now() + POWERUP_DEFS.laser.duration;
        stateRef.current.activeEffects = stateRef.current.activeEffects
          .filter((e) => e.type !== 'laser')
          .concat({ type: 'laser', endTime: end, duration: POWERUP_DEFS.laser.duration });
        setActiveEffects([...stateRef.current.activeEffects]);
        addFloatingText('雷射武裝 (空白鍵發射)！', p.x + p.width / 2, p.y - 20, '#F43F5E');
        break;
      }
      case 'shield': {
        const end = Date.now() + POWERUP_DEFS.shield.duration;
        stateRef.current.activeEffects = stateRef.current.activeEffects
          .filter((e) => e.type !== 'shield')
          .concat({ type: 'shield', endTime: end, duration: POWERUP_DEFS.shield.duration });
        setActiveEffects([...stateRef.current.activeEffects]);
        addFloatingText('防護底網啟動！', p.x + p.width / 2, p.y - 20, '#8B5CF6');
        break;
      }
      case 'slow': {
        stateRef.current.balls.forEach((b) => {
          b.speed = Math.max(4.2, b.baseSpeed * 0.7);
          const currentSpeed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
          b.dx = (b.dx / currentSpeed) * b.speed;
          b.dy = (b.dy / currentSpeed) * b.speed;
        });
        const end = Date.now() + POWERUP_DEFS.slow.duration;
        stateRef.current.activeEffects = stateRef.current.activeEffects
          .filter((e) => e.type !== 'slow')
          .concat({ type: 'slow', endTime: end, duration: POWERUP_DEFS.slow.duration });
        setActiveEffects([...stateRef.current.activeEffects]);
        addFloatingText('時光減速！', p.x + p.width / 2, p.y - 20, '#F59E0B');
        break;
      }
      case 'life': {
        stateRef.current.lives = Math.min(5, stateRef.current.lives + 1);
        setLives(stateRef.current.lives);
        addFloatingText('+1 生命！', p.x + p.width / 2, p.y - 20, '#EC4899');
        break;
      }
    }
  }, []);

  // Handle bomb detonation chain reaction
  const explodeBomb = useCallback((bombBrick: Brick) => {
    stateRef.current.screenShake = 12;
    soundFx.playBombExplosion();
    addParticles(
      bombBrick.x + bombBrick.width / 2,
      bombBrick.y + bombBrick.height / 2,
      '#EF4444',
      24
    );

    const blastRadius = 90;
    const centerBx = bombBrick.x + bombBrick.width / 2;
    const centerBy = bombBrick.y + bombBrick.height / 2;

    const remainingBricks: Brick[] = [];
    stateRef.current.bricks.forEach((b) => {
      if (b.id === bombBrick.id) return;
      const bCenterX = b.x + b.width / 2;
      const bCenterY = b.y + b.height / 2;
      const dist = Math.hypot(bCenterX - centerBx, bCenterY - centerBy);

      if (dist <= blastRadius) {
        // Destroyed by blast
        addParticles(bCenterX, bCenterY, b.color, 12);
        const pts = b.points * 2;
        stateRef.current.score += pts;
        addFloatingText(`💥 +${pts}`, bCenterX, bCenterY, '#EF4444');
        if (b.hasPowerUp || b.type === 'mystery') {
          spawnPowerUp(bCenterX, bCenterY);
        }
      } else {
        remainingBricks.push(b);
      }
    });

    stateRef.current.bricks = remainingBricks;
    setScore(stateRef.current.score);
  }, []);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = true;
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (stateRef.current.gameState === 'PLAYING') {
          if (stateRef.current.isBallAttached) {
            launchBall();
          } else {
            fireLaser();
          }
        } else if (stateRef.current.gameState === 'MENU') {
          handleStartGame(0);
        }
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (stateRef.current.gameState === 'PLAYING') {
          setGameState('PAUSED');
        } else if (stateRef.current.gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [launchBall, fireLaser]);

  // Mouse / Touch paddle tracking
  const handlePointerMove = (clientX: number) => {
    if (!canvasRef.current || stateRef.current.gameState !== 'PLAYING') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const mouseX = (clientX - rect.left) * scaleX;
    const p = stateRef.current.paddle;
    p.x = Math.max(0, Math.min(CANVAS_WIDTH - p.width, mouseX - p.width / 2));

    if (stateRef.current.isBallAttached && stateRef.current.balls.length > 0) {
      stateRef.current.balls[0].x = p.x + p.width / 2;
    }
  };

  const handlePointerDown = () => {
    if (stateRef.current.gameState === 'PLAYING') {
      if (stateRef.current.isBallAttached) {
        launchBall();
      } else {
        fireLaser();
      }
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      const cvs = canvasRef.current;
      if (!cvs) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      const now = performance.now();
      const dt = Math.min(32, now - stateRef.current.lastFrameTime);
      stateRef.current.lastFrameTime = now;

      const state = stateRef.current;
      const isPlaying = state.gameState === 'PLAYING';

      // 1. UPDATE PHASE (only when PLAYING)
      if (isPlaying) {
        // Paddle movement by keyboard
        const p = state.paddle;
        if (state.keys.left) {
          p.x = Math.max(0, p.x - p.speed);
          if (state.isBallAttached && state.balls.length > 0) {
            state.balls[0].x = p.x + p.width / 2;
          }
        }
        if (state.keys.right) {
          p.x = Math.min(CANVAS_WIDTH - p.width, p.x + p.speed);
          if (state.isBallAttached && state.balls.length > 0) {
            state.balls[0].x = p.x + p.width / 2;
          }
        }

        // Active powerup timers
        const currentTime = Date.now();
        const activeEffectsNow = state.activeEffects.filter((eff) => {
          if (eff.duration > 0 && currentTime > eff.endTime) {
            // Expired
            if (eff.type === 'expand') {
              p.width = p.baseWidth;
            }
            if (eff.type === 'laser') {
              p.hasLaser = false;
              p.laserCharges = 0;
              setLaserCharges(0);
            }
            if (eff.type === 'slow') {
              state.balls.forEach((b) => {
                const currentSpeed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
                b.speed = b.baseSpeed;
                b.dx = (b.dx / currentSpeed) * b.speed;
                b.dy = (b.dy / currentSpeed) * b.speed;
              });
            }
            return false;
          }
          return true;
        });
        state.activeEffects = activeEffectsNow;

        // Screen Shake decay
        if (state.screenShake > 0) {
          state.screenShake *= 0.88;
          if (state.screenShake < 0.2) state.screenShake = 0;
        }

        // Update Laser bullets
        const updatedLasers: LaserBullet[] = [];
        state.lasers.forEach((laser) => {
          laser.y += laser.vy;

          // Check hit against bricks
          let hit = false;
          for (let i = 0; i < state.bricks.length; i++) {
            const b = state.bricks[i];
            if (
              laser.x >= b.x &&
              laser.x <= b.x + b.width &&
              laser.y >= b.y &&
              laser.y <= b.y + b.height
            ) {
              hit = true;
              b.hitsLeft -= 1;
              addParticles(laser.x, laser.y, laser.color, 6);
              if (b.hitsLeft <= 0) {
                soundFx.playBrickBreak();
                state.score += b.points;
                addFloatingText(`+${b.points}`, b.x + b.width / 2, b.y, b.color);
                addParticles(b.x + b.width / 2, b.y + b.height / 2, b.color, 12);
                if (b.type === 'bomb') {
                  explodeBomb(b);
                } else if (b.hasPowerUp || b.type === 'mystery') {
                  spawnPowerUp(b.x + b.width / 2, b.y + b.height / 2);
                }
              } else {
                soundFx.playBrickHit(true);
              }
              break;
            }
          }

          if (!hit && laser.y > -20) {
            updatedLasers.push(laser);
          }
        });
        state.lasers = updatedLasers;
        state.bricks = state.bricks.filter((b) => b.hitsLeft > 0);

        // Update Powerups falling
        const remainingPowerUps: PowerUp[] = [];
        state.powerUps.forEach((pup) => {
          pup.y += pup.vy;

          // Check paddle collision
          if (
            pup.y + pup.height >= p.y &&
            pup.y <= p.y + p.height &&
            pup.x + pup.width >= p.x &&
            pup.x <= p.x + p.width
          ) {
            applyPowerUp(pup.type);
            addParticles(pup.x + pup.width / 2, pup.y, pup.color, 10);
          } else if (pup.y < CANVAS_HEIGHT + 20) {
            remainingPowerUps.push(pup);
          }
        });
        state.powerUps = remainingPowerUps;

        // Check if bottom shield is active
        const hasShield = state.activeEffects.some((e) => e.type === 'shield');

        // Update Balls
        const remainingBalls: Ball[] = [];
        state.balls.forEach((ball) => {
          if (state.isBallAttached) {
            ball.x = p.x + p.width / 2;
            ball.y = p.y - ball.radius - 2;
            remainingBalls.push(ball);
            return;
          }

          // Trail update
          ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.6 });
          if (ball.trail.length > 6) {
            ball.trail.shift();
          }

          // Move ball
          ball.x += ball.dx;
          ball.y += ball.dy;

          // Bounce walls
          if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.dx = Math.abs(ball.dx);
            soundFx.playPaddleHit();
          } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
            ball.x = CANVAS_WIDTH - ball.radius;
            ball.dx = -Math.abs(ball.dx);
            soundFx.playPaddleHit();
          }

          // Ceiling bounce
          if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.dy = Math.abs(ball.dy);
            soundFx.playPaddleHit();
          }

          // Floor Shield bounce
          if (hasShield && ball.y + ball.radius >= CANVAS_HEIGHT - 6 && ball.dy > 0) {
            ball.y = CANVAS_HEIGHT - 6 - ball.radius;
            ball.dy = -Math.abs(ball.dy);
            soundFx.playPaddleHit();
            addParticles(ball.x, CANVAS_HEIGHT - 6, '#8B5CF6', 8);
          }

          // Paddle collision
          if (
            ball.y + ball.radius >= p.y &&
            ball.y - ball.radius <= p.y + p.height &&
            ball.x >= p.x - ball.radius &&
            ball.x <= p.x + p.width + ball.radius &&
            ball.dy > 0
          ) {
            // Hit position determines angle
            const hitRatio = (ball.x - (p.x + p.width / 2)) / (p.width / 2);
            const clampedRatio = Math.max(-0.92, Math.min(0.92, hitRatio));
            const bounceAngle = clampedRatio * (Math.PI / 2.7); // up to ~66 degrees

            const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = currentSpeed * Math.sin(bounceAngle);
            ball.dy = -currentSpeed * Math.cos(bounceAngle);
            ball.y = p.y - ball.radius - 1;

            soundFx.playPaddleHit();
            addParticles(ball.x, p.y, p.color, 8);
            state.combo = 0; // Reset combo when ball bounces paddle
            setCombo(0);
          }

          // Brick collision
          let hitBrick = false;
          for (let i = 0; i < state.bricks.length; i++) {
            const brick = state.bricks[i];

            // Nearest point on brick to ball
            const nearestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
            const nearestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
            const distX = ball.x - nearestX;
            const distY = ball.y - nearestY;

            if (distX * distX + distY * distY < ball.radius * ball.radius) {
              hitBrick = true;
              brick.hitsLeft -= 1;

              // Collision resolution: determine horizontal vs vertical hit
              const overlapLeft = ball.x + ball.radius - brick.x;
              const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
              const overlapTop = ball.y + ball.radius - brick.y;
              const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

              const minOverlapX = Math.min(overlapLeft, overlapRight);
              const minOverlapY = Math.min(overlapTop, overlapBottom);

              if (minOverlapX < minOverlapY) {
                ball.dx = -ball.dx;
              } else {
                ball.dy = -ball.dy;
              }

              // Increment combo
              state.combo += 1;
              if (state.combo > state.maxCombo) {
                state.maxCombo = state.combo;
                setMaxCombo(state.maxCombo);
              }
              setCombo(state.combo);

              const comboMultiplier = Math.min(5, Math.floor(1 + (state.combo - 1) * 0.25));
              const pts = brick.points * comboMultiplier;
              state.score += pts;
              setScore(state.score);
              updateHighScore(state.score);

              if (brick.hitsLeft <= 0) {
                soundFx.playBrickBreak(1 + state.combo * 0.05);
                addParticles(
                  brick.x + brick.width / 2,
                  brick.y + brick.height / 2,
                  brick.color,
                  14
                );
                const comboText =
                  comboMultiplier > 1
                    ? `+${pts} (${comboMultiplier}x)`
                    : `+${pts}`;
                addFloatingText(
                  comboText,
                  brick.x + brick.width / 2,
                  brick.y,
                  brick.color
                );

                if (brick.type === 'bomb') {
                  explodeBomb(brick);
                } else if (brick.hasPowerUp || brick.type === 'mystery') {
                  spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                }
              } else {
                soundFx.playBrickHit(true);
                addParticles(ball.x, ball.y, '#94A3B8', 5);
              }

              break; // Handle one brick hit per frame per ball
            }
          }

          state.bricks = state.bricks.filter((b) => b.hitsLeft > 0);

          // Ball fallen down
          if (ball.y - ball.radius > CANVAS_HEIGHT) {
            // Ball lost
          } else {
            remainingBalls.push(ball);
          }
        });

        state.balls = remainingBalls;

        // Check if all balls lost
        if (state.balls.length === 0) {
          state.lives -= 1;
          setLives(state.lives);
          soundFx.playLifeLost();

          if (state.lives <= 0) {
            setGameState('GAME_OVER');
          } else {
            // Respawn ball attached to paddle
            const cfg = GAME_LEVELS[state.levelIndex] || GAME_LEVELS[0];
            state.balls = [createBall(cfg.targetSpeed, true)];
            state.isBallAttached = true;
            state.combo = 0;
            setCombo(0);
          }
        }

        // Check level cleared
        if (state.bricks.length === 0) {
          soundFx.playLevelClear();
          if (state.levelIndex + 1 < GAME_LEVELS.length) {
            setGameState('LEVEL_CLEARED');
          } else {
            setGameState('VICTORY');
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }

        // Update particles
        const aliveParticles: Particle[] = [];
        state.particles.forEach((part) => {
          part.x += part.vx;
          part.y += part.vy;
          part.alpha -= part.decay;
          if (part.alpha > 0) {
            aliveParticles.push(part);
          }
        });
        state.particles = aliveParticles;

        // Update floating texts
        const aliveTexts: FloatingText[] = [];
        state.floatingTexts.forEach((txt) => {
          txt.y += txt.vy;
          txt.alpha -= 0.02;
          if (txt.alpha > 0) {
            aliveTexts.push(txt);
          }
        });
        state.floatingTexts = aliveTexts;
      }

      // 2. RENDER PHASE (Every frame)
      ctx.save();

      // Screen shake translation
      if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake * 2;
        const shakeY = (Math.random() - 0.5) * state.screenShake * 2;
        ctx.translate(shakeX, shakeY);
      }

      // Clear Canvas Background (Deep Arcade Grid)
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Draw Floor Shield line if active
      if (state.activeEffects.some((e) => e.type === 'shield')) {
        ctx.save();
        ctx.strokeStyle = '#A855F7';
        ctx.shadowColor = '#A855F7';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT - 6);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 6);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Bricks
      state.bricks.forEach((b) => {
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = b.type === 'bomb' ? 10 : 4;

        // Brick body gradient
        const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
        grad.addColorStop(0, b.borderColor);
        grad.addColorStop(1, b.color);
        ctx.fillStyle = grad;

        // Rounded rect for brick
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 4);
        ctx.fill();

        ctx.strokeStyle = b.borderColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Armored Brick Hit Crack Indicators
        if (b.type === 'armored') {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`🛡️${b.hitsLeft}`, b.x + b.width / 2, b.y + b.height / 2 + 1);
        } else if (b.type === 'bomb') {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💣', b.x + b.width / 2, b.y + b.height / 2);
        } else if (b.type === 'mystery' || b.hasPowerUp) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', b.x + b.width / 2, b.y + b.height / 2);
        }

        ctx.restore();
      });

      // Draw PowerUps Capsules
      state.powerUps.forEach((pup) => {
        ctx.save();
        ctx.shadowColor = pup.color;
        ctx.shadowBlur = 8;

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(pup.x, pup.y, pup.width, pup.height, 8);
        ctx.fill();

        ctx.strokeStyle = pup.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = pup.color;
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pup.label.slice(0, 2), pup.x + pup.width / 2, pup.y + pup.height / 2);
        ctx.restore();
      });

      // Draw Laser Bullets
      state.lasers.forEach((laser) => {
        ctx.save();
        ctx.fillStyle = laser.color;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
        ctx.restore();
      });

      // Draw Paddle
      const p = state.paddle;
      ctx.save();
      ctx.shadowColor = p.hasLaser ? '#F43F5E' : p.color;
      ctx.shadowBlur = 10;

      const paddleGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      paddleGrad.addColorStop(0, '#FFFFFF');
      paddleGrad.addColorStop(0.3, p.hasLaser ? '#FB7185' : p.color);
      paddleGrad.addColorStop(1, p.hasLaser ? '#E11D48' : '#0891B2');

      ctx.fillStyle = paddleGrad;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.width, p.height, 7);
      ctx.fill();

      // Paddle Laser Cannons visual cues
      if (p.hasLaser) {
        ctx.fillStyle = '#F43F5E';
        ctx.fillRect(p.x + 4, p.y - 4, 6, 4);
        ctx.fillRect(p.x + p.width - 10, p.y - 4, 6, 4);
      }
      ctx.restore();

      // Draw Balls & Trails
      state.balls.forEach((ball) => {
        // Draw trail
        ball.trail.forEach((t, i) => {
          ctx.save();
          ctx.fillStyle = ball.color;
          ctx.globalAlpha = (i / ball.trail.length) * 0.35;
          ctx.beginPath();
          ctx.arc(t.x, t.y, ball.radius * (0.5 + (0.5 * i) / ball.trail.length), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Ball body
        ctx.save();
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 12;

        const ballGrad = ctx.createRadialGradient(
          ball.x - 2,
          ball.y - 2,
          1,
          ball.x,
          ball.y,
          ball.radius
        );
        ballGrad.addColorStop(0, '#FFFFFF');
        ballGrad.addColorStop(0.5, '#E0F2FE');
        ballGrad.addColorStop(1, '#38BDF8');

        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Particles
      state.particles.forEach((part) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, part.alpha);
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Floating Scores
      state.floatingTexts.forEach((txt) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, txt.alpha);
        ctx.fillStyle = txt.color;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(txt.text, txt.x, txt.y);
        ctx.restore();
      });

      // Attached ball launch indicator
      if (state.isBallAttached && state.balls.length > 0 && isPlaying) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('按空白鍵 (Space) 或點擊滑鼠發球', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 65);
        ctx.restore();
      }

      ctx.restore(); // restore screen shake

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [applyPowerUp, createBall, explodeBomb, updateHighScore]);

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Game HUD Bar */}
      <div className="w-full max-w-[800px] mb-3 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">關卡</span>
            <span className="font-bold text-cyan-400 font-mono">
              {currentLevelIndex + 1} / {GAME_LEVELS.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">得分</span>
            <span className="font-bold text-white font-mono tabular-nums text-sm">
              {score}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-medium">最高</span>
            <span className="font-bold text-amber-400 font-mono tabular-nums text-sm">
              {highScore}
            </span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 text-pink-400 font-mono font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>{combo} 連擊!</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Active effects indicators */}
          {activeEffects.map((eff, i) => (
            <div
              key={i}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>{POWERUP_DEFS[eff.type]?.label}</span>
              {eff.type === 'laser' && laserCharges > 0 && (
                <span className="text-rose-400 font-mono">({laserCharges})</span>
              )}
            </div>
          ))}

          {/* Lives display */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-950/30 border border-rose-500/20 rounded-md">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < lives
                    ? 'text-rose-500 fill-rose-500'
                    : 'text-slate-700 fill-transparent'
                }`}
              />
            ))}
          </div>

          {/* Mute button */}
          <button
            onClick={toggleSound}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Pause / Play */}
          {gameState === 'PLAYING' && (
            <button
              onClick={() => setGameState('PAUSED')}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="暫停遊戲 (P)"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {gameState === 'PAUSED' && (
            <button
              onClick={() => setGameState('PLAYING')}
              className="p-1.5 text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="繼續遊戲 (P)"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Game Screen Canvas Container */}
      <div className="relative w-full max-w-[800px] aspect-[800/560] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group select-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={(e) => handlePointerMove(e.clientX)}
          onTouchMove={(e) => {
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
          }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          className="w-full h-full block cursor-none touch-none"
        />

        {/* OVERLAY: TITLE MENU */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              經典街機復刻 · 霓虹粉碎
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 tracking-tight mb-2">
              NEON BREAKOUT
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              靈活控制球拍擊碎所有霓虹磚塊！拾取三球分裂、雷射砲台與防護底網，挑戰最高連擊分數！
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
              <button
                onClick={() => handleStartGame(0)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                立即開始遊戲
              </button>

              {onViewGuide && (
                <button
                  onClick={onViewGuide}
                  className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  遊戲規則與道具圖鑑
                </button>
              )}
            </div>

            {/* Level Selector */}
            <div className="w-full max-w-md pt-4 border-t border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium mb-2.5">
                直接選擇關卡：
              </div>
              <div className="grid grid-cols-5 gap-2">
                {GAME_LEVELS.map((lvl, idx) => (
                  <button
                    key={lvl.id}
                    onClick={() => handleStartGame(idx)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-all text-xs font-mono font-bold text-slate-300 hover:text-cyan-400 flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span>L{lvl.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Controls Hint */}
            <div className="mt-6 text-[11px] text-slate-400 flex items-center gap-4">
              <span>← → 或 滑鼠 移動</span>
              <span>·</span>
              <span>空白鍵 / 點擊 發球與射擊</span>
              <span>·</span>
              <span>P 鍵暫停</span>
            </div>
          </div>
        )}

        {/* OVERLAY: PAUSED */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">
              遊戲已暫停
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              目前分數：<span className="font-mono text-cyan-400 font-bold">{score}</span>
            </p>
            <div className="flex flex-col gap-2.5 w-48">
              <button
                onClick={() => setGameState('PLAYING')}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                繼續遊戲
              </button>
              <button
                onClick={() => initLevel(currentLevelIndex, true)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重新開始此關
              </button>
              <button
                onClick={() => setGameState('MENU')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-lg transition-colors cursor-pointer border border-slate-800"
              >
                返回主選單
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: LEVEL CLEARED */}
        {gameState === 'LEVEL_CLEARED' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">
              關卡完成！
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              成功擊破第 {currentLevelIndex + 1} 關的所有磚塊
            </p>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 mb-6 w-56 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>目前累計分數</span>
                <span className="text-cyan-400 font-bold">{score}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>最高連擊數</span>
                <span className="text-pink-400 font-bold">{maxCombo} 連擊</span>
              </div>
            </div>
            <button
              onClick={() => {
                initLevel(currentLevelIndex + 1, true);
                setGameState('PLAYING');
              }}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
            >
              <span>前往下一關</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* OVERLAY: GAME OVER */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-extrabold text-rose-500 mb-1 tracking-tight">
              GAME OVER
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              耗盡所有生命，請再接再厲！
            </p>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 mb-6 w-60 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>最終得分</span>
                <span className="text-white font-bold text-sm">{score}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>最高分紀錄</span>
                <span className="text-amber-400 font-bold">{highScore}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>抵達關卡</span>
                <span className="text-cyan-400 font-bold">Level {currentLevelIndex + 1}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleStartGame(currentLevelIndex)}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重新挑戰此關
              </button>
              <button
                onClick={() => setGameState('MENU')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                回主選單
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: VICTORY */}
        {gameState === 'VICTORY' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
              <Trophy className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 mb-1">
              恭喜通關！全關卡制霸！
            </h2>
            <p className="text-xs text-slate-300 mb-5">
              你成功粉碎了所有 5 個霓虹矩陣關卡！
            </p>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 mb-6 w-64 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>榮譽總分</span>
                <span className="text-amber-400 font-bold text-base">{score}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>最高連擊紀錄</span>
                <span className="text-pink-400 font-bold">{maxCombo} 連擊</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleStartGame(0)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-400/20 cursor-pointer"
              >
                再次挑戰
              </button>
              <button
                onClick={() => setGameState('MENU')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                返回主選單
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control instructions bottom bar */}
      <div className="w-full max-w-[800px] mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-400">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
            ← / →
          </div>
          <span className="text-[11px]">滑鼠或鍵盤平移球拍</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
            SPACE
          </div>
          <span className="text-[11px]">發球 / 發射雙管雷射</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
            P / ESC
          </div>
          <span className="text-[11px]">暫停與繼續遊戲</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
            TOUCH
          </div>
          <span className="text-[11px]">支援手機與觸控螢幕拖曳</span>
        </div>
      </div>
    </div>
  );
};
