/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { ImageItem, CDNType } from '../types';
import { formatBytes } from '../utils';
import { translations, Language } from '../translations';

interface ImageGridProps {
  images: ImageItem[];
  selectedCdn: CDNType;
  selectedCdnName: string;
  lang: Language;
}

export default function ImageGrid({ images, selectedCdn, selectedCdnName, lang }: ImageGridProps) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'path'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const viewMode = 'list'; // Default exclusively to minimalist horizontal long cards
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Pagine clean to fit details
  const [copiedAllText, setCopiedAllText] = useState<'url' | 'markdown' | 'html' | null>(null);
  const [individualCopiedId, setIndividualCopiedId] = useState<string | null>(null);
  const [activeZoomImage, setActiveZoomImage] = useState<ImageItem | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Sorting and filtering logic
  const filteredAndSortedImages = useMemo(() => {
    let result = [...images];

    // Filter by name or path
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerSearch) || 
        item.path.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      } else if (sortBy === 'path') {
        comparison = a.path.localeCompare(b.path);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [images, searchTerm, sortBy, sortOrder]);

  // Pagination bounds
  const paginatedImages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedImages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedImages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedImages.length / itemsPerPage) || 1;

  // Track image load errors
  const handleImageError = (sha: string) => {
    setImageErrors(prev => ({ ...prev, [sha]: true }));
  };

  // Toggle sort order
  const handleSort = (field: 'name' | 'size' | 'path') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // One-click copy methods
  const copyToClipboard = async (text: string, type: 'url' | 'markdown' | 'html', isAll = false, id: string | null = null) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isAll) {
        setCopiedAllText(type);
        setTimeout(() => setCopiedAllText(null), 2500);
      } else if (id) {
        setIndividualCopiedId(`${id}-${type}`);
        setTimeout(() => setIndividualCopiedId(null), 1500);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const getLinksText = (type: 'url' | 'markdown' | 'html') => {
    return filteredAndSortedImages.map(img => {
      const url = img.cdnUrls[selectedCdn];
      if (type === 'markdown') return `![${img.name}](${url})`;
      if (type === 'html') return `<img src="${url}" alt="${img.name}" />`;
      return url;
    }).join('\n');
  };

  const handleCopyAll = (type: 'url' | 'markdown' | 'html') => {
    const text = getLinksText(type);
    copyToClipboard(text, type, true);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="image-grid-section">
      {/* Search and control filter action panel */}
      <div className="bg-white rounded-3xl p-6 space-y-4 shadow-md shadow-slate-200/40 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col gap-3.5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-images text-black text-[16px] shrink-0"></i>
              {t.resultsSubtitleLeft}
              <span className="text-zinc-950 font-extrabold font-mono">{images.length}</span>
              {t.resultsSubtitleRight}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
              {t.resultsDesc} ({selectedCdnName})
            </p>
          </div>

          {/* Batch copy actions with unified black icons */}
          <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-slate-50">
            <button
              onClick={() => handleCopyAll('url')}
              id="copy-all-urls"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
            >
              {copiedAllText === 'url' ? (
                <>
                  <i className="fa-solid fa-check text-[14px] text-white"></i>
                  <span>{t.copiedAllUrls.substring(0, 10)}...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-copy text-[14px] text-white"></i>
                  <span>{t.btnCopyAll}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopyAll('markdown')}
              id="copy-all-markdown"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-black border border-slate-200 hover:bg-[#FAF9F6] transition-all shadow-xs cursor-pointer"
            >
              {copiedAllText === 'markdown' ? (
                <>
                  <i className="fa-solid fa-check text-[14px] text-black"></i>
                  <span>{t.copiedAllMD.substring(0, 10)}...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-code text-[14px] text-black"></i>
                  <span>{t.btnCopyMD}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopyAll('html')}
              id="copy-all-html"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-black border border-slate-200 hover:bg-[#FAF9F6] transition-all shadow-xs cursor-pointer"
            >
              {copiedAllText === 'html' ? (
                <>
                  <i className="fa-solid fa-check text-[14px] text-black"></i>
                  <span>{t.copiedAllHTML.substring(0, 10)}...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-image text-[14px] text-black"></i>
                  <span>{t.btnCopyHTML}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search, Filter inputs */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0 w-full md:max-w-md">
            {/* Search Input bar */}
            <div className="relative flex-1 rounded-lg shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa-solid fa-magnifying-glass text-black text-[15px]"></i>
              </div>
              <input
                type="text"
                id="search-filter-input"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder={t.searchPlaceholder}
                className="block w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs font-sans placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:ring-2 focus:ring-slate-100/60 bg-white"
              />
            </div>
          </div>

          {/* Sorting Buttons */}
          <div className="flex items-center rounded-xl border border-white bg-slate-100/60 p-1 shrink-0 md:ml-auto w-fit select-none" id="sort-controls-panel">
            <b className="text-[10px] text-slate-400 px-2 font-bold uppercase tracking-wider">{t.sortByLabel}</b>
            <button
              onClick={() => handleSort('name')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all
                ${sortBy === 'name' ? 'bg-white shadow-xs text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <span>{t.sortName}</span>
              <i className="fa-solid fa-sort text-[13px] text-black shrink-0"></i>
            </button>
            <button
              onClick={() => handleSort('size')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all
                ${sortBy === 'size' ? 'bg-white shadow-xs text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <span>{t.sortSize}</span>
              <i className="fa-solid fa-sort text-[13px] text-black shrink-0"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main card list visualization */}
      {filteredAndSortedImages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-md shadow-slate-200/40">
          <i className="fa-solid fa-triangle-exclamation text-amber-500 text-3xl mb-3"></i>
          <h4 className="text-sm font-bold text-slate-800">{t.noResultsTitle}</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            {t.noResultsDesc}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* ULTRA-MINIMALIST HORIZONTAL CARD */
        <div className="space-y-3.5" id="cdn-images-list-container">
          {paginatedImages.map((img) => {
            const hasError = imageErrors[img.sha];
            const cdnUrl = img.cdnUrls[selectedCdn];
            
            return (
              <div 
                key={img.sha} 
                className="bg-white rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.005] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side: Thumbnail + File details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail (clean square with small rounded corners) */}
                  <div className="relative w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-2xs hover:ring-2 hover:ring-slate-200/60 transition-all">
                    {hasError ? (
                      <div className="text-center p-1">
                        <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xs"></i>
                      </div>
                    ) : (
                      <img
                        src={cdnUrl}
                        alt={img.name}
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(img.sha)}
                        className="object-cover w-full h-full cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => setActiveZoomImage(img)}
                      />
                    )}
                  </div>

                  {/* Metadata labels */}
                  <div className="min-w-0">
                    <h4 
                      className="text-sm font-bold text-slate-900 truncate tracking-tight font-sans cursor-pointer hover:text-slate-800 transition-colors select-all"
                      onClick={() => setActiveZoomImage(img)}
                      title={img.name}
                    >
                      {img.name}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium truncate select-all">
                      <span className="truncate hover:text-slate-600" title={img.path}>{img.path}</span>
                      <span className="text-slate-300 font-bold">•</span>
                      <span>{formatBytes(img.size, 1)}</span>
                      <span className="text-slate-300 font-bold">•</span>
                      <span className="uppercase font-mono text-[10px] bg-slate-100 rounded px-1.5 py-0.5 text-slate-500">
                        {img.name.split('.').pop() || 'IMG'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Modern, super compact copy actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 select-none">
                  {/* Copy URL */}
                  <button
                    onClick={() => copyToClipboard(cdnUrl, 'url', false, img.sha)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border
                      ${individualCopiedId === `${img.sha}-url`
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold'
                        : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {individualCopiedId === `${img.sha}-url` ? (
                      <>
                        <i className="fa-solid fa-check text-emerald-600"></i>
                        <span>{lang === 'zh' ? '已复制' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-link text-slate-500"></i>
                        <span>URL</span>
                      </>
                    )}
                  </button>

                  {/* Copy Markdown */}
                  <button
                    onClick={() => copyToClipboard(`![${img.name}](${cdnUrl})`, 'markdown', false, img.sha)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border
                      ${individualCopiedId === `${img.sha}-markdown`
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold'
                        : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {individualCopiedId === `${img.sha}-markdown` ? (
                      <>
                        <i className="fa-solid fa-check text-emerald-600"></i>
                        <span>Markdown</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-code text-slate-500"></i>
                        <span>Markdown</span>
                      </>
                    )}
                  </button>

                  {/* Copy HTML */}
                  <button
                    onClick={() => copyToClipboard(`<img src="${cdnUrl}" alt="${img.name}" />`, 'html', false, img.sha)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border
                      ${individualCopiedId === `${img.sha}-html`
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold'
                        : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {individualCopiedId === `${img.sha}-html` ? (
                      <>
                        <i className="fa-solid fa-check text-emerald-600"></i>
                        <span>HTML</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-file-image text-slate-500"></i>
                        <span>HTML</span>
                      </>
                    )}
                  </button>

                  <span className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

                  {/* Open in new tab icon pill */}
                  <a
                    href={cdnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8.5 h-8.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-xs transition-all shadow-2xs"
                    title={t.openNewTab}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-[13px]"></i>
                  </a>

                  {/* Zoom Preview button */}
                  <button
                    onClick={() => setActiveZoomImage(img)}
                    className="w-8.5 h-8.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-xs transition-all shadow-2xs cursor-pointer"
                    title={t.previewTitle}
                  >
                    <i className="fa-solid fa-magnifying-glass-plus text-[13px]"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ULTRA-MINIMALIST BENTO GRID GRID CARD */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="cdn-images-grid-container">
          {paginatedImages.map((img) => {
            const hasError = imageErrors[img.sha];
            const cdnUrl = img.cdnUrls[selectedCdn];
            
            return (
              <div 
                key={img.sha} 
                className="bg-white rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between gap-3"
              >
                {/* Thumbnail and title row */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-slate-200/60 transition-all shrink-0">
                    {hasError ? (
                      <i className="fa-solid fa-triangle-exclamation text-amber-550 text-xs"></i>
                    ) : (
                      <img
                        src={cdnUrl}
                        alt={img.name}
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(img.sha)}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onClick={() => setActiveZoomImage(img)}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 
                      className="text-xs font-bold text-slate-900 truncate font-sans tracking-tight cursor-pointer hover:text-slate-800 transition-colors"
                      onClick={() => setActiveZoomImage(img)}
                      title={img.name}
                    >
                      {img.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={img.path}>{img.path}</p>
                  </div>
                </div>

                {/* File size information badge */}
                <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-medium">
                  <span>{formatBytes(img.size, 1)}</span>
                  <span className="text-slate-300 font-bold">•</span>
                  <span className="uppercase font-mono text-[9px] bg-slate-50 rounded px-1.5 py-0.5 text-slate-500 font-bold border border-slate-100">
                    {img.name.split('.').pop() || 'IMG'}
                  </span>
                </div>

                {/* Bottom simple buttons row */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-2.5 mt-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {selectedCdnName}
                  </span>

                  <div className="flex items-center gap-1.5 select-none text-slate-400">
                    {/* Copy Link button */}
                    <button
                      onClick={() => copyToClipboard(cdnUrl, 'url', false, img.sha)}
                      className={`w-7.5 h-7.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer 
                        ${individualCopiedId === `${img.sha}-url`
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      title={t.copyCellLink}
                    >
                      {individualCopiedId === `${img.sha}-url` ? (
                        <i className="fa-solid fa-check text-[11px] text-emerald-600"></i>
                      ) : (
                        <i className="fa-solid fa-link text-[11px]"></i>
                      )}
                    </button>

                    {/* Copy Markdown syntax button */}
                    <button
                      onClick={() => copyToClipboard(`![${img.name}](${cdnUrl})`, 'markdown', false, img.sha)}
                      className={`w-7.5 h-7.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer
                        ${individualCopiedId === `${img.sha}-markdown`
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      title={`${t.mdCellBadge} Syntax`}
                    >
                      {individualCopiedId === `${img.sha}-markdown` ? (
                        <i className="fa-solid fa-check text-[11px] text-emerald-600"></i>
                      ) : (
                        <i className="fa-solid fa-code text-[11px]"></i>
                      )}
                    </button>

                    {/* View Magnify button */}
                    <button
                      onClick={() => setActiveZoomImage(img)}
                      className="w-7.5 h-7.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer"
                      title={t.previewTitle}
                    >
                      <i className="fa-solid fa-magnifying-glass-plus text-[11px]"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination control with FontAwesome */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-slate-200/40 hover:shadow-lg transition-all duration-300">
          <div className="text-xs text-slate-500">
            {t.pageShowing} <span className="font-extrabold text-slate-700 font-mono">{((currentPage - 1) * itemsPerPage) + 1}</span> {t.pageTo}{' '}
            <span className="font-extrabold text-slate-700 font-mono">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedImages.length)}
            </span>{' '}
            {t.pageOf}{' '}
            <span className="font-extrabold text-slate-800 font-mono">{filteredAndSortedImages.length}</span> {t.pageEntries}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-55 transition-all focus:outline-hidden cursor-pointer
                ${currentPage === 1 ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}`}
            >
              <i className="fa-solid fa-chevron-left text-[14px] text-black"></i>
            </button>
            
            <div className="flex items-center gap-1 text-xs">
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(num => num === 1 || num === totalPages || Math.abs(num - currentPage) <= 1)
                .map((number, idx, arr) => {
                  const isCurrent = currentPage === number;
                  const showEllipsis = idx > 0 && number - arr[idx - 1] > 1;

                  return (
                    <React.Fragment key={number}>
                      {showEllipsis && <span className="text-slate-400 px-1">...</span>}
                      <button
                        onClick={() => setCurrentPage(number)}
                        className={`h-8 w-8 rounded-lg font-bold flex items-center justify-center border cursor-pointer transition-all
                          ${isCurrent 
                            ? 'bg-black border-black text-white shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        {number}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-55 transition-all focus:outline-hidden cursor-pointer
                ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}`}
            >
              <i className="fa-solid fa-chevron-right text-[14px] text-black"></i>
            </button>
          </div>
        </div>
      )}

      {/* ZOOM LIGHTBOX MODAL */}
      {activeZoomImage && (
        <div 
          onClick={() => setActiveZoomImage(null)}
          className="fixed inset-0 bg-white/45 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 animate-fade-in"
          id="zoom-image-lightbox-modal"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-100 max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col"
          >
            {/* Modal Body: image preview */}
            <div className="relative bg-[#0F172A] p-4 min-h-[300px] sm:min-h-[450px] flex items-center justify-center">
              <img
                src={activeZoomImage.cdnUrls[selectedCdn]}
                alt={activeZoomImage.name}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] rounded-md object-contain select-none"
              />
              
              {/* Close button overlay */}
              <button
                onClick={() => setActiveZoomImage(null)}
                className="absolute top-4 right-4 rounded-full h-9 w-9 bg-slate-800/80 hover:bg-slate-700/80 text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-xs shadow-xs"
              >
                <i className="fa-solid fa-xmark text-[15px] text-white"></i>
              </button>
            </div>

            {/* Modal Footer fields */}
            <div className="p-5 sm:p-6 space-y-4 bg-slate-50 select-text">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 font-sans">
                    <i className="fa-solid fa-circle-info text-[15px] text-black"></i>
                    {activeZoomImage.name}
                  </h3>
                  <code className="text-[10px] text-slate-400 font-mono font-medium truncate block mt-0.5">
                    {t.previewPath} {activeZoomImage.path} • {t.previewHash} {activeZoomImage.sha.substring(0, 8)}
                  </code>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-200 text-slate-700 font-extrabold px-2.5 py-1 rounded-full">
                    {formatBytes(activeZoomImage.size)}
                  </span>
                  <a
                    href={activeZoomImage.cdnUrls[selectedCdn]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-all cursor-pointer font-sans"
                  >
                    <span>{t.previewOrig}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[13px] text-black"></i>
                  </a>
                </div>
              </div>

              {/* Dynamic CDN path box */}
              <div className="space-y-2 pt-3 border-t border-slate-150">
                <label className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
                  <i className="fa-solid fa-cloud-arrow-down text-[15px] text-black"></i>
                  {t.previewCurrentCdn} ({selectedCdnName})
                </label>
                <div className="flex rounded-xl shadow-xs overflow-hidden border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={activeZoomImage.cdnUrls[selectedCdn]}
                    className="bg-white flex-1 py-2 px-3 text-xs font-mono text-slate-600 select-all focus:outline-hidden"
                  />
                  <button
                    onClick={() => copyToClipboard(activeZoomImage.cdnUrls[selectedCdn], 'url', false, activeZoomImage.sha)}
                    className={`px-4 text-xs font-bold cursor-pointer border-l border-slate-200 transition-colors flex items-center gap-1.5 select-none
                      ${individualCopiedId === `${activeZoomImage.sha}-url`
                        ? 'bg-black text-white hover:bg-black'
                        : 'bg-black text-white hover:bg-slate-800'
                      }`}
                  >
                    {individualCopiedId === `${activeZoomImage.sha}-url` ? (
                      <>
                        <i className="fa-solid fa-check text-[14px]"></i>
                        <span>{t.copiedCellText}</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-regular fa-copy text-[14px]"></i>
                        <span>{t.copyCellLink.substring(0, 4)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
