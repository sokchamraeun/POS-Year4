const promotedProducts = [
  {
    id: 1,
    name: 'Signature Latte',
    description: 'Rich espresso with steamed milk',
    image: 'https://picsum.photos/seed/latte/400/400',
    is_promoted: true,
    deal: { type: 'b3g1', label: 'Buy 3 Get 1 Free' },
    category: { id: 1, name: 'Coffee' },
    sizes: [
      { id: 1, name: 'Small', pivot: { price: 3.00 } },
      { id: 2, name: 'Medium', pivot: { price: 3.50 } },
      { id: 3, name: 'Large', pivot: { price: 4.00 } },
    ],
    sugar_levels: [
      { id: 1, name: 'No Sugar' },
      { id: 2, name: 'Less Sugar' },
      { id: 3, name: 'Normal Sugar' },
    ],
    ice_levels: [
      { id: 1, name: 'No Ice' },
      { id: 2, name: 'Less Ice' },
      { id: 3, name: 'Normal Ice' },
    ],
    addons: [
      { id: 1, name: 'Boba', price: 0.50 },
      { id: 2, name: 'Whipped Cream', price: 0.75 },
    ],
  },
  {
    id: 2,
    name: 'Matcha Latte',
    description: 'Premium matcha with milk',
    image: 'https://picsum.photos/seed/matcha/400/400',
    is_promoted: true,
    category: { id: 2, name: 'Tea' },
    sizes: [
      { id: 1, name: 'Medium', pivot: { price: 4.00 } },
      { id: 2, name: 'Large', pivot: { price: 4.50 } },
    ],
    sugar_levels: [
      { id: 1, name: 'No Sugar' },
      { id: 2, name: 'Less Sugar' },
      { id: 3, name: 'Normal Sugar' },
    ],
    ice_levels: [
      { id: 1, name: 'No Ice' },
      { id: 2, name: 'Less Ice' },
      { id: 3, name: 'Normal Ice' },
    ],
    addons: [
      { id: 1, name: 'Boba', price: 0.50 },
      { id: 2, name: 'Coffee Jelly', price: 1.00 },
      { id: 3, name: 'Whipped Cream', price: 0.75 },
    ],
  },
  {
    id: 3,
    name: 'Berry Smoothie',
    description: 'Mixed berries blended with yogurt',
    image: 'https://picsum.photos/seed/berry/400/400',
    is_promoted: true,
    category: { id: 3, name: 'Smoothie' },
    sizes: [
      { id: 1, name: 'Medium', pivot: { price: 4.50 } },
      { id: 2, name: 'Large', pivot: { price: 5.00 } },
    ],
    sugar_levels: [
      { id: 1, name: 'No Sugar' },
      { id: 2, name: 'Less Sugar' },
      { id: 3, name: 'Normal Sugar' },
    ],
    ice_levels: [
      { id: 1, name: 'No Ice' },
      { id: 2, name: 'Less Ice' },
      { id: 3, name: 'Normal Ice' },
    ],
    addons: [
      { id: 1, name: 'Whipped Cream', price: 0.75 },
      { id: 2, name: 'Boba', price: 0.50 },
    ],
  },
  {
    id: 4,
    name: 'Iced Caramel Macchiato',
    description: 'Vanilla syrup, milk, espresso over ice',
    image: 'https://picsum.photos/seed/caramel/400/400',
    is_promoted: true,
    category: { id: 1, name: 'Coffee' },
    sizes: [
      { id: 1, name: 'Small', pivot: { price: 3.50 } },
      { id: 2, name: 'Medium', pivot: { price: 4.00 } },
      { id: 3, name: 'Large', pivot: { price: 4.50 } },
    ],
    sugar_levels: [
      { id: 1, name: 'Less Sugar' },
      { id: 2, name: 'Normal Sugar' },
      { id: 3, name: 'Extra Sugar' },
    ],
    ice_levels: [
      { id: 1, name: 'Less Ice' },
      { id: 2, name: 'Normal Ice' },
      { id: 3, name: 'Extra Ice' },
    ],
    addons: [
      { id: 1, name: 'Whipped Cream', price: 0.75 },
      { id: 2, name: 'Caramel Drizzle', price: 0.50 },
    ],
  },
]

export default promotedProducts
