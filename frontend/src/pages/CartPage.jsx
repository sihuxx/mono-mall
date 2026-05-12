import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const cartItems = (cart.items || []).filter(i => i.productId);
  const total = cartItems.reduce((sum, i) => sum + (i.productId.price * i.qty), 0);

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
                  <p className="text-sm mb-auto">₩{Number(item.productId.price).toLocaleString()}</p>
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
            <div className="bg-neutral-50 p-6">
              <h2 className="text-lg tracking-wide mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm border-b border-neutral-200 pb-4 mb-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>₩{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="flex justify-between font-medium mb-6">
                <span>Total</span>
                <span>₩{total.toLocaleString()}</span>
              </div>
              <button
                disabled
                className="w-full bg-neutral-300 text-white py-4 text-xs tracking-[0.2em] cursor-not-allowed"
              >
                CHECKOUT (3단계 예정)
              </button>
              <p className="text-[10px] text-neutral-400 mt-3 text-center tracking-wider">
                결제 기능은 3단계 코인 시스템과 함께 추가됩니다
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
