---
title: DDD (Domain-Driven Design)
category: slang
locale: en
tags: [architecture, software-design, business]
relationships:
  - id: mvp
    type: related-to
---

## DDD là gì?

**DDD (Domain-Driven Design)** là một approach trong software design nơi mà code structure phản ánh structure của business domain.

### Core Concepts

#### 1. Ubiquitous Language
Dùng chung ngôn ngữ giữa developers và business people.

```
❌ Bad: "user_data_table"
✅ Good: "Customer" (từ business domain)
```

#### 2. Bounded Context
Mỗi module có clear boundary và responsibility.

```
Order Service (context)
├── Aggregate: Order
├── Entity: OrderItem
└── Value Object: Money

Customer Service (context)
├── Aggregate: Customer
├── Entity: Address
```

#### 3. Aggregates
Group entities xung quanh một root entity.

```javascript
class Order {
  id: OrderId;
  items: OrderItem[]; // aggregated
  customer: CustomerId; // reference only
}
```

### Lợi ích

- ✅ Code dễ hiểu (match business logic)
- ✅ Dễ collaborate với business team
- ✅ Flexible cho changes
- ✅ Scalable architecture (microservices friendly)

### Lưu ý

- ⚠️ Requires deep business understanding
- ⚠️ Takes time to get right
- ⚠️ Not always necessary cho small projects

### Trong context micro-frontends

Mỗi micro-frontend có thể đại diện một bounded context của business.

```
Portfolio Project
├── Blog (Publishing Context)
├── CV Generator (Career Context)
├── Tarot (Entertainment Context)
└── Knowledge Graph (Learning Context)
```
