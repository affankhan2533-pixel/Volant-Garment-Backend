import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

// All 46 images — ordered: flat-lay → studio → model-wearing
const SHIRTS = [
  // Group 1: flat-lay / yellow bg
  { name: 'The Oxford Classic',     category: 'formal',          image: '/shirts/image.png',              price: 4999,  discount: 3999,  featured: true,  newArrival: true  },
  { name: 'The Ivory Linen',        category: 'luxury',          image: '/shirts/image copy.png',          price: 7999,  discount: null,  featured: true,  newArrival: false },
  { name: 'The Midnight Black',     category: 'formal',          image: '/shirts/image copy 2.png',        price: 5999,  discount: 4999,  featured: true,  newArrival: false },
  { name: 'The Stone Casual',       category: 'casual',          image: '/shirts/image copy 3.png',        price: 3499,  discount: 2999,  featured: true,  newArrival: true  },
  { name: 'The Chambray Blue',      category: 'casual',          image: '/shirts/image copy 4.png',        price: 3999,  discount: null,  featured: false, newArrival: true  },
  { name: 'The Gold Edition',       category: 'limited-edition', image: '/shirts/image copy 5.png',        price: 12999, discount: null,  featured: true,  newArrival: false },
  { name: 'The Streetwear Tee',     category: 'streetwear',      image: '/shirts/image copy 6.png',        price: 2999,  discount: 2499,  featured: false, newArrival: true  },
  { name: 'The Classic White',      category: 'classic',         image: '/shirts/image copy 7.png',        price: 4499,  discount: 3799,  featured: false, newArrival: false },
  { name: 'The Slim Formal',        category: 'formal',          image: '/shirts/image copy 8.png',        price: 5499,  discount: null,  featured: false, newArrival: false },
  { name: 'The Relaxed Linen',      category: 'casual',          image: '/shirts/image copy 9.png',        price: 3799,  discount: 3299,  featured: false, newArrival: true  },
  // Group 2: studio / plain bg
  { name: 'The Luxury Silk',        category: 'luxury',          image: '/shirts/image copy 10.png',       price: 9999,  discount: 8499,  featured: true,  newArrival: false },
  { name: 'The Heritage Check',     category: 'classic',         image: '/shirts/image copy 11.png',       price: 4299,  discount: null,  featured: false, newArrival: false },
  { name: 'The Premium Poplin',     category: 'luxury',          image: '/shirts/image copy 12.png',       price: 6999,  discount: 5999,  featured: true,  newArrival: true  },
  { name: 'The Tailored Fit',       category: 'formal',          image: '/shirts/image copy 13.png',       price: 5299,  discount: 4499,  featured: false, newArrival: true  },
  { name: 'The Resort Linen',       category: 'casual',          image: '/shirts/image copy 14.png',       price: 4199,  discount: null,  featured: false, newArrival: true  },
  { name: 'The Monochrome Edit',    category: 'streetwear',      image: '/shirts/image copy 15.png',       price: 3299,  discount: 2799,  featured: false, newArrival: false },
  { name: 'The Signature Oxford',   category: 'luxury',          image: '/shirts/image copy 16.png',       price: 8499,  discount: 7499,  featured: true,  newArrival: false },
  { name: 'The Bespoke Stripe',     category: 'classic',         image: '/shirts/image copy 17.png',       price: 4799,  discount: null,  featured: false, newArrival: true  },
  { name: 'The Oversized Drape',    category: 'streetwear',      image: '/shirts/image copy 18.png',       price: 3599,  discount: 2999,  featured: false, newArrival: true  },
  { name: 'The Mandarin Collar',    category: 'formal',          image: '/shirts/image copy 19.png',       price: 5799,  discount: null,  featured: false, newArrival: false },
  // Group 3: model wearing
  { name: 'The Artisan Weave',      category: 'luxury',          image: '/shirts/image copy 20.png',       price: 11999, discount: 9999,  featured: true,  newArrival: false },
  { name: 'The Coastal Chambray',   category: 'casual',          image: '/shirts/image copy 21.png',       price: 3899,  discount: 3299,  featured: false, newArrival: true  },
  { name: 'The Velvet Touch',       category: 'limited-edition', image: '/shirts/image copy 22.png',       price: 14999, discount: null,  featured: true,  newArrival: false },
  { name: 'The Urban Slim',         category: 'streetwear',      image: '/shirts/image copy 23.png',       price: 2799,  discount: 2299,  featured: false, newArrival: false },
  { name: 'The Linen Blend',        category: 'casual',          image: '/shirts/image copy 24.png',       price: 3699,  discount: null,  featured: false, newArrival: true  },
  { name: 'The Formal Elegance',    category: 'formal',          image: '/shirts/image copy 25.png',       price: 6299,  discount: 5499,  featured: false, newArrival: false },
  { name: 'The Couture Edition',    category: 'limited-edition', image: '/shirts/image copy 26.png',       price: 18999, discount: null,  featured: true,  newArrival: false },
  { name: 'The Everyday Essential', category: 'classic',         image: '/shirts/image copy 27.png',       price: 2999,  discount: 2499,  featured: false, newArrival: true  },
  { name: 'The Archive Piece',      category: 'luxury',          image: '/shirts/image copy 28.png',       price: 9499,  discount: 7999,  featured: true,  newArrival: false },
  { name: 'The Refined Cut',        category: 'formal',          image: '/shirts/image copy 29.png',       price: 5699,  discount: 4999,  featured: false, newArrival: true  },
  { name: 'The Summer Breeze',      category: 'casual',          image: '/shirts/image copy 30.png',       price: 3299,  discount: null,  featured: false, newArrival: true  },
  { name: 'The Night Formal',       category: 'formal',          image: '/shirts/image copy 31.png',       price: 6499,  discount: 5499,  featured: false, newArrival: false },
  { name: 'The Pastel Dream',       category: 'casual',          image: '/shirts/image copy 32.png',       price: 3599,  discount: 2999,  featured: false, newArrival: true  },
  { name: 'The Power Suit Shirt',   category: 'formal',          image: '/shirts/image copy 33.png',       price: 7499,  discount: 6499,  featured: true,  newArrival: false },
  { name: 'The Minimal White',      category: 'classic',         image: '/shirts/image copy 34.png',       price: 4199,  discount: null,  featured: false, newArrival: false },
  { name: 'The Textured Weave',     category: 'luxury',          image: '/shirts/image copy 35.png',       price: 8999,  discount: 7499,  featured: false, newArrival: true  },
  { name: 'The Street Essential',   category: 'streetwear',      image: '/shirts/image copy 36.png',       price: 2699,  discount: 2199,  featured: false, newArrival: true  },
  { name: 'The Boardroom Classic',  category: 'formal',          image: '/shirts/image copy 37.png',       price: 5999,  discount: null,  featured: false, newArrival: false },
  { name: 'The Linen Master',       category: 'luxury',          image: '/shirts/image copy 38.png',       price: 10499, discount: 8999,  featured: true,  newArrival: false },
  { name: 'The Casual Friday',      category: 'casual',          image: '/shirts/image copy 39.png',       price: 3199,  discount: 2699,  featured: false, newArrival: true  },
  { name: 'The Collector Piece',    category: 'limited-edition', image: '/shirts/image copy 40.png',       price: 16999, discount: null,  featured: true,  newArrival: false },
  { name: 'The Slim Taper',         category: 'formal',          image: '/shirts/image copy 41.png',       price: 5299,  discount: 4499,  featured: false, newArrival: false },
  { name: 'The Weekend Warrior',    category: 'casual',          image: '/shirts/image copy 42.png',       price: 3499,  discount: null,  featured: false, newArrival: true  },
  { name: 'The Prestige',           category: 'luxury',          image: '/shirts/image copy 43.png',       price: 13999, discount: 11999, featured: true,  newArrival: false },
  { name: 'The Urban Classic',      category: 'streetwear',      image: '/shirts/image copy 44.png',       price: 3099,  discount: 2599,  featured: false, newArrival: true  },
  { name: 'The Signature Linen',    category: 'luxury',          image: '/shirts/image copy 45.png',       price: 9299,  discount: 7999,  featured: false, newArrival: false },
  { name: 'The Final Edition',      category: 'limited-edition', image: '/shirts/image copy 46.png',       price: 21999, discount: null,  featured: true,  newArrival: false },
];

