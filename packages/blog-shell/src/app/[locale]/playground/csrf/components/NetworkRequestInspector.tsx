import { Activity, Code, AlertTriangle } from 'lucide-react';

export interface NetworkRequest {
  id: number;
  time: string;
  method: 'POST';
  url: string;
  origin: string;
  headers: {
    [key: string]: string;
  };
  body: string;
  status: number;
  statusText: string;
}

interface NetworkRequestInspectorProps {
  requests: NetworkRequest[];
}

export function NetworkRequestInspector({ requests }: NetworkRequestInspectorProps) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Network Request Inspector
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Watch how cookies are automatically attached to cross-origin requests
        </p>
      </div>
      <div className="p-4">
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No requests yet. Go to Malware tab and launch an attack...
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 overflow-hidden"
              >
                {/* Request Summary */}
                <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded">
                        {request.method}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        request.status === 200 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {request.status} {request.statusText}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {request.time}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-gray-900 dark:text-white break-all">
                    {request.url}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Origin:</span>
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-mono">
                      {request.origin}
                    </span>
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400 font-medium">Cross-Origin Request</span>
                  </div>
                </div>

                {/* Request Headers */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    Request Headers
                  </h5>
                  <div className="space-y-1">
                    {Object.entries(request.headers).map(([key, value]) => (
                      <div
                        key={key}
                        className={`flex gap-2 text-xs font-mono p-2 rounded ${
                          key === 'Cookie' 
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800'
                            : 'bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <span className={`font-semibold min-w-[120px] ${
                          key === 'Cookie'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-purple-600 dark:text-purple-400'
                        }`}>
                          {key}:
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 break-all flex-1">
                          {value}
                          {key === 'Cookie' && (
                            <span className="ml-2 inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="font-semibold">Auto-attached by browser!</span>
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Request Body */}
                {request.body && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
                    <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Request Body
                    </h5>
                    <div className="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                      <code className="text-xs text-gray-900 dark:text-gray-100 break-all">
                        {request.body}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
