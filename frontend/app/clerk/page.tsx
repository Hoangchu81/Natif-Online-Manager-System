'use client';

import RoleDashboard from '@/components/RoleDashboard';

export default function ClerkPage() {
  return (
    <RoleDashboard
      title="Văn thư Quỹ"
      description="Điều hành, tiếp nhận, phân luồng và chuyển hồ sơ"
      role="clerk"
      actions={["Tiếp nhận hồ sơ mới", "Phân luồng hồ sơ", "Chuyển chuyên viên xử lý", "Theo dõi trạng thái"]}
    />
  );
}
