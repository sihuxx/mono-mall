import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Coins, Search, Plus, Minus, UserCog } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [chargeModal, setChargeModal] = useState(null); // { user, type: 'charge' | 'deduct' }
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      showToast('관리자 권한이 필요합니다');
      navigate('/');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { users } = await api.adminGetUsers();
      setUsers(users);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (targetUser, type) => {
    setChargeModal({ user: targetUser, type });
    setAmount('');
    setDescription('');
  };

  const handleCharge = async () => {
    if (!amount || parseInt(amount) <= 0) {
      showToast('금액을 입력해주세요');
      return;
    }
    setSubmitting(true);
    try {
      if (chargeModal.type === 'charge') {
        await api.adminChargeCoins({
          userId: chargeModal.user._id,
          amount: parseInt(amount),
          description,
        });
        showToast(`${amount} 코인이 충전되었습니다`);
      } else {
        await api.adminDeductCoins({
          userId: chargeModal.user._id,
          amount: parseInt(amount),
          description,
        });
        showToast(`${amount} 코인이 차감되었습니다`);
      }
      setChargeModal(null);
      await loadUsers();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleToggle = async (targetUser) => {
    if (targetUser._id === user.id) {
      showToast('자기 자신의 권한은 변경할 수 없습니다');
      return;
    }
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`${targetUser.username}의 권한을 "${newRole}"로 변경하시겠습니까?`)) return;
    try {
      await api.adminUpdateRole(targetUser._id, newRole);
      showToast('권한이 변경되었습니다');
      await loadUsers();
    } catch (err) {
      showToast(err.message);
    }
  };

  if (!user || user.role !== 'admin') return null;

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCoins = users.reduce((sum, u) => sum + (u.coins || 0), 0);

  return (
    <div className="py-12">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={14} strokeWidth={1.5} />
        <p className="text-xs tracking-[0.3em] text-neutral-500">ADMIN</p>
      </div>
      <h1 className="text-4xl font-light tracking-tight mb-12">User Management</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <StatCard label="TOTAL USERS" value={users.length} />
        <StatCard label="ADMINS" value={users.filter(u => u.role === 'admin').length} />
        <StatCard label="TOTAL COINS" value={totalCoins.toLocaleString()} icon={<Coins size={14} />} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 border-b border-neutral-200 pb-2 max-w-md mb-8">
        <Search size={16} strokeWidth={1.5} className="text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="사용자 검색 (이름/이메일)"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {/* User Table */}
      {loading ? (
        <p className="text-center text-neutral-400 text-sm py-12">LOADING...</p>
      ) : (
        <div className="border border-neutral-200">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-[10px] tracking-[0.2em] text-neutral-500">
            <div className="col-span-3">USER</div>
            <div className="col-span-3 hidden md:block">EMAIL</div>
            <div className="col-span-2">ROLE</div>
            <div className="col-span-2 text-right">COINS</div>
            <div className="col-span-2 text-right">ACTIONS</div>
          </div>
          {filteredUsers.length === 0 ? (
            <p className="text-center text-neutral-400 text-sm py-12">사용자가 없습니다</p>
          ) : (
            filteredUsers.map(u => (
              <div key={u._id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-neutral-100 items-center text-sm hover:bg-neutral-50/50">
                <div className="col-span-3">
                  <p className="font-medium">{u.username}</p>
                  <p className="text-xs text-neutral-400 md:hidden truncate">{u.email}</p>
                </div>
                <div className="col-span-3 hidden md:block text-xs text-neutral-600 truncate">{u.email}</div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleRoleToggle(u)}
                    disabled={u._id === user.id}
                    className={`text-[10px] tracking-wider px-2 py-1 transition ${
                      u.role === 'admin'
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {u.role.toUpperCase()}
                  </button>
                </div>
                <div className="col-span-2 text-right flex items-center justify-end gap-1">
                  <Coins size={11} strokeWidth={1.5} />
                  <span className="font-medium">{Number(u.coins || 0).toLocaleString()}</span>
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <button
                    onClick={() => openModal(u, 'charge')}
                    className="p-1.5 bg-black text-white hover:bg-neutral-800 transition"
                    title="코인 충전"
                  >
                    <Plus size={12} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => openModal(u, 'deduct')}
                    className="p-1.5 border border-neutral-300 hover:bg-neutral-50 transition"
                    title="코인 차감"
                  >
                    <Minus size={12} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Charge Modal */}
      {chargeModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setChargeModal(null)}
        >
          <div className="bg-white max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs tracking-[0.3em] text-neutral-500 mb-2">
              {chargeModal.type === 'charge' ? '코인 충전' : '코인 차감'}
            </p>
            <h2 className="text-2xl font-light mb-1">{chargeModal.user.username}</h2>
            <p className="text-xs text-neutral-500 mb-1">{chargeModal.user.email}</p>
            <p className="text-sm flex items-center gap-1 mb-6">
              현재 보유: <Coins size={12} strokeWidth={1.5} />
              <span className="font-medium">{Number(chargeModal.user.coins || 0).toLocaleString()} 코인</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-2">
                  {chargeModal.type === 'charge' ? '충전할 금액' : '차감할 금액'}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                  className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black text-lg"
                />
                <div className="flex gap-2 mt-2">
                  {[1000, 10000, 100000, 1000000].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(v))}
                      className="text-[10px] tracking-wider px-2 py-1 border border-neutral-200 hover:border-black"
                    >
                      +{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-2">메모 (선택)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 이벤트 보상"
                  className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setChargeModal(null)}
                className="flex-1 border border-neutral-300 py-3 text-xs tracking-[0.2em] hover:bg-neutral-50"
              >
                CANCEL
              </button>
              <button
                onClick={handleCharge}
                disabled={submitting}
                className="flex-1 bg-black text-white py-3 text-xs tracking-[0.2em] hover:bg-neutral-800 disabled:bg-neutral-400"
              >
                {submitting ? 'PROCESSING...' : 'CONFIRM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="border border-neutral-100 p-6">
      <p className="text-xs tracking-[0.2em] text-neutral-400 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-3xl font-light">{value}</p>
      </div>
    </div>
  );
}
