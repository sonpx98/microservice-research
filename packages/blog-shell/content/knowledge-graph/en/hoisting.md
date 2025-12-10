---
title: Hoisting
category: technical
locale: en
tags: [javascript, scope, execution-context]
relationships:
  - id: closure
    type: related-to
  - id: temporal-dead-zone
    type: causes
---

## Hoisting là gì?

**Hoisting** là hành vi của JavaScript khi nó di chuyển các declarations lên đầu scope trước khi code được execute.

### Variable Hoisting

**var:**
```javascript
console.log(x); // undefined (không lỗi!)
var x = 5;
```

Điều này tương đương với:
```javascript
var x;
console.log(x); // undefined
x = 5;
```

**let/const:**
```javascript
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;
```

### Function Hoisting

Function declarations được hoisted hoàn toàn:
```javascript
sayHi(); // "Hello!" - works fine

function sayHi() {
  console.log("Hello!");
}
```

Nhưng function expressions thì không:
```javascript
sayBye(); // TypeError: sayBye is not a function

var sayBye = function() {
  console.log("Bye!");
};
```

### Temporal Dead Zone (TDZ)

Khi dùng `let` và `const`, biến nằm trong "temporal dead zone" từ lúc scope được tạo đến dòng declaration.

### Best Practices

- ✅ Dùng `const` theo mặc định
- ✅ Dùng `let` khi cần thay đổi
- ❌ Tránh `var` trừ legacy code
- ✅ Declare variables ở đầu scope
