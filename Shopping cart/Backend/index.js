const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory product catalog (mock data)
const products = [
  {
    id: 'pumpkin-seeds',
    title: 'Pumpkin Seeds 240g',
    price: 695,
    rating: 4.5,
    reviews: 158,
    discountPercent: 65,
    image: 'https://images.unsplash.com/photo-1604908554049-1f98bd2dd2f6?w=800&q=80'
  },
  {
    id: 'airpods-pro-2',
    title: 'Airpods Pro 2 (TWS)',
    price: 3740,
    rating: 4.6,
    reviews: 584,
    discountPercent: 53,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'
  },
  {
    id: 'name-bracelet',
    title: 'Customized Name Bracelet',
    price: 299,
    rating: 4.4,
    reviews: 127,
    discountPercent: 63,
    image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=80'
  },
  {
    id: 'track-suit',
    title: 'Summer Track Suit',
    price: 799,
    rating: 4.2,
    reviews: 32,
    discountPercent: 47,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'
  },
  {
    id: 'kitchen-chopper',
    title: 'Kitchen Food Chopper',
    price: 499,
    rating: 4.3,
    reviews: 425,
    discountPercent: 44,
    image: 'https://images.unsplash.com/photo-1590099543481-555f4757f31d?w=800&q=80'
  },
  {
    id: 'gel-heel-socks',
    title: 'Gel Heel Socks Pair',
    price: 98,
    rating: 4.1,
    reviews: 174,
    discountPercent: 45,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'
  }
];

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/products', (_req, res) => {
  res.json(products);
});

// A fake checkout that just echoes back totals
app.post('/api/checkout', (req, res) => {
  const cartItems = req.body && Array.isArray(req.body.items) ? req.body.items : [];
  const productMap = new Map(products.map((p) => [p.id, p]));
  const total = cartItems.reduce((sum, item) => {
    const product = productMap.get(item.id);
    if (!product) return sum;
    const quantity = Number(item.quantity || 0);
    return sum + product.price * quantity;
  }, 0);
  res.json({ success: true, total });
});

app.listen(PORT, () => {
  console.log(`Shopping cart backend running on http://localhost:${PORT}`);
});


