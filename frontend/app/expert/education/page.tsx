'use client';

import CrudTable from '@/components/expert/CrudTable';
import type { FieldDef } from '@/components/expert/FormModal';

const fields: FieldDef[] = [
  { key: 'period', label: 'Thời gian', required: true },
  { key: 'education_system', label: 'Hệ đào tạo' },
  { key: 'institution', label: 'Tên cơ sở đào tạo', required: true },
  { key: 'country', label: 'Quốc gia đào tạo' },
  { key: 'major', label: 'Chuyên ngành' },
  { key: 'degree', label: 'Học vị' },
];

const columns = [
  { key: 'period', label: 'Thời gian' },
  { key: 'education_system', label: 'Hệ đào tạo' },
  { key: 'institution', label: 'Tên cơ sở đào tạo' },
  { key: 'country', label: 'Quốc gia' },
  { key: 'major', label: 'Chuyên ngành' },
  { key: 'degree', label: 'Học vị' },
];

export default function EducationPage() {
  return <CrudTable title="Quá trình đào tạo" apiPath="education" fields={fields} columns={columns} />;
}
