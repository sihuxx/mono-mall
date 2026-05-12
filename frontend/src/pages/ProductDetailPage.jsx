import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, X, Trash2, Plus, Minus } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    loadData();
  }, [id, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productRes, likesRes, commentsRes] = await Promise.all([
        api.getProduct(id),
        api.getProductLikes(id),
        api.getComments(id),
      ]);
      setProduct(productRes.product);
      setLikeCount(likesRes.count);
      setLiked(likesRes.liked);
      setComments(commentsRes.comments);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      showToast('로그인이 필요합니다');
      return;
    }
    try {
      const { liked, count } = await api.toggleLike(id);
      setLiked(liked);
      setLikeCount(count);
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('로그인이 필요합니다');
      return;
    }
    if (!commentInput.trim()) return;
    try {
      await api.createComment({ productId: id, content: commentInput });
      setCommentInput('');
      const { comments } = await api.getComments(id);
      setComments(comments);
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDeleteProduct = async () => {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    try {
      await api.deleteProduct(id);
      showToast('상품이 삭제되었습니다');
      navigate('/shop');
    } catch (err) {
      showToast(err.message);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-neutral-400 text-sm">LOADING...</div>;
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <p className="text-neutral-500">상품을 찾을 수 없습니다</p>
        <Link to="/shop" className="mt-4 inline-block text-sm underline">목록으로</Link>
      </div>
    );
  }

  const isOwner = user && user.id === product.uploaderId;

  return (
    <div className="py-12">
      <Link to="/shop" className="text-xs tracking-wider text-neutral-500 hover:text-black mb-8 inline-block">
        ← BACK TO SHOP
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="aspect-[3/4] bg-neutral-50 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs tracking-wider">
              NO IMAGE
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">{product.category.toUpperCase()}</p>
          )}
          <h1 className="text-3xl font-light tracking-tight mb-4">{product.title}</h1>
          <p className="text-2xl font-medium mb-8">₩{Number(product.price).toLocaleString()}</p>

          <div className="text-sm text-neutral-600 leading-relaxed mb-8 whitespace-pre-wrap">
            {product.description}
          </div>

          <div className="border-t border-neutral-100 pt-6 mb-6">
            <p className="text-xs text-neutral-400 tracking-wider">
              UPLOADED BY {product.uploaderName} · {new Date(product.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* Qty selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs tracking-[0.2em] text-neutral-500">QTY</span>
            <div className="flex items-center border border-neutral-200">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-neutral-50">
                <Minus size={12} strokeWidth={1.5} />
              </button>
              <span className="px-4 text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-neutral-50">
                <Plus size={12} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => addToCart(product._id, qty)}
              className="flex-1 bg-black text-white py-4 text-sm tracking-[0.2em] hover:bg-neutral-800 transition"
            >
              ADD TO CART
            </button>
            <button
              onClick={handleLike}
              className="px-4 border border-black hover:bg-neutral-50 transition flex items-center gap-2 text-sm"
            >
              <Heart size={16} strokeWidth={1.5} fill={liked ? '#000' : 'none'} />
              <span>{likeCount}</span>
            </button>
          </div>

          {isOwner && (
            <button
              onClick={handleDeleteProduct}
              className="mt-4 text-xs tracking-wider text-neutral-400 hover:text-red-600 transition flex items-center gap-1 self-start"
            >
              <Trash2 size={12} strokeWidth={1.5} /> 상품 삭제
            </button>
          )}
        </div>
      </div>

      {/* Comments */}
      <section className="mt-24 border-t border-neutral-100 pt-12">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle size={18} strokeWidth={1.5} />
          <h2 className="text-lg tracking-wide">REVIEWS ({comments.length})</h2>
        </div>

        <form onSubmit={handleAddComment} className="mb-8">
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={user ? "리뷰를 남겨주세요" : "로그인 후 리뷰를 작성할 수 있습니다"}
            disabled={!user}
            rows={3}
            className="w-full p-4 border border-neutral-200 text-sm outline-none focus:border-black transition resize-none disabled:bg-neutral-50"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!user || !commentInput.trim()}
              className="bg-black text-white px-6 py-2 text-xs tracking-[0.2em] hover:bg-neutral-800 transition disabled:bg-neutral-200 disabled:cursor-not-allowed"
            >
              POST
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">아직 리뷰가 없습니다</p>
          ) : (
            comments.map(c => (
              <div key={c._id} className="border-b border-neutral-100 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.username}</span>
                    <span className="text-xs text-neutral-400">
                      {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {user && user.id === c.userId && (
                    <button onClick={() => handleDeleteComment(c._id)} className="text-neutral-300 hover:text-red-500 transition">
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
