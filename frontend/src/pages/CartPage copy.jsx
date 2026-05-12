import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Coins } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function CartPage() {
  const { user, refreshUser } = useAuth();
  const { cart, updateQty, removeItem, refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const cartItems = (cart.items || []).filter(i => i.productId);
  const total = cartItems.reduce((sum, i) => sum + (i.productId.price * i.qty), 0);
  const userCoins = user.coins || 0;
  const canCheckout = userCoins >= total && cartItems.length > 0;
  const shortage = total - userCoins;

  const handleCheckout = async () => {
    if (!canCheckout) {
      showToast(`코인이 ${shortage.toLocaleString()}개 부족합니다`);
      return;
    }
    if (!confirm(`${total.toLocaleString()} 코인으로 결제하시겠습니까?`)) return;

    setSubmitting(true);
    try {
      const { order, remainingCoins } = await api.checkout();
      showToast('결제가 완료되었습니다');
      await refreshUser();
      await refreshCart();
      navigate(`/orders/${order._id}`);
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12">
      <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">CART</p>
      <h1 className="text-4xl font-light tracking-tight mb-12">Your Bag</h1>

      {cartItems.length === 0 ? (
        <EmptyState
          message="장바구니가 비어있습니다"
          actionLabel="쇼핑 계속하기"
          onAction={() => navigate('/shop')}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map(item => (
              <div key={item.productId._id} className="flex gap-4 md:gap-6 pb-6 border-b border-neutral-100">
                <div
                  className="w-24 md:w-32 aspect-[3/4] bg-neutral-50 overflow-hidden cursor-pointer flex-shrink-0"
                  onClick={() => navigate(`/product/${item.productId._id}`)}
                >
                  {item.productId.imageUrl && (
                    <img src={item.productId.imageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  {item.productId.category && (
                    <p className="text-[10px] tracking-[0.2em] text-neutral-400 mb-1">
                      {item.productId.category}
                    </p>
                  )}
                  <h3 className="text-sm font-medium mb-1">{item.productId.title}</h3>
                  <p className="text-sm mb-auto flex items-center gap-1">
                    <Coins size={11} strokeWidth={1.5} />
                    {Number(item.productId.price).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-neutral-200">
                      <button onClick={() => updateQty(item.productId._id, item.qty - 1)} className="px-2 py-1 hover:bg-neutral-50">
                        <Minus size={10} strokeWidth={1.5} />
                      </button>
                      <span className="px-3 text-xs">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId._id, item.qty + 1)} className="px-2 py-1 hover:bg-neutral-50">
                        <Plus size={10} strokeWidth={1.5} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.productId._id)} className="text-neutral-400 hover:text-red-500 transition">
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-50 p-6 sticky top-20">
              <h2 className="text-lg tracking-wide mb-6">Order Summary</h2>

              {/* 코인 정보 */}
              <div className="bg-white border border-neutral-200 p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs tracking-wider text-neutral-500">보유 코인</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Coins size={12} strokeWidth={1.5} />
                    {userCoins.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-wider text-neutral-500">결제 후 잔액</span>
                  <span className={`text-sm font-medium ${canCheckout ? 'text-neutral-900' : 'text-red-500'}`}>
                    {canCheckout
                      ? `${(userCoins - total).toLocaleString()} 코인`
                      : `-${shortage.toLocaleString()} 부족`}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm border-b border-neutral-200 pb-4 mb-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{total.toLocaleString()} 코인</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="flex justify-between font-medium mb-6">
                <span>Total</span>
                <span className="flex items-center gap-1">
                  <Coins size={14} strokeWidth={1.5} />
                  {total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!canCheckout || submitting}
                className="w-full bg-black text-white py-4 text-xs tracking-[0.2em] hover:bg-neutral-800 transition disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                {submitting ? 'PROCESSING...' : canCheckout ? 'CHECKOUT' : '코인 부족'}
              </button>

              {!canCheckout && cartItems.length > 0 && (
                <p className="text-[10px] text-neutral-500 mt-3 text-center tracking-wider">
                  관리자에게 코인 충전을 요청하세요
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
