'use client';

/**
 * Mock Giscus Widget for local testing
 * This simulates the real Giscus component without needing GitHub setup
 */

interface GiscusWidgetProps {
  locale: string;
}

export function GiscusWidget({ locale }: GiscusWidgetProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 border-2 border-dashed border-blue-300 dark:border-blue-700">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            🎉 Mock Comments Section
          </h3>
          <span className="text-sm px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-medium">
            ✅ Lazy Loaded!
          </span>
        </div>

        {/* Success Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
            ✨ Lazy Loading Works!
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            This component was loaded dynamically when you scrolled here. 
            Check DevTools Network tab to see the chunk being loaded!
          </p>
        </div>

        {/* Mock Comment */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">Anonymous User</span>
                <span className="text-xs text-gray-500">2 minutes ago</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Great article! This lazy loading implementation is awesome 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Mock Reply */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-3 ml-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
              B
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">Another User</span>
                <span className="text-xs text-gray-500">1 minute ago</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Totally agree! Saved 800KB on initial load 💪
              </p>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Write a comment (Mock - Locale: ${locale})...`}
            rows={3}
            disabled
          />
          <div className="flex justify-end mt-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg opacity-50 cursor-not-allowed"
              disabled
            >
              Comment (Mock)
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>ℹ️ This is a mock component</strong> - Replace with real Giscus by renaming <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">giscus-widget.tsx</code>
          </p>
        </div>
      </div>
    </div>
  );
}
