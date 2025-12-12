export type PriceWithOptionalOffer = {
  price: number;
  offer?: number | null;
};

export function getFinalPrice(item: PriceWithOptionalOffer): number {
  if (!item.offer || item.offer <= 0) {
    return item.price;
  }

  const discountFactor = 1 - item.offer / 100;
  const result = item.price * discountFactor;
  return Math.round(result * 100) / 100;
}
