/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Zap, Cpu, Cloud, Plus, X, Link } from 'lucide-react';
import { CDNType, CDNNode } from '../types';

interface CDNSelectorProps {
  selectedNode: CDNType;
  onSelect: (nodeType: CDNType) => void;
  lang: string;
  dynamicCdns: CDNNode[];
  onAddCustomCdn: (name: string, prefix: string) => void;
  onRemoveCustomCdn: (id: string) => void;
}

export default function CDNSelector({
  selectedNode,
  onSelect,
  lang,
  dynamicCdns,
  onAddCustomCdn,
  onRemoveCustomCdn,
}: CDNSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(lang === 'zh' ? '请输入节点名称' : 'Please enter node name');
      return;
    }
    if (!prefix.trim()) {
      setError(lang === 'zh' ? '请输入 CDN 前缀链接' : 'Please enter CDN prefix link');
      return;
    }
    if (!prefix.trim().startsWith('http://') && !prefix.trim().startsWith('https://')) {
      setError(lang === 'zh' ? '前缀链接必须以 http:// 或 https:// 开头' : 'Prefix must start with http:// or https://');
      return;
    }

    onAddCustomCdn(name, prefix);
    setName('');
    setPrefix('');
    setIsModalOpen(false);
  };

  const currentNode = dynamicCdns.find(n => n.id === selectedNode);

  return (
    <div className="flex flex-col gap-3.5 w-full" id="cdn-selector-container">
      {/* 1. Header Area: Label + Button */}
      <div className="flex items-center justify-between w-full" id="cdn-selector-header-row">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">
            {lang === 'zh' ? 'CDN 加速节点' : 'CDN Delivery Nodes'}
          </h3>
          <span className="inline-flex items-center rounded-md bg-slate-55 px-2 py-0.5 text-[11px] font-extrabold text-slate-700 ring-1 ring-inset ring-slate-200/50">
            {dynamicCdns.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-all rounded-lg select-none cursor-pointer border border-slate-200"
          id="add-custom-cdn-btn"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{lang === 'zh' ? '添加 CDN' : 'Add CDN'}</span>
        </button>
      </div>

      {/* 2. Grid list of CDN choices */}
      <div className="grid grid-cols-2 gap-2.5 w-full" id="cdn-selector-row">
        {dynamicCdns.map((node) => {
          const isSelected = selectedNode === node.id;
          const isCustom = node.id.startsWith('custom-');

          let Icon = Link;
          if (node.id === 'gcore') Icon = Globe;
          else if (node.id === 'fastly') Icon = Zap;
          else if (node.id === 'jsdelivr') Icon = Cpu;
          else if (node.id === 'cloudflare') Icon = Cloud;

          const displayLabel = node.name.replace(' 专属', '').replace(' 加速', '').replace(' 原版', '');
          const speedLabel = node.speedTag || (lang === 'zh' ? '自建线路' : 'Custom');

          return (
            <div
              key={node.id}
              title={node.description}
              className={`relative rounded-xl border p-2.5 transition-all duration-200 select-none cursor-pointer flex flex-col justify-between h-[72px]
                ${isSelected
                  ? 'border-slate-800 bg-slate-50 ring-[1px] ring-slate-800 shadow-[0_2px_8px_-3px_rgba(15,23,42,0.08)]'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/30'
                }`}
              onClick={() => onSelect(node.id)}
            >
              {/* Card top */}
              <div className="flex items-center justify-between w-full min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className={`font-sans text-[15px] font-extrabold truncate ${isSelected ? 'text-slate-950 font-black' : 'text-slate-800'}`}>
                    {displayLabel}
                  </span>
                </div>

                {isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCustomCdn(node.id);
                    }}
                    className="flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-0.5 transition-colors cursor-pointer h-[22px] w-[22px]"
                    title={lang === 'zh' ? '删除自定义节点' : 'Delete custom node'}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Card bottom speed marker */}
              <div className="flex items-center justify-between mt-1 min-w-0">
                <span className={`text-[9px] font-bold truncate px-1.5 py-0.5 rounded-md ${isSelected ? 'text-slate-700 bg-slate-250/20' : 'text-slate-400 bg-slate-50'}`}>
                  {speedLabel}
                </span>

                <span className="flex h-1.5 w-1.5 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    node.latencyIndicator === 'fast' ? 'bg-emerald-400' :
                    node.latencyIndicator === 'premium' ? 'bg-amber-400' : 'bg-slate-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                    node.latencyIndicator === 'fast' ? 'bg-emerald-500' :
                    node.latencyIndicator === 'premium' ? 'bg-amber-500' : 'bg-slate-500'
                  }`}></span>
                </span>
              </div>
            </div>
          );
        })}
      </div>



      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[1.5rem] border border-slate-150 max-w-md w-full p-6 shadow-xl space-y-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus className="h-4 w-4 text-slate-850 font-bold" />
                {lang === 'zh' ? '添加自定义 CDN 链接' : 'Add Custom CDN'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setError(null);
                  setName('');
                  setPrefix('');
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  {lang === 'zh' ? 'CDN 节点名称' : 'CDN Node Name'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'zh' ? '例如：GitMirror' : 'e.g., GitMirror'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs focus:outline-hidden focus:border-slate-400 focus:ring-4 focus:ring-slate-100/60 bg-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  {lang === 'zh' ? 'CDN 前缀链接' : 'CDN Prefix URL'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'zh' ? '例如：https://jsd.cdn.eu.org/gh' : 'e.g., https://jsd.cdn.eu.org/gh'}
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-mono focus:outline-hidden focus:border-slate-400 focus:ring-4 focus:ring-slate-100/60 bg-white placeholder-slate-400"
                />
                <span className="text-[10px] text-slate-400 mt-1.5 block leading-relaxed">
                  {lang === 'zh'
                    ? '⚠️ 必须兼容 jsDelivr 规则，系统将自动在其后拼接: /用户名/仓库@分支/路径'
                    : '⚠️ Must support jsDelivr route convention. Automatically appends: /{username}/{repo}@{branch}/{path}'
                  }
                </span>
              </div>

              {error && (
                <p className="text-xs text-rose-500 font-bold bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                    setName('');
                    setPrefix('');
                  }}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 hover:text-white cursor-pointer text-white shadow-xs transition-colors"
                >
                  {lang === 'zh' ? '添加节点' : 'Add Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
