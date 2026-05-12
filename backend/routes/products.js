import express from 'express';
import Product from '../models/Product.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// 상품 목록
router.get('/', async (req, res) => {
  try {
    const { search, category, limit } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 100);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 상품 상세
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 상품 업로드
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, price, category, imageBase64 } = req.body;

    if (!title || !description || !price || !imageBase64) {
      return res.status(400).json({ message: '모든 항목을 입력해주세요' });
    }

    // Cloudinary 업로드
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: 'mono-mall/products',
      transformation: [{ width: 800, height: 1067, crop: 'limit', quality: 'auto' }],
    });

    const product = await Product.create({
      title,
      description,
      price: parseInt(price),
      category: category || 'TOPS',
      imageUrl: uploadResult.secure_url,
      uploaderId: req.user.userId,
      uploaderName: req.user.username,
    });

    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 상품 삭제
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다' });
    if (product.uploaderId.toString() !== req.user.userId) {
      return res.status(403).json({ message: '권한이 없습니다' });
    }

    // 연관 데이터 제거
    await Promise.all([
      Comment.deleteMany({ productId: product._id }),
      Like.deleteMany({ productId: product._id }),
      Cart.updateMany({}, { $pull: { items: { productId: product._id } } }),
      Product.findByIdAndDelete(product._id),
    ]);

    res.json({ message: '상품이 삭제되었습니다' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
