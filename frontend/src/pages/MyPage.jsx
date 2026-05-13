import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Package, History } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myProducts, setMyProducts] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    Promise.all([
      api.getProducts({ limit: 100 }),
      api.getMyLikes(),
      api.getCoinTransactions(),
      api.getOrders(),
    ]).then(([productsRes, likesRes, txRes, ordersRes]) => {
      const myProds = productsRes.products.filter(p => {
        const uploaderId = typeof p.uploaderId === 'object' ? p.uploaderId._id : p.uploaderId;
        return uploaderId === user.id;
      });
      setMyProducts(myProds);
      setLikedProducts(likesRes.products);
      setTransactions(txRes.transactions);
      setOrders(ordersRes.orders);
    }).finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="py-12">
      <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">ACCOUNT</p>
      <h1 className="text-4xl font-light tracking-tight mb-2">{user.username}</h1>
      <p className="text-sm text-neutral-500 mb-12">{user.email}</p>

      {/* Coin Balance - 강조 */}
      <div className="bg-black text-white p-8 mb-12">
        <p className="text-[10px] tracking-[0.3em] text-neutral-400 mb-2">CURRENT BALANCE</p>
        <p className="text-4xl font-light flex items-center gap-2">
          <Coins size={28} strokeWidth={1.5} />
          {Number(user.coins || 0).toLocaleString()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-16">
        <StatCard label="ORDERS" value={orders.length} />
        <StatCard label="UPLOADED" value={myProducts.length} />
        <StatCard label="LIKED" value={likedProducts.length} />
        <StatCard label="ROLE" value={user.role.toUpperCase()} />
      </div>

      {/* Order History */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Package size={16} strokeWidth={1.5} />
          <h2 className="text-xl font-light tracking-wide">주문 내역</h2>
        </div>
        {loading ? (
          <p className="text-sm text-neutral-400">LOADING...</p>
        ) : orders.length === 0 ? (
          <div className="border border-neutral-100 p-12 text-center">
            <p className="text-sm text-neutral-400 mb-4">아직 주문 내역이 없습니다</p>
            <button 
              onClick={() => navigate('/shop')}
              className="text-xs tracking-[0.2em] underline hover:text-black"
            >
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order._id}
                className="border border-neutral-200 p-6 hover:border-black transition cursor-pointer"
                onClick={() => navigate(`/orders/${order._id}`)}
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
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <History size={16} strokeWidth={1.5} />
          <h2 className="text-xl font-light tracking-wide">최근 코인 거래</h2>
        </div>
        {loading ? (
          <p className="text-sm text-neutral-400">LOADING...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-neutral-400">거래 내역이 없습니다</p>
        ) : (
          <div className="border border-neutral-200">
            {transactions.slice(0, 10).map(tx => (
              <div key={tx._id} className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 last:border-b-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] tracking-[0.2em] px-2 py-0.5 ${
                      tx.type === 'charge' ? 'bg-neutral-900 text-white' :
                      tx.type === 'purchase' ? 'bg-neutral-200' :
                      'bg-neutral-100'
                    }`}>
                      {tx.type === 'charge' ? '충전' : tx.type === 'purchase' ? '결제' : '환불'}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(tx.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${tx.amount > 0 ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-neutral-400">잔액 {tx.balanceAfter.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Uploads */}
      <section className="mb-16">
        <h2 className="text-xl font-light tracking-wide mb-6">내가 등록한 상품</h2>
        {loading ? (
          <p className="text-sm text-neutral-400">LOADING...</p>
        ) : myProducts.length === 0 ? (
          <p className="text-sm text-neutral-400">아직 등록한 상품이 없습니다</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {myProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Liked */}
      <section>
        <h2 className="text-xl font-light tracking-wide mb-6">좋아요 한 상품</h2>
        {loading ? (
          <p className="text-sm text-neutral-400">LOADING...</p>
        ) : likedProducts.length === 0 ? (
          <p className="text-sm text-neutral-400">아직 좋아요 한 상품이 없습니다</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {likedProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border border-neutral-100 p-6">
      <p className="text-xs tracking-[0.2em] text-neutral-400 mb-2">{label}</p>
      <p className="text-3xl font-light">{value}</p>
    </div>
  );
}