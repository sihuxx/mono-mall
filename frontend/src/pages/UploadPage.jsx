import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const CATEGORIES = ['TOPS', 'BOTTOMS', 'OUTER', 'DRESS', 'ACC', 'SHOES'];

export default function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'TOPS',
    imageBase64: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('이미지는 2MB 이하여야 합니다');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, imageBase64: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.imageBase64) {
      showToast('모든 항목을 입력해주세요');
      return;
    }
    setSubmitting(true);
    try {
      const { product } = await api.createProduct({
        ...form,
        price: parseInt(form.price),
      });
      showToast('상품이 등록되었습니다');
      navigate(`/product/${product._id}`);
    } catch (err) {
      showToast(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-3xl mx-auto">
      <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">UPLOAD</p>
      <h1 className="text-4xl font-light tracking-tight mb-12">New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image */}
        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-3">PRODUCT IMAGE</label>
          {form.imageBase64 ? (
            <div className="relative aspect-[3/4] max-w-sm bg-neutral-50 overflow-hidden">
              <img src={form.imageBase64} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setForm({ ...form, imageBase64: '' })}
                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-[3/4] max-w-sm w-full border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-3 hover:border-black hover:bg-neutral-50 transition"
            >
              <Upload size={24} strokeWidth={1} className="text-neutral-400" />
              <span className="text-xs tracking-wider text-neutral-500">CLICK TO UPLOAD</span>
              <span className="text-[10px] text-neutral-400">JPG / PNG · 최대 2MB</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>

        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-3">PRODUCT NAME</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="예: Wool Cashmere Coat"
            className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
          />
        </div>

        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-3">CATEGORY</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`px-4 py-2 text-xs tracking-[0.2em] border transition ${
                  form.category === cat ? 'bg-black text-white border-black' : 'border-neutral-200 hover:border-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-3">PRICE (KRW)</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0"
            className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
          />
        </div>

        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-3">DESCRIPTION</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="상품에 대한 설명을 자세히 적어주세요."
            rows={6}
            className="w-full border border-neutral-200 p-4 outline-none focus:border-black transition text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-4 text-sm tracking-[0.2em] hover:bg-neutral-800 transition disabled:bg-neutral-400"
        >
          {submitting ? 'UPLOADING...' : 'PUBLISH PRODUCT'}
        </button>
      </form>
    </div>
  );
}
