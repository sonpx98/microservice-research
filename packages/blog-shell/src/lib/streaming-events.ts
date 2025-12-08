// Simple event emitter for cross-component communication
type EventCallback = () => void;

class StreamingEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string) {
    this.listeners.get(event)?.forEach(callback => callback());
  }
}

// Singleton instance
export const streamingEvents = new StreamingEventBus();

// Event names
export const STREAMING_EVENTS = {
  SKIP_ANIMATION: 'skip-animation',
  ANIMATION_COMPLETE: 'animation-complete',
} as const;
