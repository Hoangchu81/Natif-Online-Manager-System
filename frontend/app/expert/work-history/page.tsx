'use client';

import CrudTable from '@/components/expert/CrudTable';
import type { FieldDef } from '@/components/expert/FormModal';

const fields: FieldDef[] = [
  { key: 'period_start', label: 'Từ (MM/YYYY)', required: true },
  { key: 'period_end', label: 'Đến (MM/YYYY)' },
  { key: 'organization', label: 'Cơ quan công tác', required: true },
  { key: 'address_phone', label: 'Địa chỉ và Điện thoại' },
  { key: 'position', label: 'Công việc đảm nhận' },
];

const columns = [
  { key: 'period_start', label: 'Thời gian', render: (val: string, row: any) => `${val || ''} - ${row.period_end || 'nay'}` },
  { key: 'organization', label: 'Cơ quan công tác' },
  { key: 'address_phone', label: 'Địa chỉ và Điện thoại' },
  { key: 'position', label: 'Công việc đảm nhận' },
];

export default function WorkHistoryPage() {
  return <CrudTable title="Quá trình công tác" apiPath="work-history" fields={fields} columns={columns} />;
}