const SIZES   = ['S', 'M', 'L', 'XL', 'XXL'];
const FABRICS = ['Egyptian Cotton', 'Italian Linen', 'Japanese Chambray', 'Premium Poplin', 'Silk Blend'];
const FITS    = ['slim', 'regular', 'relaxed', 'oversized'];
const COLORS  = ['White', 'Ivory', 'Black', 'Blue', 'Stone', 'Gold', 'Grey', 'Beige', 'Navy', 'Cream'];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    const products = SHIRTS.map((shirt, i) => ({
      name:             shirt.name,
      slug:             shirt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description:      `${shirt.name} — crafted from premium natural fabrics with meticulous attention to detail. Features hand-finished seams, mother-of-pearl buttons, and a silhouette refined over decades of tailoring expertise.`,
      shortDescription: `Premium ${shirt.category} shirt crafted for the discerning few.`,
      price:            shirt.price,
      discountPrice:    shirt.discount || undefined,
      images:           [{ public_id: `local_${i}`, url: shirt.image }],
      category:         shirt.category,
      sizes:            SIZES.map(size => ({ size, stock: Math.floor(Math.random() * 20) + 5 })),
      fabric:           FABRICS[i % FABRICS.length],
      fit:              FITS[i % FITS.length],
      color:            COLORS[i % COLORS.length],
      isFeatured:       shirt.featured,
      isNewArrival:     shirt.newArrival,
      isBestSeller:     i < 8,
      ratings:          parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
      numReviews:       Math.floor(Math.random() * 120) + 10,
      tags:             [shirt.category, 'luxury', 'premium', 'shirt'],
      sku:              `LS-${String(i + 1).padStart(3, '0')}`,
      createdAt:        new Date(Date.now() - (SHIRTS.length - i) * 60000),
    }));

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Done');
  }
}

seed();
