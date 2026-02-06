/**
 * AI Adapter Interface
 * Defines the contract for all AI provider adapters
 */
export interface AiAdapter {
    /**
     * Name of the adapter for logging and identification
     */
    readonly name: string;

    /**
     * Generate text content from a prompt
     */
    generateText(prompt: string): Promise<string>;

    /**
     * Generate JSON content from a prompt
     */
    generateJson<T>(prompt: string): Promise<T>;

    /**
     * Check if the adapter is available (API key configured)
     */
    isAvailable(): boolean;
}
