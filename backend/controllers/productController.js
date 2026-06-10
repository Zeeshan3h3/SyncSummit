import Product from '../models/Product.js';

// GET all products (Public)
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    // Return _id mapped to id for frontend compatibility
    const mappedProducts = products.map(p => ({
      ...p._doc,
      id: p._id.toString()
    }));
    res.json(mappedProducts);
  } catch (err) {
    next(err);
  }
};

// GET single product by ID (Public)
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ ...product._doc, id: product._id.toString() });
  } catch (err) {
    next(err);
  }
};

// POST create a new product (Superadmin)
export const createProduct = async (req, res, next) => {
  try {
    const thumbnailPath = req.files && req.files['thumbnail'] ? `/uploads/${req.files['thumbnail'][0].filename}` : '';
    const imagesPaths = req.files && req.files['images'] ? req.files['images'].map(file => `/uploads/${file.filename}`) : [];

    let sizes = req.body.sizes;
    if (typeof sizes === 'string') {
      try {
        sizes = JSON.parse(sizes);
      } catch (e) {
        // if not valid JSON, split by comma or use as is
        sizes = sizes.split(',').map(s => ({ label: s.trim(), available: true }));
      }
    }

    let description = req.body.description;
    if (typeof description === 'string') {
      try {
        description = JSON.parse(description);
      } catch (e) {
        description = [description];
      }
    }

    const newProduct = new Product({
      ...req.body,
      sizes,
      description,
      thumbnail: thumbnailPath,
      images: imagesPaths
    });
    
    const savedProduct = await newProduct.save();
    res.status(201).json({ ...savedProduct._doc, id: savedProduct._id.toString() });
  } catch (err) {
    next(err);
  }
};

// PUT update a product (Admin/Superadmin)
export const updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Prevent regular admins from editing pricing
    if (req.user?.role !== 'superadmin') {
      delete updateData.price;
      delete updateData.original_price;
    }

    // Handle new file uploads if provided
    if (req.files && req.files['thumbnail'] && req.files['thumbnail'].length > 0) {
      updateData.thumbnail = `/uploads/${req.files['thumbnail'][0].filename}`;
    }
    if (req.files && req.files['images'] && req.files['images'].length > 0) {
      updateData.images = req.files['images'].map(file => `/uploads/${file.filename}`);
    }

    // Parse sizes if sent as JSON string
    if (typeof updateData.sizes === 'string') {
      try { updateData.sizes = JSON.parse(updateData.sizes); } catch (e) {
        updateData.sizes = updateData.sizes.split(',').map(s => ({ label: s.trim(), available: true }));
      }
    }
    // Parse description if sent as JSON string
    if (typeof updateData.description === 'string') {
      try { updateData.description = JSON.parse(updateData.description); } catch (e) {
        updateData.description = [updateData.description];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { 
      new: true, 
      runValidators: true 
    });
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json({ ...updatedProduct._doc, id: updatedProduct._id.toString() });
  } catch (err) {
    next(err);
  }
};

// DELETE a product (Superadmin)
export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product successfully deleted' });
  } catch (err) {
    next(err);
  }
};
