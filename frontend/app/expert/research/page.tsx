'use client';

import CrudTable from '@/components/expert/CrudTable';
import type { FieldDef } from '@/components/expert/FormModal';

const fields: FieldDef[] = [
  { key: 'title', label: 'Tên đề tài/dự án', required: true, type: 'textarea' },
  { key: 'start_year', label: 'Năm bắt đầu' },
  { key: 'end_year', label: 'Năm hoàn thành' },
  { key: 'funding_agency', label: 'Cơ quan tài trợ kinh phí' },
  { key: 'role', label: 'Vai trò tham gia' },
  { key: 'status', label: 'Tình trạng', type: 'select', options: ['Đã nghiệm thu', 'Đang thực hiện', 'Chưa nghiệm thu'] },
];

const columns = [
  { key: 'title', label: 'Tên đề tài/dự án' },
  { key: 'start_year', label: 'Năm bắt đầu/hoàn thành', render: (val: string, row: any) => `${val || ''} - ${row.end_year || ''}` },
  { key: 'funding_agency', label: 'Cơ quan tài trợ' },
  { key: 'role', label: 'Vai trò tham gia' },
  { key: 'status', label: 'Tình trạng' },
];

export default function ResearchPage() {
  return <CrudTable title="Đề tài/Dự án nghiên cứu" apiPath="research" fields={fields} columns={columns} />;
}
