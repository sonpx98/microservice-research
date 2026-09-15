---
title: Prototype Chain
category: technical
locale: en
tags: [javascript, oop, inheritance]
relationships:
  - id: closure
    type: related-to
---

## Prototype Chain là gì?

**Prototype Chain** là cơ chế mà JavaScript dùng để tìm properties và methods từ một object. Khi truy cập một property, JavaScript sẽ tìm từ object đó, rồi lên prototype của nó, rồi prototype của prototype...

### Cách hoạt động

```javascript
const parent = { greet() { return "Hi!"; } };
const child = Object.create(parent);

child.greet(); // "Hi!" - tìm từ parent qua prototype chain
console.log(child.hasOwnProperty('greet')); // false - greet ở parent
```

### Diagram

```
child object
    ↓
child.__proto__ (= parent)
    ↓
parent.__proto__ (= Object.prototype)
    ↓
Object.prototype.__proto__ (= null)
```

### Constructor Function

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(this.name + " speaks");
};

const dog = new Animal("Dog");
dog.speak(); // "Dog speaks"
```

### instanceof hoạt động như thế nào

```javascript
dog instanceof Animal // true - dog.__proto__ === Animal.prototype?
```

### Lợi ích

- ✅ Memory efficient - methods shared qua prototype
- ✅ Inheritance mà không cần copy
- ✅ Dynamic nature - có thể thêm methods lúc runtime

### Cảnh báo

Hiệu chỉnh `Object.prototype` sẽ ảnh hưởng tất cả objects!
