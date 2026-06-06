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
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json({ ...savedProduct._doc, id: savedProduct._id.toString() });
  } catch (err) {
    next(err);
  }
};

// PUT update a product (Superadmin)
export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { 
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
