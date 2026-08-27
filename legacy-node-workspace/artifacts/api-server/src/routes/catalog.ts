import { Router, type IRouter } from "express";
import {
  ListCategoriesResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  GetProductResponse,
} from "@workspace/api-zod";

export type StoreProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  badge: string | null;
  featured: boolean;
  colors: string[];
  sizes: string[];
};

export const products: StoreProduct[] = [
  {
    id: 1,
    name: "Everyday Linen Shirt",
    category: "Clothing",
    price: 42,
    compareAtPrice: 58,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
    description:
      "A breathable, easygoing linen shirt made for warm days and slow weekends. Cut with a relaxed fit and finished with natural shell buttons.",
    rating: 4.9,
    reviews: 124,
    badge: "Bestseller",
    featured: true,
    colors: ["#F7F4ED", "#7EC151", "#B2054C"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "Cloud Knit Cardigan",
    category: "Clothing",
    price: 68,
    compareAtPrice: null,
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85",
    description:
      "Soft brushed knit with a little extra room for layering. Your new favorite piece for cool mornings and coffee runs.",
    rating: 4.8,
    reviews: 86,
    badge: "New in",
    featured: true,
    colors: ["#D9C4AF", "#B2054C", "#007DCC"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 3,
    name: "Sculptural Ceramic Vase",
    category: "Home",
    price: 36,
    compareAtPrice: 48,
    image:
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=900&q=85",
    description:
      "A hand-finished ceramic vase with a playful silhouette. Designed to hold a few wild stems or stand beautifully on its own.",
    rating: 4.7,
    reviews: 52,
    badge: "Limited",
    featured: true,
    colors: ["#F7F4ED", "#FFB900"],
    sizes: ["One size"],
  },
  {
    id: 4,
    name: "Mini Crossbody Bag",
    category: "Accessories",
    price: 54,
    compareAtPrice: null,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
    description:
      "Compact, considered, and ready for everywhere. This structured crossbody keeps your essentials close without weighing you down.",
    rating: 4.9,
    reviews: 71,
    badge: null,
    featured: true,
    colors: ["#B2054C", "#FFB900", "#007DCC"],
    sizes: ["One size"],
  },
  {
    id: 5,
    name: "Weekend Canvas Tote",
    category: "Accessories",
    price: 29,
    compareAtPrice: 39,
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85",
    description:
      "A roomy cotton canvas tote that carries groceries, books, and all the little things in between.",
    rating: 4.6,
    reviews: 109,
    badge: "Everyday pick",
    featured: false,
    colors: ["#F7F4ED", "#7EC151"],
    sizes: ["One size"],
  },
  {
    id: 6,
    name: "Citrus Glow Candle",
    category: "Beauty",
    price: 24,
    compareAtPrice: null,
    image:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85",
    description:
      "Bright citrus, neroli, and a soft woody base poured into a reusable glass vessel.",
    rating: 4.8,
    reviews: 63,
    badge: "New in",
    featured: false,
    colors: ["#FFB900", "#F7F4ED"],
    sizes: ["One size"],
  },
  {
    id: 7,
    name: "Ribbed Lounge Set",
    category: "Clothing",
    price: 76,
    compareAtPrice: 92,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
    description:
      "A soft, ribbed two-piece set that moves from home to out-and-about without missing a beat.",
    rating: 4.7,
    reviews: 48,
    badge: "Trending",
    featured: false,
    colors: ["#7EC151", "#D10056", "#F7F4ED"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: 8,
    name: "Color Block Throw",
    category: "Home",
    price: 44,
    compareAtPrice: null,
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85",
    description:
      "A cheerful woven throw with tactile fringe, made to bring a little more color to your favorite corner.",
    rating: 4.9,
    reviews: 37,
    badge: "Staff favorite",
    featured: false,
    colors: ["#007DCC", "#FFB900", "#D10056"],
    sizes: ["One size"],
  },
];

const categories = [
  {
    id: "all",
    name: "All products",
    count: products.length,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "Clothing",
    name: "Clothing",
    count: products.filter((product) => product.category === "Clothing").length,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "Home",
    name: "Home",
    count: products.filter((product) => product.category === "Home").length,
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "Accessories",
    name: "Accessories",
    count: products.filter((product) => product.category === "Accessories").length,
    image:
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: "Beauty",
    name: "Beauty",
    count: products.filter((product) => product.category === "Beauty").length,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=85",
  },
];

const router: IRouter = Router();

router.get("/products", (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product filters" });
    return;
  }

  const { search, category, featured } = parsed.data;
  const normalizedSearch = search?.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesSearch =
      !normalizedSearch ||
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesCategory =
      !category || category === "all" || product.category === category;
    const matchesFeatured = featured === undefined || product.featured === featured;
    return matchesSearch && matchesCategory && matchesFeatured;
  });

  res.json(ListProductsResponse.parse(filtered));
});

router.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((item) => item.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(GetProductResponse.parse(product));
});

router.get("/categories", (_req, res) => {
  res.json(ListCategoriesResponse.parse(categories));
});

export default router;