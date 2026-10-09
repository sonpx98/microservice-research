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
    <div className="rounded-lg bg-muted border border-border">
      <div className="p-4 border-b border-border bg-primary/10">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Network Request Inspector
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          Watch how cookies are automatically attached to cross-origin requests
        </p>
      </div>
      <div className="p-4">
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No requests yet. Go to Malware tab and launch an attack...
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-input bg-card overflow-hidden"
              >
                {/* Request Summary */}
                <div className="p-3 bg-danger/10 border-b border-border">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-bold bg-danger text-danger-foreground rounded">
                        {request.method}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        request.status === 200 
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {request.status} {request.statusText}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {request.time}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-foreground break-all">
                    {request.url}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-muted-foreground">Origin:</span>
                    <span className="px-2 py-0.5 bg-danger/10 text-danger rounded font-mono">
                      {request.origin}
                    </span>
                    <AlertTriangle className="w-3 h-3 text-warning" />
                    <span className="text-warning font-medium">Cross-Origin Request</span>
                  </div>
                </div>

                {/* Request Headers */}
                <div className="p-3 border-b border-border">
                  <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    Request Headers
                  </h5>
                  <div className="space-y-1">
                    {Object.entries(request.headers).map(([key, value]) => (
                      <div
                        key={key}
                        className={`flex gap-2 text-xs font-mono p-2 rounded ${
                          key === 'Cookie' 
                            ? 'bg-warning/10 border border-warning/30'
                            : 'bg-muted'
                        }`}
                      >
                        <span className={`font-semibold min-w-[120px] ${
                          key === 'Cookie'
                            ? 'text-warning'
                            : 'text-primary'
                        }`}>
                          {key}:
                        </span>
                        <span className="text-foreground break-all flex-1">
                          {value}
                          {key === 'Cookie' && (
                            <span className="ml-2 inline-flex items-center gap-1 text-warning">
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
                  <div className="p-3 bg-muted">
                    <h5 className="text-xs font-semibold text-foreground mb-2">
                      Request Body
                    </h5>
                    <div className="p-2 bg-card rounded border border-border">
                      <code className="text-xs text-foreground break-all">
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
