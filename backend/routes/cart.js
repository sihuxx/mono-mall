import express from 'express';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 내 장바구니
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ userId: req.user.userId, items: [] });
    }
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 장바구니에 추가
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = await Cart.create({
        userId: req.user.userId,
        items: [{ productId, qty }],
      });
    } else {
      const existingItem = cart.items.find(i => i.productId.toString() === productId);
      if (existingItem) {
        existingItem.qty += qty;
      } else {
        cart.items.push({ productId, qty });
      }
      await cart.save();
    }
    const populated = await Cart.findById(cart._id).populate('items.productId');
    res.json({ cart: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 수량 변경
router.patch('/update', protect, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ message: '장바구니가 없습니다' });

    if (qty < 1) {
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    } else {
      const item = cart.items.find(i => i.productId.toString() === productId);
      if (item) item.qty = qty;
    }
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');
    res.json({ cart: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 항목 삭제
router.delete('/item/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ message: '장바구니가 없습니다' });
    cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId);
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');
    res.json({ cart: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
