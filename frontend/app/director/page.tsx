'use client';

import RoleDashboard from '@/components/RoleDashboard';

export default function DirectorPage() {
  return (
    <RoleDashboard
      title="Lãnh đạo cấp Quỹ"
      description="Phê duyệt cuối cùng các hồ sơ đề xuất tài trợ/hỗ trợ"
      role="director"
      actions={["Hồ sơ chờ phê duyệt", "Xem ý kiến phòng", "Phê duyệt cuối", "Ký quyết định"]}
    />
  );
}
