// Cart service — business logic for cart ops.
// Persistence handled in CartContext via storage layer.
export const cartService = {
  addItem(items, product, quantity = 1) {
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      return items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
    }
    return [...items, { id: product.id, name: product.name, price: product.price, image: product.image, quantity }];
  },
  updateQuantity(items, id, quantity) {
    if (quantity <= 0) return items.filter((i) => i.id !== id);
    return items.map((i) => (i.id === id ? { ...i, quantity } : i));
  },
  removeItem(items, id) {
    return items.filter((i) => i.id !== id);
  },
  total(items) {
    return items.reduce((s, i) => s + i.price * i.quantity, 0);
  },
  count(items) {
    return items.reduce((s, i) => s + i.quantity, 0);
  },
};
