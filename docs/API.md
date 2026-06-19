# Spotless Solutions — API Input / Output Reference

All payloads use **JSON** with `Content-Type: application/json`. Money values
are integers in the smallest currency unit (paise → `₹249` is `24900`) **or**
plain integers in rupees where noted. Timestamps are ISO 8601 UTC.

Authentication: `Authorization: Bearer <jwt>`.

Standard error envelope:

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Name is required", "field": "name" }
}
```

Standard success envelope (when the resource is wrapped):

```json
{ "success": true, "data": { /* resource */ } }
```

---

## Customer side

### Product listing — `GET /api/products?page=1&category=&search=`

**Response**

```json
{
  "success": true,
  "data": {
    "page": 1,
    "totalPages": 8,
    "totalItems": 152,
    "products": [
      {
        "id": "p_001",
        "name": "Premium Multi-Surface Cleaner 500ml",
        "slug": "premium-multi-surface-cleaner-500ml",
        "category": { "id": "c_01", "name": "Cleaning Liquids" },
        "thumbnail": "https://cdn.../p_001/thumb.jpg",
        "actualPrice": 299,
        "sellingPrice": 249,
        "discountPercent": 17,
        "tags": ["Best Seller", "Eco-Friendly"],
        "avgRating": 4.5,
        "ratingCount": 128,
        "inStock": true
      }
    ]
  }
}
```

### Product detail — `GET /api/products/{productId}`

**Response**

```json
{
  "success": true,
  "data": {
    "id": "p_001",
    "name": "Premium Multi-Surface Cleaner 500ml",
    "description": "Long-form description...",
    "highlights": ["Streak-free", "Safe on glass", "Pleasant fragrance"],
    "category": { "id": "c_01", "name": "Cleaning Liquids" },
    "tags": ["Best Seller"],
    "size": "M",
    "volume": "500ml",
    "sku": "SS-CL-500",
    "barcode": "8901234567890",
    "manufacturer": "Spotless Pvt Ltd",
    "hsn": "3402",
    "gstPercent": 18,
    "productType": "Simple",
    "bundleItems": [],
    "actualPrice": 299,
    "sellingPrice": 249,
    "discountPercent": 17,
    "quantityAvailable": 150,
    "images": ["https://cdn.../1.jpg", "https://cdn.../2.jpg"],
    "videoDemo": "https://cdn.../demo.mp4",
    "enableRating": true,
    "showRating": true,
    "avgRating": 4.5,
    "ratingCount": 128
  }
}
```

For `productType: "Bundle"`, `bundleItems` is populated:

```json
"bundleItems": [
  { "productId": "p_007", "name": "Microfiber Cloth", "quantity": 2 },
  { "productId": "p_011", "name": "Spray Bottle",     "quantity": 1 }
]
```

### Product ratings — `GET /api/products/{productId}/ratings?page=1`

```json
{
  "success": true,
  "data": {
    "avgRating": 4.5,
    "totalReviews": 128,
    "reviews": [
      { "id": "r_01", "user": "Anita S.", "rating": 5, "comment": "Excellent.", "date": "2026-04-12" }
    ]
  }
}
```

### Cart — Add to cart `POST /api/cart/items`

```json
{ "productId": "p_001", "quantity": 2, "variant": { "size": "M", "volume": "500ml" } }
```

Response: full updated cart (see below).

### Cart — Update quantity `PATCH /api/cart/items/{itemId}`

```json
{ "quantity": 3 }
```

### Cart — Get `GET /api/cart`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemId": "ci_01",
        "productId": "p_001",
        "name": "Premium Multi-Surface Cleaner 500ml",
        "thumbnail": "https://cdn.../thumb.jpg",
        "unitPrice": 249,
        "quantity": 2,
        "lineTotal": 498
      }
    ],
    "subtotal": 498,
    "discount": 0,
    "gst": 90,
    "shipping": 0,
    "total": 588
  }
}
```

### Address — Add `POST /api/user/addresses` (max 4 per user)

