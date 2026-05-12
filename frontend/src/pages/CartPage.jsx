import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Coins, MapPin, Phone, User } from 'lucide-react';
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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    zipcode: '',
    memo: '',
  });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const cartItems = (cart.items || []).filter(i => i.productId);
  const total = cartItems.reduce((sum, i) => sum + (i.productId.price * i.qty), 0);
  const userCoins = user.coins || 0;
  const canCheckout = userCoins >= total && cartItems.length > 0;
  const shortage = total - userCoins;

  const openCheckoutModal = () => {
    if (!canCheckout) {
      showToast(`코인이 ${shortage.toLocaleString()}개 부족합니다`);
      return;
    }
    setShippingInfo({
      name: user.username || '',
      phone: '',
      address: '',
      zipcode: '',
      memo: '',
    });
    setShowCheckoutModal(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      showToast('배송 정보를 모두 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      const { order } = await api.checkout();
      showToast('결제가 완료되었습니다! 🎉');
      setShowCheckoutModal(false);
      await refreshUser();
      await refreshCart();
      
      // 주문 완료 페이지로 이동
      setTimeout(() => {
        navigate('/orders');
      }, 1000);
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
          {/* 상품 목록 */}
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

          {/* Order Summary */}
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
                onClick={openCheckoutModal}
                disabled={!canCheckout || submitting}
                className="w-full bg-black text-white py-4 text-xs tracking-[0.2em] hover:bg-neutral-800 transition disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                {canCheckout ? 'CHECKOUT' : '코인 부족'}
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

      {/* 결제 모달 */}
      {showCheckoutModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowCheckoutModal(false)}
        >
          <div 
            className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-8 py-6">
              <p className="text-xs tracking-[0.3em] text-neutral-500 mb-2">CHECKOUT</p>
              <h2 className="text-2xl font-light tracking-tight">배송 정보</h2>
            </div>

            <form onSubmit={handleCheckout} className="p-8 space-y-6">
              {/* 수령인 */}
              <div>
                <label className="flex items-center gap-2 text-xs tracking-[0.2em] text-neutral-500 mb-3">
                  <User size={12} strokeWidth={1.5} />
                  수령인
                </label>
                <input
                  type="text"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
                  placeholder="이름"
                  required
                />
              </div>

              {/* 연락처 */}
              <div>
                <label className="flex items-center gap-2 text-xs tracking-[0.2em] text-neutral-500 mb-3">
                  <Phone size={12} strokeWidth={1.5} />
                  연락처
                </label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
                  placeholder="010-0000-0000"
                  required
                />
              </div>

              {/* 우편번호 */}
              <div>
                <label className="flex items-center gap-2 text-xs tracking-[0.2em] text-neutral-500 mb-3">
                  <MapPin size={12} strokeWidth={1.5} />
                  우편번호
                </label>
                <input
                  type="text"
                  value={shippingInfo.zipcode}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, zipcode: e.target.value })}
                  className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
                  placeholder="12345"
                />
              </div>

              {/* 주소 */}
              <div>
                <label className="text-xs tracking-[0.2em] text-neutral-500 mb-3 block">
                  배송 주소
                </label>
                <textarea
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  className="w-full border border-neutral-200 p-4 outline-none focus:border-black transition text-sm resize-none"
                  placeholder="상세 주소를 입력해주세요"
                  rows={3}
                  required
                />
              </div>

              {/* 배송 메모 */}
              <div>
                <label className="text-xs tracking-[0.2em] text-neutral-500 mb-3 block">
                  배송 메모 (선택)
                </label>
                <input
                  type="text"
                  value={shippingInfo.memo}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, memo: e.target.value })}
                  className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
                  placeholder="예: 부재 시 문 앞에 놓아주세요"
                />
              </div>

              {/* 결제 정보 요약 */}
              <div className="bg-neutral-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">결제 금액</span>
                  <span className="font-medium flex items-center gap-1">
                    <Coins size={12} strokeWidth={1.5} />
                    {total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>결제 후 잔액</span>
                  <span>{(userCoins - total).toLocaleString()} 코인</span>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 border border-neutral-300 py-4 text-xs tracking-[0.2em] hover:bg-neutral-50 transition"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-black text-white py-4 text-xs tracking-[0.2em] hover:bg-neutral-800 transition disabled:bg-neutral-400"
                >
                  {submitting ? 'PROCESSING...' : `${total.toLocaleString()} 코인 결제`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}