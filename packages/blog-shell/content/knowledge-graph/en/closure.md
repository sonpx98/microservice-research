---
title: Closure
category: technical
locale: en
tags: [javascript, functional-programming, scope]
relationships:
  - id: memory-leak
    type: causes
  - id: hoisting
    type: related-to
---

## Closure là gì?

**Closure** là một function có thể truy cập vào scope của function khác, ngay cả khi function đó đã return. Nó cho phép bạn tạo ra các private variables.

### Cách hoạt động

```javascript
function outer() {
  let count = 0;
  
  function inner() {
    count++;
    return count;
  }
  
  return inner;
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
```

Trong ví dụ này, `inner()` là một closure vì nó có thể truy cập vào biến `count` từ scope của `outer()`.

### Sử dụng trong thực tế

**Module Pattern:**
```javascript
const counter = (() => {
  let count = 0;
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count
  };
})();
```

### Lợi ích

- ✅ Encapsulation - tạo private variables
- ✅ Functional programming patterns
- ✅ Callbacks & event handlers

### Lưu ý

Closure có thể giữ reference đến scope cha, dẫn đến memory leak nếu không cẩn thận.
