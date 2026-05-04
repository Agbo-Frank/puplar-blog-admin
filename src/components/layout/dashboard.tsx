import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashSidebar } from './sidebar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <DashSidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
