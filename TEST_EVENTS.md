# Event Bus Testing Guide

## Current Status
- ✅ Servers running: portfolio-home (5004), interface-generator (5007)
- ✅ EventNotificationListener mounted in portfolio-home
- ✅ Event emissions in interface-generator (handleGenerate, handleCopy)
- ✅ Event bus shared in Module Federation config

## Testing Steps

### 1. Basic Browser Test
Open: http://localhost:5004

**Open DevTools Console (F12) and check:**
```javascript
// Should see these logs on page load:
// [Portfolio] Event bus debug mode enabled
// [Portfolio] 🟢 Remote mounted: portfolio-home
```

### 2. Navigate to Interface Generator
Click on "Interface Generator" project in portfolio

**Console should show:**
```javascript
// [Portfolio] 🟢 Remote mounted: interface-generator
```

### 3. Generate TypeScript Interface
In Interface Generator:
1. Enter some JSON like: `{"name": "John", "age": 30}`
2. Click "Generate Interface"

**Expected:**
- Console: `[Portfolio] Notification received: ...`
- UI: Green notification toast in top-right corner
- Message: "✨ Generated GeneratedInterface and GeneratedType successfully!"

### 4. Copy Code
Click "Copy" button in the output

**Expected:**
- Console: `[Portfolio] Notification received: ...`
- UI: Green notification toast
- Message: "Code copied to clipboard!"

### 5. Manual Event Test in Console
```javascript
// Import event bus
import('@microservice-research/event-bus').then(({ eventBus }) => {
  window.testEventBus = eventBus;
  
  // Check active listeners
  console.log('Active listeners:', eventBus.getActiveListeners());
  
  // Manually emit notification
  eventBus.emit('notification:show', {
    message: '🧪 Manual test notification',
    type: 'info',
    duration: 3000
  });
});
```

## Debugging Commands

### Check if event-bus is shared
```javascript
// In browser console
Object.keys(__FEDERATION__.__SHARED__ || {}).filter(k => k.includes('event-bus'))
```

### Check component state
```javascript
// In React DevTools
// Find EventNotificationListener component
// Check notifications state - should be array
```

### Force emit from interface-generator
```javascript
// In interface-generator page console
import('@microservice-research/event-bus').then(({ eventBus }) => {
  eventBus.emit('notification:show', {
    message: 'Test from interface-generator',
    type: 'success',
    duration: 3000
  });
});
```

## Common Issues

### Issue 1: "notifications" is empty array
**Cause:** useEventListener not triggering
**Fix:** Check if event-bus is singleton (shared in Module Federation)

### Issue 2: Console shows no logs
**Cause:** EventNotificationListener not mounted
**Fix:** Check App.tsx has `<EventNotificationListener />`

### Issue 3: Events emit but no UI update
**Cause:** CSS issue (z-index, visibility)
**Fix:** Check `.pf\\:fixed` classes are applied

### Issue 4: Multiple event-bus instances
**Cause:** Not in Module Federation shared config
**Fix:** Verify `shared: [..., '@microservice-research/event-bus']` in vite.config.ts

## Debug URLs
- Portfolio Home: http://localhost:5004
- Interface Generator: http://localhost:5007
- Debug Tool: http://localhost:5004/debug-event-bus.html

## Expected Console Output Timeline

```
[0ms] [Portfolio] Event bus debug mode enabled
[50ms] [Portfolio] 🟢 Remote mounted: portfolio-home

[User clicks Interface Generator]
[200ms] [Portfolio] 🟢 Remote mounted: interface-generator

[User clicks Generate]
[300ms] notifications []
[310ms] notifications [{ id: "...", message: "✨ Generated...", type: "success" }]
[320ms] [Portfolio] Notification received: { message: "✨ Generated...", type: "success", duration: 3000 }
[3320ms] notifications []
```
