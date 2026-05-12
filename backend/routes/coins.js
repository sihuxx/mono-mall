import express from 'express';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// 내 코인 잔액 조회
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('coins');
    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다' });
    res.json({ coins: user.coins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 내 거래 내역
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await CoinTransaction.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ 관리자 전용 ============

// 모든 유저 목록 (코인 잔액 포함)
router.get('/admin/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 특정 유저에게 코인 충전 (무한 추가 가능)
router.post('/admin/charge', protect, adminOnly, async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: '유효한 충전 금액을 입력해주세요' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다' });

    user.coins += parseInt(amount);
    await user.save();

    await CoinTransaction.create({
      userId: user._id,
      type: 'charge',
      amount: parseInt(amount),
      balanceAfter: user.coins,
      description: description || `관리자 충전: ${amount} 코인`,
      adminId: req.user.userId,
    });

    res.json({
      message: '충전 완료',
      user: { id: user._id, username: user.username, coins: user.coins },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 코인 차감 (관리자용)
router.post('/admin/deduct', protect, adminOnly, async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다' });

    const deductAmount = Math.min(parseInt(amount), user.coins);
    user.coins -= deductAmount;
    await user.save();

    await CoinTransaction.create({
      userId: user._id,
      type: 'refund',
      amount: -deductAmount,
      balanceAfter: user.coins,
      description: description || `관리자 차감: ${deductAmount} 코인`,
      adminId: req.user.userId,
    });

    res.json({
      message: '차감 완료',
      user: { id: user._id, username: user.username, coins: user.coins },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 유저 권한 변경 (일반/관리자)
router.patch('/admin/role/:userId', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: '유효한 권한을 선택해주세요' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
