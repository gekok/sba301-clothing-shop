export function getItemSubtotal(item) {
  return item.unitPrice * item.quantity;
}

export function getItemsSubtotal(items) {
  return items.reduce((sum, item) => sum + getItemSubtotal(item), 0);
}

