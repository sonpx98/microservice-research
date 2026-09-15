---
title: Memory Leak
category: issue
locale: en
tags: [performance, debugging, memory]
relationships:
  - id: closure
    type: caused-by
  - id: hoisting
    type: related-to
---

## Memory Leak là gì?

**Memory Leak** xảy ra khi một chương trình chiếm dụng bộ nhớ nhưng không giải phóng nó, dù không còn cần dùng.

### Nguyên nhân phổ biến

#### 1. Closures
```javascript
function leak() {
  let largeData = new Array(1000000);
  
  return function() {
    console.log(largeData[0]); // giữ reference
  };
}

const fn = leak();
// largeData vẫn ở trong memory
```

#### 2. Event Listeners không được remove
```javascript
const button = document.querySelector('button');
button.addEventListener('click', handler);
// Nếu element bị remove khỏi DOM, listener vẫn ở trong memory
```

#### 3. Global Variables
```javascript
window.cache = []; // sẽ tồn tại đến khi browser close
```

#### 4. setTimeout/setInterval không clear
```javascript
const id = setInterval(() => {
  console.log('polling...');
}, 1000);
// Nếu quên clearInterval, callback vẫn chạy
```

### Cách phát hiện

**Chrome DevTools:**
1. Mở DevTools → Memory tab
2. Chụp heap snapshot
3. So sánh giữa các snapshots

### Cách fix

```javascript
// ✅ Remove event listeners
button.removeEventListener('click', handler);

// ✅ Clear intervals
clearInterval(id);

// ✅ Clear closures
let reference = null;

// ✅ Cleanup trong React
useEffect(() => {
  const handler = () => {};
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);
```

### Tác hại

- 🔴 Application chạy chậm
- 🔴 Browser crash
- 🔴 Xấu user experience