```json
{
  "label": "Home",
  "fullName": "Anita Sharma",
  "phone": "+91 9876543210",
  "line1": "12 MG Road",
  "line2": "Apt 4B",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pincode": "560001",
  "country": "IN",
  "isDefault": true
}
```

### Address — List `GET /api/user/addresses`

```json
{
  "success": true,
  "data": [
    {
      "id": "ad_01",
      "label": "Home",
      "fullName": "Anita Sharma",
      "phone": "+91 9876543210",
      "line1": "12 MG Road", "line2": "Apt 4B",
      "city": "Bengaluru", "state": "Karnataka",
      "pincode": "560001", "country": "IN",
      "isDefault": true
    }
  ]
}
```

### Customer profile — `GET /api/user/profile`

```json
{
  "success": true,
  "data": {
    "id": "u_001",
    "name": "Anita Sharma",
    "email": "anita@example.com",
    "phone": "+91 9876543210",
    "profilePicture": "https://cdn.../u_001.jpg",
    "addresses": [ /* see above */ ]
  }
}
```

### Customer profile — Update `PUT /api/user/profile` (multipart/form-data when uploading)

```json
{
  "name": "Anita Sharma",
  "email": "anita@example.com",
  "phone": "+91 9876543210",
  "profilePicture": "<binary | url | null>"
}
```

---

## Checkout

### Order creation — `POST /api/orders`

```json
{
  "addressId": "ad_01",
  "items": [
    { "productId": "p_001", "quantity": 2, "unitPrice": 249 }
  ],
  "pricing": {
    "subtotal": 498,
    "discount": 0,
    "gst": 90,
    "shipping": 0,
    "total": 588
  },
  "couponCode": null,
  "notes": ""
}
```

### Payment initiation — `POST /api/payments/initiate`

```json
{
  "orderId": "o_1001",
  "amount": 588,
  "currency": "INR",
  "method": "UPI"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "paymentId": "pay_01",
    "gatewayOrderId": "razor_xxx",
    "redirectUrl": "https://gateway/.../checkout"
  }
}
```

### Order success — `GET /api/orders/{orderId}`

```json
{
  "success": true,
  "data": {
    "orderId": "o_1001",
    "status": "Processing",
    "placedAt": "2026-04-30T10:11:00Z",
    "expectedDelivery": "2026-05-04",
    "items": [ /* same shape as creation */ ],
    "pricing": { "subtotal": 498, "discount": 0, "gst": 90, "shipping": 0, "total": 588 },
    "address": { /* address object */ },
    "payment": { "method": "UPI", "status": "PAID", "paidAt": "2026-04-30T10:11:42Z" }
  }
}
```

---

## Admin side

### Dashboard — `GET /api/admin/dashboard`

```json
{
  "success": true,
  "data": {
    "totals": {
      "ordersToday": 42,
      "revenueToday": 18450,
      "newCustomers": 7,
      "lowStockProducts": 3
    },
    "monthlyOrders": [
      { "month": "Nov", "orders": 120 },
      { "month": "Dec", "orders": 165 }
    ],
    "salesByCategory": [
      { "category": "Cleaning Liquids", "value": 38 },
      { "category": "Gloves",           "value": 22 }
    ]
  }
}
```

### Product — Create `POST /api/admin/products`

```json
{
  "name": "Premium Multi-Surface Cleaner 500ml",
  "description": "Long description...",
  "highlights": ["Streak-free", "Safe on glass"],
  "category": "Cleaning Liquids",
  "tags": ["Best Seller", "Eco-Friendly"],
  "size": "M",
  "volume": "500ml",
  "sku": "SS-CL-500",
  "barcode": "8901234567890",
  "manufacturer": "Spotless Pvt Ltd",
  "hsn": "3402",
  "gstPercent": 18,
  "productType": "Simple",
  "bundleItems": [],
  "actualPrice": 299,
  "sellingPrice": 249,
  "discount": 17,
  "quantity": 150,
  "image": "<url|file>",
  "videoDemo": "<url|file>",
  "enableRating": true,
  "showRating": true,
  "active": true
}
```

For bundles:

```json
{
  "productType": "Bundle",
  "bundleItems": [
    { "productId": "p_007", "quantity": 2 },
    { "productId": "p_011", "quantity": 1 }
  ]
}
```

