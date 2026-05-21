'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const DEGREE_OPTIONS = ['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ', 'Tiến sĩ khoa học'];
const TITLE_OPTIONS = ['', 'Phó Giáo sư', 'Giáo sư'];
const GENDER_OPTIONS = ['Nam', 'Nữ'];

export default function ExpertProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', company: '',
    date_of_birth: '', birth_place: '', gender: '',
    id_number: '', id_issued_date: '', id_issued_place: '',
    hometown: '', nationality: 'Việt Nam', address: '', province: '',
    bank_account: '', bank_account_name: '', bank_name: '', bank_branch: '',
    academic_degree: '', degree_year: '', academic_title: '', title_year: '',
    expertise_fields: [] as string[],
  });
  const [fieldInput, setFieldInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await authFetch(`${API_BASE}/api/expert/profile`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          company: data.company || '',
          date_of_birth: data.date_of_birth?.slice(0, 10) || '',
          birth_place: data.birth_place || '',
          gender: data.gender || '',
          id_number: data.id_number || '',
          id_issued_date: data.id_issued_date?.slice(0, 10) || '',
          id_issued_place: data.id_issued_place || '',
          hometown: data.hometown || '',
          nationality: data.nationality || 'Việt Nam',
          address: data.address || '',
          province: data.province || '',
          bank_account: data.bank_account || '',
          bank_account_name: data.bank_account_name || '',
          bank_name: data.bank_name || '',
          bank_branch: data.bank_branch || '',
          academic_degree: data.academic_degree || '',
          degree_year: data.degree_year?.toString() || '',
          academic_title: data.academic_title || '',
          title_year: data.title_year?.toString() || '',
          expertise_fields: data.expertise_fields || [],
        });
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await authFetch(`${API_BASE}/api/expert/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          degree_year: form.degree_year ? parseInt(form.degree_year) : null,
          title_year: form.title_year ? parseInt(form.title_year) : null,
        }),
      });
      if (res.ok) setMessage('Đã lưu thành công');
      else setMessage('Lỗi khi lưu');
    } catch {
      setMessage('Không thể kết nối server');
    } finally {
      setSaving(false);
    }
  }

  function addField() {
    const val = fieldInput.trim();
    if (val && !form.expertise_fields.includes(val)) {
      setForm({ ...form, expertise_fields: [...form.expertise_fields, val] });
      setFieldInput('');
    }
  }

  function removeField(f: string) {
    setForm({ ...form, expertise_fields: form.expertise_fields.filter(x => x !== f) });
  }

  if (loading) return <div className="text-gray-500 py-12 text-center">Đang tải...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-heading font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin cơ bản và chuyên môn của bạn</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Thông tin cơ bản */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-heading font-semibold text-gray-800 mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Họ và tên *</label>
              <input className="form-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input className="form-input bg-gray-50" value={form.email} disabled />
            </div>
            <div>
              <label className="form-label">Điện thoại</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Ngày sinh</label>
              <input type="date" className="form-input" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Nơi sinh</label>
              <input className="form-input" value={form.birth_place} onChange={e => setForm({ ...form, birth_place: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Giới tính</label>
              <select className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">-- Chọn --</option>
                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">CMTCC/CCCD</label>
              <input className="form-input" value={form.id_number} onChange={e => setForm({ ...form, id_number: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Ngày cấp</label>
              <input type="date" className="form-input" value={form.id_issued_date} onChange={e => setForm({ ...form, id_issued_date: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Nơi cấp</label>
              <input className="form-input" value={form.id_issued_place} onChange={e => setForm({ ...form, id_issued_place: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Quê quán</label>
              <input className="form-input" value={form.hometown} onChange={e => setForm({ ...form, hometown: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Quốc tịch</label>
              <input className="form-input" value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Tỉnh/Thành phố</label>
              <input className="form-input" value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <label className="form-label">Chỗ ở hoặc địa chỉ liên lạc</label>
              <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
        </section>

        {/* Tài khoản ngân hàng */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-heading font-semibold text-gray-800 mb-4">Tài khoản ngân hàng</h2>
          <p className="text-xs text-gray-500 mb-4">(Thông tin tài khoản làm cơ sở thanh toán sau này khi Nhà khoa học/ứng viên đăng ký chương trình tài trợ)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tên tài khoản</label>
              <input className="form-input" value={form.bank_account_name} onChange={e => setForm({ ...form, bank_account_name: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Số tài khoản</label>
              <input className="form-input" value={form.bank_account} onChange={e => setForm({ ...form, bank_account: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Tên ngân hàng</label>
              <input className="form-input" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Chi nhánh ngân hàng</label>
              <input className="form-input" value={form.bank_branch} onChange={e => setForm({ ...form, bank_branch: e.target.value })} />
            </div>
          </div>
        </section>

        {/* Chuyên môn */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-heading font-semibold text-gray-800 mb-4">Chuyên môn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Học vị cao nhất</label>
              <select className="form-input" value={form.academic_degree} onChange={e => setForm({ ...form, academic_degree: e.target.value })}>
                <option value="">-- Chọn --</option>
                {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Năm nhận học vị</label>
              <input className="form-input" type="number" value={form.degree_year} onChange={e => setForm({ ...form, degree_year: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Nơi công tác</label>
              <input className="form-input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Học hàm</label>
              <select className="form-input" value={form.academic_title} onChange={e => setForm({ ...form, academic_title: e.target.value })}>
                <option value="">-- Chọn --</option>
                {TITLE_OPTIONS.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Năm bổ nhiệm</label>
              <input className="form-input" type="number" value={form.title_year} onChange={e => setForm({ ...form, title_year: e.target.value })} />
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label">Lĩnh vực chuyên môn</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {form.expertise_fields.map(f => (
                <span key={f} className="inline-flex items-center gap-1 bg-natif-blue/10 text-natif-blue text-sm px-3 py-1 rounded-full">
                  {f}
                  <button type="button" onClick={() => removeField(f)} className="text-natif-blue/60 hover:text-natif-blue">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="form-input flex-1"
                placeholder="Nhập lĩnh vực và nhấn Thêm"
                value={fieldInput}
                onChange={e => setFieldInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addField(); } }}
              />
              <button type="button" onClick={addField} className="btn-secondary py-2 px-4">Thêm</button>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 disabled:opacity-60">
            {saving ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
          {message && (
            <span className={`text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
