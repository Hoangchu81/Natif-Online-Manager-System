'use client';

import CrudTable from '@/components/expert/CrudTable';
import type { FieldDef } from '@/components/expert/FormModal';

const fields: FieldDef[] = [
  { key: 'title', label: 'Tên giải thưởng', required: true, type: 'textarea' },
  { key: 'author_role', label: 'Vai trò tác giả' },
  { key: 'awarding_body', label: 'Đơn vị tặng thưởng' },
  { key: 'year', label: 'Năm tặng thưởng', type: 'number' },
  { key: 'notes', label: 'Ghi chú' },
  { key: 'reference_link', label: 'Link tham khảo (nếu có)' },
];

const columns = [
  { key: 'title', label: 'Tên giải thưởng' },
  { key: 'author_role', label: 'Vai trò tác giả' },
  { key: 'awarding_body', label: 'Đơn vị tặng thưởng' },
  { key: 'year', label: 'Năm' },
  { key: 'notes', label: 'Ghi chú' },
  { key: 'reference_link', label: 'Link tham khảo' },
];

export default function AwardsPage() {
  return <CrudTable title="Giải thưởng" apiPath="awards" fields={fields} columns={columns} />;
}
