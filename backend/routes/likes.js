import express from 'express';
import Like from '../models/Like.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 상품의 좋아요 정보
router.get('/product/:productId', optionalAuth, async (req, res) => {
  try {
    const count = await Like.countDocuments({ productId: req.params.productId });
    let liked = false;
    if (req.user) {
      const myLike = await Like.findOne({
        productId: req.params.productId,
        userId: req.user.userId,
      });
      liked = !!myLike;
    }
    res.json({ count, liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 좋아요 토글
router.post('/toggle/:productId', protect, async (req, res) => {
  try {
    const existing = await Like.findOne({
      productId: req.params.productId,
      userId: req.user.userId,
    });
    if (existing) {
      await existing.deleteOne();
      const count = await Like.countDocuments({ productId: req.params.productId });
      return res.json({ liked: false, count });
    }
    await Like.create({
      productId: req.params.productId,
      userId: req.user.userId,
    });
    const count = await Like.countDocuments({ productId: req.params.productId });
    res.json({ liked: true, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 내가 좋아요 한 상품 목록
router.get('/me', protect, async (req, res) => {
  try {
    const likes = await Like.find({ userId: req.user.userId }).populate('productId');
    const products = likes.map(l => l.productId).filter(Boolean);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
