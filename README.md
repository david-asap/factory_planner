# 🏭 Warehouse Management System for Glass Manufacturing
*(Work in Progress)*

A comprehensive digital solution for managing warehouse operations in glass manufacturing facilities, specifically designed for window and door glass production companies.

---

## 🎯 Problem Statement

During my time picking up my order from a glass manufacturing facility, I observed significant organizational challenges:

- **Time Waste:** Employees spent excessive time searching for specific orders
- **Poor Visibility:** No one knew exactly where orders were stored
- **Complex Retrieval:** Orders split across multiple shelves required manual checking
- **Inefficient Space Usage:** No systematic approach to optimize storage capacity

---

## 💡 Solution Overview

This warehouse management system provides a visual, interactive interface for tracking and managing glass inventory with real-time capacity monitoring and intelligent order placement.

---

## ✨ Key Features

### 🗺️ Visual Warehouse Layout
- Interactive **34-shelf** warehouse visualization (4×5 + 2×7 configuration)
- **Click-to-view** detailed shelf information
- **Color-coded shelves:** Green (empty) → Yellow (50%) → Red (full)
- **Capacity indicators** directly on shelves (~X remaining glasses)

### 📊 Smart Inventory Management
- **Three glass types** with different storage costs:
  - Small Glass (cost: 1 unit)
  - Regular Glass (cost: 2 units)  
  - Big Glass (cost: 4 units)
- **Shelf capacity:** 100 units per shelf (≈ 50 regular glasses)
- **Total warehouse capacity:** 3,400 units
- Real-time space tracking across all shelves

### 🧠 Intelligent Order Placement Algorithm

**Design Philosophy:**  
The placement algorithm was specifically designed for **small-to-medium orders** to prioritize **customer convenience**. The goal is to minimize the number of shelves a customer needs to visit when picking up their order.

**Alternative Approach (Rejected):**  
I considered creating separate sections for small, medium, and big glasses. However, this would force customers to collect their orders from **minimum 3 different locations**, even for small orders, significantly increasing retrieval time.

**Current Algorithm Benefits:**
- Orders are placed on **as few shelves as possible**
- Small-medium orders typically fit on **1-2 shelves maximum**
- Automatic optimization of shelf space utilization
- Smart distribution when orders span multiple shelves
- Prioritizes empty shelves first, then finds best-fit partial shelves

### 🔍 Core Operations

#### **Add Order (Smart Placement)**
- Automatic ID validation (prevents duplicates)
- Intelligent multi-shelf distribution when needed
- Validates against total warehouse capacity
- Splits large orders optimally across shelves

#### **Add Order On Specific Shelf**
- Manual placement option for special cases
- Real-time capacity validation

#### **Remove Order**
- Automatic capacity restoration across all affected shelves
- Maintains data integrity for split orders

#### **Find Order**
- Quick search within selected shelf
- Visual highlighting with smooth scrolling

### 📈 Real-time Analytics

**Per-Shelf View:**
- Position (Row X, Shelf Y)
- Total glasses and percentage filled
- Remaining capacity by glass type: `X small | Y medium | Z big`
- Complete order list with glass breakdown
- Aggregated totals per shelf

**Global Tracking:**
- Total remaining factory space
- Order distribution visualization
- Multi-shelf order tracking

---

## 🛠️ Technical Implementation

### Architecture
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Data Structure:** Hash Map for O(1) order lookup
- **Storage:** In-memory with object references
- **UI**: Event-driven popup interface

### Core Algorithm: `placeOrderSmart()`
1. Calculate required shelves (full + remainder)
2. Prioritize empty shelves for main capacity
3. **Decision tree for remainders:**
   - If fits on 1 partial shelf → use best-fit
   - If needs 2 partial shelves → find optimal pair
   - Otherwise → use new empty shelf
4. Distribute glasses using greedy algorithm (big → normal → small)
5. Update all affected shelves simultaneously

### Data Models

**Shelf Object:**
```javascript
{
  name: "row.shelf",
  capacity: 100,
  remainingCapacity: X,
  orderIds: [...],
  domElement: <DOM reference>,
  position: {row: X, shelf: Y}
}
```

**Order Object:**
```javascript
{
  ID_NO: X,
  Glassestype: {total_small, total_normal, total_big},
  Located: [
    {shelfName: "X.Y", cost: Z, glasses: {...}}
  ]
}
```

---

## 🚀 Future Enhancements

- Persistent storage (database integration)
- Export/import functionality
- Analytics dashboard
- Print-ready reports
- Barcode/QR integration

---

## 📝 Key Takeaway

**Customer-first design:** The algorithm optimizes for **convenience over perfect space utilization**, ensuring customers can retrieve their orders quickly from minimal locations while still maintaining efficient warehouse operations.