### Product — Update `PUT /api/admin/products/{productId}`

Same payload as create. Partial updates may use `PATCH`.

### Product — Toggle status `PATCH /api/admin/products/{productId}/status`

```json
{ "active": false }
```

### Product — List `GET /api/admin/products?page=1&search=&category=`

```json
{
  "success": true,
  "data": {
    "page": 1,
    "totalPages": 8,
    "products": [
      {
        "id": "p_001",
        "name": "...",
        "category": "Cleaning Liquids",
        "sellingPrice": 249,
        "quantity": 150,
        "active": true,
        "avgRating": 4.5
      }
    ]
  }
}
```

### Tags — List `GET /api/admin/tags`

```json
{
  "success": true,
  "data": [
    { "id": "t_01", "name": "Best Seller", "icon": "🔥", "color": "#FF6B35" }
  ]
}
```

### Tags — Create `POST /api/admin/tags`

```json
{ "name": "Eco-Friendly", "icon": "🌿", "color": "#2EA46B" }
```

### Category — List `GET /api/admin/categories`

```json
{
  "success": true,
  "data": [
    {
      "id": "c_01",
      "name": "Cleaning Liquids",
      "slug": "cleaning-liquids",
      "icon": "https://cdn.../c_01.png",
      "active": true,
      "productsCount": 24
    }
  ]
}
```

### Category — Create `POST /api/admin/categories`

```json
{ "name": "Kitchen Care", "slug": "kitchen-care", "icon": "<url|file>", "active": true }
```

### Orders — List `GET /api/admin/orders?status=&from=&to=&search=`

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "o_1001",
        "customer": { "id": "u_001", "name": "Anita Sharma" },
        "placedAt": "2026-04-30T10:11:00Z",
        "items": 3,
        "total": 588,
        "status": "Processing",
        "paymentStatus": "PAID"
      }
    ]
  }
}
```

### Orders — Detail `GET /api/admin/orders/{orderId}`

Same shape as `GET /api/orders/{orderId}` plus a `customer` block and a
`statusHistory` array.

### Orders — Cancel `POST /api/admin/orders/{orderId}/cancel`

```json
{ "reason": "Customer requested cancellation", "refund": true }
```

---

## Users & RBAC

### User — Create `POST /api/admin/users`

```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "+91 9123456780",
  "password": "<initial>",
  "userType": "Customer",
  "branch": "Bengaluru",
  "responsibilities": "Premium tier",
  "profilePicture": "<url|file>",
  "status": "Active",
  "permissions": {
    "products":  { "read": true,  "write": false, "delete": false },
    "orders":    { "read": true,  "write": false, "delete": false }
  }
}
```

### User — Update `PUT /api/admin/users/{userId}`

Same shape as create; `password` optional.

### Permissions — Assign `PUT /api/admin/users/{userId}/permissions`

```json
{
  "permissions": {
    "dashboard": { "read": true,  "write": false, "delete": false },
    "products":  { "read": true,  "write": true,  "delete": false },
    "orders":    { "read": true,  "write": true,  "delete": true  }
  }
}
```

### Permissions — Fetch `GET /api/admin/users/{userId}/permissions`

```json
{
  "success": true,
  "data": {
    "userId": "u_042",
    "role": "Staff",
    "permissions": {
      "dashboard": { "read": true,  "write": false, "delete": false },
      "products":  { "read": true,  "write": true,  "delete": false }
    }
  }
}
```

---

## Conventions summary

| Concern | Convention |
|---|---|
| Money | Integer rupees (e.g. `249`) |
| Dates | ISO 8601 UTC (e.g. `2026-04-30T10:11:00Z`) |
| IDs | Prefixed string (`p_`, `o_`, `u_`, `c_`, `t_`, `ad_`) |
| Pagination | `?page=` + response `{ page, totalPages, totalItems }` |
| Booleans | Lowercase `true` / `false`, never `0` / `1` |
| Lists | Always wrapped in `data: [...]` or `data: { items: [...] }` |
| Errors | `{ success: false, error: { code, message, field? } }` |
