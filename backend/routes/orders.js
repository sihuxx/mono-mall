import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import CoinTransaction from '../models/CoinTransaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 장바구니 전체 결제
router.post('/checkout', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) 장바구니 조회
    const cart = await Cart.findOne({ userId: req.user.userId })
      .populate('items.productId')
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: '장바구니가 비어있습니다' });
    }

    const validItems = cart.items.filter(i => i.productId);
    if (validItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: '유효한 상품이 없습니다' });
    }

    // 2) 총액 계산
    const totalCoins = validItems.reduce((sum, i) => sum + (i.productId.price * i.qty), 0);

    // 3) 유저 코인 확인
    const user = await User.findById(req.user.userId).session(session);
    if (user.coins < totalCoins) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `코인이 부족합니다. 필요: ${totalCoins}, 보유: ${user.coins}`,
      });
    }

    // 4) 주문 생성
    const order = await Order.create([{
      userId: user._id,
      username: user.username,
      items: validItems.map(i => ({
        productId: i.productId._id,
        title: i.productId.title,
        price: i.productId.price,
        imageUrl: i.productId.imageUrl,
        qty: i.qty,
      })),
      totalCoins,
      status: 'completed',
    }], { session });

    // 5) 코인 차감
    user.coins -= totalCoins;
    await user.save({ session });

    // 6) 거래 내역 기록
    await CoinTransaction.create([{
      userId: user._id,
      type: 'purchase',
      amount: -totalCoins,
      balanceAfter: user.coins,
      description: `상품 결제 (${validItems.length}건)`,
      orderId: order[0]._id,
    }], { session });

    // 7) 장바구니 비우기
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    res.json({
      message: '결제 완료',
      order: order[0],
      remainingCoins: user.coins,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// 내 주문 내역
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 주문 상세
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: '주문을 찾을 수 없습니다' });
    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: '권한이 없습니다' });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
