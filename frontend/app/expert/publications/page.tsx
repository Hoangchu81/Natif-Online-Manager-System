'use client';

import CrudTable from '@/components/expert/CrudTable';
import type { FieldDef } from '@/components/expert/FormModal';

const fields: FieldDef[] = [
  { key: 'title', label: 'Tên công bố', required: true, type: 'textarea' },
  { key: 'authors', label: 'Tác giả' },
  { key: 'publisher', label: 'Nhà xuất bản/Tạp chí' },
  { key: 'year', label: 'Năm', type: 'number' },
  { key: 'publication_type', label: 'Loại công bố', type: 'select', options: ['Tạp chí quốc tế', 'Tạp chí trong nước', 'Hội nghị quốc tế', 'Hội nghị trong nước', 'Khác'] },
  { key: 'doi', label: 'Địa chỉ DOI' },
  { key: 'issn', label: 'ISSN' },
  { key: 'author_role', label: 'Vai trò tác giả', type: 'select', options: ['Tác giả chính', 'Đồng tác giả', 'Tác giả liên hệ'] },
  { key: 'journal_rank', label: 'Phân hạng tạp chí' },
  { key: 'impact_factor', label: 'IF tại năm công bố', type: 'number' },
  { key: 'citations', label: 'Số trích dẫn', type: 'number' },
  { key: 'source_url', label: 'Ghi chú/Nguồn' },
];

const columns = [
  { key: 'title', label: 'Tên công bố' },
  { key: 'authors', label: 'Tác giả' },
  { key: 'publisher', label: 'Nhà xuất bản' },
  { key: 'year', label: 'Năm' },
  { key: 'publication_type', label: 'Loại' },
  { key: 'author_role', label: 'Vai trò' },
];

export default function PublicationsPage() {
  return <CrudTable title="Công bố khoa học" apiPath="publications" fields={fields} columns={columns} />;
}
