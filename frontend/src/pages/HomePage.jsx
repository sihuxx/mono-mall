import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getProducts({ limit: 4 })
      .then(({ products }) => setProducts(products))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-40 border-b border-neutral-100">
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.3em] text-neutral-500 mb-6">2025 COLLECTION</p>
          <h1 className="text-5xl md:text-7xl font-light leading-tight tracking-tight">
            Less is<br/><span className="italic font-extralight">more.</span>
          </h1>
          <p className="mt-8 text-neutral-600 max-w-md leading-relaxed">
            본질에 집중한 미니멀한 디자인.
            절제된 라인과 차분한 컬러로 완성하는 일상의 미학.
          </p>
          <Link
            to="/shop"
            className="mt-10 inline-flex items-center gap-3 text-sm tracking-[0.2em] border-b border-black pb-1 hover:gap-5 transition-all"
          >
            EXPLORE COLLECTION
            <ChevronRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-2xl font-light tracking-wide">New Arrivals</h2>
          <Link to="/shop" className="text-xs tracking-[0.2em] text-neutral-500 hover:text-black transition">
            VIEW ALL →
          </Link>
        </div>
        {loading ? (
          <p className="text-center text-neutral-400 text-sm py-12">LOADING...</p>
        ) : products.length === 0 ? (
          <EmptyState
            message="아직 등록된 상품이 없습니다"
            actionLabel={user ? "첫 상품 등록하기" : "로그인 후 등록"}
            onAction={() => navigate(user ? '/upload' : '/login')}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
