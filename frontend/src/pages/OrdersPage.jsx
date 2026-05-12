import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coins, Package } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.getOrders()
      .then(({ orders }) => setOrders(orders))
      .catch(err => showToast(err.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="py-12">
      <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">ORDERS</p>
      <h1 className="text-4xl font-light tracking-tight mb-12">Order History</h1>

      {loading ? (
        <p className="text-center text-neutral-400 text-sm py-12">LOADING...</p>
      ) : orders.length === 0 ? (
        <EmptyState
          message="주문 내역이 없습니다"
          actionLabel="쇼핑하러 가기"
          onAction={() => navigate('/shop')}
        />
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block border border-neutral-200 p-6 hover:border-black transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-neutral-400 mb-1">
                    ORDER #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-neutral-700">
                    {new Date(order.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`text-[10px] tracking-[0.2em] px-3 py-1 ${
                  order.status === 'completed' ? 'bg-black text-white' :
                  order.status === 'cancelled' ? 'bg-neutral-200 text-neutral-500' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
                {order.items.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="w-16 aspect-[3/4] bg-neutral-50 flex-shrink-0">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
                {order.items.length > 5 && (
                  <div className="w-16 aspect-[3/4] bg-neutral-100 flex items-center justify-center text-xs text-neutral-500 flex-shrink-0">
                    +{order.items.length - 5}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <Package size={12} strokeWidth={1.5} />
                  {order.items.reduce((s, i) => s + i.qty, 0)} items
                </p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Coins size={12} strokeWidth={1.5} />
                  {order.totalCoins.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
