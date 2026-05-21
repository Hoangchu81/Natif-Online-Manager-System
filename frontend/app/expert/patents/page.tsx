'use client';

import CrudTable from '@/components/expert/CrudTable';
import type { FieldDef } from '@/components/expert/FormModal';

const fields: FieldDef[] = [
  { key: 'citation', label: 'Trích dẫn công trình', required: true, type: 'textarea' },
  { key: 'author_role', label: 'Vai trò tác giả' },
  { key: 'protection_type', label: 'Loại bảo hộ SHTT', type: 'select', options: ['Bằng sáng chế', 'Giải pháp hữu ích', 'Kiểu dáng công nghiệp'] },
  { key: 'country', label: 'Quốc gia cấp' },
  { key: 'status', label: 'Tình trạng', type: 'select', options: ['Đã cấp', 'Đang xét duyệt', 'Đã nộp đơn'] },
  { key: 'reference_link', label: 'Link tham khảo (nếu có)' },
];

const columns = [
  { key: 'citation', label: 'Trích dẫn công trình' },
  { key: 'author_role', label: 'Vai trò tác giả' },
  { key: 'protection_type', label: 'Loại bảo hộ SHTT' },
  { key: 'country', label: 'Quốc gia cấp' },
  { key: 'status', label: 'Tình trạng' },
  { key: 'reference_link', label: 'Link tham khảo' },
];

export default function PatentsPage() {
  return <CrudTable title="Bằng sáng chế/Giải pháp hữu ích" apiPath="patents" fields={fields} columns={columns} />;
}
