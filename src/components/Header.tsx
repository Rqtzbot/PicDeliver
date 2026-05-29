/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { Github, Globe } from 'lucide-react';
import { Language } from '../translations';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Header({ lang, onLanguageChange }: HeaderProps) {
  return (
    <header className="border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        {/* Left Side Branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <span className="h-5 w-1 bg-slate-800 rounded-full mr-2" />
            <h1 className="font-sans text-lg font-extrabold tracking-tight text-slate-900">
              Pic<span className="text-slate-800">Deliver</span>
            </h1>
          </div>
          <span className="h-4 w-[1px] bg-slate-200 hidden md:block" />
          <p className="text-[11px] text-slate-450 font-medium hidden md:block">
            {lang === 'zh'
              ? '一键转换 GitHub 仓库中的图片为高速、稳定的多节点 CDN 静态图床外链'
              : 'Convert the images of GitHub repositories into high-availability global CDN static links'}
          </p>
        </div>

        {/* Right Side: Language Switcher and Actions */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-700 transition-colors"
            title="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>

          {/* Custom micro pill language toggler */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => onLanguageChange('zh')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                lang === 'zh'
                  ? 'bg-white text-slate-800 shadow-xs ring-1 ring-slate-150/40'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-slate-800 shadow-xs ring-1 ring-slate-150/40'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
