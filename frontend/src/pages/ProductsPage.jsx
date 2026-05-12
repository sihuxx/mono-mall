import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = search ? { search } : {};
    api.getProducts(params)
      .then(({ products }) => setProducts(products))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="py-12">
      <div className="mb-12">
        <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">SHOP</p>
        <h1 className="text-4xl font-light tracking-tight mb-6">All Products</h1>
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-2 max-w-md">
          <Search size={16} strokeWidth={1.5} className="text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>
      {loading ? (
        <p className="text-center text-neutral-400 text-sm py-12">LOADING...</p>
      ) : products.length === 0 ? (
        <EmptyState
          message={search ? "검색 결과가 없습니다" : "아직 등록된 상품이 없습니다"}
          actionLabel={!search && user ? "상품 등록하기" : null}
          onAction={() => navigate('/upload')}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
