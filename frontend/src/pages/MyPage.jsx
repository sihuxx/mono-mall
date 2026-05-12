import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    ]).then(([productsRes, likesRes, txRes]) => {
      const myProds = productsRes.products.filter(p => {
        const uploaderId = typeof p.uploaderId === 'object' ? p.uploaderId._id : p.uploaderId;
        return uploaderId === user.id;
      });
      setMyProducts(myProds);
      setLikedProducts(likesRes.products);
      setTransactions(txRes.transactions);
    }).finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="py-12">
      <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">ACCOUNT</p>
      <h1 className="text-4xl font-light tracking-tight mb-2">{user.username}</h1>
      <p className="text-sm text-neutral-500 mb-12">{user.email}</p>

      {/* Coin Balance - 강조 */}
      <div className="bg-black text-white p-8 mb-12 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-neutral-400 mb-2">CURRENT BALANCE</p>
          <p className="text-4xl font-light flex items-center gap-2">
            <Coins size={28} strokeWidth={1.5} />
            {Number(user.coins || 0).toLocaleString()}
          </p>
        </div>
        <Link to="/orders" className="text-xs tracking-[0.2em] border-b border-white pb-1 hover:opacity-70">
          ORDER HISTORY →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <StatCard label="UPLOADED" value={myProducts.length} />
        <StatCard label="LIKED" value={likedProducts.length} />
        <StatCard label="ROLE" value={user.role.toUpperCase()} />
      </div>

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
