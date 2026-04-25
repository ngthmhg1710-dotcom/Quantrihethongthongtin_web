export interface Product {
  id: number;
  name: string;
  price: number;
  stock?: number;
  image: string;
  category: string;
  description: string;
  ingredients: string[];
  skinTypes: string[];
  rating: number;
  reviews: Review[];
  featured?: boolean;
  step?: number;
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Hydrating Rose Serum",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop",
    category: "Serum",
    description: "A lightweight, fast-absorbing serum infused with rose extract to deeply hydrate and brighten your skin. Perfect for all skin types.",
    ingredients: ["Rose Extract", "Hyaluronic Acid", "Vitamin C", "Niacinamide"],
    skinTypes: ["dry", "normal", "sensitive"],
    rating: 4.8,
    reviews: [
      { id: 1, user: "Emma S.", rating: 5, comment: "This serum is amazing! My skin feels so soft and hydrated.", date: "2026-04-15" },
      { id: 2, user: "Sophia M.", rating: 5, comment: "Love the rose scent and how it absorbs quickly!", date: "2026-04-10" }
    ],
    featured: true,
    step: 3
  },
  {
    id: 2,
    name: "Gentle Foam Cleanser",
    price: 28.00,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop",
    category: "Cleanser",
    description: "A gentle, pH-balanced foam cleanser that removes makeup and impurities without stripping your skin's natural moisture.",
    ingredients: ["Glycerin", "Chamomile Extract", "Green Tea", "Aloe Vera"],
    skinTypes: ["oily", "normal", "combination"],
    rating: 4.6,
    reviews: [
      { id: 3, user: "Olivia K.", rating: 5, comment: "Perfect for my sensitive skin!", date: "2026-04-12" }
    ],
    featured: true,
    step: 1
  },
  {
    id: 3,
    name: "Vitamin C Brightening Cream",
    price: 52.00,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=500&fit=crop",
    category: "Moisturizer",
    description: "A rich moisturizing cream packed with Vitamin C to brighten and even out skin tone while providing intense hydration.",
    ingredients: ["Vitamin C", "Shea Butter", "Jojoba Oil", "Peptides"],
    skinTypes: ["dry", "normal", "combination"],
    rating: 4.9,
    reviews: [
      { id: 4, user: "Ava L.", rating: 5, comment: "My skin looks so much brighter!", date: "2026-04-08" }
    ],
    featured: true,
    step: 4
  },
  {
    id: 4,
    name: "Exfoliating Toner",
    price: 32.00,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=500&fit=crop",
    category: "Toner",
    description: "An alcohol-free toner with gentle AHA/BHA to exfoliate dead skin cells and refine pores for a smoother complexion.",
    ingredients: ["Glycolic Acid", "Salicylic Acid", "Rose Water", "Witch Hazel"],
    skinTypes: ["oily", "combination", "normal"],
    rating: 4.7,
    reviews: [],
    step: 2
  },
  {
    id: 5,
    name: "Nourishing Night Cream",
    price: 58.00,
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&h=500&fit=crop",
    category: "Night Cream",
    description: "A deeply nourishing night cream that works while you sleep to repair and rejuvenate your skin.",
    ingredients: ["Retinol", "Ceramides", "Squalane", "Vitamin E"],
    skinTypes: ["dry", "normal", "mature"],
    rating: 4.8,
    reviews: [
      { id: 5, user: "Isabella R.", rating: 5, comment: "Wake up with glowing skin every morning!", date: "2026-04-05" }
    ]
  },
  {
    id: 6,
    name: "SPF 50 Sunscreen",
    price: 35.00,
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=500&fit=crop",
    category: "Sunscreen",
    description: "Lightweight, non-greasy sunscreen with SPF 50 that protects against UVA/UVB rays without leaving a white cast.",
    ingredients: ["Zinc Oxide", "Titanium Dioxide", "Vitamin E", "Aloe Vera"],
    skinTypes: ["all"],
    rating: 4.9,
    reviews: [],
    step: 5
  },
  {
    id: 7,
    name: "Hydrating Face Mask",
    price: 42.00,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&h=500&fit=crop",
    category: "Mask",
    description: "A cooling gel mask that instantly hydrates and soothes stressed skin. Use 2-3 times a week for best results.",
    ingredients: ["Hyaluronic Acid", "Cucumber Extract", "Aloe Vera", "Green Tea"],
    skinTypes: ["dry", "sensitive", "normal"],
    rating: 4.7,
    reviews: []
  },
  {
    id: 8,
    name: "Eye Renewal Cream",
    price: 48.00,
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=500&h=500&fit=crop",
    category: "Eye Cream",
    description: "A targeted eye cream that reduces dark circles, puffiness, and fine lines for a refreshed, youthful look.",
    ingredients: ["Caffeine", "Peptides", "Vitamin K", "Hyaluronic Acid"],
    skinTypes: ["all"],
    rating: 4.6,
    reviews: []
  },
  {
    id: 9,
    name: "Clarifying Clay Mask",
    price: 38.00,
    image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=500&h=500&fit=crop",
    category: "Mask",
    description: "A purifying clay mask that draws out impurities and excess oil, leaving skin clean and refreshed.",
    ingredients: ["Kaolin Clay", "Bentonite Clay", "Tea Tree Oil", "Charcoal"],
    skinTypes: ["oily", "combination"],
    rating: 4.5,
    reviews: []
  },
  {
    id: 10,
    name: "Lip Care Set",
    price: 25.00,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop",
    category: "Lip Care",
    description: "A nourishing lip balm and scrub duo to keep your lips soft, smooth, and perfectly moisturized.",
    ingredients: ["Shea Butter", "Coconut Oil", "Vitamin E", "Beeswax"],
    skinTypes: ["all"],
    rating: 4.8,
    reviews: []
  }
];

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
