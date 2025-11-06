/**
 * Type-safe Event Bus for Micro-Frontend Communication
 * Production-ready singleton without window dependency
 */

// Define event types and their payload structures
export interface EventMap {
  // Theme events
  'theme:changed': { theme: 'light' | 'dark' };
  
  // Navigation events
  'navigation:change': { path: string; source: string };
  
  // User events
  'user:action': { action: string; data?: unknown };
  
  // Data sharing events
  'data:share': { type: string; payload: unknown; source: string };
  
  // Notification events
  'notification:show': { 
    message: string; 
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  };
  
  // Remote lifecycle events
  'remote:mounted': { remoteName: string };
  'remote:unmounted': { remoteName: string };
}

type EventKey = keyof EventMap;
type EventCallback<K extends EventKey> = (payload: EventMap[K]) => void;

class EventBus {
  private listeners: Map<EventKey, Set<EventCallback<any>>> = new Map();
  private debugMode: boolean = false;

  /**
   * Enable debug mode to log all events
   */
  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }

  /**
   * Subscribe to an event
   */
  on<K extends EventKey>(event: K, callback: EventCallback<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);

    if (this.debugMode) {
      console.log(`[EventBus] Listener added for "${event}"`);
    }

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends EventKey>(event: K, callback: EventCallback<K>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
      
      if (this.debugMode) {
        console.log(`[EventBus] Listener removed for "${event}"`);
      }
    }
  }

  /**
   * Emit an event with payload
   */
  emit<K extends EventKey>(event: K, payload: EventMap[K]): void {
    const callbacks = this.listeners.get(event);
    
    if (this.debugMode) {
      console.log(`[EventBus] Event "${event}" emitted with payload:`, payload);
    }

    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`[EventBus] Error in listener for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event once (auto-unsubscribe after first call)
   */
  once<K extends EventKey>(event: K, callback: EventCallback<K>): () => void {
    const wrappedCallback: EventCallback<K> = (payload) => {
      callback(payload);
      this.off(event, wrappedCallback);
    };
    
    return this.on(event, wrappedCallback);
  }

  /**
   * Get all active event listeners (for debugging)
   */
  getActiveListeners(): Record<string, number> {
    const result: Record<string, number> = {};
    this.listeners.forEach((callbacks, event) => {
      result[event] = callbacks.size;
    });
    return result;
  }

  /**
   * Clear all listeners for an event or all events
   */
  clear(event?: EventKey): void {
    if (event) {
      this.listeners.delete(event);
      if (this.debugMode) {
        console.log(`[EventBus] All listeners cleared for "${event}"`);
      }
    } else {
      this.listeners.clear();
      if (this.debugMode) {
        console.log('[EventBus] All listeners cleared');
      }
    }
  }
}

// Force global singleton across all Module Federation boundaries
// This is necessary because Module Federation may create multiple instances
// when mixing dev mode (shell) with preview mode (remotes)
const GLOBAL_KEY = Symbol.for('@microservice-research/event-bus');

function getEventBus(): EventBus {
  // Use globalThis for true cross-boundary singleton
  const globalScope = globalThis as any;
  
  if (!globalScope[GLOBAL_KEY]) {
    globalScope[GLOBAL_KEY] = new EventBus();
    const instanceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    (globalScope[GLOBAL_KEY] as any).__instanceId = instanceId;
    console.log('[EventBus] ✨ GLOBAL singleton instance created with ID:', instanceId);
    console.log('[EventBus] This instance is now shared across all micro-frontends');
  } else {
    console.log('[EventBus] ♻️  Reusing existing global instance:', (globalScope[GLOBAL_KEY] as any).__instanceId);
  }
  
  return globalScope[GLOBAL_KEY];
}

// Export singleton instance
export const eventBus = getEventBus();

// Export class for testing
export { EventBus };

// Export types
export type { EventKey, EventCallback };
