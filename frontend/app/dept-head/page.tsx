'use client';

import RoleDashboard from '@/components/RoleDashboard';

export default function DeptHeadPage() {
  return (
    <RoleDashboard
      title="Lãnh đạo cấp phòng"
      description="Xem xét hồ sơ đã tổng hợp và phê duyệt cấp phòng"
      role="dept_head"
      actions={["Hồ sơ chờ duyệt cấp phòng", "Xem kết quả phản biện", "Phê duyệt cấp phòng", "Trả lại bổ sung"]}
    />
  );
}
