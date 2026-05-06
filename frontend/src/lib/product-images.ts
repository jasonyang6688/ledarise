export interface ProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export const HAIR_PRODUCT_IMAGES = [
  '/hair/hair-01.jpeg',
  '/hair/hair-02.jpeg',
  '/hair/hair-03.jpeg',
  '/hair/hair-04.png',
  '/hair/hair-05.jpeg',
  '/hair/hair-06.jpeg',
  '/hair/hair-07.jpeg',
  '/hair/hair-08.jpeg',
] as const;

export function stableHairImageFor(seed: string | number): ProductImage {
  const key = String(seed);
  let hash = 0;

  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  return {
    id: hash,
    url: HAIR_PRODUCT_IMAGES[hash % HAIR_PRODUCT_IMAGES.length],
    sortOrder: 0,
  };
}
