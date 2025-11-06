# 🐛 Fix: Event Bus Singleton Issue

## Vấn đề
Portfolio-home không nhận được notification events từ interface-generator vì mỗi remote đang sử dụng instance riêng của event bus thay vì shared instance.

## ✅ Solution Applied

### 1. Event Bus Singleton trên Window Object
Updated `packages/shared/lib/event-bus.ts`:
```typescript
// Store on window to ensure single instance across Module Federation
declare global {
  interface Window {
    __EVENT_BUS__?: EventBus;
  }
}

if (typeof window !== 'undefined' && !window.__EVENT_BUS__) {
  window.__EVENT_BUS__ = new EventBus();
}

export const eventBus = typeof window !== 'undefined' 
  ? window.__EVENT_BUS__! 
  : new EventBus();
```

### 2. Expose Event Bus từ Portfolio-Home
Updated `packages/portfolio-home/vite.config.ts`:
```typescript
exposes: {
  './app': './src/App.tsx',
  './event-bus': '../shared/lib/event-bus',  // ← Added this
}
```

## 🧪 Testing Steps

### Step 1: Restart Dev Servers
```bash
# Stop current servers (Ctrl+C)

# Terminal 1: Start remotes
pnpm start:remotes

# Terminal 2: Start portfolio  
pnpm start:portfolio
```

### Step 2: Open Browser Console
Navigate to: http://localhost:5004

Open Developer Tools (F12) → Console tab

### Step 3: Verify Singleton
Paste this in console:
```javascript
// Check if event bus singleton exists
console.log('Event bus on window:', window.__EVENT_BUS__);
console.log('Active listeners:', window.__EVENT_BUS__.getActiveListeners());
```

**Expected output:**
```
Event bus on window: EventBus { listeners: Map(7), debugMode: true }
Active listeners: {
  "notification:show": 1,
  "remote:mounted": 1,
  "remote:unmounted": 1,
  "user:action": 1,
  "data:share": 1
}
```

### Step 4: Test Manual Event
Paste in console:
```javascript
window.__EVENT_BUS__.emit('notification:show', {
  message: '🧪 Test from console!',
  type: 'success',
  duration: 3000
});
```

**Expected:** Green notification appears in top-right corner

### Step 5: Test Interface Generator
1. Click "Interface Generator" card
2. Click "Load Example"  
3. Click "Generate"

**Expected:**
- Console shows: `[EventBus] Event "notification:show" emitted`
- Console shows: `[Portfolio] Notification received`
- Green notification appears: "TypeScript code generated successfully!"

### Step 6: Verify Cross-Remote Communication
Console should show:
```
[EventBus] Event "remote:mounted" emitted with payload: { remoteName: "interface-generator" }
[Portfolio] 🟢 Remote mounted: interface-generator
[EventBus] Event "data:share" emitted with payload: { type: "typescript-generated", ... }
[Portfolio] 📤 Data shared from interface-generator: {...}
[EventBus] Event "notification:show" emitted with payload: { message: "TypeScript code generated successfully!", ... }
[Portfolio] Notification received: {...}
```

## 🔍 Debugging Commands

If notifications still don't appear, check:

```javascript
// 1. Check if EventNotificationListener is mounted
const listeners = window.__EVENT_BUS__.getActiveListeners();
console.log('Notification listeners:', listeners['notification:show']);
// Should show 1 or more

// 2. Check React component state
// In React DevTools → Components → EventNotificationListener
// Check 'notifications' state array

// 3. Manually trigger notification
window.__EVENT_BUS__.emit('notification:show', {
  message: 'Manual test',
  type: 'info',
  duration: 5000
});

// 4. Check CSS (notifications might be hidden)
document.querySelector('[class*="pf:fixed"]'); // Should find notification container

// 5. Enable debug mode if not already
window.__EVENT_BUS__.setDebugMode(true);
```

## 📊 Expected Console Output

### On Page Load
```
[Portfolio] Event bus debug mode enabled
[EventBus] Listener added for "notification:show"
[EventBus] Listener added for "remote:mounted"
[EventBus] Listener added for "remote:unmounted"
[EventBus] Listener added for "user:action"
[EventBus] Listener added for "data:share"
```

### On Interface Generator Load
```
[EventBus] Event "remote:mounted" emitted with payload: { remoteName: "interface-generator" }
[Portfolio] 🟢 Remote mounted: interface-generator
```

### On Generate Code
```
[EventBus] Event "data:share" emitted with payload: {...}
[Portfolio] 📤 Data shared from interface-generator: {...}
[EventBus] Event "notification:show" emitted with payload: {...}
[Portfolio] Notification received: { id: "...", message: "TypeScript code generated successfully!", type: "success", duration: 3000 }
notifications [{ id: "...", message: "...", type: "success", duration: 3000 }]
```

## ❓ Still Not Working?

### Check 1: Event Bus Instance
```javascript
// Should be same instance in all contexts
console.log('Same instance?', window.__EVENT_BUS__ === eventBus);
```

### Check 2: Module Federation
```javascript
// Check if remotes are loaded
console.log('Loaded remotes:', Object.keys(__FEDERATION__));
```

### Check 3: React State
Open React DevTools → Components → EventNotificationListener
- Check if `notifications` state updates when event is emitted
- If state updates but no UI → CSS issue
- If state doesn't update → event listener not working

### Check 4: Build vs Dev
Make sure you're running in dev mode (hot reload):
```bash
# Should see:
vite v7.1.9 dev server running at:
➜  Local:   http://localhost:5004/
```

## ✅ Success Indicators

- [ ] `window.__EVENT_BUS__` exists in console
- [ ] Active listeners show correct counts
- [ ] Manual test notification appears
- [ ] Interface Generator notifications appear
- [ ] Console shows event flow logs
- [ ] Multiple remotes can communicate

## 🎉 Once Working

You should see:
1. 🟢 Green notification when generating code
2. 📊 Console logs showing event flow
3. 🔄 Real-time updates across remotes
4. ✅ All tests passing

The singleton pattern ensures all remotes share the same event bus instance, enabling true cross-remote communication! 🚀
