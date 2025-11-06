// apps/shell/src/types/design-tokens.d.ts
declare module '@microservice-research/design-tokens/css' {
  const css: string
  export default css
}

declare module '@microservice-research/design-tokens/tokens' {
  const css: string
  export default css
}

declare module '@microservice-research/design-tokens/tokens/js' {
  export const tokens: {
    readonly light: Record<string, string>
    readonly dark: Record<string, string>
  }
  
  export function getToken(
    key: string,
    mode?: 'light' | 'dark'
  ): string
  
  export function getAllTokens(
    mode?: 'light' | 'dark'
  ): Record<string, string>
}