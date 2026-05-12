import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    api.getProductLikes(product._id)
      .then(({ count, liked }) => {
        setLikeCount(count);
        setLiked(liked);
      })
      .catch(() => {});
  }, [product._id, user]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      showToast('로그인이 필요합니다');
      return;
    }
    try {
      const { liked, count } = await api.toggleLike(product._id);
      setLiked(liked);
      setLikeCount(count);
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden mb-3">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs tracking-wider">
            NO IMAGE
          </div>
        )}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition"
        >
          <Heart size={14} strokeWidth={1.5} fill={liked ? '#000' : 'none'} color="#000" />
        </button>
      </div>
      <div>
        {product.category && (
          <p className="text-[10px] tracking-[0.2em] text-neutral-400 mb-1">
            {product.category.toUpperCase()}
          </p>
        )}
        <h3 className="text-sm font-normal mb-1 truncate">{product.title}</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">₩{Number(product.price).toLocaleString()}</p>
          {likeCount > 0 && (
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Heart size={10} strokeWidth={1.5} /> {likeCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
