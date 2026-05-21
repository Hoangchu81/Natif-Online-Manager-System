'use client';

import CrudTable from '@/components/expert/CrudTable';
import type { FieldDef } from '@/components/expert/FormModal';

const fields: FieldDef[] = [
  { key: 'title', label: 'Tên sách/chương sách', required: true, type: 'textarea' },
  { key: 'link', label: 'Link sách' },
  { key: 'authors', label: 'Các tác giả' },
  { key: 'publisher', label: 'Nhà xuất bản' },
  { key: 'isbn', label: 'ISBN/ISSN' },
  { key: 'notes', label: 'Ghi chú' },
];

const columns = [
  { key: 'title', label: 'Tên sách/chương sách' },
  { key: 'link', label: 'Link sách' },
  { key: 'authors', label: 'Các tác giả' },
  { key: 'publisher', label: 'Nhà xuất bản' },
  { key: 'isbn', label: 'ISBN/ISSN' },
  { key: 'notes', label: 'Ghi chú' },
];

export default function BooksPage() {
  return <CrudTable title="Sách chuyên khảo đã xuất bản" apiPath="books" fields={fields} columns={columns} />;
}
