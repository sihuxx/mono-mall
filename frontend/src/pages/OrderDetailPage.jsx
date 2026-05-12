import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Coins, CheckCircle } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.getOrder(id)
      .then(({ order }) => setOrder(order))
      .catch(err => {
        showToast(err.message);
        navigate('/orders');
      })
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) {
    return <div className="py-24 text-center text-neutral-400 text-sm">LOADING...</div>;
  }
  if (!order) return null;

  return (
    <div className="py-12 max-w-3xl mx-auto">
      <Link to="/orders" className="text-xs tracking-wider text-neutral-500 hover:text-black mb-8 inline-block">
        ← 주문 내역으로
      </Link>

      {order.status === 'completed' && (
        <div className="flex items-center gap-3 bg-neutral-50 px-6 py-4 mb-8">
          <CheckCircle size={20} strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium">결제 완료</p>
            <p className="text-xs text-neutral-500">
              {new Date(order.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">
        ORDER #{order._id.slice(-8).toUpperCase()}
      </p>
      <h1 className="text-3xl font-light tracking-tight mb-12">Order Details</h1>

      {/* Items */}
      <section className="mb-12">
        <h2 className="text-sm tracking-[0.2em] text-neutral-500 mb-6">ITEMS</h2>
        <div className="space-y-4 border-t border-neutral-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-4 py-4 border-b border-neutral-100">
              <div className="w-20 aspect-[3/4] bg-neutral-50 flex-shrink-0">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-medium mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-500 mb-auto">수량 {item.qty}</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Coins size={11} strokeWidth={1.5} />
                  {(item.price * item.qty).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Total */}
      <section className="border-t border-neutral-200 pt-6">
        <div className="flex items-center justify-between mb-2 text-sm text-neutral-600">
          <span>Subtotal</span>
          <span>{order.totalCoins.toLocaleString()} 코인</span>
        </div>
        <div className="flex items-center justify-between mb-2 text-sm text-neutral-600">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 text-lg font-medium">
          <span>Total Paid</span>
          <span className="flex items-center gap-1">
            <Coins size={16} strokeWidth={1.5} />
            {order.totalCoins.toLocaleString()}
          </span>
        </div>
      </section>
    </div>
  );
}
