import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, Menu, Coins, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const close = () => setMenuOpen(false);
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl tracking-[0.2em] font-light" onClick={close}>
            MONO<span className="font-medium">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm tracking-wider text-neutral-600">
            <Link to="/" className="hover:text-black transition">HOME</Link>
            <Link to="/shop" className="hover:text-black transition">SHOP</Link>
            {user && <Link to="/upload" className="hover:text-black transition">UPLOAD</Link>}
            {isAdmin && (
              <Link to="/admin" className="hover:text-black transition flex items-center gap-1">
                <Shield size={12} strokeWidth={1.5} /> ADMIN
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <Link to="/mypage" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 rounded-full text-xs tracking-wider hover:bg-neutral-100 transition">
                <Coins size={12} strokeWidth={1.5} />
                <span className="font-medium">{Number(user.coins || 0).toLocaleString()}</span>
              </Link>
            )}
            <Link to={user ? '/cart' : '/login'} className="relative p-2 hover:bg-neutral-50 rounded-full transition">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/mypage" className="text-sm text-neutral-700 hover:text-black transition">
                  {user.username}
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-neutral-50 rounded-full transition" title="로그아웃">
                  <LogOut size={16} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block text-sm tracking-wider text-neutral-600 hover:text-black transition">
                LOGIN
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              <Menu size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white">
          <div className="px-6 py-4 flex flex-col gap-3 text-sm tracking-wider">
            {user && (
              <div className="flex items-center gap-2 py-2 pb-3 border-b border-neutral-100">
                <Coins size={14} strokeWidth={1.5} />
                <span className="font-medium">{Number(user.coins || 0).toLocaleString()} 코인</span>
              </div>
            )}
            <Link to="/" onClick={close} className="py-2">HOME</Link>
            <Link to="/shop" onClick={close} className="py-2">SHOP</Link>
            {user && <Link to="/upload" onClick={close} className="py-2">UPLOAD</Link>}
            {isAdmin && <Link to="/admin" onClick={close} className="py-2 flex items-center gap-1"><Shield size={12} /> ADMIN</Link>}
            {user ? (
              <>
                <Link to="/mypage" onClick={close} className="py-2">{user.username}</Link>
                <Link to="/orders" onClick={close} className="py-2">주문내역</Link>
                <button onClick={handleLogout} className="text-left py-2 text-neutral-500">LOGOUT</button>
              </>
            ) : (
              <Link to="/login" onClick={close} className="py-2">LOGIN</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
