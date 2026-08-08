import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12, isFeatured, includeInactive } = req.query;

    const query = {};

    // By default, only active products are shown on public storefront
    if (!includeInactive || includeInactive !== 'true') {
      query.isActive = true;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          query.category = catDoc._id;
        } else {
          return res.json({ success: true, data: { products: [], total: 0, page: Number(page), pages: 0 } });
        }
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    if (sort === 'price-desc') sortOptions = { price: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        products,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    let product;
    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slug).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug }).populate('category', 'name slug');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, slug, description, price, compareAtPrice, category, images, stock, sku, isFeatured, isActive } = req.body;

    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingProduct = await Product.findOne({ slug: productSlug });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Product with this slug already exists' });
    }

    const product = await Product.create({
      name,
      slug: productSlug,
      description,
      price,
      compareAtPrice,
      category,
      images: images || [],
      stock: stock !== undefined ? stock : 0,
      sku,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true
    });

    const populated = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fields = ['name', 'slug', 'description', 'price', 'compareAtPrice', 'category', 'images', 'stock', 'sku', 'isFeatured', 'isActive'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate('category', 'name slug');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};
