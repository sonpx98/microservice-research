---
title: Temporal Dead Zone (TDZ)
category: issue
locale: en
tags: [javascript, scope, hoisting]
relationships:
  - id: hoisting
    type: caused-by
---

## Temporal Dead Zone là gì?

**Temporal Dead Zone (TDZ)** là khoảng thời gian từ khi scope được tạo đến khi biến được khai báo/khởi tạo. Truy cập biến trong TDZ sẽ throw `ReferenceError`.

### Ví dụ

```javascript
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 5;
```

TDZ được tạo từ lúc scope bắt đầu cho đến dòng `let x = 5`.

### Diagram

```
        ← TDZ starts here
console.log(x); // ReferenceError
let x = 5;
        ← TDZ ends here, x có thể truy cập
console.log(x); // 5
```

### Với var thì khác

```javascript
console.log(y); // undefined (không throw error)
var y = 5;
```

Với `var`, hoisting nhưng không TDZ. Giá trị mặc định là `undefined`.

### Trong function scope

```javascript
function example() {
  console.log(typeof x); // ReferenceError (TDZ!)
  let x = 5;
}

example();
```

Tại sao không phải `undefined`? Vì JavaScript biết `x` tồn tại (hoisting), nhưng chưa initialize.

### Điều kiện của TDZ

- ✅ Chỉ áp dụng cho `let`, `const`, `class`
- ✅ Áp dụng cả function parameters với default values
- ✅ Không áp dụng cho `var`

### Bài học

- ✅ Declare variables trước khi dùng
- ✅ TDZ giúp catch lỗi sớm
- ✅ `const` và `let` an toàn hơn `var`
