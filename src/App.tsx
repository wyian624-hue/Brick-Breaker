/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { BreakoutGame } from './components/BreakoutGame';
import { GameGuideSection } from './components/GameGuideSection';
import { exportProjectZip } from './utils/zipExporter';
import { GAME_LEVELS } from './utils/levels';

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'guide' | 'levels'>('game');
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await exportProjectZip();
    } catch (e) {
      console.error('Download error', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. TOP BAR (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="text-lg sm:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            Neon Breakout
          </a>

          {/* Zone 2: 3 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <button
              onClick={() => setActiveTab('game')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'game' ? 'text-cyan-400 underline underline-offset-8' : ''
              }`}
            >
              遊戲畫布
            </button>
            <button
              onClick={() => setActiveTab('levels')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'levels' ? 'text-cyan-400 underline underline-offset-8' : ''
              }`}
            >
              關卡全覽
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'guide' ? 'text-cyan-400 underline underline-offset-8' : ''
              }`}
            >
              道具與規則
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-lg transition-all shadow-md shadow-cyan-400/20 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '打包中...' : '下載遊戲原始碼'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile subnav */}
      <div className="flex md:hidden items-center justify-around px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('game')}
          className={`py-1 ${activeTab === 'game' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          遊戲畫布
        </button>
        <button
          onClick={() => setActiveTab('levels')}
          className={`py-1 ${activeTab === 'levels' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          關卡全覽
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`py-1 ${activeTab === 'guide' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          道具規則
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
        {/* Game Area */}
        {activeTab === 'game' && (
          <div className="w-full flex flex-col items-center">
            {/* Quick Hero Banner */}
            <div className="w-full max-w-[800px] mb-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-slate-300 font-medium">已就緒 · HTML5 物理碰撞引擎</span>
              </div>
              <button
                onClick={() => setActiveTab('guide')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium hover:underline cursor-pointer"
              >
                查看道具圖鑑與磚塊說明
              </button>
            </div>

            <BreakoutGame onViewGuide={() => setActiveTab('guide')} />
          </div>
        )}

        {/* Levels Overview */}
        {activeTab === 'levels' && (
          <div className="w-full max-w-4xl space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                精心設計的 5 大關卡陣列
              </h2>
              <p className="text-xs text-slate-400">
                每道關卡具備獨特的球速漸進、磚塊耐受度、炸彈連鎖佈局與神秘道具配置
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GAME_LEVELS.map((level) => (
                <div
                  key={level.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      STAGE 0{level.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      初始球速: {level.targetSpeed}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{level.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{level.subtitle}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {level.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setActiveTab('game')}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                前往遊戲開始挑戰
              </button>
            </div>
          </div>
        )}

        {/* Guide Section */}
        {activeTab === 'guide' && (
          <div className="w-full animate-in fade-in duration-200">
            <GameGuideSection />
          </div>
        )}
      </main>

      {/* Quiet, Standard Footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Neon Breakout. 基於 React, TypeScript 與 Tailwind CSS 開發之街機打磚塊遊戲。</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              遊戲攻略與規則
            </button>
            <span>·</span>
            <button
              onClick={handleDownload}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              下載專案原始碼
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
