// packages/shared/csp-config.ts
export interface CSPConfig {
  remoteHosts: string[];
  scriptEndpoints?: string[];
  styleEndpoints?: string[];
  apiEndpoints?: string[];
  isDev?: boolean;
}

export function generateCSP(config: CSPConfig): string {
  const { remoteHosts, apiEndpoints = [], isDev = false, scriptEndpoints = [], styleEndpoints= [] } = config;

  const remoteHostsStr = remoteHosts.join(' ');
  const apiEndpointsStr = apiEndpoints.join(' ');
  const styleEndpointsStr = styleEndpoints.join(' ');
  const scriptEndpointsStr = scriptEndpoints.join(' ');
  
  const directives = [
    "default-src 'self' data: blob:;",
    "worker-src 'self' blob:;",
    `connect-src 'self' ${apiEndpointsStr} ${isDev ? 'https://localhost:* http://localhost:*' : ''}`.trim(),
    `img-src 'self' data: blob: ${isDev ? 'https://localhost:* http://localhost:*' : ''}`.trim(),
    `style-src 'self' ${styleEndpointsStr} 'unsafe-inline' ${isDev ? 'https://localhost:* http://localhost:*' : ''}`.trim(),
  ];
  
  // Dev: Allow unsafe-eval for HMR
  // Prod: Remove unsafe-eval, consider nonce-based
  if (isDev) {
    directives.push(
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${remoteHostsStr} ${scriptEndpointsStr}`,
      `script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' ${remoteHostsStr} ${scriptEndpointsStr}`
    );
  } else {
    // Production nonce-based approach (see below)
    directives.push(
      `script-src 'self' ${remoteHostsStr} ${remoteHostsStr} ${scriptEndpointsStr}`,
      `script-src-elem 'self' ${remoteHostsStr} ${remoteHostsStr} ${scriptEndpointsStr}`
    );
  }
  
  return directives.join('; ') + ';';
}

// Environment-specific configs
export const DEV_REMOTE_HOSTS = [
  'http://localhost:5003',
  'http://localhost:5005',
  'http://localhost:5006',
  'http://localhost:5007',

];

export const PROD_REMOTE_HOSTS = [
  'https://tarot.yourdomain.com',
  'https://snake-game.yourdomain.com',
  'https://video-editor.yourdomain.com',
  'https://interface-generator.yourdomain.com',
];