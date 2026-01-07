'use client';

import React, { useEffect } from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import type { PageCapacityInfo } from '../lib/pdf-calculator';

interface PDFPreviewModalProps {
  isOpen: boolean;
  pdfUrl: string; // HTML string for srcDoc
  analysis: PageCapacityInfo;
  filename: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PDFPreviewModal({
  isOpen,
  pdfUrl,
  analysis,
  filename,
  isLoading = false,
  onConfirm,
  onCancel,
}: PDFPreviewModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onCancel]);

  // Remove html2pdf overlay that blocks interaction
  useEffect(() => {
    if (!isOpen) return;

    const removeOverlay = () => {
      // Remove html2pdf overlay if exists
      const overlay = document.querySelector('.html2pdf__overlay');
      if (overlay) {
        overlay.remove();
      }

      // Also set pointer-events-none on html2pdf containers
      const containers = document.querySelectorAll('[class*="html2pdf"]');
      containers.forEach((el) => {
        (el as HTMLElement).style.pointerEvents = 'none';
        (el as HTMLElement).style.display = 'none';
      });
    };

    // Initial removal
    removeOverlay();

    // Periodically check in case new overlays appear
    const interval = setInterval(removeOverlay, 100);

    return () => {
      clearInterval(interval);
      // Cleanup: remove all html2pdf elements when modal closes
      const containers = document.querySelectorAll('[class*="html2canvas-container"]');
      containers.forEach((el) => {
        try {
          el.remove();
        } catch (e) {
          // Already removed
        }
      });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasWarnings = analysis?.warnings?.length > 0;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on backdrop, not children
    if (e.currentTarget === e.target) {
      onCancel();
    }
  };

  return (
    <>
      {/* Global style to hide html2pdf overlays */}
      <style>{`
        .html2pdf__overlay {
          display: none !important;
          pointer-events: none !important;
        }
        [class*="html2pdf"] {
          display: none !important;
          pointer-events: none !important;
        }
      `}</style>

      <div 
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        onClick={handleBackdropClick}
        role="presentation"
      >
      {/* Modal Dialog - Will receive click events normally */}
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-6xl w-[90vw] h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            PDF Preview - {filename}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
            aria-label="Close modal"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-4 overflow-hidden p-4 min-h-0">
          {/* Left: PDF Preview */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Generating PDF preview...</p>
              </div>
            ) : pdfUrl ? (
              <iframe
                srcDoc={pdfUrl}
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>PDF preview not available</p>
              </div>
            )}
          </div>

          {/* Right: Analysis & Issues */}
          <div className="w-80 flex flex-col gap-4 overflow-auto">
            {/* Stats */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-2">
              <div className="text-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Estimated Pages:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-bold">
                  {analysis.estimatedPages}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Total Characters:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-bold">
                  {analysis.totalCharacters.toLocaleString()}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Per Page:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-bold">
                  {analysis.characterPerPage.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Warnings/Issues */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-auto">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                {hasWarnings ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Issues Found ({analysis.warnings.length})
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    No Issues
                  </>
                )}
              </h3>

              {hasWarnings ? (
                <div className="space-y-3">
                  {analysis.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-700 rounded p-3 border-l-4 border-amber-500 text-sm"
                    >
                      <p className="text-gray-700 dark:text-gray-200">{warning}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Layout looks great! Ready to export.
                </p>
              )}

              {/* Section Details */}
              {analysis.sections.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                    Section Details
                  </h4>
                  <div className="space-y-2">
                    {analysis.sections.map((section, index) => {
                      const riskIcon =
                        section.riskLevel === 'danger'
                          ? '🔴'
                          : section.riskLevel === 'warning'
                          ? '🟡'
                          : '🟢';

                      return (
                        <div
                          key={index}
                          className="text-xs bg-white dark:bg-gray-700 rounded p-2 text-gray-700 dark:text-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-semibold">{riskIcon} {section.title}</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {section.characters} chars
                            </span>
                          </div>
                          {section.willOverflow && (
                            <p className="text-red-600 dark:text-red-400 mt-1">⚠️ May overflow</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
            type="button"
          >
            Cancel & Edit
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            type="button"
          >
            {hasWarnings ? 'Export Anyway' : 'Export PDF'}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
