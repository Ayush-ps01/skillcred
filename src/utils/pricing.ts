export const FREE_SHIPPING_THRESHOLD_INR = 2000;

export function amountUntilFreeShipping(totalInr: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_INR - totalInr);
}

export function isCloseToThreshold(totalInr: number, windowInr: number = 250): boolean {
  const delta = amountUntilFreeShipping(totalInr);
  return delta > 0 && delta <= windowInr;
}



