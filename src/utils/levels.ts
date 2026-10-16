/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, Brick, BrickType } from '../types/game';

export const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '關卡 1: 霓虹拂曉 (Neon Dawn)',
    subtitle: '熟悉球速與擊球角度',
    description: '標準彩虹磚塊牆面，包含基本能量掉落磚，適合暖身練習。',
    targetSpeed: 6.2,
    layout: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [2, 7, 2, 2, 2, 2, 2, 2, 7, 2],
      [3, 3, 3, 6, 3, 3, 6, 3, 3, 3],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 2, 2, 2, 0, 0, 2, 2, 2, 0],
    ],
  },
  {
    id: 2,
    name: '關卡 2: 太空侵略者 (Space Invaders)',
    subtitle: '外星生物陣型與防護裝甲',
    description: '外星戰機陣型，兩翼配備 2 擊裝甲磚，中央蘊藏高分神秘磚。',
    targetSpeed: 6.8,
    layout: [
      [0, 0, 2, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 2, 2, 2, 2, 0, 0, 0],
      [0, 2, 4, 1, 7, 7, 1, 4, 2, 0],
      [2, 2, 1, 1, 1, 1, 1, 1, 2, 2],
      [2, 0, 6, 0, 0, 0, 0, 6, 0, 2],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    ],
  },
  {
    id: 3,
    name: '關卡 3: 烈焰核心 (Explosive Core)',
    subtitle: '連鎖反應與重裝甲要塞',
    description: '核心蘊藏多顆炸藥磚，觸發連鎖爆破能快速掃除整片裝甲磚壁！',
    targetSpeed: 7.2,
    layout: [
      [4, 4, 4, 4, 5, 5, 4, 4, 4, 4],
      [4, 1, 1, 6, 1, 1, 6, 1, 1, 4],
      [4, 1, 7, 3, 3, 3, 3, 7, 1, 4],
      [4, 6, 3, 6, 2, 2, 6, 3, 6, 4],
      [4, 1, 3, 2, 7, 7, 2, 3, 1, 4],
      [0, 4, 4, 0, 0, 0, 0, 4, 4, 0],
    ],
  },
  {
    id: 4,
    name: '關卡 4: 鑽石方陣 (Diamond Vault)',
    subtitle: '金字塔結構與高難度反彈',
    description: '多層鑽石金字塔結構，狹窄的彈道縫隙將加速球體運行！',
    targetSpeed: 7.6,
    layout: [
      [0, 0, 0, 0, 5, 5, 0, 0, 0, 0],
      [0, 0, 0, 4, 7, 7, 4, 0, 0, 0],
      [0, 0, 4, 6, 2, 2, 6, 4, 0, 0],
      [0, 4, 1, 2, 3, 3, 2, 1, 4, 0],
      [5, 1, 2, 3, 6, 6, 3, 2, 1, 5],
      [0, 4, 1, 2, 7, 7, 2, 1, 4, 0],
      [0, 0, 4, 1, 2, 2, 1, 4, 0, 0],
    ],
  },
  {
    id: 5,
    name: '關卡 5: 賽博母體 (Cyber Matrix)',
    subtitle: '終極挑戰：高密度防線',
    description: '三層重裝甲守護母體，包含多重神秘道具掉落，考驗極限反射神經！',
    targetSpeed: 8.0,
    layout: [
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      [4, 6, 7, 4, 6, 6, 4, 7, 6, 4],
      [2, 2, 3, 3, 1, 1, 3, 3, 2, 2],
      [1, 7, 1, 6, 2, 2, 6, 1, 7, 1],
      [4, 4, 4, 4, 5, 5, 4, 4, 4, 4],
      [0, 2, 6, 3, 7, 7, 3, 6, 2, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    ],
  },
];

export function createBricksForLevel(
  levelIndex: number,
  canvasWidth: number,
  canvasHeight: number
): Brick[] {
  const level = GAME_LEVELS[levelIndex] || GAME_LEVELS[0];
  const layout = level.layout;
  const rows = layout.length;
  const cols = layout[0].length;

  const paddingX = 36;
  const marginTop = 50;
  const gap = 8;
  const totalGapsX = (cols - 1) * gap;
  const brickWidth = (canvasWidth - paddingX * 2 - totalGapsX) / cols;
  const brickHeight = 24;

  const bricks: Brick[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const code = layout[r][c];
      if (code === 0) continue;

      const x = paddingX + c * (brickWidth + gap);
      const y = marginTop + r * (brickHeight + gap);

      let type: BrickType = 'normal';
      let hits = 1;
      let color = '#06B6D4'; // cyan
      let borderColor = '#22D3EE';
      let points = 100;
      let hasPowerUp = Math.random() < 0.22; // 22% chance of powerup

      switch (code) {
        case 1: // Cyan Normal
          type = 'normal';
          hits = 1;
          color = '#06B6D4';
          borderColor = '#67E8F9';
          points = 100;
          break;
        case 2: // Magenta Normal
          type = 'normal';
          hits = 1;
          color = '#EC4899';
          borderColor = '#F472B6';
          points = 120;
          break;
        case 3: // Amber Normal
          type = 'normal';
          hits = 1;
          color = '#F59E0B';
          borderColor = '#FCD34D';
          points = 150;
          break;
        case 4: // Armored 2-hits
          type = 'armored';
          hits = 2;
          color = '#64748B';
          borderColor = '#94A3B8';
          points = 250;
          break;
        case 5: // Heavy Armored 3-hits
          type = 'armored';
          hits = 3;
          color = '#475569';
          borderColor = '#CBD5E1';
          points = 400;
          break;
        case 6: // Bomb
          type = 'bomb';
          hits = 1;
          color = '#EF4444';
          borderColor = '#FCA5A5';
          points = 300;
          hasPowerUp = false;
          break;
        case 7: // Mystery Power-up
          type = 'mystery';
          hits = 1;
          color = '#8B5CF6';
          borderColor = '#C4B5FD';
          points = 200;
          hasPowerUp = true;
          break;
      }

      bricks.push({
        id: `brick-${r}-${c}`,
        x,
        y,
        width: brickWidth,
        height: brickHeight,
        type,
        hitsLeft: hits,
        maxHits: hits,
        color,
        borderColor,
        points,
        hasPowerUp,
      });
    }
  }

  return bricks;
}
