'use client';

import RoleDashboard from '@/components/RoleDashboard';

export default function ModeratorPage() {
  return (
    <RoleDashboard
      title="Moderator"
      description="Cấu hình biểu mẫu, phân cấp, phân quyền người dùng"
      role="moderator"
      actions={["Quản lý người dùng", "Cấu hình biểu mẫu", "Phân cấp xử lý", "Phân quyền hệ thống"]}
    />
  );
}
