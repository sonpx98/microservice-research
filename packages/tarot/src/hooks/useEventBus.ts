import { useEffect, useRef, useCallback, type DependencyList } from 'react';
import { eventBus } from '@microservice-research/event-bus';
import type { EventKey, EventCallback, EventMap } from '@microservice-research/event-bus';

/**
 * Hook to listen to events with automatic cleanup
 * 
 * @example
 * useEventListener('theme:changed', (payload) => {
 *   console.log('Theme changed to:', payload.theme);
 * });
 */
export function useEventListener<K extends EventKey>(
  event: K,
  callback: EventCallback<K>,
  deps: DependencyList = []
) {
  const callbackRef = useRef(callback);

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler: EventCallback<K> = (payload) => {
      callbackRef.current(payload);
    };

    const unsubscribe = eventBus.on(event, handler);
    
    return unsubscribe;
  }, [event, ...deps]);
}

/**
 * Hook to emit events with a stable reference
 * 
 * @example
 * const emit = useEventEmitter();
 * emit('theme:changed', { theme: 'dark' });
 */
export function useEventEmitter() {
  return useCallback(<K extends EventKey>(event: K, payload: EventMap[K]) => {
    eventBus.emit(event, payload);
  }, []);
}

/**
 * Combined hook for both emitting and listening to events
 * 
 * @example
 * const { emit, on } = useEventBus();
 * 
 * useEffect(() => {
 *   const unsubscribe = on('data:share', (payload) => {
 *     console.log('Received data:', payload);
 *   });
 *   return unsubscribe;
 * }, []);
 * 
 * emit('notification:show', { 
 *   message: 'Hello!', 
 *   type: 'success' 
 * });
 */
export function useEventBus() {
  const emit = useEventEmitter();
  
  const on = useCallback(<K extends EventKey>(
    event: K,
    callback: EventCallback<K>
  ) => {
    return eventBus.on(event, callback);
  }, []);

  const once = useCallback(<K extends EventKey>(
    event: K,
    callback: EventCallback<K>
  ) => {
    return eventBus.once(event, callback);
  }, []);

  return { emit, on, once };
}

/**
 * Hook to listen to an event only once
 * 
 * @example
 * useEventListenerOnce('remote:mounted', (payload) => {
 *   console.log('Remote mounted:', payload.remoteName);
 * });
 */
export function useEventListenerOnce<K extends EventKey>(
  event: K,
  callback: EventCallback<K>,
  deps: DependencyList = []
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler: EventCallback<K> = (payload) => {
      callbackRef.current(payload);
    };

    const unsubscribe = eventBus.once(event, handler);
    
    return unsubscribe;
  }, [event, ...deps]);
}
