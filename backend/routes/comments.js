import express from 'express';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 상품의 댓글 목록
router.get('/product/:productId', async (req, res) => {
  try {
    const comments = await Comment.find({ productId: req.params.productId })
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 댓글 작성
router.post('/', protect, async (req, res) => {
  try {
    const { productId, content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: '내용을 입력해주세요' });
    }

    const comment = await Comment.create({
      productId,
      userId: req.user.userId,
      username: req.user.username,
      content: content.trim(),
    });

    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 댓글 삭제
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: '권한이 없습니다' });
    }
    await comment.deleteOne();
    res.json({ message: '댓글이 삭제되었습니다' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
