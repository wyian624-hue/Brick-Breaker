/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Zap,
  Shield,
  Layers,
  Heart,
  Clock,
  Sparkles,
  Bomb,
  ShieldAlert,
  HelpCircle,
  Gem,
} from 'lucide-react';

export const GameGuideSection: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 mt-12 text-slate-300">
      {/* Section 1: Power-ups */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            掉落道具一覽 (Power-Ups)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Layers className="w-4 h-4" />
              </span>
              <span className="font-semibold text-white text-xs">
                三球分裂 (Multiball)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              將場上所有球體分裂出額外 2 顆球，大幅提升清場效率與連擊機會。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Zap className="w-4 h-4" />
              </span>
              <span className="font-semibold text-white text-xs">
                雷射砲台 (Laser Paddle)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              球拍兩端加裝雙管雷射砲，按空白鍵或滑鼠點擊可發射 16 發雷射射穿磚塊。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="font-semibold text-white text-xs">
                加寬球拍 (Expand Paddle)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              增加 50% 球拍寬度，持續 12 秒，大幅降低失球漏接率。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Shield className="w-4 h-4" />
              </span>
              <span className="font-semibold text-white text-xs">
                防護底網 (Floor Shield)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              在底部生成一條高能防護雷射網，落空的球將被強制向上反彈，持續 14 秒。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-4 h-4" />
              </span>
              <span className="font-semibold text-white text-xs">
                時光減速 (Slow Motion)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              減緩球體運動速度 30%，持續 10 秒，適合在密集磚塊陣型中精確控制彈道。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Heart className="w-4 h-4" />
              </span>
              <span className="font-semibold text-white text-xs">
                額外生命 (+1 Heart)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              立即補充 1 條生命，最多可累計儲存 5 條生命。
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Brick Types */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            磚塊特性與計分 (Brick Types)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="h-6 w-full rounded bg-gradient-to-r from-cyan-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-slate-950">
              標準霓虹磚
            </div>
            <div className="text-xs font-semibold text-white">標準磚 (1 Hit)</div>
            <p className="text-xs text-slate-400">
              擊打 1 次即碎，基礎得分 100~150 分，有機率掉落能量道具。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="h-6 w-full rounded bg-gradient-to-r from-slate-600 to-slate-500 border border-slate-400 flex items-center justify-center text-[10px] font-mono font-bold text-white">
              🛡️2 / 🛡️3
            </div>
            <div className="text-xs font-semibold text-white">裝甲鐵磚 (2~3 Hits)</div>
            <p className="text-xs text-slate-400">
              需多次撞擊才能瓦解，上方標有剩餘耐久值，可獲得 250~400 分。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="h-6 w-full rounded bg-gradient-to-r from-rose-600 to-rose-500 flex items-center justify-center text-[11px] font-bold text-white">
              💣 BOMB
            </div>
            <div className="text-xs font-semibold text-white">烈焰炸藥磚 (Bomb)</div>
            <p className="text-xs text-slate-400">
              擊中時引發半徑 90px 大範圍爆破，直接摧毀周圍所有磚塊並引發連鎖反應！
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="h-6 w-full rounded bg-gradient-to-r from-purple-600 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white">
              ★ MYSTERY
            </div>
            <div className="text-xs font-semibold text-white">神秘能量磚 (Mystery)</div>
            <p className="text-xs text-slate-400">
              100% 保證掉落強力道具膠囊，200 分，是反敗為勝的關鍵。
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Pro Tips */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Gem className="w-4 h-4 text-amber-400" />
          進階得分秘訣 (Pro Tips)
        </h4>
        <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>角度控制：</strong>球擊中球拍的越邊緣，反彈的角度就越尖銳平緩；擊中中央則會以大角度垂直飛向天花板。善用邊緣切球可穿透頂部引發多次連續反彈！
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>連擊 Combo 加成：</strong>只要球未落回球拍持續在磚塊間反彈，連擊計數器就會累加，得分倍率最高可達 <strong>5 倍</strong>！
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span>
              <strong>雷射貫穿：</strong>撿到雷射道具後，直接對準密集裝甲區或炸彈磚狂轟濫炸，能瞬間打通天花板通路。
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
