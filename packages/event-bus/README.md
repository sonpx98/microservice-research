# @microservice-research/event-bus

Type-safe event bus for micro-frontend communication in Module Federation architecture.

## Features

- ✅ Type-safe events with TypeScript
- ✅ Singleton pattern for shared state
- ✅ No window object dependency
- ✅ SSR/SSG compatible
- ✅ Production-ready
- ✅ Debug mode for development

## Installation

```bash
# In monorepo
pnpm add @microservice-research/event-bus
```

## Usage

```typescript
import { eventBus } from '@microservice-research/event-bus';

// Emit event
eventBus.emit('notification:show', {
  message: 'Hello!',
  type: 'success',
  duration: 3000
});

// Listen to event
const unsubscribe = eventBus.on('notification:show', ({ message, type }) => {
  console.log(`${type}: ${message}`);
});

// Cleanup
unsubscribe();
```

## Available Events

- `theme:changed` - Theme switch events
- `notification:show` - Show notifications
- `data:share` - Share data between remotes
- `user:action` - User interaction tracking
- `remote:mounted` - Remote component loaded
- `remote:unmounted` - Remote component unloaded
- `navigation:change` - Navigation events

## API

### `eventBus.emit(event, payload)`
Emit an event with typed payload.

### `eventBus.on(event, callback)`
Subscribe to an event. Returns unsubscribe function.

### `eventBus.once(event, callback)`
Subscribe to an event once. Auto-unsubscribes after first call.

### `eventBus.off(event, callback)`
Unsubscribe from an event.

### `eventBus.clear(event?)`
Clear all listeners for an event, or all events if no event specified.

### `eventBus.getActiveListeners()`
Get count of active listeners for debugging.

### `eventBus.setDebugMode(enabled)`
Enable/disable debug logging.

## License

MIT
