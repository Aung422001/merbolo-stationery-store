import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const categories = [
  {
    name: 'Notebooks & Journals',
    slug: 'notebooks-journals',
    description: 'Premium dot grid, lined, and blank journals for writing and bullet planning.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Pens & Pencils',
    slug: 'pens-pencils',
    description: 'Fine gel pens, fountain pens, mechanical pencils, and calligraphy markers.',
    image: 'https://images.unsplash.com/photo-1585336261026-8f5786372969?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Art Supplies',
    slug: 'art-supplies',
    description: 'Watercolors, acrylic paints, sketchbooks, and artist brushes.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Paper & Sticky Notes',
    slug: 'paper-sticky-notes',
    description: 'Washi tapes, decorative sticky notes, index tabs, and specialty paper.',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Office & School',
    slug: 'office-school',
    description: 'Desk organizers, scissors, staplers, binders, and everyday essentials.',
    image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Bestselling fiction, non-fiction, and creative guides for readers and writers alike.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'
  }
];

const sampleProducts = (catMap) => [
  {
    name: 'Midori MD Hardcover Dot Grid Notebook - A5',
    slug: 'midori-md-hardcover-dot-grid-a5',
    description: 'Minimalist Japanese notebook featuring bleed-resistant MD paper, lay-flat binding, and ribbon marker.',
    price: 650,
    compareAtPrice: 750,
    category: catMap['notebooks-journals'],
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
    stock: 25,
    sku: 'NB-MID-A5',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Leuchtturm1917 Medium Softcover Journal - Emerald',
    slug: 'leuchtturm1917-medium-softcover-emerald',
    description: 'Numbered pages, table of contents, expandable back pocket, and 80g acid-free paper.',
    price: 890,
    category: catMap['notebooks-journals'],
    images: ['https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=600&q=80'],
    stock: 18,
    sku: 'NB-LEU-EME',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Hobonichi Techo Planner 2026 - A6 English Edition',
    slug: 'hobonichi-techo-planner-2026-a6',
    description: 'Daily planner crafted with ultra-thin Tomoe River paper, grid pages, and daily quotes.',
    price: 1250,
    compareAtPrice: 1400,
    category: catMap['notebooks-journals'],
    images: ['https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80'],
    stock: 12,
    sku: 'NB-HOB-2026',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Rhodia Webnotebook Dot Grid - Black A5',
    slug: 'rhodia-webnotebook-dot-grid-a5',
    description: 'Smooth 90g Clairefontaine ivory paper in an elegant faux leather hardcover.',
    price: 720,
    category: catMap['notebooks-journals'],
    images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80'],
    stock: 30,
    sku: 'NB-RHO-A5',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Pilot Kakuno Fountain Pen - Fine Nib (Pastel Blue)',
    slug: 'pilot-kakuno-fountain-pen-fine-blue',
    description: 'Ergonomic triangular grip fountain pen ideal for beginners and daily fountain pen enthusiasts.',
    price: 380,
    category: catMap['pens-pencils'],
    images: ['https://images.unsplash.com/photo-1585336261026-8f5786372969?auto=format&fit=crop&w=600&q=80'],
    stock: 40,
    sku: 'PEN-PIL-BLUE',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Uniball One Gel Pen Set - 0.38mm 10 Color Set',
    slug: 'uniball-one-gel-pen-set-10color',
    description: 'Pigment-rich vibrant ink that stays on top of paper fibers for deeper color contrast.',
    price: 490,
    compareAtPrice: 550,
    category: catMap['pens-pencils'],
    images: ['https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=600&q=80'],
    stock: 15,
    sku: 'PEN-UNI-10C',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Rotring 600 Mechanical Pencil - 0.5mm Matte Black',
    slug: 'rotring-600-mechanical-pencil-05mm',
    description: 'Full metal hexagonal brass body, knurled grip, and lead grade indicator mechanism.',
    price: 1100,
    category: catMap['pens-pencils'],
    images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80'],
    stock: 8,
    sku: 'PEN-ROT-600',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Tombow Dual Brush Pen Art Set - Pastel 10 Pack',
    slug: 'tombow-dual-brush-pen-pastel-10pack',
    description: 'Flexible brush tip and fine bullet tip in one marker. Water-based blendable ink.',
    price: 850,
    category: catMap['pens-pencils'],
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'],
    stock: 22,
    sku: 'PEN-TOM-10P',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Holbein Artists Watercolor 12 Half Pan Set',
    slug: 'holbein-artists-watercolor-12-pan-set',
    description: 'Japanese artist-grade watercolor palette with brilliant transparency and lightfastness.',
    price: 1850,
    compareAtPrice: 2100,
    category: catMap['art-supplies'],
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80'],
    stock: 6,
    sku: 'ART-HOL-12P',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Canson XL Watercolor Paper Pad - A4 300gsm',
    slug: 'canson-xl-watercolor-pad-a4',
    description: 'Cold press texture heavyweight watercolor paper perfect for wet-on-wet technique.',
    price: 320,
    category: catMap['art-supplies'],
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80'],
    stock: 50,
    sku: 'ART-CAN-A4',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Kuretake ZIG Waterbrush Detail Pen Set',
    slug: 'kuretake-zig-waterbrush-set',
    description: 'Refillable water brush pens with nylon bristles for watercolor painting on the go.',
    price: 290,
    category: catMap['art-supplies'],
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80'],
    stock: 35,
    sku: 'ART-KUR-WB',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Mindy Pastel Washi Tape Roll Set (12 Rolls)',
    slug: 'mindy-pastel-washi-tape-12rolls',
    description: 'Gentle adhesive decorative Japanese masking tape featuring foil floral patterns.',
    price: 240,
    compareAtPrice: 300,
    category: catMap['paper-sticky-notes'],
    images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80'],
    stock: 45,
    sku: 'PAP-WASH-12',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Post-it Super Sticky Gradient Memo Notes - 3x3in',
    slug: 'post-it-super-sticky-gradient-memo',
    description: 'Enhanced stickiness for vertical surfaces with aesthetic pastel gradient hues.',
    price: 145,
    category: catMap['paper-sticky-notes'],
    images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80'],
    stock: 60,
    sku: 'PAP-POS-33',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Midori Index Clip Animals - Brass Page Markers',
    slug: 'midori-index-clip-animals-brass',
    description: 'Ultra-thin brass metal bookmarks shaped into delicate animal silhouettes.',
    price: 210,
    category: catMap['paper-sticky-notes'],
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'],
    stock: 28,
    sku: 'PAP-MID-CLIP',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Brass Heavyweight Desk Scissors - Gold',
    slug: 'brass-heavyweight-desk-scissors-gold',
    description: 'Precision stainless steel blades finished in brushed vintage brass gold plating.',
    price: 480,
    category: catMap['office-school'],
    images: ['https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=80'],
    stock: 14,
    sku: 'OFF-SCI-GLD',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Minimalist Wooden Pen Dock & Storage Tray',
    slug: 'minimalist-wooden-pen-dock-storage',
    description: 'Carved solid walnut desk dock for holding desktop pens, paperclips, and sticky notes.',
    price: 890,
    compareAtPrice: 990,
    category: catMap['office-school'],
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80'],
    stock: 10,
    sku: 'OFF-WOD-TRAY',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Kokuyo Harinacs Press Stapler (Stapleless)',
    slug: 'kokuyo-harinacs-press-stapler',
    description: 'Innovatively binds up to 5 sheets of paper using crimping without metal staples.',
    price: 390,
    category: catMap['office-school'],
    images: ['https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=80'],
    stock: 32,
    sku: 'OFF-KOK-STAP',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Atomic Habits - James Clear (Paperback)',
    slug: 'atomic-habits-james-clear-paperback',
    description: 'An easy and proven way to build good habits and break bad ones, from bestselling author James Clear.',
    price: 450,
    compareAtPrice: 520,
    category: catMap['books'],
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'],
    stock: 40,
    sku: 'BK-ATOM-HAB',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'The Midnight Library - Matt Haig (Hardcover)',
    slug: 'the-midnight-library-matt-haig-hardcover',
    description: 'A dazzling novel about all the choices that go into a life well lived, from the celebrated author of Reasons to Stay Alive.',
    price: 590,
    category: catMap['books'],
    images: ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80'],
    stock: 20,
    sku: 'BK-MIDLIB',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Keep Going - Austin Kleon (Creative Guide)',
    slug: 'keep-going-austin-kleon-creative-guide',
    description: '10 ways to stay creative in good times and bad, illustrated by the bestselling author of Steal Like an Artist.',
    price: 480,
    category: catMap['books'],
    images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80'],
    stock: 25,
    sku: 'BK-KEEPGO',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Sapiens - Yuval Noah Harari (Paperback)',
    slug: 'sapiens-yuval-noah-harari-paperback',
    description: 'A brief history of humankind, exploring how Homo sapiens came to dominate the world.',
    price: 550,
    compareAtPrice: 620,
    category: catMap['books'],
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80'],
    stock: 30,
    sku: 'BK-SAPIENS',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'The Bullet Journal Method - Ryder Carroll',
    slug: 'the-bullet-journal-method-ryder-carroll',
    description: 'Track the past, order the present, design the future — the definitive guide from the creator of the Bullet Journal.',
    price: 510,
    category: catMap['books'],
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'],
    stock: 18,
    sku: 'BK-BUJOMETH',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Studio Ghibli Coloring Book for Adults',
    slug: 'studio-ghibli-coloring-book-adults',
    description: 'Intricately illustrated scenes for relaxation, perfect to pair with your favorite fine-liner pens.',
    price: 350,
    category: catMap['books'],
    images: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80'],
    stock: 22,
    sku: 'BK-GHIBLICOL',
    isFeatured: false,
    isActive: true
  }
];

