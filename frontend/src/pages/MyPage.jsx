import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myProducts, setMyProducts] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user) {
    navigate('/login');
    return;
  }
  Promise.all([
    api.getProducts({ limit: 100 }),
    api.getMyLikes(),
  ]).then(([productsRes, likesRes]) => {
    const myProds = productsRes.products.filter(p => {
      const uploaderId = typeof p.uploaderId === 'object' ? p.uploaderId._id : p.uploaderId;
      return uploaderId === user.id;
    });
    setMyProducts(myProds);
    setLikedProducts(likesRes.products);
  }).finally(() => setLoading(false));
}, [user, navigate]);

  if (!user) return null;

  return (
    <div className="py-12">
      <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">ACCOUNT</p>
      <h1 className="text-4xl font-light tracking-tight mb-2">{user.username}</h1>
      <p className="text-sm text-neutral-500 mb-12">{user.email}</p>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <StatCard label="UPLOADED" value={myProducts.length} />
        <StatCard label="LIKED" value={likedProducts.length} />
        <StatCard label="MEMBER SINCE" value={new Date().getFullYear()} />
      </div>

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
