'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { applicationDetails, applications, type DuToan, type NhomNghienCuu, type NoiDung, type SanPham, type ThuyetMinh, type TienDo } from '@/lib/api';

const inputCls = 'w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-natif-blue focus:outline-none focus:ring-2 focus:ring-natif-blue/20';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';
const cardCls = 'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const initialThuyetMinh: Partial<ThuyetMinh> = {
  tinh_cap_thiet: '',
  tong_quan_trong_nuoc: '',
  tong_quan_quoc_te: '',
  tinh_moi_sang_tao: '',
  muc_tieu_tong_quat: '',
  muc_tieu_cu_the: [''],
  hieu_qua_kinh_te: '',
  hieu_qua_xa_hoi: '',
  hieu_qua_moi_truong: '',
  kha_nang_ung_dung: '',
  co_so_vat_chat: '',
  hop_tac_quoc_te: '',
};

export default function ThuyetMinhPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const appId = params.id;
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const [app, setApp] = useState<{ title?: string; funding_mechanism?: string; status?: string } | null>(null);
  const [tm, setTm] = useState<Partial<ThuyetMinh>>(initialThuyetMinh);
  const [noiDung, setNoiDung] = useState<NoiDung[]>([{ noi_dung_so: 1, ten: '', mo_ta_chi_tiet: '', phuong_phap: '', san_pham_du_kien: '' }]);
  const [sanPham, setSanPham] = useState<SanPham[]>([{ loai: 'ung_dung', ten: '', chi_tieu_chat_luong: '', so_luong: 1, don_vi: '' }]);
  const [duToan, setDuToan] = useState<DuToan[]>([{ hang_muc: 'cong_lao_dong', noi_dung: '', thanh_tien: 0, nguon_nsnn: 0, nguon_khac: 0 }]);
  const [nhomNc, setNhomNc] = useState<NhomNghienCuu[]>([{ ho_ten: '', vai_tro: 'Chủ nhiệm', hoc_vi: '', don_vi_cong_tac: '' }]);
  const [tienDo, setTienDo] = useState<TienDo[]>([{ giai_doan: 1, noi_dung: '', san_pham: '', kinh_phi: 0 }]);

  const totalBudget = useMemo(() => duToan.reduce((sum, item) => sum + Number(item.thanh_tien || 0), 0), [duToan]);

  useEffect(() => {
    async function load() {
      try {
        const full = await applicationDetails.getFull(appId);
        setApp(full.data);
        if (full.data.thuyet_minh) setTm(full.data.thuyet_minh);
        if (full.data.noi_dung.length) setNoiDung(full.data.noi_dung);
        if (full.data.san_pham.length) setSanPham(full.data.san_pham);
        if (full.data.du_toan.length) setDuToan(full.data.du_toan);
        if (full.data.nhom_nghien_cuu.length) setNhomNc(full.data.nhom_nghien_cuu);
        if (full.data.tien_do.length) setTienDo(full.data.tien_do);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tải được hồ sơ');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appId]);

  const save = async () => {
    setSaving(true);
    setStatus('idle');
    setError('');
    try {
      await applicationDetails.upsertThuyetMinh(appId, {
        ...tm,
        muc_tieu_cu_the: (tm.muc_tieu_cu_the || []).filter(Boolean),
      });
      await Promise.all([
        applicationDetails.bulkSave<NoiDung>(appId, 'noi_dung', noiDung.filter(i => i.ten)),
        applicationDetails.bulkSave<SanPham>(appId, 'san_pham', sanPham.filter(i => i.ten)),
        applicationDetails.bulkSave<DuToan>(appId, 'du_toan', duToan.filter(i => i.noi_dung && Number(i.thanh_tien) > 0)),
        applicationDetails.bulkSave<NhomNghienCuu>(appId, 'nhom_nghien_cuu', nhomNc.filter(i => i.ho_ten)),
        applicationDetails.bulkSave<TienDo>(appId, 'tien_do', tienDo.filter(i => i.noi_dung)),
      ]);
      await applications.update(appId, {
        total_budget: totalBudget,
        requested_funding: duToan.reduce((s, i) => s + Number(i.nguon_nsnn || 0), 0),
        co_funding_amount: duToan.reduce((s, i) => s + Number(i.nguon_khac || 0), 0),
        decl_no_duplicate_funding: true,
        decl_self_responsibility: true,
        decl_proper_use: true,
      } as any);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được thuyết minh');
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    await save();
    await applications.submit(appId);
    router.push('/apply/dashboard');
  };

  if (loading) return <><Header /><main className="min-h-screen bg-gray-50 py-16 text-center">Đang tải...</main><Footer /></>;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-natif-blue to-cyan-600 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-widest opacity-80">Điều 11 NĐ 268/2025/NĐ-CP</p>
            <h1 className="mt-2 text-3xl font-bold">Thuyết minh nhiệm vụ đổi mới sáng tạo</h1>
            <p className="mt-2 opacity-90">{app?.title || 'Hồ sơ đề xuất nhiệm vụ'} — {app?.funding_mechanism === 'dat_hang' ? 'Đặt hàng (gắn chương trình)' : 'Tài trợ'}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-6">
            {['Tổng quan', 'Nội dung', 'Sản phẩm', 'Dự toán', 'Nhân sự', 'Tiến độ'].map((name, idx) => (
              <button key={name} onClick={() => setStep((idx + 1) as Step)} className={`rounded-xl px-3 py-3 text-sm font-semibold ${step === idx + 1 ? 'bg-natif-blue text-white' : 'bg-white text-gray-700 border'}`}>
                {idx + 1}. {name}
              </button>
            ))}
          </div>

          {status === 'success' && <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">Đã lưu thuyết minh.</div>}
          {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

          {step === 1 && (
            <section className={cardCls}>
              <h2 className="mb-4 text-xl font-bold">1. Tổng quan, mục tiêu, hiệu quả</h2>
              <div className="grid gap-4">
                <Field label="Tính cấp thiết"><textarea className={inputCls} rows={4} value={tm.tinh_cap_thiet || ''} onChange={e => setTm({ ...tm, tinh_cap_thiet: e.target.value })} /></Field>
                <Field label="Tổng quan trong nước"><textarea className={inputCls} rows={3} value={tm.tong_quan_trong_nuoc || ''} onChange={e => setTm({ ...tm, tong_quan_trong_nuoc: e.target.value })} /></Field>
                <Field label="Tổng quan quốc tế"><textarea className={inputCls} rows={3} value={tm.tong_quan_quoc_te || ''} onChange={e => setTm({ ...tm, tong_quan_quoc_te: e.target.value })} /></Field>
                <Field label="Tính mới, sáng tạo"><textarea className={inputCls} rows={4} value={tm.tinh_moi_sang_tao || ''} onChange={e => setTm({ ...tm, tinh_moi_sang_tao: e.target.value })} /></Field>
                <Field label="Mục tiêu tổng quát"><textarea className={inputCls} rows={3} value={tm.muc_tieu_tong_quat || ''} onChange={e => setTm({ ...tm, muc_tieu_tong_quat: e.target.value })} /></Field>
                <Field label="Mục tiêu cụ thể (mỗi dòng một mục tiêu)"><textarea className={inputCls} rows={4} value={(tm.muc_tieu_cu_the || []).join('\n')} onChange={e => setTm({ ...tm, muc_tieu_cu_the: e.target.value.split('\n') })} /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Hiệu quả kinh tế"><textarea className={inputCls} rows={3} value={tm.hieu_qua_kinh_te || ''} onChange={e => setTm({ ...tm, hieu_qua_kinh_te: e.target.value })} /></Field>
                  <Field label="Hiệu quả xã hội"><textarea className={inputCls} rows={3} value={tm.hieu_qua_xa_hoi || ''} onChange={e => setTm({ ...tm, hieu_qua_xa_hoi: e.target.value })} /></Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Cơ sở vật chất"><textarea className={inputCls} rows={3} value={tm.co_so_vat_chat || ''} onChange={e => setTm({ ...tm, co_so_vat_chat: e.target.value })} /></Field>
                  <Field label="Khả năng ứng dụng"><textarea className={inputCls} rows={3} value={tm.kha_nang_ung_dung || ''} onChange={e => setTm({ ...tm, kha_nang_ung_dung: e.target.value })} /></Field>
                </div>
              </div>
            </section>
          )}

          {step === 2 && <EditableList title="2. Nội dung thực hiện" items={noiDung} setItems={setNoiDung} create={() => ({ noi_dung_so: noiDung.length + 1, ten: '', mo_ta_chi_tiet: '', phuong_phap: '', san_pham_du_kien: '' })} fields={[['noi_dung_so','Số'],['ten','Tên nội dung'],['mo_ta_chi_tiet','Mô tả'],['phuong_phap','Phương pháp'],['san_pham_du_kien','Sản phẩm dự kiến']]} />}
          {step === 3 && <EditableList title="3. Sản phẩm đầu ra" items={sanPham} setItems={setSanPham} create={() => ({ loai: 'ung_dung' as const, ten: '', chi_tieu_chat_luong: '', so_luong: 1, don_vi: '' })} fields={[['loai','Loại'],['ten','Tên sản phẩm'],['chi_tieu_chat_luong','Chỉ tiêu chất lượng'],['so_luong','Số lượng'],['don_vi','Đơn vị']]} />}
          {step === 4 && <EditableList title={`4. Dự toán kinh phí — Tổng: ${totalBudget.toLocaleString('vi-VN')} VNĐ`} items={duToan} setItems={setDuToan} create={() => ({ hang_muc: 'cong_lao_dong' as const, noi_dung: '', thanh_tien: 0, nguon_nsnn: 0, nguon_khac: 0 })} fields={[['hang_muc','Hạng mục'],['noi_dung','Nội dung'],['so_luong','SL'],['don_gia','Đơn giá'],['thanh_tien','Thành tiền'],['nguon_nsnn','NSNN'],['nguon_khac','Nguồn khác']]} />}
          {step === 5 && <EditableList title="5. Nhóm nghiên cứu" items={nhomNc} setItems={setNhomNc} create={() => ({ ho_ten: '', vai_tro: '', hoc_vi: '', don_vi_cong_tac: '' })} fields={[['ho_ten','Họ tên'],['vai_tro','Vai trò'],['hoc_vi','Học vị'],['chuc_danh','Chức danh'],['don_vi_cong_tac','Đơn vị']]} />}
          {step === 6 && <EditableList title="6. Tiến độ thực hiện" items={tienDo} setItems={setTienDo} create={() => ({ giai_doan: tienDo.length + 1, noi_dung: '', san_pham: '', kinh_phi: 0 })} fields={[['giai_doan','Giai đoạn'],['noi_dung','Nội dung'],['san_pham','Sản phẩm'],['thoi_gian_tu','Từ ngày'],['thoi_gian_den','Đến ngày'],['kinh_phi','Kinh phí']]} />}

          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <button disabled={step === 1} onClick={() => setStep((Math.max(1, step - 1) as Step))} className="rounded-xl border px-5 py-3 font-semibold disabled:opacity-40">Quay lại</button>
            <div className="flex gap-3">
              <button onClick={save} disabled={saving} className="rounded-xl bg-gray-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu nháp'}</button>
              {step < 6 ? <button onClick={() => setStep((Math.min(6, step + 1) as Step))} className="rounded-xl bg-natif-blue px-5 py-3 font-semibold text-white">Tiếp tục</button> : <button onClick={submit} disabled={saving} className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50">Lưu & nộp hồ sơ</button>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label><span className={labelCls}>{label}</span>{children}</label>;
}

function EditableList<T extends Record<string, any>>({ title, items, setItems, create, fields }: { title: string; items: T[]; setItems: (items: T[]) => void; create: () => T; fields: [keyof T & string, string][] }) {
  const update = (idx: number, key: keyof T & string, value: string) => {
    const next = [...items];
    const old = next[idx][key];
    next[idx] = { ...next[idx], [key]: typeof old === 'number' ? Number(value) : value };
    setItems(next);
  };

  return (
    <section className={cardCls}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={() => setItems([...items, create()])} className="rounded-lg bg-natif-blue px-4 py-2 text-sm font-semibold text-white">+ Thêm</button>
      </div>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Mục {idx + 1}</span>
              <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-sm text-red-600">Xóa</button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map(([key, label]) => (
                <Field key={key} label={label}>
                  <input className={inputCls} value={item[key] ?? ''} onChange={e => update(idx, key, e.target.value)} />
                </Field>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