export const runSeed = async () => {
  console.log('Clearing existing database collections...');
  await Category.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({});

  console.log('Seeding Users...');
  const adminPasswordHash = await bcrypt.hash('Admin123456!', 10);
  const customerPasswordHash = await bcrypt.hash('Customer123456!', 10);

  const adminUser = await User.create({
    name: 'Admin Merbolo',
    email: 'admin@merbolo.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    addresses: [
      {
        label: 'Shop Headquarters',
        line1: '88 Sukhumvit Road',
        line2: 'Floor 12',
        city: 'Bangkok',
        province: 'Bangkok',
        postalCode: '10110',
        country: 'TH',
        isDefault: true
      }
    ]
  });

  const customerUser = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: customerPasswordHash,
    role: 'customer',
    addresses: [
      {
        label: 'Home',
        line1: '123 Rama IV Road',
        line2: 'Apt 4B',
        city: 'Bangkok',
        province: 'Bangkok',
        postalCode: '10330',
        country: 'TH',
        isDefault: true
      }
    ]
  });

  console.log('Seeding Categories...');
  const createdCategories = await Category.insertMany(categories);

  const catMap = {};
  createdCategories.forEach((cat) => {
    catMap[cat.slug] = cat._id;
  });

  console.log('Seeding Products...');
  const productsData = sampleProducts(catMap);
  const createdProducts = await Product.insertMany(productsData);

  return {
    categoriesCount: createdCategories.length,
    productsCount: createdProducts.length,
    adminEmail: adminUser.email,
    customerEmail: customerUser.email
  };
};

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/merboloebook';
    console.log(`Connecting to Mongo at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    await runSeed();
    console.log('Seed database completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};
