'use client';

import RoleDashboard from '@/components/RoleDashboard';

export default function OfficerPage() {
  return (
    <RoleDashboard
      title="Chuyên viên Quỹ"
      description="Thẩm định sơ bộ, tổng hợp kết quả phản biện và trình lãnh đạo"
      role="officer"
      actions={["Hồ sơ được phân công", "Thẩm định sơ bộ", "Tổng hợp phản biện", "Trình lãnh đạo phòng"]}
    />
  );
}
